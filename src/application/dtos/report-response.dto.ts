import {
  ReportComponent,
  ReportRisk,
  ReportRecommendation,
  ReportMetadata,
} from '@domain/entities/report.entity'

export interface ReportResponseDto {
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
