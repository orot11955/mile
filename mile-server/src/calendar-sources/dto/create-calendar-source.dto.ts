import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CalendarProvider,
  CalendarSourceStatus,
  SyncDirection,
} from '@prisma/client';

export class CreateCalendarSourceDto {
  @IsString()
  workspaceId!: string;

  @ApiProperty({ enum: CalendarProvider })
  @IsEnum(CalendarProvider)
  provider!: CalendarProvider;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  accountLabel?: string;

  @ApiPropertyOptional({ enum: SyncDirection })
  @IsOptional()
  @IsEnum(SyncDirection)
  syncDirection?: SyncDirection;

  @ApiPropertyOptional({ enum: CalendarSourceStatus })
  @IsOptional()
  @IsEnum(CalendarSourceStatus)
  syncStatus?: CalendarSourceStatus;
}
