import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/authenticated-user';
import { DecisionStatus } from '@prisma/client';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { UpdateDecisionStatusDto } from './dto/update-decision-status.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { DecisionsService } from './decisions.service';

@ApiTags('Decisions')
@ApiBearerAuth('access-token')
@Controller('decisions')
@UseGuards(JwtAuthGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: DecisionStatus,
  ) {
    return this.decisionsService.list(user.id, workspaceId, projectId, status);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDecisionDto,
  ) {
    return this.decisionsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.decisionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDecisionDto,
  ) {
    return this.decisionsService.update(user.id, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDecisionStatusDto,
  ) {
    return this.decisionsService.updateStatus(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.decisionsService.remove(user.id, id);
  }
}
