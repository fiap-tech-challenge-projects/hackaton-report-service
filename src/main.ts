import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { CorrelationIdInterceptor } from '@shared/interceptors/correlation-id.interceptor'
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Enable CORS
  app.enableCors()

  // API prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1'
  app.setGlobalPrefix(apiPrefix)

  // Global interceptors
  app.useGlobalInterceptors(new CorrelationIdInterceptor())

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter())

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Report Service API')
    .setDescription('Report Service - Generates and serves structured technical reports from diagram analysis')
    .setVersion('1.0')
    .addTag('reports', 'Report management endpoints')
    .addTag('health', 'Health check endpoints')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document)

  const port = process.env.PORT || 3003
  await app.listen(port)

  console.log(`Report Service is running on: http://localhost:${port}${apiPrefix}`)
  console.log(`Swagger docs available at: http://localhost:${port}${apiPrefix}/docs`)
}

bootstrap()
