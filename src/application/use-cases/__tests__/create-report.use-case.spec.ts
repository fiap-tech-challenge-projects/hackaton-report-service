import { CreateReportUseCase } from '../create-report.use-case'
import { IReportRepository } from '@domain/repositories/report.repository'
import { IEventPublisher } from '@application/ports/event-publisher.port'
import { Report } from '@domain/entities/report.entity'
import { CreateReportDto } from '@application/dtos/create-report.dto'

describe('CreateReportUseCase', () => {
  let useCase: CreateReportUseCase
  let reportRepository: jest.Mocked<IReportRepository>
  let eventPublisher: jest.Mocked<IEventPublisher>

  const mockComponent = {
    id: 'comp-1',
    name: 'API Gateway',
    type: 'gateway',
    description: 'Entry point',
    connections: ['User Service'],
  }

  const mockRisk = {
    id: 'risk-1',
    title: 'Single Point of Failure',
    description: 'No redundancy',
    severity: 'critical' as const,
    category: 'reliability',
    affectedComponents: ['API Gateway'],
  }

  const mockRecommendation = {
    id: 'rec-1',
    title: 'Add Redundancy',
    description: 'Deploy multiple instances',
    priority: 'high' as const,
    effort: 'medium' as const,
    relatedRisks: ['Single Point of Failure'],
  }

  const mockDto: CreateReportDto = {
    analysisId: '550e8400-e29b-41d4-a716-446655440000',
    summary: 'A microservices architecture with 8 components',
    components: [mockComponent],
    risks: [mockRisk],
    recommendations: [mockRecommendation],
    model: 'claude-sonnet-4-20250514',
    promptVersion: 'v1',
    confidence: 0.85,
    processingTimeMs: 5200,
    correlationId: 'corr-123',
  }

  beforeEach(() => {
    reportRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAnalysisId: jest.fn(),
      findAll: jest.fn(),
    }

    eventPublisher = {
      publishReportGenerated: jest.fn(),
    }

    useCase = new CreateReportUseCase(reportRepository, eventPublisher)
  })

  describe('execute', () => {
    it('should create a report and return response DTO', async () => {
      const savedReport = Report.create(
        mockDto.analysisId,
        mockDto.summary,
        mockDto.components,
        mockDto.risks,
        mockDto.recommendations,
        {
          model: mockDto.model,
          promptVersion: mockDto.promptVersion,
          processingTimeMs: mockDto.processingTimeMs,
          confidence: mockDto.confidence,
          analyzedAt: new Date().toISOString(),
        },
      )

      reportRepository.create.mockResolvedValue(savedReport)
      eventPublisher.publishReportGenerated.mockResolvedValue()

      const result = await useCase.execute(mockDto)

      expect(reportRepository.create).toHaveBeenCalledTimes(1)
      expect(eventPublisher.publishReportGenerated).toHaveBeenCalledTimes(1)
      expect(result).toMatchObject({
        analysisId: mockDto.analysisId,
        title: 'Architecture Analysis Report',
        summary: mockDto.summary,
      })
    })

    it('should publish report.generated event after creating report', async () => {
      const savedReport = Report.create(
        mockDto.analysisId,
        mockDto.summary,
        mockDto.components,
        mockDto.risks,
        mockDto.recommendations,
        {
          model: mockDto.model,
          promptVersion: mockDto.promptVersion,
          processingTimeMs: mockDto.processingTimeMs,
          confidence: mockDto.confidence,
          analyzedAt: new Date().toISOString(),
        },
      )

      reportRepository.create.mockResolvedValue(savedReport)
      eventPublisher.publishReportGenerated.mockResolvedValue()

      await useCase.execute(mockDto)

      expect(eventPublisher.publishReportGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          analysisId: mockDto.analysisId,
          correlationId: mockDto.correlationId,
        }),
      )
    })

    it('should map components, risks and recommendations correctly', async () => {
      const savedReport = Report.create(
        mockDto.analysisId,
        mockDto.summary,
        mockDto.components,
        mockDto.risks,
        mockDto.recommendations,
        {
          model: mockDto.model,
          promptVersion: mockDto.promptVersion,
          processingTimeMs: mockDto.processingTimeMs,
          confidence: mockDto.confidence,
          analyzedAt: new Date().toISOString(),
        },
      )

      reportRepository.create.mockResolvedValue(savedReport)
      eventPublisher.publishReportGenerated.mockResolvedValue()

      const result = await useCase.execute(mockDto)

      expect(result.components).toHaveLength(1)
      expect(result.risks).toHaveLength(1)
      expect(result.recommendations).toHaveLength(1)
      expect(result.components[0].name).toBe('API Gateway')
      expect(result.risks[0].severity).toBe('critical')
    })

    it('should use report ID as correlationId when not provided', async () => {
      const dtoWithoutCorrelationId: CreateReportDto = {
        ...mockDto,
        correlationId: undefined,
      }

      const savedReport = Report.create(
        mockDto.analysisId,
        mockDto.summary,
        mockDto.components,
        mockDto.risks,
        mockDto.recommendations,
        {
          model: mockDto.model,
          promptVersion: mockDto.promptVersion,
          processingTimeMs: mockDto.processingTimeMs,
          confidence: mockDto.confidence,
          analyzedAt: new Date().toISOString(),
        },
      )

      reportRepository.create.mockResolvedValue(savedReport)
      eventPublisher.publishReportGenerated.mockResolvedValue()

      await useCase.execute(dtoWithoutCorrelationId)

      expect(eventPublisher.publishReportGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: savedReport.id,
        }),
      )
    })

    it('should propagate repository errors', async () => {
      reportRepository.create.mockRejectedValue(new Error('Database error'))

      await expect(useCase.execute(mockDto)).rejects.toThrow('Database error')
      expect(eventPublisher.publishReportGenerated).not.toHaveBeenCalled()
    })
  })
})
