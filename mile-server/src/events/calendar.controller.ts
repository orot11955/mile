import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/authenticated-user';
import { EventsService } from './events.service';

@ApiTags('Calendar')
@ApiBearerAuth('access-token')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  calendar(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.eventsService.list(user.id, { workspaceId });
  }

  @Get('agenda')
  agenda(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.eventsService.agenda(user.id, workspaceId);
  }

  @Get('dev')
  devCalendar(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.eventsService.devCalendar(user.id, workspaceId);
  }
}
