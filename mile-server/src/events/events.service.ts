import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType } from '@prisma/client';
import { toRequiredDate } from '../common/date.util';
import { HistoriesService } from '../histories/histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const DEV_EVENT_TYPES: EventType[] = [
  'DEV',
  'RELEASE',
  'DEPLOYMENT',
  'MAINTENANCE',
  'CI_BUILD',
  'INCIDENT',
];

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly projects: ProjectsService,
    private readonly tasks: TasksService,
    private readonly histories: HistoriesService,
  ) {}

  async list(
    userId: string,
    filters: {
      workspaceId?: string;
      projectId?: string;
      type?: EventType;
      start?: string;
      end?: string;
    },
  ) {
    const start = filters.start ? toRequiredDate(filters.start) : undefined;
    const end = filters.end ? toRequiredDate(filters.end) : undefined;

    if (filters.workspaceId) {
      await this.workspaces.findOne(userId, filters.workspaceId);
    }

    if (filters.projectId) {
      await this.projects.findOne(userId, filters.projectId);
    }

    return this.prisma.event.findMany({
      where: {
        workspaceId: filters.workspaceId,
        projectId: filters.projectId,
        type: filters.type,
        workspace: { ownerId: userId },
        startAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateEventDto) {
    await this.assertEventLinks(
      userId,
      dto.workspaceId,
      dto.projectId,
      dto.taskId,
      dto.calendarSourceId,
    );
    const startAt = toRequiredDate(dto.startAt);
    const endAt = toRequiredDate(dto.endAt);
    this.assertDateRange(startAt, endAt);

    const event = await this.prisma.event.create({
      data: {
        workspaceId: dto.workspaceId,
        projectId: dto.projectId,
        taskId: dto.taskId,
        calendarSourceId: dto.calendarSourceId,
        externalEventId: dto.externalEventId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        startAt,
        endAt,
        allDay: dto.allDay,
        recurrenceRule: dto.recurrenceRule,
        syncStatus: dto.syncStatus,
      },
    });

    await this.histories.record({
      workspaceId: event.workspaceId,
      entityType: 'EVENT',
      entityId: event.id,
      eventType: 'CREATED',
      afterValue: event,
      message: `Event "${event.title}" was created.`,
      createdBy: userId,
    });

    return event;
  }

  async findOne(userId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id,
        workspace: { ownerId: userId },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    return event;
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    const before = await this.findOne(userId, id);
    await this.assertEventLinks(
      userId,
      before.workspaceId,
      dto.projectId === null ? undefined : dto.projectId,
      dto.taskId === null ? undefined : dto.taskId,
      dto.calendarSourceId === null ? undefined : dto.calendarSourceId,
    );

    const startAt = dto.startAt ? toRequiredDate(dto.startAt) : undefined;
    const endAt = dto.endAt ? toRequiredDate(dto.endAt) : undefined;
    this.assertDateRange(startAt ?? before.startAt, endAt ?? before.endAt);

    const after = await this.prisma.event.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        taskId: dto.taskId,
        calendarSourceId: dto.calendarSourceId,
        externalEventId: dto.externalEventId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        startAt,
        endAt,
        allDay: dto.allDay,
        recurrenceRule: dto.recurrenceRule,
        syncStatus: dto.syncStatus,
      },
    });

    await this.histories.record({
      workspaceId: after.workspaceId,
      entityType: 'EVENT',
      entityId: after.id,
      eventType: 'UPDATED',
      beforeValue: before,
      afterValue: after,
      message: `Event "${after.title}" was updated.`,
      createdBy: userId,
    });

    return after;
  }

  async remove(userId: string, id: string) {
    const before = await this.findOne(userId, id);
    await this.prisma.event.delete({ where: { id } });

    await this.histories.record({
      workspaceId: before.workspaceId,
      entityType: 'EVENT',
      entityId: before.id,
      eventType: 'DELETED',
      beforeValue: before,
      message: `Event "${before.title}" was deleted.`,
      createdBy: userId,
    });

    return { success: true };
  }

  agenda(userId: string, workspaceId?: string) {
    const now = new Date();
    const rangeEnd = new Date(now);
    rangeEnd.setDate(rangeEnd.getDate() + 14);

    return this.prisma.event.findMany({
      where: {
        workspaceId,
        workspace: { ownerId: userId },
        startAt: { gte: now, lte: rangeEnd },
      },
      orderBy: { startAt: 'asc' },
      take: 50,
    });
  }

  devCalendar(userId: string, workspaceId?: string) {
    return this.prisma.event.findMany({
      where: {
        workspaceId,
        workspace: { ownerId: userId },
        type: { in: DEV_EVENT_TYPES },
      },
      orderBy: { startAt: 'asc' },
      take: 100,
    });
  }

  private async assertEventLinks(
    userId: string,
    workspaceId: string,
    projectId?: string,
    taskId?: string,
    calendarSourceId?: string,
  ) {
    await this.workspaces.findOne(userId, workspaceId);

    if (projectId) {
      const project = await this.projects.findOne(userId, projectId);

      if (project.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Project belongs to a different workspace.',
        );
      }
    }

    if (taskId) {
      const task = await this.tasks.findOne(userId, taskId);

      if (task.workspaceId !== workspaceId) {
        throw new BadRequestException('Task belongs to a different workspace.');
      }
    }

    if (calendarSourceId) {
      const calendarSource = await this.prisma.calendarSource.findFirst({
        where: {
          id: calendarSourceId,
          workspaceId,
          workspace: { ownerId: userId },
        },
      });

      if (!calendarSource) {
        throw new BadRequestException(
          'Calendar source belongs to a different workspace.',
        );
      }
    }
  }

  private assertDateRange(start: Date, end: Date) {
    if (start > end) {
      throw new BadRequestException(
        'Event start time must be before end time.',
      );
    }
  }
}
