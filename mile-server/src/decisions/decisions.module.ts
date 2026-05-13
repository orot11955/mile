import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DecisionsController } from './decisions.controller';
import { DecisionsService } from './decisions.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    HistoriesModule,
    WorkspacesModule,
    ProjectsModule,
  ],
  controllers: [DecisionsController],
  providers: [DecisionsService],
})
export class DecisionsModule {}
