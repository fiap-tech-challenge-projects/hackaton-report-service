import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as amqplib from 'amqplib'
import { IEventPublisher, ReportGeneratedPayload } from '@application/ports/event-publisher.port'
import { v4 as uuidv4 } from 'uuid'

/**
 * RabbitMQ implementation of IEventPublisher
 * Publishes report.generated events
 */
@Injectable()
export class RabbitmqPublisherService implements IEventPublisher, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqPublisherService.name)
  private connection: any
  private channel: any

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect()
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  private async connect() {
    try {
      const url = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://guest:guest@localhost:5672',
      )
      this.connection = await amqplib.connect(url)
      this.channel = await this.connection.createChannel()

      await this.channel.assertExchange('hackaton-events', 'topic', { durable: true })

      this.logger.log('RabbitMQ publisher connected')
    } catch (error) {
      this.logger.error(`Failed to connect RabbitMQ publisher: ${error.message}`)
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close()
      await this.connection?.close()
    } catch (error) {
      this.logger.warn(`Error closing RabbitMQ publisher: ${error.message}`)
    }
  }

  async publishReportGenerated(payload: ReportGeneratedPayload): Promise<void> {
    const envelope = {
      eventType: 'report.generated',
      timestamp: new Date().toISOString(),
      correlationId: payload.correlationId || uuidv4(),
      source: 'report-service',
      version: '1.0',
      payload: {
        analysisId: payload.analysisId,
        reportId: payload.reportId,
      },
    }

    try {
      if (!this.channel) {
        this.logger.warn('RabbitMQ channel not available, skipping publish')
        return
      }

      const message = Buffer.from(JSON.stringify(envelope))
      this.channel.publish('hackaton-events', 'report.generated', message, {
        persistent: true,
        contentType: 'application/json',
      })

      this.logger.log(
        `Published report.generated event analysisId=${payload.analysisId} reportId=${payload.reportId}`,
      )
    } catch (error) {
      this.logger.error(`Failed to publish report.generated: ${error.message}`)
    }
  }
}
