# Study Todo App

## 프로젝트 소개

Node.js, Express, MySQL로 REST API를 만들고 HTML, CSS, JavaScript 화면과 연결하는 과정을 학습하기 위한 TODO 웹 애플리케이션입니다. 기본 CRUD부터 프론트엔드 상태 관리, 날짜 기반 일정 저장·조회, 월별 집계까지 직접 구현했습니다.

현재 캘린더 기능은 데이터베이스 구조와 백엔드 API까지만 구현되어 있습니다. 월간 캘린더 화면과 날짜 선택 UI는 아직 구현되지 않았습니다.

## 현재 구현된 기능

### 프론트엔드

- Todo 추가
- Todo 완료 및 체크 해제
- Todo 제목 인라인 수정과 취소
- Todo 삭제
- 전체 / 진행 중 / 완료 필터
- 필터별 Todo 개수 표시
- 전체 Todo 기준 진행률 숫자와 진행률 막대
- 한국 시간대에 따라 아침 / 낮 / 저녁 / 밤으로 변하는 풍경 UI
- 320px 이상 화면을 고려한 반응형 디자인
- 키보드 포커스와 모션 감소 설정을 고려한 접근성 처리

### 백엔드

- MySQL 기반 Todo 영구 저장
- 전체 Todo 조회
- 특정 날짜의 Todo 조회
- 날짜가 있거나 없는 Todo 생성
- 완료 및 체크 해제
- Todo 제목 수정
- Todo 예정 날짜 수정 및 제거
- Todo 삭제
- 월별 날짜 집계 API
- 완료 처리 시 UTC 기준 `completed_at` 기록
- 체크 해제 시 `completed_at`을 `NULL`로 변경
- 윤년과 실제 존재하는 날짜를 포함한 날짜 검증
- `?` 플레이스홀더를 이용한 SQL 파라미터 바인딩
- `400`, `404`, `500` 상태 코드와 기능별 오류 응답

### 아직 구현되지 않은 기능

- 사이드 드로어 월간 캘린더 UI
- 월 이동과 날짜 선택 화면
- 캘린더에서 선택한 날짜의 Todo 상세 표시
- 캘린더 UI와 메인 Todo 목록의 상태 동기화

## 사용 기술

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API

### Backend

- Node.js
- Express
- CORS
- dotenv
- mysql2/promise

### Database

- MySQL

## 프로젝트 구조

`node_modules`는 아래 구조에서 생략했습니다.

```text
js/todo-list/
├─ README.md
└─ study-todo-api/
   ├─ app.js
   ├─ db.js
   ├─ package.json
   ├─ package-lock.json
   ├─ .env
   ├─ .gitignore
   ├─ controllers/
   │  ├─ todoController.js
   │  └─ calendarController.js
   ├─ routes/
   │  ├─ todoRoutes.js
   │  └─ calendarRoutes.js
   ├─ utils/
   │  └─ dateUtils.js
   ├─ public/
   │  ├─ index.html
   │  ├─ script.js
   │  └─ style.css
   ├─ sql/
   │  └─ 20260717_add_calendar_fields.sql
   └─ tests/
      ├─ todos.http
      └─ calendar.http
```

주요 폴더의 역할은 다음과 같습니다.

| 경로 | 역할 |
| --- | --- |
| `controllers/` | 요청값 검증, MySQL 쿼리 실행, 응답 데이터 가공 |
| `routes/` | HTTP method와 endpoint를 컨트롤러에 연결 |
| `utils/` | 날짜 유효성 검사와 월 시작일·다음 달 시작일 계산 |
| `public/` | Todo 화면, 스타일, 브라우저 이벤트와 상태 관리 |
| `sql/` | 기존 DB 구조를 확장하는 마이그레이션 이력 |
| `tests/` | VS Code REST Client 등에서 실행할 HTTP 요청 예시 |

## 애플리케이션 동작 흐름

```text
사용자 입력
→ public/script.js
→ Fetch API
→ Express Router
→ Controller
→ MySQL
→ JSON 응답
→ 프론트엔드 상태 배열 갱신
→ 화면 재렌더링
```

`app.js`는 Express 설정과 서버 실행을 담당하고, `routes`는 URL을 컨트롤러에 연결합니다. `controllers`는 유효성 검사와 SQL 실행을 담당하며, `db.js`가 `mysql2/promise` 연결 풀을 제공합니다.

## 데이터베이스 구조

마이그레이션까지 적용된 `todos` 테이블의 주요 컬럼은 다음과 같습니다.

| 컬럼 | 타입 | NULL | 역할 |
| --- | --- | --- | --- |
| `id` | `INT AUTO_INCREMENT` | 불가 | Todo 기본 키 |
| `title` | `VARCHAR(255)` | 불가 | Todo 제목 |
| `completed` | `BOOLEAN` | 불가 | 완료 여부, 기본값 `FALSE` |
| `scheduled_date` | `DATE` | 허용 | Todo 수행 예정 날짜 |
| `completed_at` | `DATETIME` | 허용 | 실제 완료 처리 시각 |
| `created_at` | `TIMESTAMP` | 불가 | 생성 시각, 기본값 `CURRENT_TIMESTAMP` |

`scheduled_date`가 `NULL`이면 날짜를 지정하지 않은 Todo입니다. 기존 데이터도 날짜 없이 그대로 조회할 수 있습니다.

완료 요청에서 `completed`가 `true`이면 `completed_at`에 `UTC_TIMESTAMP()`를 기록합니다. 체크를 해제해 `completed`가 `false`가 되면 `completed_at`은 다시 `NULL`이 됩니다.

날짜별 조회와 월별 집계를 위해 `scheduled_date`에는 `idx_todos_scheduled_date` 인덱스가 있습니다.

## 데이터베이스 마이그레이션

마이그레이션 파일:

```text
study-todo-api/sql/20260717_add_calendar_fields.sql
```

이 파일은 기존 `todos` 테이블에 `scheduled_date`, `completed_at`, 날짜 조회 인덱스를 추가합니다. 기존 Todo를 삭제하거나 초기화하지 않습니다.

파일 주석에는 개발 DB 적용일이 `2026-07-17`로 기록되어 있습니다. 새로운 DB나 별도 개발 환경을 준비할 때만 MySQL Workbench 등에서 대상 DB를 확인한 뒤 직접 한 번 실행합니다. 동일한 DB에서 다시 실행하면 중복 컬럼 또는 중복 인덱스 오류가 발생할 수 있습니다.

MySQL CLI를 사용한다면 `study-todo-api` 폴더에서 접속한 뒤 다음처럼 실행할 수 있습니다.

```sql
SOURCE sql/20260717_add_calendar_fields.sql;
```

실행 후에도 마이그레이션 파일은 DB 변경 이력으로 보관합니다.

## API 명세

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/` | 서버 실행 상태 확인 |
| `GET` | `/todos` | 전체 Todo 조회 |
| `GET` | `/todos?date=YYYY-MM-DD` | 예정 날짜가 일치하는 Todo 조회 |
| `POST` | `/todos` | Todo 생성, `scheduledDate`는 선택값 |
| `PATCH` | `/todos/:id` | 완료 또는 체크 해제 |
| `PATCH` | `/todos/:id/title` | Todo 제목 수정 |
| `PATCH` | `/todos/:id/date` | Todo 예정 날짜 수정 또는 제거 |
| `DELETE` | `/todos/:id` | Todo 삭제 |
| `GET` | `/calendar?year=YYYY&month=M` | 월별 날짜 단위 Todo 개수 집계 |

### Todo 생성

날짜가 있는 Todo:

```json
{
  "title": "알고리즘 공부",
  "scheduledDate": "2026-07-17"
}
```

날짜가 없는 Todo도 기존 방식 그대로 생성할 수 있습니다.

```json
{
  "title": "날짜 미지정 일정"
}
```

`scheduledDate`의 빈 문자열은 `NULL`로 정규화됩니다. 날짜 문자열은 실제로 존재하는 `YYYY-MM-DD` 형식이어야 합니다.

### 완료 상태 변경

완료 처리:

```json
{
  "completed": true
}
```

체크 해제:

```json
{
  "completed": false
}
```

### 제목 수정

```json
{
  "title": "Node.js와 Express 복습"
}
```

### 예정 날짜 변경과 제거

날짜 변경:

```json
{
  "scheduledDate": "2026-07-20"
}
```

날짜 제거:

```json
{
  "scheduledDate": null
}
```

### Todo 응답 예시

DB 컬럼명과 같은 snake_case 형식으로 날짜 필드를 반환합니다.

```json
{
  "id": 1,
  "title": "알고리즘 공부",
  "completed": true,
  "scheduled_date": "2026-07-17",
  "completed_at": "2026-07-17T08:30:00Z",
  "created_at": "2026-07-17T08:00:00.000Z"
}
```

`scheduled_date`와 `completed_at`은 값이 없으면 `null`입니다.

### 월별 캘린더 집계 응답

요청 예시:

```http
GET http://localhost:3000/calendar?year=2026&month=7
```

응답 예시:

```json
[
  {
    "date": "2026-07-17",
    "total": 3,
    "completed": 1,
    "pending": 2
  }
]
```

월별 집계의 `pending`은 `completed = false`인 Todo 전체를 의미합니다. 진행 중과 기한 초과의 세부 구분은 아직 캘린더 UI에 구현되지 않았습니다.

## 실행 방법

### 1. 프로젝트 폴더로 이동

```powershell
cd "js/todo-list/study-todo-api"
```

### 2. 패키지 설치

```powershell
npm install
```

### 3. 환경변수 작성

`study-todo-api/.env` 파일을 만들고 다음 항목을 입력합니다. 실제 비밀번호는 README나 Git에 기록하지 않습니다.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=사용자명
DB_PASSWORD=비밀번호
DB_NAME=데이터베이스명
```

`db.js`가 사용하는 환경변수는 위 다섯 개입니다. 서버 포트는 환경변수가 아니라 `app.js`의 `PORT = 3000`으로 고정되어 있습니다.

### 4. MySQL 데이터베이스와 기본 테이블 준비

사용할 데이터베이스를 생성하고 선택한 다음 기본 `todos` 테이블을 준비합니다.

```sql
CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`id`는 `AUTO_INCREMENT`이므로 Todo를 삭제해도 이전 번호를 자동으로 재사용하지 않습니다.

### 5. 캘린더 마이그레이션 적용

새로운 DB라면 기본 테이블을 만든 뒤 `sql/20260717_add_calendar_fields.sql`을 한 번 실행합니다. 이미 적용된 DB에서는 다시 실행하지 않습니다.

### 6. 서버 실행

현재 `package.json`에는 `start` 스크립트가 없으므로 다음 명령을 사용합니다.

```powershell
node app.js
```

정상적으로 연결되면 다음 메시지가 출력됩니다.

```text
MySQL 연결 성공
서버 실행 중: http://localhost:3000
```

### 7. 브라우저 접속

- 서버 상태 확인: `http://localhost:3000/`
- Todo 웹 화면: `http://localhost:3000/index.html`

## API 테스트

다음 파일에 직접 실행할 수 있는 HTTP 요청 예시가 있습니다.

- `tests/todos.http`
- `tests/calendar.http`

VS Code REST Client 같은 도구에서 실행할 수 있습니다. 캘린더 필드 마이그레이션을 적용하고 서버를 재시작한 뒤 테스트하세요. `calendar.http`의 `@todoId`는 실제 생성되었거나 DB에 존재하는 Todo ID로 바꿔야 합니다.

주요 테스트 항목:

- 날짜가 있는 Todo 생성
- 날짜 없는 Todo 생성
- 특정 날짜 조회
- 잘못된 날짜 검증
- 예정 날짜 변경 및 제거
- 완료 처리 및 체크 해제
- 월별 캘린더 집계
- 잘못된 month 검증

## 학습한 내용

- Express Router와 Controller의 역할 분리
- `async/await`과 `mysql2/promise`를 이용한 비동기 쿼리
- `?` 플레이스홀더를 이용한 SQL 파라미터 바인딩
- REST API의 method, endpoint, 상태 코드 설계
- 프론트엔드 상태 배열과 서버 응답 동기화
- 전체 / 진행 중 / 완료 필터링과 전체 기준 진행률 계산
- DB 스키마 마이그레이션과 변경 이력 관리
- MySQL `DATE`, `DATETIME`, `TIMESTAMP`의 역할
- `DATE_FORMAT`을 이용한 날짜 문자열 응답
- 날짜 범위 조회와 `GROUP BY` 집계
- 윤년과 월별 일수를 고려한 날짜 검증
- 기존 title-only 요청과 CRUD API의 호환성을 유지하며 기능 확장
- `AUTO_INCREMENT`, `insertId`, `affectedRows`의 동작

## 다음 단계

- [ ] 사이드 드로어 캘린더 UI
- [ ] 월 이동과 날짜 선택
- [ ] 선택 날짜 Todo 상세 조회
- [ ] 완료 / 진행 중 / 기한 초과 분류
- [ ] 캘린더와 메인 목록 상태 동기화
- [ ] 배포
- [ ] 테스트 자동화
- [ ] 대량 데이터 기반 성능 및 인덱스 비교

## 회고

처음에는 Todo 데이터를 JavaScript 배열에만 저장했기 때문에 서버를 재실행하면 데이터가 초기화되었습니다. 이후 CRUD를 MySQL의 `SELECT`, `INSERT`, `UPDATE`, `DELETE`와 연결하면서 데이터를 영구 저장하도록 개선했습니다.

Express 코드에 모여 있던 요청 처리 로직을 `routes`와 `controllers`로 분리하면서 파일마다 역할을 나누는 방법을 학습했습니다. 제목 수정 기능에서는 텍스트를 입력창으로 교체하고 저장 또는 취소 시 원래 화면으로 복원하는 인라인 편집 흐름도 구현했습니다.

필터 기능을 추가하면서 화면에 보이는 DOM만 계산하는 방식에서 벗어나, 전체 Todo 배열을 기준으로 필터별 목록과 진행률을 다시 렌더링하도록 상태 관리를 개선했습니다. 이후 기존 API를 유지한 채 `scheduled_date`와 `completed_at`을 추가하고 날짜 조회와 월별 집계 API를 연결하면서, 기존 기능을 깨뜨리지 않고 데이터베이스 구조와 REST API를 확장하는 과정을 경험했습니다.
