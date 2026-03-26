import { BaseEntity } from '@shared/base/base.entity'
import { v4 as uuidv4 } from 'uuid'

export interface ReportComponent {
  id: string
  name: string
  type: string
  description: string
  connections: string[]
}

export interface ReportRisk {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  affectedComponents: string[]
}

export interface ReportRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  relatedRisks: string[]
}

export interface ReportMetadata {
  model: string
  promptVersion: string
  processingTimeMs: number
  confidence: number
  analyzedAt: string
}

export class Report extends BaseEntity {
  private readonly _analysisId: string
  private readonly _title: string
  private readonly _summary: string
  private readonly _components: ReportComponent[]
  private readonly _risks: ReportRisk[]
  private readonly _recommendations: ReportRecommendation[]
  private readonly _metadata: ReportMetadata

  constructor(
    id: string,
    analysisId: string,
    title: string,
    summary: string,
    components: ReportComponent[],
    risks: ReportRisk[],
    recommendations: ReportRecommendation[],
    metadata: ReportMetadata,
    createdAt: Date,
  ) {
    super(id, createdAt)
    this._analysisId = analysisId
    this._title = title
    this._summary = summary
    this._components = components
    this._risks = risks
    this._recommendations = recommendations
    this._metadata = metadata
  }

  static create(
    analysisId: string,
    summary: string,
    components: ReportComponent[],
    risks: ReportRisk[],
    recommendations: ReportRecommendation[],
    metadata: ReportMetadata,
  ): Report {
    return new Report(
      uuidv4(),
      analysisId,
      'Architecture Analysis Report',
      summary,
      components,
      risks,
      recommendations,
      metadata,
      new Date(),
    )
  }

  get analysisId(): string {
    return this._analysisId
  }

  get title(): string {
    return this._title
  }

  get summary(): string {
    return this._summary
  }

  get components(): ReportComponent[] {
    return this._components
  }

  get risks(): ReportRisk[] {
    return this._risks
  }

  get recommendations(): ReportRecommendation[] {
    return this._recommendations
  }

  get metadata(): ReportMetadata {
    return this._metadata
  }
}
