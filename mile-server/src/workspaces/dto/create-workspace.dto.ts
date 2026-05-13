import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkspaceType } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsString()
  name!: string;

  @ApiProperty({ enum: WorkspaceType })
  @IsEnum(WorkspaceType)
  type!: WorkspaceType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
