import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { toOptionalDate } from '../common/date.util';
import { HistoriesService } from '../histories/histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly projects: ProjectsService,
    private readonly histories: HistoriesService,
  ) {}

  async list(
    userId: string,
    workspaceId?: string,
    projectId?: string,
    status?: TaskStatus,
  ) {
    if (workspaceId) {
      await this.workspaces.findOne(userId, workspaceId);
    }

    if (projectId) {
      await this.projects.findOne(userId, projectId);
    }

    return this.prisma.task.findMany({
      where: {
        workspaceId,
        projectId,
        status,
        workspace: { ownerId: userId },
      },
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    await this.assertTaskLinks(
      userId,
      dto.workspaceId,
      dto.projectId,
      dto.parentTaskId,
    );
    const startDate = toOptionalDate(dto.startDate);
    const dueDate = toOptionalDate(dto.dueDate);
    this.assertDateRange(startDate, dueDate);

    const task = await this.prisma.task.create({
      data: {
        workspaceId: dto.workspaceId,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.status,
        priority: dto.priority,
        startDate,
        dueDate,
      },
    });

    await this.histories.record({
      workspaceId: task.workspaceId,
      entityType: 'TASK',
      entityId: task.id,
      eventType: 'CREATED',
      afterValue: task,
      message: `Task "${task.title}" was created.`,
      createdBy: userId,
    });

    return task;
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        workspace: { ownerId: userId },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const before = await this.findOne(userId, id);
    await this.assertTaskLinks(
      userId,
      before.workspaceId,
      dto.projectId === null ? undefined : dto.projectId,
      dto.parentTaskId === null ? undefined : dto.parentTaskId,
    );

    if (dto.parentTaskId === id) {
      throw new BadRequestException('Task cannot be its own parent.');
    }

    const startDate = toOptionalDate(dto.startDate);
    const dueDate = toOptionalDate(dto.dueDate);
    this.assertDateRange(
      startDate ?? before.startDate,
      dueDate ?? before.dueDate,
    );
    const statusChanged = Boolean(dto.status && dto.status !== before.status);

    const after = await this.prisma.task.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.status,
        priority: dto.priority,
        startDate,
        dueDate,
        completedAt: toOptionalDate(dto.completedAt),
      },
    });

    await this.histories.record({
      workspaceId: after.workspaceId,
      entityType: 'TASK',
      entityId: after.id,
      eventType: statusChanged ? 'STATUS_CHANGED' : 'UPDATED',
      beforeValue: before,
      afterValue: after,
      message: statusChanged
        ? `Task status changed from ${before.status} to ${after.status}.`
        : `Task "${after.title}" was updated.`,
      createdBy: userId,
    });

    return after;
  }

  updateStatus(userId: string, id: string, dto: UpdateTaskStatusDto) {
    return this.update(userId, id, {
      status: dto.status,
      completedAt: dto.status === 'DONE' ? new Date().toISOString() : null,
    });
  }

  async remove(userId: string, id: string) {
    const before = await this.findOne(userId, id);
    await this.prisma.task.delete({ where: { id } });

    await this.histories.record({
      workspaceId: before.workspaceId,
      entityType: 'TASK',
      entityId: before.id,
      eventType: 'DELETED',
      beforeValue: before,
      message: `Task "${before.title}" was deleted.`,
      createdBy: userId,
    });

    return { success: true };
  }

  private async assertTaskLinks(
    userId: string,
    workspaceId: string,
    projectId?: string,
    parentTaskId?: string,
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

    if (parentTaskId) {
      const parentTask = await this.findOne(userId, parentTaskId);

      if (parentTask.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Parent task belongs to a different workspace.',
        );
      }
    }
  }

  private assertDateRange(start?: Date | null, end?: Date | null) {
    if (start && end && start > end) {
      throw new BadRequestException('Task start date must be before due date.');
    }
  }
}
