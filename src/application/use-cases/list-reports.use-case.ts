import { Inject, Injectable } from '@nestjs/common'
import { IReportRepository, REPORT_REPOSITORY } from '@domain/repositories/report.repository'
import { ListReportsDto, ListReportsResponseDto } from '../dtos/list-reports.dto'
import { ReportMapper } from '../mappers/report.mapper'

/**
 * Use case for listing reports with pagination
 */
@Injectable()
export class ListReportsUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(dto: ListReportsDto): Promise<ListReportsResponseDto> {
    const page = Math.max(1, dto.page || 1)
    const limit = Math.min(100, Math.max(1, dto.limit || 10))

    const { reports, total } = await this.reportRepository.findAll({ page, limit })

    return {
      data: reports.map((r) => ReportMapper.toSummaryDto(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
