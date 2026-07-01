# Study Todo Dashboard

브라우저의 Todo 화면과 Node.js/Express 서버를 연결해 CRUD 중 Create, Read, Update를 구현한 학습 프로젝트입니다.

## 구현 기능

- `GET /todos`: 전체 Todo 조회
- `POST /todos`: 새로운 Todo 생성
- `PATCH /todos/:id`: 완료 상태 수정
- 빈 제목 및 잘못된 자료형 검증
- 서버 응답에 따른 동적 화면 렌더링
- 체크 상태 기반 진행률 계산
- Enter 키를 이용한 Todo 추가
- CORS 설정을 통한 프론트엔드·백엔드 연결

## 실행 방법

### 백엔드

```bash
cd study-todo-api
npm install
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.

### 프론트엔드

VS Code Live Server로 `index.html`을 실행합니다.

## 요청 흐름

```text
사용자 조작
→ JavaScript 이벤트
→ fetch() HTTP 요청
→ Express 라우터
→ 서버 데이터 조회/변경
→ JSON 응답
→ 화면 렌더링 및 진행률 갱신
```

## 배운 개념

- 클라이언트와 서버의 역할
- HTTP 메서드 GET, POST, PATCH
- `async` / `await`
- `fetch()`와 JSON 요청·응답
- `req.body`, `req.params`
- HTTP 상태 코드 200, 201, 400, 404
- 입력값 검증과 예외 처리
- DOM 생성 및 이벤트 처리

## 다음 단계

- [ ] `DELETE /todos/:id` 구현
- [ ] 중복되지 않는 ID 생성 방식 적용
- [ ] MySQL 연동
- [ ] 공통 오류 처리 구조 작성
- [ ] 배포 환경에 맞춘 CORS 제한
