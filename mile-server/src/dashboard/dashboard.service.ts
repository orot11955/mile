import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
  ) {}

  async summary(userId: string, workspaceId?: string) {
    if (workspaceId) {
      await this.workspaces.findOne(userId, workspaceId);
    }

    const workspaceFilter = {
      workspaceId,
      workspace: { ownerId: userId },
    };

    const now = new Date();
    const soon = new Date(now);
    soon.setDate(soon.getDate() + 7);

    const [
      workspaces,
      projects,
      openTasks,
      overdueTasks,
      upcomingEvents,
      pendingDecisions,
      recentHistory,
    ] = await Promise.all([
      this.prisma.workspace.count({ where: { ownerId: userId } }),
      this.prisma.project.count({ where: workspaceFilter }),
      this.prisma.task.count({
        where: {
          ...workspaceFilter,
          status: { notIn: ['DONE', 'CANCELED', 'ARCHIVED'] },
        },
      }),
      this.prisma.task.count({
        where: {
          ...workspaceFilter,
          status: { notIn: ['DONE', 'CANCELED', 'ARCHIVED'] },
          dueDate: { lt: now },
        },
      }),
      this.prisma.event.count({
        where: {
          ...workspaceFilter,
          startAt: { gte: now, lte: soon },
        },
      }),
      this.prisma.decision.count({
        where: {
          ...workspaceFilter,
          status: 'PROPOSED',
        },
      }),
      this.prisma.history.findMany({
        where: workspaceId
          ? { workspaceId }
          : {
              workspaceId: {
                in: (
                  await this.prisma.workspace.findMany({
                    where: { ownerId: userId },
                    select: { id: true },
                  })
                ).map((workspace) => workspace.id),
              },
            },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      workspaces,
      projects,
      openTasks,
      overdueTasks,
      upcomingEvents,
      pendingDecisions,
      recentHistory,
    };
  }
}
