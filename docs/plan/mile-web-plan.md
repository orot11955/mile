# mile Web 계획서

## 1. 개요

`mile-web`은 `mile`의 메인 관리 콘솔이다.

사용자는 웹에서 개인/업무 Workspace를 전환하고, 프로젝트, 작업, 일정, 결정사항, 히스토리, devCal, 외부 캘린더 연동 상태, CI/CD 상태를 관리한다.

웹은 `mile`의 가장 완성도 높은 클라이언트이며, 모바일 앱보다 더 많은 관리 기능을 제공한다.

```txt
mile-web
├─ Dashboard
├─ Workspace 관리
├─ Project 관리
├─ Task 관리
├─ Calendar 관리
├─ Decision 관리
├─ History / Timeline
├─ devCal
├─ Calendar Source 설정
├─ CI/CD 설정
└─ User / App Settings
```

---

## 2. 웹의 핵심 역할

```txt
- mile의 메인 관리 화면
- 개인/업무 데이터 분리 조회
- 프로젝트 중심의 작업 관리
- 일정과 작업의 연결
- 결정사항 기록
- 히스토리와 타임라인 확인
- CalendarSource 설정
- devCal View 제공
- Jenkins 등 외부 연동 설정
```

---

## 3. 제품 방향

`mile-web`은 단순한 TODO 웹앱이 아니라, 프로젝트 흐름을 관리하는 생산성 콘솔이다.

```txt
방향성
- Web-first
- Project-centered
- Calendar-connected
- Decision-driven
- History-based
- Developer-friendly
```

제외할 방향:

```txt
- 대규모 협업 SaaS
- 처음부터 복잡한 팀 권한 시스템
- 모든 기능을 모바일 중심으로 설계
- 캘린더 앱만을 목표로 하는 구조
```

---

## 4. 기술 스택

```txt
Framework: Next.js
Language: TypeScript
UI: orot-ui 또는 CSS Modules 기반 자체 UI
State: Zustand 또는 Jotai
Server State: TanStack Query
Form: React Hook Form + Zod
Calendar UI: FullCalendar 또는 자체 Calendar View
API Client: Axios 또는 Fetch Wrapper
Auth: Access Token / Refresh Token 기반
```

권장 구조:

```txt
mile-web
├─ app
├─ components
├─ features
│  ├─ dashboard
│  ├─ workspace
│  ├─ project
│  ├─ task
│  ├─ calendar
│  ├─ decision
│  ├─ history
│  ├─ devcal
│  ├─ integration
│  └─ settings
├─ lib
├─ services
├─ styles
└─ types
```

---

## 5. 라우트 구조

```txt
/
/login
/dashboard
/tasks
/calendar
/calendar/dev
/projects
/projects/:slug
/projects/:slug/tasks
/projects/:slug/calendar
/projects/:slug/decisions
/projects/:slug/timeline
/projects/:slug/devcal
/decisions
/history
/notes
/work/meetings
/work/cicd
/settings
/settings/profile
/settings/workspaces
/settings/calendars
/settings/integrations
```

---

## 6. 기본 레이아웃

```txt
App Layout
├─ Sidebar
│  ├─ Dashboard
│  ├─ Tasks
│  ├─ Calendar
│  ├─ devCal
│  ├─ Projects
│  ├─ Decisions
│  ├─ History
│  ├─ Notes
│  └─ Settings
│
└─ Main
   ├─ Topbar
   │  ├─ Workspace Switcher
   │  ├─ Search
   │  ├─ Quick Create
   │  ├─ Calendar Sync Status
   │  └─ User Menu
   │
   └─ Content
```

## 6.1 Workspace Switcher

```txt
All
Personal
Work
```

Workspace Switcher는 화면을 바꾸는 기능이 아니라, 현재 화면의 데이터 범위를 바꾸는 기능이다.

예시:

```txt
/tasks?workspace=personal
/tasks?workspace=work
/tasks?workspace=all
```

---

## 7. Dashboard

## 7.1 목적

개인과 업무의 현재 상태를 한눈에 보여준다.

## 7.2 화면 범위

```txt
Dashboard
├─ All
├─ Personal
└─ Work
```

## 7.3 주요 카드

```txt
- 오늘 할 일
- 오늘 일정
- 마감 임박 작업
- 진행 중 프로젝트
- 막힌 작업
- 최근 결정사항
- 최근 히스토리
- 캘린더 동기화 상태
- 최근 devCal 이벤트
- 최근 CI/CD 상태
```

## 7.4 Dashboard 예시

```txt
오늘 요약
- 개인 할 일 3개
- 업무 할 일 5개
- 개인 일정 1개
- 업무 일정 2개
- 마감 임박 2개

최근 결정
- mile 앱은 Swift로 개발하기로 결정
- Apple Calendar 연동은 서버 중심 CalDAV 구조로 결정

최근 히스토리
- Task 상태 변경
- Project 일정 변경
- Calendar Sync 실패 후 재시도
```

---

## 8. Project

## 8.1 목적

개인/업무 프로젝트를 관리한다.

## 8.2 주요 기능

```txt
- 프로젝트 목록
- 프로젝트 생성
- 프로젝트 수정
- 프로젝트 상태 변경
- 프로젝트 보관
- 프로젝트별 작업 관리
- 프로젝트별 일정 관리
- 프로젝트별 결정사항 관리
- 프로젝트별 히스토리 확인
- 프로젝트별 devCal 확인
- 프로젝트별 외부 링크 관리
```

## 8.3 Project Detail

```txt
Project Detail
├─ Overview
├─ Tasks
├─ Calendar
├─ Decisions
├─ Timeline
├─ Notes
├─ Links
├─ devCal
├─ CI/CD
└─ Settings
```

## 8.4 Overview 카드

```txt
- 프로젝트 상태
- 목표
- 진행 중 Task
- 마감 임박 Task
- 연결된 일정
- 최근 결정사항
- 최근 Timeline
- devCal 이벤트
```

---

## 9. Task

## 9.1 목적

개인 할 일, 업무 할 일, 프로젝트 작업을 관리한다.

## 9.2 View

```txt
- List View
- Kanban View
- Calendar View
- Timeline View
- Table View
```

## 9.3 기능

```txt
- Task 생성
- Task 수정
- 상태 변경
- 우선순위 변경
- 마감일 설정
- 프로젝트 연결
- 일정 연결
- 결정사항 연결
- 하위 Task 관리
- 메모 작성
- 히스토리 자동 기록 확인
```

## 9.4 상태

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

---

## 10. Calendar

## 10.1 목적

개인 일정, 업무 일정, 프로젝트 일정, 회의, 마감일, 개발 이벤트를 관리한다.

## 10.2 View

```txt
Calendar
├─ Month
├─ Week
├─ Day
├─ Agenda
├─ Project Timeline
└─ devCal View
```

## 10.3 표시 대상

```txt
- 내부 Event
- Task Due Date
- Project Milestone
- Meeting
- Apple Calendar Event
- devCal Event
- Deployment Schedule
- CI/CD Event
```

## 10.4 Event 구분

```txt
INTERNAL EVENT
- mile에서 직접 생성한 일정

EXTERNAL EVENT
- Apple Calendar 등 외부 캘린더에서 가져온 일정

DERIVED EVENT
- Task due date, CI/CD, 배포 등 다른 엔티티에서 파생된 일정
```

## 10.5 Calendar UI 원칙

```txt
- 개인/업무 색상 분리
- 내부/외부 일정 구분 표시
- 읽기 전용 외부 일정은 수정 UI 제한
- Task 마감일은 Event와 다른 아이콘 사용
- 프로젝트별 필터 제공
```

---

## 11. devCal

## 11.1 목적

개발자 중심 일정과 이벤트를 관리한다.

## 11.2 devCal 대상 이벤트

```txt
- 개발 작업 일정
- 코드 리뷰
- 릴리즈
- 배포
- 서버 점검
- 장애
- CI/CD 실패
- Jenkins Build
- GitHub Actions Workflow
- 프로젝트 마일스톤
- 프로젝트 회고
```

## 11.3 View

```txt
/calendar/dev
/projects/:slug/devcal
```

## 11.4 기능

```txt
- 프로젝트별 개발 일정 조회
- 배포 일정 표시
- CI/CD 이벤트 자동 표시
- 장애/점검 일정 등록
- 릴리즈 캘린더 관리
- Task와 devCal Event 연결
- Decision과 devCal Event 연결
```

초기에는 Calendar의 특화 View로 구현하고, 별도 도메인으로 분리하지 않는다.

---

## 12. Decision

## 12.1 목적

중요한 결정사항을 기록하고 추적한다.

## 12.2 기능

```txt
- Decision 생성
- Decision 수정
- Decision 상태 변경
- Project 연결
- Task 연결
- Event 연결
- 대안 기록
- 영향 범위 기록
- 재검토 처리
- 이전 결정 대체 처리
```

## 12.3 Decision 화면

```txt
Decisions
├─ 전체 결정사항
├─ Proposed
├─ Decided
├─ Revisited
└─ Superseded
```

Decision 상세:

```txt
- 배경
- 결정 내용
- 결정 이유
- 대안
- 영향 범위
- 연결된 Project
- 연결된 Task
- 연결된 Event
- 변경 히스토리
```

---

## 13. History / Timeline

## 13.1 목적

프로젝트, 작업, 일정, 결정사항의 변경 흐름을 추적한다.

## 13.2 화면

```txt
/history
/projects/:slug/timeline
/tasks/:id/history
/decisions/:id/history
```

## 13.3 표시 대상

```txt
- Project 생성/상태 변경
- Task 생성/상태 변경/마감 변경
- Event 생성/일정 변경
- Decision 생성/수정/상태 변경
- Calendar Sync 성공/실패
- CI/CD Build 성공/실패
- Deployment 성공/실패
```

## 13.4 UI 원칙

```txt
- 시간순 정렬
- 엔티티별 필터
- Project별 필터
- Workspace별 필터
- 변경 전/후 값 표시
- 중요한 이벤트 강조
```

---

## 14. Settings

## 14.1 설정 영역

```txt
/settings/profile
/settings/workspaces
/settings/calendars
/settings/integrations
/settings/notifications
/settings/security
```

## 14.2 Calendar 설정

```txt
- 내부 캘린더 관리
- Apple Calendar 연결
- 캘린더 소스 목록
- 동기화 방향 설정
- 마지막 동기화 시간 확인
- 동기화 실패 로그 확인
- 수동 동기화 실행
```

## 14.3 Integration 설정

```txt
- Jenkins Provider 등록
- Provider 상태 확인
- Project와 Job 연결
- Sync 실행
- 실패 로그 확인
```

---

## 15. Quick Create

상단에서 빠르게 데이터를 생성한다.

```txt
+ Task
+ Event
+ Project
+ Decision
+ Note
+ Meeting
```

Quick Create는 현재 선택된 Workspace를 기본값으로 사용한다.

추가 규칙:

```txt
- Project 상세에서 생성하면 project_id 자동 지정
- Calendar에서 생성하면 start_at/end_at 자동 지정
- Decision 탭에서 생성하면 Decision 타입으로 생성
- devCal에서 생성하면 Event.type을 DEV 계열로 기본 지정
```

---

## 16. API 연동 원칙

```txt
- 모든 목록 API는 pagination 지원
- 모든 목록 API는 workspace filter 지원
- Project / Task / Event / Decision은 status filter 지원
- Calendar API는 start_at/end_at 범위 조회 필수
- TanStack Query로 서버 상태 관리
- mutation 성공 후 관련 query invalidate
```

예시 Query Key:

```txt
['dashboard', workspace]
['projects', workspace, filters]
['tasks', workspace, filters]
['calendar', workspace, range]
['project', projectId]
['project-timeline', projectId]
```

---

## 17. 구현 단계

## Phase 1. Web Foundation

```txt
- Next.js 프로젝트 세팅
- 인증 화면
- 기본 레이아웃
- Sidebar / Topbar
- Workspace Switcher
- API Client 구성
```

완료 기준:

```txt
- 로그인 후 기본 레이아웃에 진입할 수 있다.
- Workspace를 전환할 수 있다.
```

## Phase 2. Project / Task

```txt
- Project List
- Project Detail
- Task List
- Task CRUD
- Task 상태 변경
- Project Overview
```

완료 기준:

```txt
- 프로젝트와 작업을 생성/수정할 수 있다.
- 프로젝트 상세에서 작업을 확인할 수 있다.
```

## Phase 3. Calendar / Decision

```txt
- Calendar View
- Event CRUD
- Task Due Date 표시
- Decision List
- Decision Detail
- Decision CRUD
```

완료 기준:

```txt
- 일정을 캘린더에서 볼 수 있다.
- 결정사항을 프로젝트와 연결할 수 있다.
```

## Phase 4. Dashboard / Timeline

```txt
- Dashboard 구현
- History View
- Project Timeline
- Recent Activity
- Filter / Search 기초
```

완료 기준:

```txt
- 오늘 할 일과 일정을 한눈에 볼 수 있다.
- 프로젝트 변경 흐름을 Timeline으로 볼 수 있다.
```

## Phase 5. Calendar Settings / devCal

```txt
- CalendarSource 설정 화면
- Sync Status 표시
- Sync Log 표시
- devCal View
- Project devCal Tab
```

완료 기준:

```txt
- 외부 캘린더 소스 상태를 확인할 수 있다.
- 개발 이벤트를 별도 View에서 볼 수 있다.
```

## Phase 6. Integration

```txt
- Jenkins Provider 설정
- CI Job 목록
- Project-Job 연결
- Build History View
- CI 이벤트 Timeline 표시
```

완료 기준:

```txt
- 프로젝트별 CI 상태를 웹에서 확인할 수 있다.
```

---

## 18. MVP 범위

## 포함

```txt
- Login
- Workspace Switcher
- Dashboard
- Project CRUD
- Task CRUD
- Event CRUD
- Calendar View
- Decision CRUD
- History View
- Project Detail
```

## 제외

```txt
- Apple Calendar 실제 동기화 설정 화면 고도화
- Jenkins 실제 연동 화면 고도화
- 모바일 전용 화면
- 복잡한 팀 권한 관리
- AI 요약
```

---

## 19. 최종 목표

`mile-web`은 `mile`의 가장 강력한 관리 콘솔이다.

웹에서 사용자는 개인/업무 프로젝트의 전체 흐름을 확인하고, 일정과 작업을 관리하며, 중요한 결정과 히스토리를 추적한다.

장기적으로는 Apple Calendar, devCal, Jenkins, 배포 이력까지 연결되어 개인과 업무의 모든 진행 상황을 한 화면에서 관리하는 생산성 허브가 된다.
