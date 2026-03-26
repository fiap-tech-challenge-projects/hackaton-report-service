/**
 * Application configuration
 * Reads from environment variables with defaults
 */
export const appConfig = () => ({
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/report_service',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  },
})
