import { Injectable } from '@nestjs/common'
import {
  Report,
  ReportComponent,
  ReportRisk,
  ReportRecommendation,
  ReportMetadata,
} from '@domain/entities/report.entity'
import {
  IReportRepository,
  FindAllOptions,
  FindAllResult,
} from '@domain/repositories/report.repository'
import { PrismaService } from '../prisma.service'

/**
 * Prisma implementation of Report repository
 */
@Injectable()
export class PrismaReportRepository implements IReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(report: Report): Promise<Report> {
    const created = await this.prisma.report.create({
      data: {
        id: report.id,
        analysisId: report.analysisId,
        title: report.title,
        summary: report.summary,
        components: report.components as any,
        risks: report.risks as any,
        recommendations: report.recommendations as any,
        metadata: report.metadata as any,
        createdAt: report.createdAt,
      },
    })

    return this.toDomain(created)
  }

  async findById(id: string): Promise<Report | null> {
    const found = await this.prisma.report.findUnique({
      where: { id },
    })

    return found ? this.toDomain(found) : null
  }

  async findByAnalysisId(analysisId: string): Promise<Report | null> {
    const found = await this.prisma.report.findUnique({
      where: { analysisId },
    })

    return found ? this.toDomain(found) : null
  }

  async findAll(options: FindAllOptions): Promise<FindAllResult> {
    const { page, limit } = options
    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count(),
    ])

    return {
      reports: reports.map((r) => this.toDomain(r)),
      total,
    }
  }

  private toDomain(model: any): Report {
    return new Report(
      model.id,
      model.analysisId,
      model.title,
      model.summary,
      model.components as ReportComponent[],
      model.risks as ReportRisk[],
      model.recommendations as ReportRecommendation[],
      model.metadata as ReportMetadata,
      model.createdAt,
    )
  }
}
