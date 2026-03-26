import { Controller, Get, Param, Query, HttpStatus, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'
import { GetReportUseCase } from '@application/use-cases/get-report.use-case'
import { GetReportByAnalysisUseCase } from '@application/use-cases/get-report-by-analysis.use-case'
import { ListReportsUseCase } from '@application/use-cases/list-reports.use-case'
import { ListReportsQueryDto } from '../dtos/report.response'

@ApiTags('reports')
@Controller()
export class ReportsController {
  constructor(
    private readonly getReportUseCase: GetReportUseCase,
    private readonly getReportByAnalysisUseCase: GetReportByAnalysisUseCase,
    private readonly listReportsUseCase: ListReportsUseCase,
  ) {}

  @Get('reports')
  @ApiOperation({ summary: 'List all reports with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of reports with pagination metadata',
  })
  async listReports(@Query() query: ListReportsQueryDto) {
    return await this.listReportsUseCase.execute({
      page: query.page,
      limit: query.limit,
    })
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Full report with all fields',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Report not found',
  })
  async getReport(@Param('id') id: string) {
    try {
      return await this.getReportUseCase.execute(id)
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new NotFoundException(`Report with ID ${id} not found`)
    }
  }

  @Get('analyses/:analysisId/report')
  @ApiOperation({ summary: 'Get report by analysis ID' })
  @ApiParam({ name: 'analysisId', description: 'Analysis UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Full report for the given analysis',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Report not found for this analysis (may still be processing)',
  })
  async getReportByAnalysis(@Param('analysisId') analysisId: string) {
    try {
      return await this.getReportByAnalysisUseCase.execute(analysisId)
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new NotFoundException(`Report not found for analysis ${analysisId}`)
    }
  }
}
