import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DecisionStatus } from '@prisma/client';

export class UpdateDecisionStatusDto {
  @ApiProperty({ enum: DecisionStatus })
  @IsEnum(DecisionStatus)
  status!: DecisionStatus;
}
