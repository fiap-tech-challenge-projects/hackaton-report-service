import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { PrismaReportRepository } from './repositories/prisma-report.repository'
import { REPORT_REPOSITORY } from '@domain/repositories/report.repository'

/**
 * Database module providing repository implementations
 */
@Module({
  providers: [
    PrismaService,
    {
      provide: REPORT_REPOSITORY,
      useClass: PrismaReportRepository,
    },
  ],
  exports: [PrismaService, REPORT_REPOSITORY],
})
export class DatabaseModule {}
