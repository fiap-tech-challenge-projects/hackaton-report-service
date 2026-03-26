import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IReportRepository, REPORT_REPOSITORY } from '@domain/repositories/report.repository'
import { ReportResponseDto } from '../dtos/report-response.dto'
import { ReportMapper } from '../mappers/report.mapper'

/**
 * Use case for retrieving a report by ID
 */
@Injectable()
export class GetReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(id: string): Promise<ReportResponseDto> {
    const report = await this.reportRepository.findById(id)

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`)
    }

    return ReportMapper.toResponseDto(report)
  }
}
