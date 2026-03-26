import {
  ReportComponent,
  ReportRisk,
  ReportRecommendation,
  ReportMetadata,
} from '@domain/entities/report.entity'

/**
 * DTO for creating a report from an analysis.processed event payload
 */
export interface CreateReportDto {
  analysisId: string
  components: ReportComponent[]
  risks: ReportRisk[]
  recommendations: ReportRecommendation[]
  summary: string
  model: string
  promptVersion: string
  confidence: number
  processingTimeMs: number
  correlationId?: string
}

export interface CreateReportResponseDto {
  id: string
  analysisId: string
  title: string
  summary: string
  components: ReportComponent[]
  risks: ReportRisk[]
  recommendations: ReportRecommendation[]
  metadata: ReportMetadata
  createdAt: string
}
