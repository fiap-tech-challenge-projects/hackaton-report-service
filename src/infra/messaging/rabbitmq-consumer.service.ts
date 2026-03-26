import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as amqplib from 'amqplib'
import { CreateReportUseCase } from '@application/use-cases/create-report.use-case'

/**
 * RabbitMQ consumer service
 * Consumes analysis.processed events and creates reports
 */
@Injectable()
export class RabbitmqConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqConsumerService.name)
  private connection: any
  private channel: any

  constructor(
    private readonly configService: ConfigService,
    private readonly createReportUseCase: CreateReportUseCase,
  ) {}

  async onModuleInit() {
    await this.connect()
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  private async connect(retryCount = 0) {
    try {
      const url = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://guest:guest@localhost:5672',
      )
      this.connection = await amqplib.connect(url)
      this.channel = await this.connection.createChannel()

      await this.channel.assertExchange('hackaton-events', 'topic', { durable: true })

      await this.channel.assertQueue('analysis.processed', { durable: true })
      await this.channel.bindQueue('analysis.processed', 'hackaton-events', 'analysis.processed')

      // DLQ setup
      await this.channel.assertQueue('analysis.dlq', { durable: true })

      this.channel.prefetch(1)

      this.channel.consume('analysis.processed', async (msg: any) => {
        if (!msg) return

        try {
          await this.handleMessage(msg)
          this.channel.ack(msg)
        } catch (error) {
          this.logger.error(`Failed to process message: ${error.message}`)
          // Reject and send to DLQ after processing failure
          this.channel.nack(msg, false, false)
        }
      })

      this.logger.log('RabbitMQ consumer connected, listening on analysis.processed')
    } catch (error) {
      const maxRetries = 10
      const retryDelay = Math.min(5000 * (retryCount + 1), 30000)
      this.logger.error(
        `Failed to connect RabbitMQ consumer: ${error.message}. Retry ${retryCount + 1}/${maxRetries} in ${retryDelay}ms`,
      )
      if (retryCount < maxRetries) {
        setTimeout(() => this.connect(retryCount + 1), retryDelay)
      } else {
        this.logger.error('Max retries reached. RabbitMQ consumer will not start.')
      }
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close()
      await this.connection?.close()
    } catch (error) {
      this.logger.warn(`Error closing RabbitMQ consumer: ${error.message}`)
    }
  }

  private async handleMessage(msg: any): Promise<void> {
    const content = JSON.parse(msg.content.toString())
    const { eventType, correlationId, payload } = content

    this.logger.log(
      `Received event=${eventType} correlationId=${correlationId} analysisId=${payload?.analysisId}`,
    )

    if (eventType !== 'analysis.processed') {
      this.logger.warn(`Unexpected eventType=${eventType}, skipping`)
      return
    }

    const {
      analysisId,
      components,
      risks,
      recommendations,
      summary,
      model,
      promptVersion,
      confidence,
      processingTimeMs,
    } = payload

    await this.createReportUseCase.execute({
      analysisId,
      components: components || [],
      risks: risks || [],
      recommendations: recommendations || [],
      summary: summary || '',
      model: model || 'unknown',
      promptVersion: promptVersion || 'v1',
      confidence: confidence || 0,
      processingTimeMs: processingTimeMs || 0,
      correlationId,
    })

    this.logger.log(`Report created for analysisId=${analysisId} correlationId=${correlationId}`)
  }
}
