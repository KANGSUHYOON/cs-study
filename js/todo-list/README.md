# Study Todo App

Express.js 백엔드 API와 HTML/CSS/JavaScript 프론트엔드를 연결한 공부용 TODO 프로젝트입니다.

기본적인 TODO 기능을 구현하면서 프론트엔드와 백엔드가 어떻게 데이터를 주고받는지 학습하는 것을 목표로 합니다.

---

## 프로젝트 구조

```txt
todo-list
├─ index.html        # 프론트엔드 화면
├─ style.css         # 프론트엔드 스타일
├─ script.js         # 프론트엔드 동작 코드
├─ client.js         # API 요청 관련 코드
├─ README.md
└─ study-todo-api
   ├─ app.js         # Express 백엔드 서버
   ├─ package.json
   ├─ package-lock.json
   ├─ test.http      # API 테스트 파일
   └─ node_modules
```

## 실행 방법

### 백엔드 서버 실행

```bash
cd study-todo-api
node app.js
```
서버가 정상적으로 실행되면 터미널에 아래와 같이 출력됩니다.
```
서버 실행 중: http://localhost:3000
```

### 프론트엔드 실행

VS Code Live Server로 `index.html`을 실행합니다.

## 구현한 API

| 기능            | Method | URL          | 설명                      |
| ------------- | ------ | ------------ | ----------------------- |
| 서버 상태 확인      | GET    | `/`          | 서버가 정상 실행 중인지 확인        |
| TODO 목록 조회    | GET    | `/todos`     | 전체 TODO 목록 조회           |
| TODO 추가       | POST   | `/todos`     | 새로운 TODO 추가             |
| TODO 완료 상태 수정 | PATCH  | `/todos/:id` | 특정 TODO의 완료 여부 수정       |
| TODO 제목/상태 수정 | PUT    | `/todos/:id` | 특정 TODO의 제목 또는 완료 상태 수정 |
| TODO 삭제       | DELETE | `/todos/:id` | 특정 TODO 삭제              |


## API 예시

### TODO 목록 조회
```
GET http://localhost:3000/todos
```
---

### TODO 추가
```
POST http://localhost:3000/todos
Content-Type: application/json

{
  "title": "Node.js 공부하기"
}
```
---

### TODO 완료 상태 수정
```
PATCH http://localhost:3000/todos/1
Content-Type: application/json

{
  "completed": true
}
```
---

### TODO 제목 및 상태 수정
```
PUT http://localhost:3000/todos/1
Content-Type: application/json

{
  "title": "Express PUT API 구현하기",
  "completed": true
}
```
---

### TODO 삭제
```
DELETE http://localhost:3000/todos/1
```
---

## 현재 구현 상태
- Express 서버 생성
- CORS 설정
- JSON 요청 body 처리
- TODO 목록 조회 기능
- TODO 추가 기능
- TODO 완료 상태 수정 기능
- TODO 제목 및 완료 상태 수정 기능
- TODO 삭제 기능
- 프론트엔드와 백엔드 파일 구조 분리
- Live Server와 Express 서버를 함께 사용하는 구조 이해
---

## 학습한 내용
### Express 기본 구조
```
const express = require("express");
const app = express();

app.use(express.json());

app.listen(3000, () => {
  console.log("서버 실행 중");
});
```
Express를 사용하면 Node.js에서 API 서버를 쉽게 만들 수 있습니다.

---

### req.params
URL에 들어온 값을 가져올 때 사용합니다.
```
app.put("/todos/:id", (req, res) => {
  const todoId = Number(req.params.id);
});
```
예를 들어 `/todos/1`로 요청하면 `req.params.id` 값은 `"1"`입니다.

---

### req.body
클라이언트가 보낸 JSON 데이터를 가져올 때 사용합니다.
```
const { title, completed } = req.body;
```
---
## GET, POST, PATCH, PUT, DELETE 차이
| Method | 역할        |
| ------ | --------- |
| GET    | 데이터 조회    |
| POST   | 데이터 추가    |
| PATCH  | 데이터 일부 수정 |
| PUT    | 데이터 수정    |
| DELETE | 데이터 삭제    |

---

## 주의할 점
현재 TODO 데이터는 서버 메모리 배열에 저장됩니다.
```
const todos = [
  {
    id: 1,
    title: "Node.js 공부하기",
    completed: false,
  },
];
```
따라서 서버를 재부팅하면 데이터가 초기 상태로 돌아갑니다.

추후에는 JSON 파일 저장 또는 데이터베이스 연동을 통해 데이터를 영구 저장할 수 있도록 개선할 예정입니다.

## 다음 개선 예정
- [ ] TODO 데이터를 JSON 파일에 저장하기
- [ ] 서버 재실행 후에도 TODO 목록 유지하기
- [ ] 프론트엔드에서 체크박스 클릭 시 PATCH API 연결
- [ ] 프론트엔드에서 삭제 버튼 클릭 시 DELETE API 연결
- [ ] 프론트엔드에서 제목 수정 기능 구현
- [ ] AI를 활용한 TODO 자동 분해 기능 추가

---

## 회고
이번 프로젝트를 통해 단순한 프론트엔드 TODO 앱에서 벗어나, Express 백엔드 API와 연결되는 구조를 학습했습니다.

특히 프론트엔드 파일과 백엔드 파일을 분리하고, Live Server와 Node 서버가 각각 다른 역할을 한다는 점을 이해했습니다.

또한 CRUD API를 직접 구현하면서 백엔드에서 요청을 받고, 데이터를 처리한 뒤, 응답을 보내는 기본 흐름을 익혔습니다.
