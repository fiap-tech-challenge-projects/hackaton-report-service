import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PrismaService } from '@infra/database/prisma.service'
import { ConfigService } from '@nestjs/config'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async check() {
    const dbStatus = await this.checkDatabase()

    return {
      status: 'ok',
      service: 'report-service',
      version: this.configService.get('SERVICE_VERSION', '1.0.0'),
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      dependencies: {
        database: dbStatus,
      },
    }
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`
      return 'ok'
    } catch {
      return 'error'
    }
  }
}
