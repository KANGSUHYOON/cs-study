/*설치한 EXPRESS 라이브러리를 현재 파일에서 사용할 수 있게 불러오는 코드*/
const express = require("express");
const cors = require("cors")

const app = express(); //Express  기반 서버 애플리케이션을 생성
const PORT = 3000; //서버가 사용할 포트 번호를 지정

//프론트엔드에서 백엔드 API를 호출할 수 있도록 허용
app.use(cors()) //다른 주소에서 실행 중인 웹페이지가 우리 서버에 요청하는 것을 허용하겠다 라는 의미

/*클라이언트가 보낸 JSON 데이터를 req.body로 읽게 해줌*/
app.use(express.json());

/*메모리에 저장할 TODO 배열 생성*/
const todos = [
  {
    id: 1,
    title: "Node.js 공부하기",
    completed: false,
  },
  {
    id: 2,
    title: "백준 문제 풀기",
    completed: true,
  },
];

/*클라이언트가 /주소로 GET 요청을 보내면 문자열을 응답*/
app.get("/", (req, res) => {
  res.send("공부 TODO 서버가 정상적으로 실행 중입니다!");
});

/* TODO 목록을 반환하는 API 추가*/
app.get("/todos", (req, res) => {
  res.json(todos);
});

//post 방식으로 /todos 주소에 요청이 들어왔을 때 실행되는 코드
app.post("/todos", (req, res) => {
  // 요청 body에서 title 값을 꺼냄
  // const title = req.body.title; 과 같은 의미
  const { title } = req.body;

  //title이 문자열인지 확인하고, 앞뒤 공백을 제거
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  // trim은 앞뒤의 공백을 제거한다.
  // title이 없거나 빈 문자열이면 잘못된 요청으로 처리
  if (!trimmedTitle) {
    // HTTP 상태 코드 400과 오류 메시지를 클라이언트에게 보냄
    return res.status(400).json({
      message: "title을 올바르게 입력해주세요.",
    });
  }

  // 새로 추가할 일 객체 생성
  const newTodo = {
    // 현재 todos 배열 길이에 1을 더해서 ID 생성
    id: todos.length + 1,
    // 사용자가 입력한 할 일 제목
    title: trimmedTitle,
    // 처음 생성된 할 일은 완료되지 않은 상태
    completed: false,
  };

  // 새 할 일을 todos 배열에 추가
  todos.push(newTodo);

  // HTTP 상태 코드 201과 생성된 할 일 정보를 클라이언트에게 보냄
  res.status(201).json(newTodo);
});

// 특정 Todo의 완료 상태를 수정하는 API
app.patch("/todos/:id", (req, res) => {
  // URL에서 전달된 id 값을 숫자로 변환
  const todoId = Number(req.params.id);

  // 요청 body에서 completed 값을 꺼냄
  const { completed } = req.body;

  // id가 올바른 양의 정수가 아니면 오류 처리
  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({
      message: "올바른 Todo ID를 입력해주세요.",
    });
  }

  // completed는 반드시 true 또는 false여야 함
  if (typeof completed !== "boolean") {
    return res.status(400).json({
      message: "completed 값은 true 또는 false여야 합니다.",
    });
  }

  // 배열에서 전달받은 id와 일치하는 Todo를 찾음
  const todo = todos.find((todo) => todo.id === todoId);

  // 해당 Todo가 없으면 404 오류 처리
  if (!todo) {
    return res.status(404).json({
      message: "해당 Todo를 찾을 수 없습니다.",
    });
  }

  // 완료 상태 수정
  todo.completed = completed;

  // 수정된 Todo 반환
  res.status(200).json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const todoId = Number(req.params.id);

  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({
      message: "올바른 Todo ID를 입력해주세요.",
    });
  }

  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({
      message: "해당 Todo를 찾을 수 없습니다.",
    });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];

  res.status(200).json(deletedTodo);
});

// port 번호로 서버 실행
app.listen(PORT, () => {
  // 서버가 정상 실행되면 터미널에 주소 출력
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});