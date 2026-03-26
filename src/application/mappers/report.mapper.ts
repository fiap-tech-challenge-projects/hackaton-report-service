import { Report } from '@domain/entities/report.entity'
import { ReportResponseDto } from '../dtos/report-response.dto'
import { ReportSummaryDto } from '../dtos/list-reports.dto'

/**
 * Maps Report domain entity to DTOs
 */
export class ReportMapper {
  static toResponseDto(report: Report): ReportResponseDto {
    return {
      id: report.id,
      analysisId: report.analysisId,
      title: report.title,
      summary: report.summary,
      components: report.components,
      risks: report.risks,
      recommendations: report.recommendations,
      metadata: report.metadata,
      createdAt: report.createdAt.toISOString(),
    }
  }

  static toSummaryDto(report: Report): ReportSummaryDto {
    return {
      id: report.id,
      analysisId: report.analysisId,
      title: report.title,
      summary: report.summary,
      componentCount: report.components.length,
      riskCount: report.risks.length,
      recommendationCount: report.recommendations.length,
      createdAt: report.createdAt.toISOString(),
    }
  }
}
