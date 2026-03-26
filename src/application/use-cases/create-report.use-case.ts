import { Inject, Injectable, Logger } from '@nestjs/common'
import { Report } from '@domain/entities/report.entity'
import { IReportRepository, REPORT_REPOSITORY } from '@domain/repositories/report.repository'
import { IEventPublisher, EVENT_PUBLISHER } from '../ports/event-publisher.port'
import { CreateReportDto, CreateReportResponseDto } from '../dtos/create-report.dto'
import { ReportMapper } from '../mappers/report.mapper'

/**
 * Use case for creating a report from an analysis.processed event
 */
@Injectable()
export class CreateReportUseCase {
  private readonly logger = new Logger(CreateReportUseCase.name)

  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: IReportRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(dto: CreateReportDto): Promise<CreateReportResponseDto> {
    this.logger.log(`Creating report for analysisId=${dto.analysisId}`)

    const metadata = {
      model: dto.model,
      promptVersion: dto.promptVersion,
      processingTimeMs: dto.processingTimeMs,
      confidence: dto.confidence,
      analyzedAt: new Date().toISOString(),
    }

    const report = Report.create(
      dto.analysisId,
      dto.summary,
      dto.components,
      dto.risks,
      dto.recommendations,
      metadata,
    )

    const saved = await this.reportRepository.create(report)

    this.logger.log(`Report created id=${saved.id} for analysisId=${saved.analysisId}`)

    await this.eventPublisher.publishReportGenerated({
      analysisId: saved.analysisId,
      reportId: saved.id,
      correlationId: dto.correlationId || saved.id,
    })

    return ReportMapper.toResponseDto(saved) as CreateReportResponseDto
  }
}
