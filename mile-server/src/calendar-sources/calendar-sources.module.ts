import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { CalendarSourcesController } from './calendar-sources.controller';
import { CalendarSourcesService } from './calendar-sources.service';

@Module({
  imports: [AuthModule, PrismaModule, HistoriesModule, WorkspacesModule],
  controllers: [CalendarSourcesController],
  providers: [CalendarSourcesService],
  exports: [CalendarSourcesService],
})
export class CalendarSourcesModule {}
