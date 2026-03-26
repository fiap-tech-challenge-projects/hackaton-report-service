import { Module } from '@nestjs/common'
import { RabbitmqConsumerService } from './rabbitmq-consumer.service'
import { RabbitmqPublisherService } from './rabbitmq-publisher.service'
import { EVENT_PUBLISHER } from '@application/ports/event-publisher.port'
import { CreateReportUseCase } from '@application/use-cases/create-report.use-case'
import { DatabaseModule } from '@infra/database/database.module'

/**
 * Messaging module - RabbitMQ consumer and publisher
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    RabbitmqConsumerService,
    {
      provide: EVENT_PUBLISHER,
      useClass: RabbitmqPublisherService,
    },
    CreateReportUseCase,
  ],
  exports: [EVENT_PUBLISHER, CreateReportUseCase],
})
export class MessagingModule {}
