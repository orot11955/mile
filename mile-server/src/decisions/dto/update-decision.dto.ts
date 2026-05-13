import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { DecisionStatus } from '@prisma/client';

export class UpdateDecisionDto {
  @IsOptional()
  @IsString()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  context?: string | null;

  @IsOptional()
  @IsString()
  decision?: string;

  @IsOptional()
  @IsString()
  reason?: string | null;

  @IsOptional()
  @IsArray()
  alternatives?: string[] | null;

  @IsOptional()
  @IsString()
  impact?: string | null;

  @ApiPropertyOptional({ enum: DecisionStatus })
  @IsOptional()
  @IsEnum(DecisionStatus)
  status?: DecisionStatus;

  @IsOptional()
  @IsISO8601()
  decidedAt?: string | null;
}
