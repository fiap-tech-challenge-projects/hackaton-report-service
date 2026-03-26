import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ReportsController } from '../reports.controller'
import { GetReportUseCase } from '@application/use-cases/get-report.use-case'
import { GetReportByAnalysisUseCase } from '@application/use-cases/get-report-by-analysis.use-case'
import { ListReportsUseCase } from '@application/use-cases/list-reports.use-case'
import { ReportResponseDto } from '@application/dtos/report-response.dto'
import { ListReportsResponseDto } from '@application/dtos/list-reports.dto'

describe('ReportsController', () => {
  let controller: ReportsController
  let getReportUseCase: jest.Mocked<GetReportUseCase>
  let getReportByAnalysisUseCase: jest.Mocked<GetReportByAnalysisUseCase>
  let listReportsUseCase: jest.Mocked<ListReportsUseCase>

  const mockReport: ReportResponseDto = {
    id: '660e8400-e29b-41d4-a716-446655440000',
    analysisId: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Architecture Analysis Report',
    summary: 'Microservices architecture with 8 components',
    components: [
      {
        id: 'comp-1',
        name: 'API Gateway',
        type: 'gateway',
        description: 'Entry point',
        connections: ['User Service'],
      },
    ],
    risks: [
      {
        id: 'risk-1',
        title: 'Single Point of Failure',
        description: 'No redundancy',
        severity: 'critical',
        category: 'reliability',
        affectedComponents: ['API Gateway'],
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        title: 'Add Redundancy',
        description: 'Deploy multiple instances',
        priority: 'high',
        effort: 'medium',
        relatedRisks: ['Single Point of Failure'],
      },
    ],
    metadata: {
      model: 'claude-sonnet-4-20250514',
      promptVersion: 'v1',
      processingTimeMs: 5200,
      confidence: 0.85,
      analyzedAt: '2026-03-26T10:00:30.000Z',
    },
    createdAt: '2026-03-26T10:00:35.000Z',
  }

  const mockListResponse: ListReportsResponseDto = {
    data: [
      {
        id: '660e8400-e29b-41d4-a716-446655440000',
        analysisId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Architecture Analysis Report',
        summary: 'Microservices architecture with 8 components',
        componentCount: 8,
        riskCount: 3,
        recommendationCount: 5,
        createdAt: '2026-03-26T10:00:35.000Z',
      },
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: GetReportUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetReportByAnalysisUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListReportsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile()

    controller = module.get<ReportsController>(ReportsController)
    getReportUseCase = module.get(GetReportUseCase)
    getReportByAnalysisUseCase = module.get(GetReportByAnalysisUseCase)
    listReportsUseCase = module.get(ListReportsUseCase)
  })

  describe('listReports', () => {
    it('should return paginated list of reports', async () => {
      listReportsUseCase.execute.mockResolvedValue(mockListResponse)

      const result = await controller.listReports({ page: 1, limit: 10 })

      expect(listReportsUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 })
      expect(result).toEqual(mockListResponse)
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('should use default pagination when no query params provided', async () => {
      listReportsUseCase.execute.mockResolvedValue(mockListResponse)

      await controller.listReports({})

      expect(listReportsUseCase.execute).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
      })
    })
  })

  describe('getReport', () => {
    it('should return a report by ID', async () => {
      getReportUseCase.execute.mockResolvedValue(mockReport)

      const result = await controller.getReport('660e8400-e29b-41d4-a716-446655440000')

      expect(getReportUseCase.execute).toHaveBeenCalledWith('660e8400-e29b-41d4-a716-446655440000')
      expect(result).toEqual(mockReport)
    })

    it('should throw NotFoundException when report not found', async () => {
      getReportUseCase.execute.mockRejectedValue(
        new NotFoundException('Report with ID non-existent not found'),
      )

      await expect(controller.getReport('non-existent')).rejects.toThrow(NotFoundException)
    })

    it('should re-throw NotFoundException from use case', async () => {
      const notFound = new NotFoundException('Report with ID abc not found')
      getReportUseCase.execute.mockRejectedValue(notFound)

      await expect(controller.getReport('abc')).rejects.toThrow('Report with ID abc not found')
    })
  })

  describe('getReportByAnalysis', () => {
    it('should return a report by analysis ID', async () => {
      getReportByAnalysisUseCase.execute.mockResolvedValue(mockReport)

      const result = await controller.getReportByAnalysis('550e8400-e29b-41d4-a716-446655440000')

      expect(getReportByAnalysisUseCase.execute).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      )
      expect(result).toEqual(mockReport)
      expect(result.analysisId).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    it('should throw NotFoundException when no report found for analysis', async () => {
      getReportByAnalysisUseCase.execute.mockRejectedValue(
        new NotFoundException('Report not found for this analysis. The analysis may still be processing.'),
      )

      await expect(controller.getReportByAnalysis('non-existent')).rejects.toThrow(NotFoundException)
    })
  })
})
