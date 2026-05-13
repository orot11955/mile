import { Injectable } from '@nestjs/common';
import { HistoryEntityType, HistoryEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface RecordHistoryInput {
  workspaceId: string;
  entityType: HistoryEntityType;
  entityId: string;
  eventType: HistoryEventType;
  beforeValue?: unknown;
  afterValue?: unknown;
  message: string;
  createdBy?: string;
}

@Injectable()
export class HistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, workspaceId?: string) {
    const workspaceIds = workspaceId
      ? [
          (
            await this.prisma.workspace.findFirstOrThrow({
              where: { id: workspaceId, ownerId: userId },
              select: { id: true },
            })
          ).id,
        ]
      : (
          await this.prisma.workspace.findMany({
            where: { ownerId: userId },
            select: { id: true },
          })
        ).map((workspace) => workspace.id);

    return this.prisma.history.findMany({
      where: {
        workspaceId: { in: workspaceIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async listEntityForUser(
    userId: string,
    entityType: HistoryEntityType,
    entityId: string,
  ) {
    const workspaceIds = (
      await this.prisma.workspace.findMany({
        where: { ownerId: userId },
        select: { id: true },
      })
    ).map((workspace) => workspace.id);

    return this.prisma.history.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listProjectForUser(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirstOrThrow({
      where: {
        id: projectId,
        workspace: { ownerId: userId },
      },
      include: {
        tasks: { select: { id: true } },
        events: { select: { id: true } },
        decisions: { select: { id: true } },
      },
    });

    return this.prisma.history.findMany({
      where: {
        workspaceId: project.workspaceId,
        OR: [
          { entityType: 'PROJECT', entityId: project.id },
          {
            entityType: 'TASK',
            entityId: { in: project.tasks.map((task) => task.id) },
          },
          {
            entityType: 'EVENT',
            entityId: { in: project.events.map((event) => event.id) },
          },
          {
            entityType: 'DECISION',
            entityId: {
              in: project.decisions.map((decision) => decision.id),
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  record(input: RecordHistoryInput) {
    return this.prisma.history.create({
      data: {
        workspaceId: input.workspaceId,
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: input.eventType,
        beforeValue: this.toJson(input.beforeValue),
        afterValue: this.toJson(input.afterValue),
        message: input.message,
        createdBy: input.createdBy,
      },
    });
  }

  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
