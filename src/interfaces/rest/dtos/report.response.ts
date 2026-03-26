import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class ListReportsQueryDto {
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1

  @ApiProperty({ description: 'Items per page (max 100)', default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number = 10
}
