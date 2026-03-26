export interface ListReportsDto {
  page?: number
  limit?: number
}

export interface ReportSummaryDto {
  id: string
  analysisId: string
  title: string
  summary: string
  componentCount: number
  riskCount: number
  recommendationCount: number
  createdAt: string
}

export interface ListReportsResponseDto {
  data: ReportSummaryDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
