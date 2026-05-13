import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CalendarProvider,
  CalendarSourceStatus,
  SyncDirection,
} from '@prisma/client';

export class UpdateCalendarSourceDto {
  @ApiPropertyOptional({ enum: CalendarProvider })
  @IsOptional()
  @IsEnum(CalendarProvider)
  provider?: CalendarProvider;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  accountLabel?: string | null;

  @ApiPropertyOptional({ enum: SyncDirection })
  @IsOptional()
  @IsEnum(SyncDirection)
  syncDirection?: SyncDirection;

  @ApiPropertyOptional({ enum: CalendarSourceStatus })
  @IsOptional()
  @IsEnum(CalendarSourceStatus)
  syncStatus?: CalendarSourceStatus;
}
