import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toOptionalDate } from '../common/date.util';
import { createSlug } from '../common/slug.util';
import { HistoriesService } from '../histories/histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly histories: HistoriesService,
  ) {}

  async list(userId: string, workspaceId?: string, status?: string) {
    if (workspaceId) {
      await this.workspaces.findOne(userId, workspaceId);
    }

    return this.prisma.project.findMany({
      where: {
        workspaceId,
        status: status as never,
        workspace: { ownerId: userId },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateProjectDto) {
    await this.workspaces.findOne(userId, dto.workspaceId);
    const slug = dto.slug ? createSlug(dto.slug) : createSlug(dto.name);

    try {
      const project = await this.prisma.project.create({
        data: {
          workspaceId: dto.workspaceId,
          name: dto.name,
          slug,
          description: dto.description,
          goal: dto.goal,
          status: dto.status,
          priority: dto.priority,
          startDate: toOptionalDate(dto.startDate),
          targetDate: toOptionalDate(dto.targetDate),
        },
      });

      await this.histories.record({
        workspaceId: project.workspaceId,
        entityType: 'PROJECT',
        entityId: project.id,
        eventType: 'CREATED',
        afterValue: project,
        message: `Project "${project.name}" was created.`,
        createdBy: userId,
      });

      return project;
    } catch (error) {
      this.rethrowUniqueSlug(error);
      throw error;
    }
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: { ownerId: userId },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async overview(userId: string, id: string) {
    const project = await this.findOne(userId, id);
    const [taskCounts, upcomingEvents, recentDecisions] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where: { projectId: id, workspaceId: project.workspaceId },
        _count: { _all: true },
      }),
      this.prisma.event.findMany({
        where: {
          projectId: id,
          workspaceId: project.workspaceId,
          startAt: { gte: new Date() },
        },
        orderBy: { startAt: 'asc' },
        take: 5,
      }),
      this.prisma.decision.findMany({
        where: { projectId: id, workspaceId: project.workspaceId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      project,
      taskCounts: taskCounts.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count._all;
        return acc;
      }, {}),
      upcomingEvents,
      recentDecisions,
    };
  }

  async timeline(userId: string, id: string) {
    return this.histories.listProjectForUser(userId, id);
  }

  async devcal(userId: string, id: string) {
    const project = await this.findOne(userId, id);

    return this.prisma.event.findMany({
      where: {
        workspaceId: project.workspaceId,
        projectId: id,
        type: {
          in: [
            'DEV',
            'RELEASE',
            'DEPLOYMENT',
            'MAINTENANCE',
            'CI_BUILD',
            'INCIDENT',
          ],
        },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const before = await this.findOne(userId, id);
    const statusChanged = Boolean(dto.status && dto.status !== before.status);

    try {
      const after = await this.prisma.project.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug ? createSlug(dto.slug) : undefined,
          description: dto.description,
          goal: dto.goal,
          status: dto.status,
          priority: dto.priority,
          startDate: toOptionalDate(dto.startDate),
          targetDate: toOptionalDate(dto.targetDate),
          completedAt: toOptionalDate(dto.completedAt),
          archivedAt: toOptionalDate(dto.archivedAt),
        },
      });

      await this.histories.record({
        workspaceId: after.workspaceId,
        entityType: 'PROJECT',
        entityId: after.id,
        eventType: statusChanged ? 'STATUS_CHANGED' : 'UPDATED',
        beforeValue: before,
        afterValue: after,
        message: statusChanged
          ? `Project status changed from ${before.status} to ${after.status}.`
          : `Project "${after.name}" was updated.`,
        createdBy: userId,
      });

      return after;
    } catch (error) {
      this.rethrowUniqueSlug(error);
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const before = await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });

    await this.histories.record({
      workspaceId: before.workspaceId,
      entityType: 'PROJECT',
      entityId: before.id,
      eventType: 'DELETED',
      beforeValue: before,
      message: `Project "${before.name}" was deleted.`,
      createdBy: userId,
    });

    return { success: true };
  }

  private rethrowUniqueSlug(error: unknown): never | void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Project slug already exists in workspace.');
    }
  }

  assertDateRange(start?: Date | null, end?: Date | null) {
    if (start && end && start > end) {
      throw new BadRequestException('Start date must be before end date.');
    }
  }
}
