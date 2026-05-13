import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoriesService } from '../histories/histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateCalendarSourceDto } from './dto/create-calendar-source.dto';
import { UpdateCalendarSourceDto } from './dto/update-calendar-source.dto';

@Injectable()
export class CalendarSourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly histories: HistoriesService,
  ) {}

  async list(userId: string, workspaceId?: string) {
    if (workspaceId) {
      await this.workspaces.findOne(userId, workspaceId);
    }

    return this.prisma.calendarSource.findMany({
      where: {
        workspaceId,
        workspace: { ownerId: userId },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateCalendarSourceDto) {
    await this.workspaces.findOne(userId, dto.workspaceId);

    const source = await this.prisma.calendarSource.create({
      data: {
        workspaceId: dto.workspaceId,
        provider: dto.provider,
        name: dto.name,
        accountLabel: dto.accountLabel,
        syncDirection: dto.syncDirection,
        syncStatus: dto.syncStatus,
      },
    });

    await this.histories.record({
      workspaceId: source.workspaceId,
      entityType: 'CALENDAR_SOURCE',
      entityId: source.id,
      eventType: 'CREATED',
      afterValue: source,
      message: `Calendar source "${source.name}" was created.`,
      createdBy: userId,
    });

    return source;
  }

  async findOne(userId: string, id: string) {
    const source = await this.prisma.calendarSource.findFirst({
      where: {
        id,
        workspace: { ownerId: userId },
      },
    });

    if (!source) {
      throw new NotFoundException('Calendar source not found.');
    }

    return source;
  }

  async update(userId: string, id: string, dto: UpdateCalendarSourceDto) {
    const before = await this.findOne(userId, id);
    const after = await this.prisma.calendarSource.update({
      where: { id },
      data: dto,
    });

    await this.histories.record({
      workspaceId: after.workspaceId,
      entityType: 'CALENDAR_SOURCE',
      entityId: after.id,
      eventType: 'UPDATED',
      beforeValue: before,
      afterValue: after,
      message: `Calendar source "${after.name}" was updated.`,
      createdBy: userId,
    });

    return after;
  }

  async remove(userId: string, id: string) {
    const before = await this.findOne(userId, id);
    await this.prisma.calendarSource.delete({ where: { id } });

    await this.histories.record({
      workspaceId: before.workspaceId,
      entityType: 'CALENDAR_SOURCE',
      entityId: before.id,
      eventType: 'DELETED',
      beforeValue: before,
      message: `Calendar source "${before.name}" was deleted.`,
      createdBy: userId,
    });

    return { success: true };
  }

  async sync(userId: string, id: string) {
    const source = await this.findOne(userId, id);
    const now = new Date();

    const log = await this.prisma.calendarSyncLog.create({
      data: {
        calendarSourceId: source.id,
        status: 'SUCCESS',
        message:
          'Sync foundation is ready. External provider sync is outside the MVP.',
        startedAt: now,
        finishedAt: now,
      },
    });

    await this.prisma.calendarSource.update({
      where: { id },
      data: {
        lastSyncedAt: now,
        syncStatus: 'CONNECTED',
      },
    });

    await this.histories.record({
      workspaceId: source.workspaceId,
      entityType: 'CALENDAR_SOURCE',
      entityId: source.id,
      eventType: 'SYNCED',
      afterValue: log,
      message: `Calendar source "${source.name}" sync was recorded.`,
      createdBy: userId,
    });

    return log;
  }

  async syncLogs(userId: string, id: string) {
    const source = await this.findOne(userId, id);

    return this.prisma.calendarSyncLog.findMany({
      where: { calendarSourceId: source.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
