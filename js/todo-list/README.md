# Study Todo App

Express.js와 MySQL을 사용해 만든 공부용 TODO 웹 애플리케이션입니다.

HTML/CSS/JavaScript로 구성된 프론트엔드에서 Express API를 호출하고, TODO 데이터는 MySQL에 영구 저장됩니다. CRUD 기능을 직접 구현하면서 프론트엔드, 백엔드, 데이터베이스가 연결되는 전체 흐름을 학습하는 것을 목표로 합니다.

---

## 주요 기능

- TODO 목록 조회
- 새로운 TODO 추가
- 체크박스를 통한 완료 상태 변경
- 수정 버튼을 통한 TODO 제목 변경
- TODO 삭제
- MySQL을 이용한 데이터 영구 저장
- 요청 값 유효성 검사
- 라우터와 컨트롤러 역할 분리
- 데이터베이스 연결 실패 및 서버 오류 처리

---

## 사용 기술

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- VS Code Live Server

### Backend

- Node.js
- Express.js
- CORS
- dotenv
- mysql2

### Database

- MySQL

---

## 프로젝트 구조

```text
todo-list/
├─ README.md
└─ study-todo-api/
   ├─ controllers/
   │  └─ todoController.js
   ├─ public/
   │  ├─ index.html
   │  ├─ script.js
   │  └─ style.css
   ├─ routes/
   │  └─ todoRoutes.js
   ├─ tests/
   │  └─ todos.http
   ├─ .env
   ├─ .gitignore
   ├─ app.js
   ├─ db.js
   ├─ package.json
   └─ package-lock.json
```

### 파일별 역할

| 파일 | 역할 |
| --- | --- |
| `public/index.html` | TODO 화면 구조 |
| `public/style.css` | 프론트엔드 스타일 |
| `public/script.js` | 화면 렌더링과 사용자 이벤트 처리 |
| `app.js` | Express 설정, 라우터 연결, 서버 실행 |
| `db.js` | 환경변수 확인 및 MySQL 연결 풀 생성 |
| `routes/todoRoutes.js` | HTTP 메서드와 URL을 컨트롤러 함수에 연결 |
| `controllers/todoController.js` | 유효성 검사, SQL 실행, HTTP 응답 처리 |
| `tests/todos.http` | REST API 직접 테스트 |

---

## 동작 흐름

```text
사용자 입력
→ 프론트엔드 JavaScript
→ Fetch API 요청
→ Express Router
→ Todo Controller
→ MySQL
→ JSON 응답
→ 화면 갱신
```

---

## 데이터베이스 준비

사용할 MySQL 데이터베이스를 만든 뒤 다음과 같이 `todos` 테이블을 생성합니다.

```sql
CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`id`는 `AUTO_INCREMENT`이므로 삭제된 번호를 다시 사용하지 않고 다음 번호부터 증가합니다.

예를 들어 `1`, `2`, `3`번 데이터를 삭제한 뒤 새 TODO를 추가하면 ID가 `4`부터 시작할 수 있습니다. 이는 정상적인 동작입니다.

---

## 환경변수 설정

`study-todo-api` 폴더 안에 `.env` 파일을 만들고 MySQL 연결 정보를 입력합니다.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=사용자명
DB_PASSWORD=비밀번호
DB_NAME=데이터베이스명
```

`.env`에는 비밀번호가 포함되므로 GitHub에 올리지 않습니다.

---

## 실행 방법

### 1. 백엔드 패키지 설치

```bash
cd study-todo-api
npm install
```

### 2. 백엔드 서버 실행

```bash
node app.js
```

정상적으로 연결되면 터미널에 다음과 같이 출력됩니다.

```text
MySQL 연결 성공
서버 실행 중: http://localhost:3000
```

### 3. 프론트엔드 실행

백엔드 서버 실행 후 브라우저에서 `http://localhost:3000/index.html`로 접속합니다.

---

## 구현한 API

| 기능 | Method | URL | MySQL 명령 |
| --- | --- | --- | --- |
| 서버 상태 확인 | `GET` | `/` | - |
| TODO 목록 조회 | `GET` | `/todos` | `SELECT` |
| TODO 추가 | `POST` | `/todos` | `INSERT` |
| 완료 상태 수정 | `PATCH` | `/todos/:id` | `UPDATE` |
| 제목 수정 | `PATCH` | `/todos/:id/title` | `UPDATE` |
| TODO 삭제 | `DELETE` | `/todos/:id` | `DELETE` |

---

## API 요청 예시

### TODO 목록 조회

```http
GET http://localhost:3000/todos
```

### TODO 추가

```http
POST http://localhost:3000/todos
Content-Type: application/json

{
  "title": "MySQL 공부하기"
}
```

### TODO 완료 상태 수정

```http
PATCH http://localhost:3000/todos/1
Content-Type: application/json

{
  "completed": true
}
```

### TODO 제목 수정

```http
PATCH http://localhost:3000/todos/1/title
Content-Type: application/json

{
  "title": "Node.js 복습하기"
}
```

### TODO 삭제

```http
DELETE http://localhost:3000/todos/1
```

---

## CRUD와 MySQL 연결

| CRUD | API | SQL |
| --- | --- | --- |
| Create | `POST /todos` | `INSERT INTO` |
| Read | `GET /todos` | `SELECT` |
| Update | `PATCH /todos/:id`, `PATCH /todos/:id title` | `UPDATE` |
| Delete | `DELETE /todos/:id` | `DELETE` |

서버의 메모리 배열이 아니라 MySQL을 기준으로 데이터를 처리하므로 서버를 종료하거나 다시 실행해도 TODO 데이터가 유지됩니다.

---

## 역할 분리

### `app.js`

Express 애플리케이션 설정과 서버 실행을 담당합니다.

```js
app.use("/todos", todoRoutes);
```

### `routes/todoRoutes.js`

요청 주소와 컨트롤러 함수를 연결합니다.

```js
router.get("/", getTodos);
router.post("/", createTodo);
router.patch("/:id/title", updateTodoTitle);
router.patch("/:id", updateTodoCompleted);
router.delete("/:id", deleteTodo);
```

`app.js`에서 `/todos`를 기본 경로로 지정했으므로 `router.get("/")`는 실제로 `GET /todos` 요청을 처리합니다.

### `controllers/todoController.js`

다음과 같은 실제 비즈니스 로직을 담당합니다.

- 요청 데이터 유효성 검사
- MySQL 쿼리 실행
- 조회 결과 가공
- 상태 코드와 JSON 응답 반환
- 예외 처리

### `db.js`

`.env`의 MySQL 정보를 불러오고 `mysql2/promise` 기반 연결 풀을 생성합니다.

연결 풀을 사용하면 요청마다 새 연결을 만드는 대신 여러 요청에서 데이터베이스 연결을 효율적으로 재사용할 수 있습니다.

---

## 학습한 내용

- Express 서버 생성과 미들웨어 설정
- HTTP 메서드별 역할
- `req.params`와 `req.body` 사용
- Fetch API를 통한 프론트엔드와 백엔드 통신
- MySQL의 `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- `async/await`을 이용한 비동기 DB 처리
- `?` 플레이스홀더를 이용한 안전한 값 전달
- `AUTO_INCREMENT`와 `insertId`
- `affectedRows`를 이용한 수정·삭제 결과 확인
- MySQL의 `0`, `1` 값을 JavaScript의 `false`, `true`로 변환
- `.env`를 이용한 DB 정보 관리
- Router와 Controller 역할 분리
- HTTP 상태 코드 `200`, `201`, `400`, `404`, `500`

---

## 현재 구현 상태

- [x] 프론트엔드 TODO 화면 구현
- [x] Express 서버 생성
- [x] CORS 및 JSON 미들웨어 설정
- [x] 프론트엔드와 Express API 연결
- [x] TODO 목록 조회
- [x] TODO 추가
- [x] 완료 상태 수정
- [x] TODO 제목 수정
- [x] 수정·저장·취소 버튼 구현
- [x] Enter 저장 및 Escape 취소
- [x] TODO 삭제
- [x] MySQL 연결
- [x] 전체 CRUD의 MySQL 전환
- [x] 서버 재실행 후 데이터 유지
- [x] 환경변수를 통한 DB 정보 관리
- [x] Router와 Controller 역할 분리
---

## 다음 개선 예정

- [ ] 입력 길이 제한과 세부 유효성 검사
- [ ] 공통 에러 처리 미들웨어
- [ ] 서비스 계층 분리
- [ ] API 자동 테스트
- [x] Express에서 정적 프론트엔드 파일 제공
- [ ] 배포 환경 구성
- [ ] AI를 활용한 TODO 자동 분해 기능

---

## 회고

처음에는 TODO 데이터를 JavaScript 배열에 저장했기 때문에 서버를 재실행하면 데이터가 초기화되었습니다.

이후 Express API의 CRUD 기능을 MySQL의 `SELECT`, `INSERT`, `UPDATE`, `DELETE`와 연결해 데이터를 영구 저장할 수 있도록 개선했습니다. 또한 `app.js`에 모여 있던 라우터와 데이터 처리 코드를 `routes`와 `controllers`로 분리하면서 파일마다 하나의 역할을 갖도록 구조를 정리했습니다.

이번 작업을 통해 프론트엔드 요청이 Express 라우터와 컨트롤러를 거쳐 MySQL에서 처리되고, 결과가 다시 화면에 반영되는 전체 흐름을 이해할 수 있었습니다.

또한 TODO 제목 수정 기능을 추가하면서 기존 텍스트를 입력창으로 교체하고, 저장 또는 취소 시 다시 원래 화면으로 복원하는 방식의 인라인 수정 UI를 구현했습니다. 완료상태와 제목을 서로 다른 API 경로로 분리해 하나의 기능이 하나의 역할을 담당하도록 구성했습니다.
