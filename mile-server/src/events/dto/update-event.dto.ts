import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventSyncStatus, EventType } from '@prisma/client';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  taskId?: string | null;

  @IsOptional()
  @IsString()
  calendarSourceId?: string | null;

  @IsOptional()
  @IsString()
  externalEventId?: string | null;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string | null;

  @ApiPropertyOptional({ enum: EventSyncStatus })
  @IsOptional()
  @IsEnum(EventSyncStatus)
  syncStatus?: EventSyncStatus;
}
