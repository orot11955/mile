import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CalendarSourcesModule } from './calendar-sources/calendar-sources.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DecisionsModule } from './decisions/decisions.module';
import { EventsModule } from './events/events.module';
import { HistoriesModule } from './histories/histories.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    EventsModule,
    CalendarSourcesModule,
    DecisionsModule,
    HistoriesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
