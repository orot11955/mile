import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/authenticated-user';
import { HistoryEntityType } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HistoriesService } from './histories.service';

@ApiTags('Histories')
@ApiBearerAuth('access-token')
@Controller('histories')
@UseGuards(JwtAuthGuard)
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.historiesService.listForUser(user.id, workspaceId);
  }

  @Get('entity/:entityType/:entityId')
  listEntity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('entityType') entityType: HistoryEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.historiesService.listEntityForUser(
      user.id,
      entityType,
      entityId,
    );
  }

  @Get('projects/:projectId')
  listProject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.historiesService.listProjectForUser(user.id, projectId);
  }
}
