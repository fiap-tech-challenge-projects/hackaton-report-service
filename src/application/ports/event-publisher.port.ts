/**
 * Event publisher port interface
 * Abstracts the messaging infrastructure from application layer
 */
export interface IEventPublisher {
  publishReportGenerated(payload: ReportGeneratedPayload): Promise<void>
}

export interface ReportGeneratedPayload {
  analysisId: string
  reportId: string
  correlationId: string
}

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER')
