import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DecisionStatus } from '@prisma/client';
import { toOptionalDate } from '../common/date.util';
import { HistoriesService } from '../histories/histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { UpdateDecisionStatusDto } from './dto/update-decision-status.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';

@Injectable()
export class DecisionsService {
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
    status?: DecisionStatus,
  ) {
    if (workspaceId) {
      await this.workspaces.findOne(userId, workspaceId);
    }

    if (projectId) {
      await this.projects.findOne(userId, projectId);
    }

    return this.prisma.decision.findMany({
      where: {
        workspaceId,
        projectId,
        status,
        workspace: { ownerId: userId },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateDecisionDto) {
    await this.assertDecisionLinks(userId, dto.workspaceId, dto.projectId);

    const decision = await this.prisma.decision.create({
      data: {
        workspaceId: dto.workspaceId,
        projectId: dto.projectId,
        title: dto.title,
        context: dto.context,
        decision: dto.decision,
        reason: dto.reason,
        alternatives: dto.alternatives ?? undefined,
        impact: dto.impact,
        status: dto.status,
        decidedAt: toOptionalDate(dto.decidedAt),
      },
    });

    await this.histories.record({
      workspaceId: decision.workspaceId,
      entityType: 'DECISION',
      entityId: decision.id,
      eventType: 'CREATED',
      afterValue: decision,
      message: `Decision "${decision.title}" was created.`,
      createdBy: userId,
    });

    return decision;
  }

  async findOne(userId: string, id: string) {
    const decision = await this.prisma.decision.findFirst({
      where: {
        id,
        workspace: { ownerId: userId },
      },
    });

    if (!decision) {
      throw new NotFoundException('Decision not found.');
    }

    return decision;
  }

  async update(userId: string, id: string, dto: UpdateDecisionDto) {
    const before = await this.findOne(userId, id);
    await this.assertDecisionLinks(
      userId,
      before.workspaceId,
      dto.projectId === null ? undefined : dto.projectId,
    );

    const statusChanged = Boolean(dto.status && dto.status !== before.status);
    const after = await this.prisma.decision.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        title: dto.title,
        context: dto.context,
        decision: dto.decision,
        reason: dto.reason,
        alternatives: dto.alternatives ?? undefined,
        impact: dto.impact,
        status: dto.status,
        decidedAt: toOptionalDate(dto.decidedAt),
      },
    });

    await this.histories.record({
      workspaceId: after.workspaceId,
      entityType: 'DECISION',
      entityId: after.id,
      eventType: statusChanged ? 'STATUS_CHANGED' : 'UPDATED',
      beforeValue: before,
      afterValue: after,
      message: statusChanged
        ? `Decision status changed from ${before.status} to ${after.status}.`
        : `Decision "${after.title}" was updated.`,
      createdBy: userId,
    });

    return after;
  }

  updateStatus(userId: string, id: string, dto: UpdateDecisionStatusDto) {
    return this.update(userId, id, { status: dto.status });
  }

  async remove(userId: string, id: string) {
    const before = await this.findOne(userId, id);
    await this.prisma.decision.delete({ where: { id } });

    await this.histories.record({
      workspaceId: before.workspaceId,
      entityType: 'DECISION',
      entityId: before.id,
      eventType: 'DELETED',
      beforeValue: before,
      message: `Decision "${before.title}" was deleted.`,
      createdBy: userId,
    });

    return { success: true };
  }

  private async assertDecisionLinks(
    userId: string,
    workspaceId: string,
    projectId?: string,
  ) {
    await this.workspaces.findOne(userId, workspaceId);

    if (!projectId) {
      return;
    }

    const project = await this.projects.findOne(userId, projectId);

    if (project.workspaceId !== workspaceId) {
      throw new BadRequestException(
        'Project belongs to a different workspace.',
      );
    }
  }
}
