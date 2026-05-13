import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoriesService } from '../histories/histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly histories: HistoriesService,
  ) {}

  list(userId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        ownerId: userId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
      },
    });

    await this.histories.record({
      workspaceId: workspace.id,
      entityType: 'WORKSPACE',
      entityId: workspace.id,
      eventType: 'CREATED',
      afterValue: workspace,
      message: `Workspace "${workspace.name}" was created.`,
      createdBy: userId,
    });

    return workspace;
  }

  async findOne(userId: string, id: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id, ownerId: userId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    return workspace;
  }

  async update(userId: string, id: string, dto: UpdateWorkspaceDto) {
    const before = await this.findOne(userId, id);
    const after = await this.prisma.workspace.update({
      where: { id },
      data: dto,
    });

    await this.histories.record({
      workspaceId: after.id,
      entityType: 'WORKSPACE',
      entityId: after.id,
      eventType: 'UPDATED',
      beforeValue: before,
      afterValue: after,
      message: `Workspace "${after.name}" was updated.`,
      createdBy: userId,
    });

    return after;
  }

  async remove(userId: string, id: string) {
    const before = await this.findOne(userId, id);
    await this.prisma.workspace.delete({ where: { id } });

    return this.histories.record({
      workspaceId: before.id,
      entityType: 'WORKSPACE',
      entityId: before.id,
      eventType: 'DELETED',
      beforeValue: before,
      message: `Workspace "${before.name}" was deleted.`,
      createdBy: userId,
    });
  }
}
