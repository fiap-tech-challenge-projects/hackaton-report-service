# Report Service

Report generation and storage service. Consumes processed analysis events from RabbitMQ, persists structured technical reports in PostgreSQL, and exposes REST endpoints for report retrieval.

## Tech Stack

- **Runtime:** NestJS 11, TypeScript 5
- **Database:** PostgreSQL 15 via Prisma 6
- **Messaging:** RabbitMQ (amqplib)
- **Docs:** Swagger / OpenAPI

## Architecture

Clean Architecture:

```
src/
  domain/          # Entities, value objects, domain interfaces
  application/     # Use cases, DTOs, ports
  infra/           # Prisma, RabbitMQ adapters
  interfaces/      # Controllers
  shared/          # Filters, interceptors, utilities
  config/          # Configuration
```

## Event-Driven Flow

1. **Consumes** `analysis.processed` from RabbitMQ
2. Generates a structured report from the analysis result
3. Persists the report in PostgreSQL
4. **Produces** `report.generated`

## API Endpoints

| Method | Path                                  | Description               |
| ------ | ------------------------------------- | ------------------------- |
| `GET`  | `/api/v1/reports`                     | List all reports          |
| `GET`  | `/api/v1/reports/:id`                 | Get report by ID          |
| `GET`  | `/api/v1/analyses/:analysisId/report` | Get report by analysis ID |
| `GET`  | `/api/v1/health`                      | Health check              |

Swagger UI is available at `/api/v1/docs` when the service is running.

## Data Model

```prisma
model Report {
  id              String   @id @default(uuid())
  analysisId      String   @unique
  title           String
  summary         String
  components      Json
  risks           Json
  recommendations Json
  metadata        Json
  createdAt       DateTime
}
```

## Environment Variables

| Variable          | Description                  | Required | Default          |
| ----------------- | ---------------------------- | -------- | ---------------- |
| `NODE_ENV`        | Environment                  | No       | `development`    |
| `PORT`            | Server port                  | No       | `3003`           |
| `API_PREFIX`      | API route prefix             | No       | `/api/v1`        |
| `DATABASE_URL`    | PostgreSQL connection string | Yes      | -                |
| `RABBITMQ_URL`    | RabbitMQ connection string   | Yes      | -                |
| `SERVICE_NAME`    | Service identifier           | No       | `report-service` |
| `SERVICE_VERSION` | Service version              | No       | `1.0.0`          |

## Running Locally

```bash
cp .env.example .env
# Edit .env with your local values

npm install
npx prisma generate
npx prisma migrate dev

npm run start:dev
```

## Tests

```bash
npm test              # Unit tests
npm run test:cov      # With coverage
npm run test:e2e      # End-to-end tests
```

## Docker

```bash
docker build -t report-service .
docker run -p 3003:3003 --env-file .env report-service
```

## License

UNLICENSED
