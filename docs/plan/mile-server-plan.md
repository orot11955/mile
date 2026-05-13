# mile Server 계획서

## 1. 개요

`mile-server`는 `mile`의 모든 데이터를 관리하는 중심 백엔드다.

개인/업무 Workspace, 프로젝트, 작업, 일정, 결정사항, 히스토리, 외부 캘린더 연동, devCal 이벤트, 알림, CI/CD 연동을 담당한다.

`mile`의 제품 구조에서 서버는 단순 API 서버가 아니라, 다음 역할을 가진다.

```txt
mile-server
├─ 데이터 저장소
├─ 인증/권한 관리
├─ 일정 동기화 엔진
├─ 히스토리 기록 엔진
├─ devCal 이벤트 생성기
├─ 알림 트리거
├─ CI/CD 연동 수집기
└─ web/app 공통 API 제공자
```

---

## 2. 서버의 핵심 역할

```txt
- 사용자 인증과 세션 관리
- Workspace 기반 데이터 분리
- Project / Task / Event / Decision 관리
- 모든 주요 변경사항의 History 자동 기록
- Apple Calendar 연동을 위한 CalDAV 동기화
- devCal 이벤트 저장 및 조회
- Jenkins 등 CI/CD Provider 연동
- 알림 이벤트 생성
- web과 app이 함께 사용하는 REST API 제공
```

---

## 3. 서버 아키텍처

```txt
mile-web ─┐
          ├─ REST API ─ mile-server ─ PostgreSQL
mile-app ─┘                  │
                              ├─ Redis / Queue
                              ├─ Apple CalDAV
                              ├─ Jenkins API
                              └─ Notification Provider
```

## 3.1 구성 요소

```txt
API Server
- NestJS 기반 REST API
- 인증/권한 처리
- Web/App 공통 응답 제공

Database
- PostgreSQL
- 핵심 데이터, 히스토리, 일정, 동기화 로그 저장

Worker
- BullMQ 기반 비동기 작업
- 캘린더 동기화
- CI/CD 상태 수집
- 알림 이벤트 생성

Scheduler
- 반복 동기화
- 마감 알림 검사
- CI/CD 주기적 상태 확인
```

---

## 4. 기술 스택

```txt
Runtime: Node.js
Framework: NestJS
Language: TypeScript
ORM: Prisma
Database: PostgreSQL
Queue: Redis + BullMQ
Auth: JWT + Refresh Token 또는 Session 기반
API Style: REST 우선
Realtime: SSE 또는 WebSocket 후속 도입
Deployment: Docker Compose
```

PostgreSQL을 권장하는 이유:

```txt
- 일정 범위 검색에 유리
- JSONB 메타데이터 저장 가능
- History / SyncLog / Event metadata 구조에 적합
- 검색과 필터 확장에 유리
```

---

## 5. 핵심 도메인 모델

## 5.1 User

```txt
User
- id
- email
- password_hash
- name
- avatar_url
- timezone
- locale
- created_at
- updated_at
```

## 5.2 Workspace

```txt
Workspace
- id
- owner_id
- name
- type
- description
- color
- icon
- created_at
- updated_at
```

Workspace Type:

```txt
PERSONAL
WORK
```

## 5.3 Project

```txt
Project
- id
- workspace_id
- name
- slug
- description
- goal
- status
- priority
- start_date
- target_date
- completed_at
- archived_at
- created_at
- updated_at
```

Project Status:

```txt
IDEA
PLANNING
ACTIVE
PAUSED
MAINTENANCE
COMPLETED
ARCHIVED
```

## 5.4 Task

```txt
Task
- id
- workspace_id
- project_id
- parent_task_id
- title
- description
- type
- status
- priority
- start_date
- due_date
- completed_at
- created_at
- updated_at
```

Task Status:

```txt
BACKLOG
READY
IN_PROGRESS
WAITING
REVIEW
DONE
CANCELED
ARCHIVED
```

Task Type:

```txt
TASK
BUG
IDEA
RESEARCH
DECISION_REQUIRED
MEETING_ACTION
DEPLOY
MAINTENANCE
DOCUMENT
```

## 5.5 Event

```txt
Event
- id
- workspace_id
- project_id
- task_id
- calendar_source_id
- external_event_id
- title
- description
- type
- start_at
- end_at
- all_day
- recurrence_rule
- sync_status
- created_at
- updated_at
```

Event Type:

```txt
PERSONAL
WORK
MEETING
DEADLINE
REMINDER
REVIEW
DEPLOYMENT
MAINTENANCE
DEV
RELEASE
CI_BUILD
INCIDENT
```

## 5.6 Decision

```txt
Decision
- id
- workspace_id
- project_id
- title
- context
- decision
- reason
- alternatives
- impact
- status
- decided_at
- created_at
- updated_at
```

Decision Status:

```txt
PROPOSED
DECIDED
REVISITED
SUPERSEDED
CANCELED
```

## 5.7 History

```txt
History
- id
- workspace_id
- entity_type
- entity_id
- event_type
- before_value
- after_value
- message
- created_by
- created_at
```

History 대상:

```txt
- Project
- Task
- Event
- Decision
- CalendarSource
- CiJob
- CiBuild
- Deployment
```

---

## 6. Calendar / Apple Calendar 연동

## 6.1 기본 원칙

Apple Calendar 연동은 앱이 아니라 서버 중심으로 처리한다.

```txt
Apple Calendar ← CalDAV → mile-server ← API → mile-web / mile-app
```

이 구조를 사용하는 이유:

```txt
- web과 app이 같은 일정 데이터를 볼 수 있다.
- 앱이 열려 있지 않아도 서버에서 동기화할 수 있다.
- 동기화 로그와 충돌 처리를 중앙에서 관리할 수 있다.
- 앱의 백그라운드 제한에 덜 의존한다.
```

## 6.2 CalendarSource

```txt
CalendarSource
- id
- workspace_id
- provider
- name
- account_label
- sync_direction
- sync_status
- last_synced_at
- created_at
- updated_at
```

Provider:

```txt
INTERNAL
APPLE_CALDAV
GOOGLE_CALENDAR
ICS_FEED
DEV_CAL
```

Sync Direction:

```txt
READ_ONLY
WRITE_ONLY
TWO_WAY
```

Sync Status:

```txt
CONNECTED
SYNCING
FAILED
DISABLED
```

## 6.3 ExternalCalendarEvent

```txt
ExternalCalendarEvent
- id
- calendar_source_id
- event_id
- external_event_id
- external_uid
- etag
- last_modified_at
- sync_status
- created_at
- updated_at
```

## 6.4 CalendarSyncLog

```txt
CalendarSyncLog
- id
- calendar_source_id
- status
- message
- started_at
- finished_at
- created_at
```

## 6.5 구현 순서

```txt
1. 내부 Event 모델 구현
2. CalendarSource 모델 추가
3. ExternalCalendarEvent 매핑 구조 구현
4. CalendarSyncLog 구현
5. Apple CalDAV 읽기 동기화
6. 선택한 Calendar만 동기화
7. 반복 일정 처리
8. 충돌 처리 정책 추가
9. 쓰기 동기화는 후속 단계에서 제한적으로 제공
```

## 6.6 동기화 정책

초기에는 `READ_ONLY`를 기본값으로 한다.

```txt
MVP 이후 1차 연동
- Apple Calendar 읽기 전용
- mile에서 외부 일정을 조회
- 외부 일정은 mile 내부 일정과 구분 표시

후속 단계
- 사용자가 선택한 mile Event를 Apple Calendar로 내보내기
- 제한적 TWO_WAY 동기화
- 충돌 수동 해결
```

충돌 정책:

```txt
EXTERNAL_WINS
INTERNAL_WINS
MANUAL_RESOLVE
```

---

## 7. devCal 서버 기능

`devCal`은 개발자 중심 일정 관리 기능이다.

초기에는 별도 도메인보다 Event의 타입과 View로 처리한다.

```txt
Event.type
- DEV
- RELEASE
- DEPLOYMENT
- MAINTENANCE
- CI_BUILD
- INCIDENT
```

후속 고도화 시 별도 모델로 분리한다.

```txt
DevEvent
- id
- workspace_id
- project_id
- event_id
- type
- severity
- source
- metadata
- created_at
- updated_at
```

주요 기능:

```txt
- 프로젝트별 개발 일정 조회
- 릴리즈 일정 관리
- 배포 일정 관리
- 서버 점검 일정 관리
- CI/CD 이벤트를 devCal에 자동 표시
- 장애/점검 이력 기록
```

---

## 8. CI/CD Integration

## 8.1 목표

업무 프로젝트와 개발 프로젝트의 빌드/배포 상태를 mile에 연결한다.

초기 Provider는 Jenkins로 시작한다.

## 8.2 모델

```txt
CiProvider
- id
- workspace_id
- name
- type
- base_url
- auth_type
- status
- created_at
- updated_at
```

```txt
CiJob
- id
- provider_id
- project_id
- name
- external_job_id
- url
- status
- last_build_id
- created_at
- updated_at
```

```txt
CiBuild
- id
- ci_job_id
- external_build_id
- build_number
- branch
- commit_hash
- status
- started_at
- finished_at
- duration_seconds
- log_url
- created_at
```

Provider Type:

```txt
JENKINS
GITHUB_ACTIONS
GITLAB_CI
TEAMCITY
```

Build Status:

```txt
IDLE
QUEUED
RUNNING
SUCCESS
FAILED
CANCELED
UNSTABLE
UNKNOWN
```

## 8.3 기능

```txt
- Jenkins Provider 등록
- Jenkins Job 목록 조회
- Project와 Job 연결
- 최근 Build 상태 조회
- Build History 저장
- 실패 로그 저장
- 실패 사유 메모
- Timeline에 CI 이벤트 기록
- devCal에 CI 이벤트 표시
```

---

## 9. API 구조

## 9.1 Auth

```txt
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
```

## 9.2 Workspace

```txt
GET    /workspaces
POST   /workspaces
GET    /workspaces/:id
PATCH  /workspaces/:id
DELETE /workspaces/:id
```

## 9.3 Project

```txt
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
GET    /projects/:id/overview
GET    /projects/:id/timeline
GET    /projects/:id/devcal
```

## 9.4 Task

```txt
GET    /tasks
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
PATCH  /tasks/:id/status
DELETE /tasks/:id
```

## 9.5 Event / Calendar

```txt
GET    /events
POST   /events
GET    /events/:id
PATCH  /events/:id
DELETE /events/:id

GET    /calendar
GET    /calendar/agenda
GET    /calendar/dev
```

## 9.6 CalendarSource

```txt
GET    /calendar-sources
POST   /calendar-sources
GET    /calendar-sources/:id
PATCH  /calendar-sources/:id
DELETE /calendar-sources/:id
POST   /calendar-sources/:id/sync
GET    /calendar-sources/:id/sync-logs
```

## 9.7 Decision

```txt
GET    /decisions
POST   /decisions
GET    /decisions/:id
PATCH  /decisions/:id
PATCH  /decisions/:id/status
DELETE /decisions/:id
```

## 9.8 History

```txt
GET /histories
GET /histories/entity/:entityType/:entityId
GET /histories/projects/:projectId
```

## 9.9 CI/CD

```txt
GET    /integrations/ci/providers
POST   /integrations/ci/providers
GET    /integrations/ci/providers/:id/jobs
POST   /integrations/ci/jobs/:id/sync
GET    /integrations/ci/jobs/:id/builds
GET    /integrations/ci/builds/:id
```

---

## 10. 보안 방향

## 10.1 인증

```txt
- Access Token + Refresh Token
- Refresh Token Rotation 고려
- Web/App 공통 인증 구조
- App에서는 Keychain 기반 토큰 저장
```

## 10.2 Workspace 분리

```txt
- 모든 핵심 테이블에 workspace_id 포함
- API 요청마다 workspace 접근 권한 검증
- 개인/업무 데이터 혼합 방지
```

## 10.3 Calendar 보안

```txt
- Apple Calendar 인증 정보 암호화 저장
- App-specific password 사용 고려
- 민감 정보 로그 노출 금지
- CalendarSource별 접근 범위 제한
- 동기화 실패 로그에 credential 포함 금지
```

## 10.4 CI/CD 보안

```txt
- Jenkins Token 암호화 저장
- Provider별 credential 분리
- 민감 정보 로그 마스킹
- 배포 실행 기능은 초기 제외
- 수동 빌드 실행 시 확인 단계 추가
```

---

## 11. 구현 단계

## Phase 1. Core API

```txt
- NestJS 프로젝트 세팅
- Prisma / PostgreSQL 구성
- Auth 구현
- User / Workspace 구현
- Project CRUD
- Task CRUD
- History 자동 기록 기초
```

완료 기준:

```txt
- 개인/업무 Workspace가 생성된다.
- 프로젝트와 작업을 생성/수정할 수 있다.
- 상태 변경 이력이 기록된다.
```

## Phase 2. Calendar / Decision API

```txt
- Event 모델 구현
- Calendar API 구현
- Decision 모델 구현
- Project / Task / Event / Decision 연결
- Timeline API 구현
```

완료 기준:

```txt
- 일정을 만들고 조회할 수 있다.
- 결정사항을 프로젝트에 연결할 수 있다.
- 프로젝트 타임라인을 조회할 수 있다.
```

## Phase 3. CalendarSource Foundation

```txt
- CalendarSource 모델 구현
- ExternalCalendarEvent 모델 구현
- CalendarSyncLog 모델 구현
- Sync Job 구조 구현
- INTERNAL Provider 구현
```

완료 기준:

```txt
- 외부 캘린더 소스를 등록할 수 있는 구조가 생긴다.
- 동기화 로그를 남길 수 있다.
```

## Phase 4. Apple CalDAV Read Sync

```txt
- Apple CalDAV 연결 테스트
- 캘린더 목록 조회
- 선택 캘린더 이벤트 읽기
- Event 매핑
- SyncLog 저장
- 실패 재시도 처리
```

완료 기준:

```txt
- Apple Calendar 일정을 mile에서 읽을 수 있다.
- 외부 일정과 내부 일정이 구분된다.
```

## Phase 5. devCal / CI Foundation

```txt
- devCal 전용 API
- CI Provider 모델
- Jenkins Provider 연동
- Build History 저장
- CI 이벤트를 Event/History에 기록
```

완료 기준:

```txt
- Jenkins 빌드 상태가 프로젝트와 연결된다.
- CI 이벤트가 Timeline과 devCal에 표시된다.
```

---

## 12. MVP 범위

## 포함

```txt
- Auth
- Workspace
- Project
- Task
- Event
- Decision
- History
- Dashboard Summary API
- Project Timeline API
```

## 제외

```txt
- Apple Calendar 실제 동기화
- Jenkins 실제 연동
- 배포 실행
- Push Notification
- 양방향 Calendar Sync
```

MVP에서는 CalendarSource 구조만 미리 고려하고, 실제 Apple Calendar 연동은 MVP 이후에 구현한다.

---

## 13. 최종 목표

`mile-server`는 `mile` 제품군의 중심이다.

서버는 데이터를 안정적으로 저장하고, web과 app이 같은 데이터를 보게 하며, Apple Calendar, devCal, Jenkins, Notification 같은 외부 흐름을 하나의 프로젝트 타임라인으로 통합한다.

최종적으로 사용자는 `mile`을 통해 다음 질문에 답할 수 있어야 한다.

```txt
- 오늘 무엇을 해야 하는가?
- 이 프로젝트는 어디까지 진행되었는가?
- 어떤 일정이 다가오는가?
- 어떤 결정 때문에 방향이 바뀌었는가?
- 어떤 빌드/배포/일정 이벤트가 있었는가?
```
