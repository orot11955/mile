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
import { CalendarSourcesService } from './calendar-sources.service';
import { CreateCalendarSourceDto } from './dto/create-calendar-source.dto';
import { UpdateCalendarSourceDto } from './dto/update-calendar-source.dto';

@ApiTags('Calendar Sources')
@ApiBearerAuth('access-token')
@Controller('calendar-sources')
@UseGuards(JwtAuthGuard)
export class CalendarSourcesController {
  constructor(
    private readonly calendarSourcesService: CalendarSourcesService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.calendarSourcesService.list(user.id, workspaceId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCalendarSourceDto,
  ) {
    return this.calendarSourcesService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.calendarSourcesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarSourceDto,
  ) {
    return this.calendarSourcesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.calendarSourcesService.remove(user.id, id);
  }

  @Post(':id/sync')
  sync(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.calendarSourcesService.sync(user.id, id);
  }

  @Get(':id/sync-logs')
  syncLogs(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.calendarSourcesService.syncLogs(user.id, id);
  }
}
