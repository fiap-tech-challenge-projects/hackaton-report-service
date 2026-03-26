import { Report } from '../entities/report.entity'

export interface FindAllOptions {
  page: number
  limit: number
}

export interface FindAllResult {
  reports: Report[]
  total: number
}

/**
 * Report repository interface
 * Defines operations for persisting and retrieving reports
 */
export interface IReportRepository {
  /**
   * Create a new report
   */
  create(report: Report): Promise<Report>

  /**
   * Find report by ID
   */
  findById(id: string): Promise<Report | null>

  /**
   * Find report by analysis ID
   */
  findByAnalysisId(analysisId: string): Promise<Report | null>

  /**
   * Find all reports with pagination
   */
  findAll(options: FindAllOptions): Promise<FindAllResult>
}

export const REPORT_REPOSITORY = Symbol('REPORT_REPOSITORY')
