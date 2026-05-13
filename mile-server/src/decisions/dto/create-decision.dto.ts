import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { DecisionStatus } from '@prisma/client';

export class CreateDecisionDto {
  @IsString()
  workspaceId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsString()
  decision!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsArray()
  alternatives?: string[];

  @IsOptional()
  @IsString()
  impact?: string;

  @ApiPropertyOptional({ enum: DecisionStatus })
  @IsOptional()
  @IsEnum(DecisionStatus)
  status?: DecisionStatus;

  @IsOptional()
  @IsISO8601()
  decidedAt?: string;
}
