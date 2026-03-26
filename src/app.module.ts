import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { appConfig } from '@config/app.config'
import { DatabaseModule } from '@infra/database/database.module'
import { MessagingModule } from '@infra/messaging/messaging.module'
import { ReportsController } from '@interfaces/rest/controllers/reports.controller'
import { HealthController } from '@interfaces/rest/controllers/health.controller'
import { GetReportUseCase } from '@application/use-cases/get-report.use-case'
import { GetReportByAnalysisUseCase } from '@application/use-cases/get-report-by-analysis.use-case'
import { ListReportsUseCase } from '@application/use-cases/list-reports.use-case'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    MessagingModule,
  ],
  controllers: [ReportsController, HealthController],
  providers: [GetReportUseCase, GetReportByAnalysisUseCase, ListReportsUseCase],
})
export class AppModule {}
