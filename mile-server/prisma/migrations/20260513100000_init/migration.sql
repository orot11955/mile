-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('PERSONAL', 'WORK');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('IDEA', 'PLANNING', 'ACTIVE', 'PAUSED', 'MAINTENANCE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'READY', 'IN_PROGRESS', 'WAITING', 'REVIEW', 'DONE', 'CANCELED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('TASK', 'BUG', 'IDEA', 'RESEARCH', 'DECISION_REQUIRED', 'MEETING_ACTION', 'DEPLOY', 'MAINTENANCE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PERSONAL', 'WORK', 'MEETING', 'DEADLINE', 'REMINDER', 'REVIEW', 'DEPLOYMENT', 'MAINTENANCE', 'DEV', 'RELEASE', 'CI_BUILD', 'INCIDENT');

-- CreateEnum
CREATE TYPE "EventSyncStatus" AS ENUM ('INTERNAL', 'EXTERNAL', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PROPOSED', 'DECIDED', 'REVISITED', 'SUPERSEDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "HistoryEntityType" AS ENUM ('USER', 'WORKSPACE', 'PROJECT', 'TASK', 'EVENT', 'DECISION', 'CALENDAR_SOURCE', 'CI_PROVIDER', 'CI_JOB', 'CI_BUILD', 'DEPLOYMENT');

-- CreateEnum
CREATE TYPE "HistoryEventType" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('INTERNAL', 'APPLE_CALDAV', 'GOOGLE_CALENDAR', 'ICS_FEED', 'DEV_CAL');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('READ_ONLY', 'WRITE_ONLY', 'TWO_WAY');

-- CreateEnum
CREATE TYPE "CalendarSourceStatus" AS ENUM ('CONNECTED', 'SYNCING', 'FAILED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CalendarSyncLogStatus" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "CiProviderType" AS ENUM ('JENKINS', 'GITHUB_ACTIONS', 'GITLAB_CI', 'TEAMCITY');

-- CreateEnum
CREATE TYPE "CiAuthType" AS ENUM ('NONE', 'BASIC', 'TOKEN');

-- CreateEnum
CREATE TYPE "CiProviderStatus" AS ENUM ('CONNECTED', 'FAILED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CiBuildStatus" AS ENUM ('IDLE', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED', 'UNSTABLE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'ko-KR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "start_date" TIMESTAMP(3),
    "target_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "project_id" TEXT,
    "parent_task_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'TASK',
    "status" "TaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "project_id" TEXT,
    "task_id" TEXT,
    "calendar_source_id" TEXT,
    "external_event_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'WORK',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_rule" TEXT,
    "sync_status" "EventSyncStatus" NOT NULL DEFAULT 'INTERNAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "context" TEXT,
    "decision" TEXT NOT NULL,
    "reason" TEXT,
    "alternatives" JSONB,
    "impact" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "histories" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "entity_type" "HistoryEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" "HistoryEventType" NOT NULL,
    "before_value" JSONB,
    "after_value" JSONB,
    "message" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_sources" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "account_label" TEXT,
    "sync_direction" "SyncDirection" NOT NULL DEFAULT 'READ_ONLY',
    "sync_status" "CalendarSourceStatus" NOT NULL DEFAULT 'CONNECTED',
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_calendar_events" (
    "id" TEXT NOT NULL,
    "calendar_source_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "external_uid" TEXT,
    "etag" TEXT,
    "last_modified_at" TIMESTAMP(3),
    "sync_status" "EventSyncStatus" NOT NULL DEFAULT 'SYNCED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_sync_logs" (
    "id" TEXT NOT NULL,
    "calendar_source_id" TEXT NOT NULL,
    "status" "CalendarSyncLogStatus" NOT NULL,
    "message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ci_providers" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CiProviderType" NOT NULL,
    "base_url" TEXT NOT NULL,
    "auth_type" "CiAuthType" NOT NULL DEFAULT 'TOKEN',
    "status" "CiProviderStatus" NOT NULL DEFAULT 'CONNECTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ci_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ci_jobs" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "external_job_id" TEXT NOT NULL,
    "url" TEXT,
    "status" "CiBuildStatus" NOT NULL DEFAULT 'UNKNOWN',
    "last_build_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ci_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ci_builds" (
    "id" TEXT NOT NULL,
    "ci_job_id" TEXT NOT NULL,
    "external_build_id" TEXT NOT NULL,
    "build_number" INTEGER,
    "branch" TEXT,
    "commit_hash" TEXT,
    "status" "CiBuildStatus" NOT NULL DEFAULT 'UNKNOWN',
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "log_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ci_builds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "workspaces_owner_id_idx" ON "workspaces"("owner_id");

-- CreateIndex
CREATE INDEX "projects_workspace_id_status_idx" ON "projects"("workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "projects_workspace_id_slug_key" ON "projects"("workspace_id", "slug");

-- CreateIndex
CREATE INDEX "tasks_workspace_id_status_idx" ON "tasks"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "events_workspace_id_start_at_idx" ON "events"("workspace_id", "start_at");

-- CreateIndex
CREATE INDEX "events_project_id_idx" ON "events"("project_id");

-- CreateIndex
CREATE INDEX "decisions_workspace_id_status_idx" ON "decisions"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "decisions_project_id_idx" ON "decisions"("project_id");

-- CreateIndex
CREATE INDEX "histories_workspace_id_created_at_idx" ON "histories"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "histories_entity_type_entity_id_idx" ON "histories"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "calendar_sources_workspace_id_provider_idx" ON "calendar_sources"("workspace_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "external_calendar_events_event_id_key" ON "external_calendar_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "external_calendar_events_calendar_source_id_external_event__key" ON "external_calendar_events"("calendar_source_id", "external_event_id");

-- CreateIndex
CREATE INDEX "calendar_sync_logs_calendar_source_id_created_at_idx" ON "calendar_sync_logs"("calendar_source_id", "created_at");

-- CreateIndex
CREATE INDEX "ci_providers_workspace_id_type_idx" ON "ci_providers"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "ci_jobs_project_id_idx" ON "ci_jobs"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "ci_jobs_provider_id_external_job_id_key" ON "ci_jobs"("provider_id", "external_job_id");

-- CreateIndex
CREATE INDEX "ci_builds_ci_job_id_created_at_idx" ON "ci_builds"("ci_job_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ci_builds_ci_job_id_external_build_id_key" ON "ci_builds"("ci_job_id", "external_build_id");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_calendar_source_id_fkey" FOREIGN KEY ("calendar_source_id") REFERENCES "calendar_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_sources" ADD CONSTRAINT "calendar_sources_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_calendar_events" ADD CONSTRAINT "external_calendar_events_calendar_source_id_fkey" FOREIGN KEY ("calendar_source_id") REFERENCES "calendar_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_calendar_events" ADD CONSTRAINT "external_calendar_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_sync_logs" ADD CONSTRAINT "calendar_sync_logs_calendar_source_id_fkey" FOREIGN KEY ("calendar_source_id") REFERENCES "calendar_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ci_providers" ADD CONSTRAINT "ci_providers_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ci_jobs" ADD CONSTRAINT "ci_jobs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ci_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ci_jobs" ADD CONSTRAINT "ci_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ci_builds" ADD CONSTRAINT "ci_builds_ci_job_id_fkey" FOREIGN KEY ("ci_job_id") REFERENCES "ci_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
