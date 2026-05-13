import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventSyncStatus, EventType } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  workspaceId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  calendarSourceId?: string;

  @IsOptional()
  @IsString()
  externalEventId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiPropertyOptional({ enum: EventSyncStatus })
  @IsOptional()
  @IsEnum(EventSyncStatus)
  syncStatus?: EventSyncStatus;
}
