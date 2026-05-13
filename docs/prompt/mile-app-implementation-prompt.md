# mile-app 구현 프롬프트

아래 프롬프트는 `mile` 프로젝트의 `app` 영역을 구현하기 위해 다른 AI 개발 도구, 코드 생성 도구, 또는 개발 세션에 그대로 전달할 수 있는 요청서다.

---

## 1. 역할 부여

당신은 개인 생산성 관리 서비스 `mile`의 `app` 영역을 설계하고 구현하는 시니어 소프트웨어 엔지니어다.

프로젝트의 목표는 개인/업무 Workspace를 분리하고, Project / Task / Event / Decision / History를 중심으로 일정, 작업, 결정사항, 변경 이력을 관리하는 웹 기반 생산성 관리 시스템을 만드는 것이다.

`mile`은 나중에 Apple Calendar 연동, devCal, Jenkins/CI/CD 연동, 모바일 앱까지 확장된다.

---

## 2. 구현 대상

```txt
대상: mile-app
권장 기술 스택: Swift + SwiftUI + Combine/async-await + URLSession + EventKit + UserNotifications
```

아래 계획서를 기준으로 구현 계획을 세우고, 실제 프로젝트 구조, 코드 구조, 데이터 구조, API 또는 화면 구조를 제안한 뒤 단계별 구현을 진행하라.

---

## 3. 최우선 원칙

```txt
- MVP 범위를 먼저 완성한다.
- 개인/업무 Workspace 분리를 모든 데이터 모델과 화면/API에 일관되게 반영한다.
- Project 중심으로 Task, Event, Decision, History가 연결되도록 설계한다.
- History는 사용자가 직접 작성하는 로그가 아니라 시스템이 자동 기록하는 변경 이력으로 구현한다.
- Apple Calendar 연동은 처음부터 완전 구현하지 말고, 확장 가능한 구조를 먼저 만든다.
- devCal은 처음부터 별도 제품으로 분리하지 말고 Event 타입과 전용 View/API로 시작한다.
- 유지보수하기 쉬운 구조를 우선한다.
- 파일, 모듈, 컴포넌트, 서비스 이름은 명확하게 작성한다.
- 과도한 추상화보다 실제 구현 가능한 구조를 우선한다.
```

---

## 4. 요청할 산출물

아래 순서대로 결과를 제공하라.

```txt
1. 전체 구현 전략
2. 폴더 구조
3. 핵심 모듈/도메인/컴포넌트 설명
4. 데이터 모델 또는 상태 구조
5. API / 화면 / 기능 흐름
6. MVP 구현 순서
7. 이후 확장 순서
8. 주의해야 할 기술적 리스크
9. 바로 작성해야 할 초기 코드 목록
```

코드를 작성할 때는 한 번에 모든 기능을 만들기보다, MVP부터 동작 가능한 단위로 구현하라.

---

## 5. 구현 기준 계획서

아래 내용을 기준으로 `mile-app`를 구현하라.

# mile App 계획서

## 1. 개요

`mile-app`은 iPhone, iPad, macOS Apple 생태계에 최적화된 Swift 기반 모바일/클라이언트 앱이다.

초기 검토에서는 Expo 기반 앱도 고려했지만, Apple Calendar 연동, iOS 알림, EventKit, Background Task, 위젯, Live Activity, Apple 생태계 확장을 고려하면 Swift 네이티브 앱으로 개발하는 방향이 더 적합하다.

`mile-app`은 웹을 대체하는 전체 관리 도구가 아니라, 빠른 확인과 입력, 알림, Apple Calendar 연동 경험을 담당하는 보조 클라이언트다.

```txt
mile-app
├─ 오늘 할 일
├─ 오늘 일정
├─ 빠른 Task 생성
├─ 빠른 Decision 기록
├─ 프로젝트 요약
├─ 알림 수신
├─ Apple Calendar 보조 연동
├─ devCal 확인
└─ 위젯 / Live Activity 확장
```

---

## 2. 앱의 핵심 역할

```txt
- 오늘 할 일 확인
- 오늘 일정 확인
- 빠른 Task 생성
- 빠른 Decision 생성
- 프로젝트 요약 확인
- 일정 알림 수신
- 마감 알림 수신
- devCal 이벤트 확인
- Apple Calendar와 자연스러운 사용자 경험 제공
```

앱은 모든 관리 기능을 제공하지 않는다.

복잡한 설정, 외부 연동, 프로젝트 구조 관리, CI/CD Provider 설정은 웹에서 담당한다.

---

## 3. Swift를 선택하는 이유

## 3.1 Apple Calendar 연동 안정성

Swift 앱은 iOS의 EventKit을 직접 사용할 수 있다.

```txt
- 사용자의 기기 캘린더 접근
- Calendar 목록 조회
- Event 조회/생성/수정
- Reminder 접근 가능성
- 시스템 권한 흐름 제어
- iOS Calendar UI와 자연스러운 통합
```

## 3.2 Apple 생태계 확장성

Swift 기반 앱은 다음 확장에 유리하다.

```txt
- iOS Widget
- Live Activity
- App Intents
- Siri Shortcuts
- Background Tasks
- Apple Watch
- iPad 최적화
- macOS Catalyst 또는 별도 macOS App
```

## 3.3 장기 유지보수 판단

Swift를 모르는 상태에서는 초기 학습 비용이 있다.

하지만 이 프로젝트에서 앱의 핵심 가치가 Apple Calendar와 iOS 경험에 있다면, 제한이 많은 크로스플랫폼보다 Swift로 명확하게 가는 것이 장기적으로 안정적이다.

---

## 4. 앱의 위치

```txt
Apple Calendar
      │
      │ CalDAV
      ▼
mile-server
      │
      ├─ mile-web
      └─ mile-app
             │
             └─ EventKit / Notification / Widget
```

중요 원칙:

```txt
- 핵심 데이터는 서버가 가진다.
- 앱은 서버 데이터를 빠르게 보여준다.
- Apple Calendar의 서버 동기화는 mile-server가 담당한다.
- 앱의 EventKit 사용은 보조 기능으로 제한한다.
```

---

## 5. 기술 스택

```txt
Language: Swift
UI: SwiftUI
Architecture: MVVM 또는 TCA-lite 구조
Networking: URLSession 또는 Alamofire
Persistence: SwiftData 또는 CoreData / SQLite
Calendar: EventKit
Notification: UserNotifications
Secure Storage: Keychain
Background: BackgroundTasks
Widget: WidgetKit
Live Activity: ActivityKit
```

초기에는 복잡한 아키텍처보다 단순한 MVVM 구조를 권장한다.

```txt
mile-app
├─ App
├─ Core
│  ├─ API
│  ├─ Auth
│  ├─ Storage
│  ├─ Calendar
│  └─ Notification
├─ Features
│  ├─ Today
│  ├─ Tasks
│  ├─ Calendar
│  ├─ Projects
│  ├─ Decisions
│  ├─ DevCal
│  └─ Settings
├─ Models
└─ DesignSystem
```

---

## 6. 주요 화면

## 6.1 Today

앱의 메인 화면이다.

```txt
Today
├─ 오늘 일정
├─ 오늘 할 일
├─ 마감 임박 작업
├─ 최근 결정사항
├─ devCal 이벤트
└─ Quick Add
```

목표:

```txt
- 앱을 열자마자 오늘 할 일을 알 수 있다.
- 개인/업무를 빠르게 전환할 수 있다.
- 일정과 작업을 함께 볼 수 있다.
```

## 6.2 Tasks

```txt
Tasks
├─ Today
├─ Upcoming
├─ Inbox
├─ Project Tasks
└─ Completed
```

기능:

```txt
- Task 목록 조회
- Task 생성
- Task 상태 변경
- Task 마감일 수정
- Project 연결
- 간단 메모 수정
```

## 6.3 Calendar

```txt
Calendar
├─ Day
├─ Week
├─ Agenda
└─ Calendar Source Filter
```

기능:

```txt
- mile Event 조회
- Apple Calendar에서 동기화된 일정 조회
- Task Due Date 표시
- 내부/외부 일정 구분
- 일정 상세 확인
- 간단 Event 생성
```

## 6.4 Projects

```txt
Projects
├─ 진행 중 프로젝트
├─ 마감 임박 프로젝트
├─ 개인 프로젝트
├─ 업무 프로젝트
└─ 프로젝트 상세 요약
```

앱의 Project 화면은 웹처럼 모든 설정을 제공하지 않는다.

제공 범위:

```txt
- 프로젝트 상태 확인
- 연결된 Task 확인
- 연결된 Event 확인
- 최근 Decision 확인
- 최근 Timeline 확인
```

## 6.5 Decisions

```txt
Decisions
├─ 최근 결정사항
├─ 프로젝트별 결정사항
├─ 빠른 Decision 생성
└─ Decision 상세
```

앱에서는 빠르게 기록하는 경험을 우선한다.

```txt
Quick Decision
- 제목
- 결정 내용
- 이유
- 연결 Project
- 연결 Task
```

## 6.6 devCal

```txt
devCal
├─ 오늘 개발 이벤트
├─ 배포 일정
├─ 릴리즈 일정
├─ CI 실패 이벤트
├─ 서버 점검
└─ 프로젝트별 개발 일정
```

앱에서 devCal은 알림과 확인 중심이다.

---

## 7. Apple Calendar 연동에서 앱의 역할

## 7.1 서버 중심 원칙

Apple Calendar의 핵심 동기화는 `mile-server`에서 CalDAV로 처리한다.

```txt
Apple Calendar ← CalDAV → mile-server ← API → mile-app
```

이 구조가 기본이다.

## 7.2 앱의 EventKit 역할

앱은 EventKit을 사용해 다음 보조 기능을 제공할 수 있다.

```txt
- 기기 캘린더 권한 요청
- 로컬 Calendar 목록 확인
- 사용자가 선택한 일정 가져오기
- mile 일정을 기기 캘린더에 추가
- 시스템 Calendar UI 열기
- 로컬 알림과 일정 경험 개선
```

## 7.3 앱이 하면 안 되는 일

```txt
- 앱이 Apple Calendar 동기화의 주체가 되는 구조
- 앱 백그라운드 실행에 의존한 지속 동기화
- 기기 캘린더를 mile의 주 데이터 저장소로 사용하는 구조
- MVP부터 복잡한 양방향 동기화 구현
```

---

## 8. 알림

## 8.1 알림 종류

```txt
- 오늘 일정 알림
- Task 마감 알림
- Decision 재검토 알림
- Calendar Sync 실패 알림
- CI/CD 실패 알림
- 배포 실패 알림
- devCal 이벤트 알림
```

## 8.2 알림 구조

```txt
mile-server
├─ 알림 이벤트 생성
├─ Push 요청
└─ 알림 상태 저장

mile-app
├─ Push 수신
├─ Local Notification 표시
├─ 알림 클릭 시 상세 화면 이동
└─ 알림 읽음 처리
```

## 8.3 로컬 알림

앱은 서버 Push 외에도 사용자가 직접 설정한 로컬 알림을 처리할 수 있다.

```txt
- 오늘 할 일 리마인더
- 특정 일정 전 알림
- 개인 루틴 알림
```

---

## 9. 위젯 / Live Activity

초기 MVP에는 포함하지 않는다.

후속 기능으로 다음을 고려한다.

## 9.1 Widget

```txt
- 오늘 할 일 위젯
- 오늘 일정 위젯
- 프로젝트 진행 상태 위젯
- devCal 이벤트 위젯
```

## 9.2 Live Activity

```txt
- 진행 중 배포
- 진행 중 CI Build
- 진행 중 작업 세션
- 집중 작업 타이머
```

## 9.3 App Intents

```txt
- 빠른 Task 추가
- 오늘 일정 확인
- 프로젝트 상태 확인
- Decision 빠른 기록
```

---

## 10. 인증과 보안

## 10.1 인증

```txt
- Access Token / Refresh Token 기반
- Keychain에 Refresh Token 저장
- Access Token은 메모리 또는 안전 저장소 사용
- 만료 시 자동 Refresh
```

## 10.2 보안 원칙

```txt
- 비밀번호 저장 금지
- 토큰 로그 출력 금지
- Calendar 권한은 사용자 동의 후 요청
- 민감 정보는 Keychain에 저장
- Workspace 데이터 분리 유지
```

---

## 11. 오프라인 전략

초기에는 완전한 오프라인 편집을 제공하지 않는다.

권장 단계:

```txt
MVP
- 온라인 중심
- 최근 조회 데이터 캐시
- 네트워크 실패 시 에러 표시

후속
- Today 데이터 로컬 캐시
- Task 빠른 생성 임시 저장
- 네트워크 복구 시 동기화

장기
- 일부 오프라인 편집 지원
- 충돌 해결 정책 추가
```

---

## 12. 앱 API 사용 범위

앱에서 우선 사용할 API:

```txt
GET  /auth/me
POST /auth/login
POST /auth/refresh

GET  /dashboard
GET  /tasks
POST /tasks
PATCH /tasks/:id/status

GET  /calendar
POST /events

GET  /projects
GET  /projects/:id/overview
GET  /projects/:id/timeline

GET  /decisions
POST /decisions

GET  /calendar/dev
GET  /notifications
PATCH /notifications/:id/read
```

웹에서만 우선 제공할 API:

```txt
- CalendarSource 등록/수정
- Jenkins Provider 등록/수정
- Workspace 상세 설정
- 복잡한 Integration 설정
- 대량 History 검색
```

---

## 13. 구현 단계

## Phase 1. App Foundation

```txt
- SwiftUI 프로젝트 생성
- 기본 Design System
- API Client 구현
- Auth 구현
- Keychain 저장
- Tab 구조 구성
```

완료 기준:

```txt
- 로그인할 수 있다.
- 서버에서 사용자 정보를 가져올 수 있다.
- 기본 탭 화면이 구성된다.
```

## Phase 2. Today / Task

```txt
- Today 화면
- 오늘 할 일 조회
- 오늘 일정 조회
- Task 목록
- Task 상태 변경
- 빠른 Task 생성
```

완료 기준:

```txt
- 앱에서 오늘 할 일과 일정을 볼 수 있다.
- 빠르게 Task를 만들고 완료 처리할 수 있다.
```

## Phase 3. Calendar / Project

```txt
- Calendar Agenda View
- Event 상세
- 간단 Event 생성
- Project 목록
- Project 요약
- Project Timeline 조회
```

완료 기준:

```txt
- 앱에서 일정을 확인할 수 있다.
- 프로젝트 진행 상태를 요약해서 볼 수 있다.
```

## Phase 4. Decision / devCal

```txt
- Decision 목록
- Quick Decision 생성
- devCal 이벤트 조회
- CI 실패/배포 이벤트 표시
```

완료 기준:

```txt
- 앱에서 중요한 결정을 빠르게 기록할 수 있다.
- 개발 관련 이벤트를 확인할 수 있다.
```

## Phase 5. Notification

```txt
- Push Notification 설정
- Local Notification 설정
- 알림 목록
- 알림 클릭 시 상세 이동
```

완료 기준:

```txt
- 마감, 일정, CI 실패 등 주요 알림을 받을 수 있다.
```

## Phase 6. Apple Native Extension

```txt
- EventKit 권한 요청
- 로컬 캘린더 목록 조회
- mile 일정을 기기 캘린더에 추가
- WidgetKit
- Live Activity
- App Intents
```

완료 기준:

```txt
- Apple 생태계와 자연스럽게 연결된다.
```

---

## 14. MVP 범위

## 포함

```txt
- SwiftUI 앱
- 로그인
- Today 화면
- 오늘 할 일
- 오늘 일정
- Task 목록
- Task 상태 변경
- 빠른 Task 생성
- Project 요약
- Calendar Agenda
```

## 제외

```txt
- EventKit 직접 연동
- 위젯
- Live Activity
- App Intents
- 오프라인 편집
- 복잡한 Project 관리
- CalendarSource 설정
- Jenkins Provider 설정
```

---

## 15. 학습 및 유지보수 전략

Swift를 모르는 상태에서 시작하므로 앱은 기능을 작게 나눠서 개발한다.

권장 방식:

```txt
1. SwiftUI 화면 구성부터 시작
2. API Client와 Codable 모델 작성
3. 인증과 Keychain 처리
4. Today / Task 같은 단순 기능 구현
5. Calendar / Notification으로 확장
6. EventKit은 마지막에 도입
```

초기에는 다음을 피한다.

```txt
- 복잡한 앱 아키텍처
- 과도한 추상화
- CoreData부터 시작하는 구조
- 앱에서 모든 기능을 처리하려는 구조
- EventKit을 MVP에 넣는 것
```

---

## 16. 최종 목표

`mile-app`은 사용자가 이동 중에도 자신의 일정, 작업, 프로젝트 흐름을 빠르게 확인하고 기록할 수 있는 Apple 생태계 클라이언트다.

웹이 전체 관리 콘솔이라면, 앱은 다음 역할에 집중한다.

```txt
- 오늘 무엇을 해야 하는지 확인한다.
- 중요한 작업을 빠르게 기록한다.
- 결정사항을 놓치지 않고 남긴다.
- 일정과 마감 알림을 받는다.
- Apple Calendar와 자연스럽게 연결된다.
```

장기적으로 `mile-app`은 Widget, Live Activity, App Intents, EventKit을 통해 iOS에서 가장 자주 보는 개인 생산성 인터페이스가 된다.


---

## 6. 구현 시 추가 지시

```txt
- 불분명한 부분은 임의로 복잡하게 확장하지 말고 MVP 기준으로 합리적인 기본값을 정한다.
- 인증, 권한, Workspace 필터링은 처음부터 고려한다.
- Calendar, devCal, Apple Calendar, CI/CD는 확장 가능한 구조로 열어둔다.
- 실제 구현에서는 타입 안정성과 에러 처리를 중요하게 다룬다.
- README, .env.example, 실행 스크립트, Docker 또는 개발 환경 문서를 함께 고려한다.
```

---

## 7. 첫 번째 작업 요청

먼저 이 계획서를 바탕으로 `mile-app`의 초기 프로젝트 구조와 MVP 구현 순서를 제안하라.

그 다음, 바로 구현 가능한 1단계 작업부터 코드 또는 파일 단위로 작성하라.
