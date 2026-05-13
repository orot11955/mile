import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkspaceType } from '@prisma/client';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: WorkspaceType })
  @IsOptional()
  @IsEnum(WorkspaceType)
  type?: WorkspaceType;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsString()
  icon?: string | null;
}
