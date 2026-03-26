import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IReportRepository, REPORT_REPOSITORY } from '@domain/repositories/report.repository'
import { ReportResponseDto } from '../dtos/report-response.dto'
import { ReportMapper } from '../mappers/report.mapper'

/**
 * Use case for retrieving a report by analysis ID
 */
@Injectable()
export class GetReportByAnalysisUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(analysisId: string): Promise<ReportResponseDto> {
    const report = await this.reportRepository.findByAnalysisId(analysisId)

    if (!report) {
      throw new NotFoundException(`Report not found for this analysis. The analysis may still be processing.`)
    }

    return ReportMapper.toResponseDto(report)
  }
}
