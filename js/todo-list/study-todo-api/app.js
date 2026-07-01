const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const todos = [
  { id: 1, title: "Node.js 공부하기", completed: false },
  { id: 2, title: "백준 문제 풀기", completed: true },
];

app.get("/", (req, res) => {
  res.send("공부 TODO 서버가 정상적으로 실행 중입니다!");
});

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const { title } = req.body;
  const trimmedTitle = typeof title === "string" ? title.trim() : "";

  if (!trimmedTitle) {
    return res.status(400).json({ message: "title을 올바르게 입력해주세요." });
  }

  const newTodo = {
    id: todos.length + 1,
    title: trimmedTitle,
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.patch("/todos/:id", (req, res) => {
  const todoId = Number(req.params.id);
  const { completed } = req.body;

  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({ message: "올바른 Todo ID를 입력해주세요." });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      message: "completed 값은 true 또는 false여야 합니다.",
    });
  }

  const todo = todos.find((item) => item.id === todoId);

  if (!todo) {
    return res.status(404).json({ message: "해당 Todo를 찾을 수 없습니다." });
  }

  todo.completed = completed;
  res.status(200).json(todo);
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
