import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { CalendarController } from './calendar.controller';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    HistoriesModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [EventsController, CalendarController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
