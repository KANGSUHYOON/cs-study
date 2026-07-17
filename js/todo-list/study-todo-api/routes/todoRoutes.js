const express = require("express");

const {
    getTodos,
    createTodo,
    updateTodoCompleted,
    updateTodoTitle,
    updateTodoDate,
    deleteTodo,
} = require("../controllers/todoController");

const router = express.Router();

// GET /todos
router.get("/", getTodos);

// POST /todos
router.post("/", createTodo);

// Todo 제목 수정: PATCH /todos/:id/title
router.patch("/:id/title", updateTodoTitle);

// Todo 예정 날짜 수정: PATCH /todos/:id/date
router.patch("/:id/date", updateTodoDate);

// PATCH /todos/:id
router.patch("/:id", updateTodoCompleted);

// DELETE /todos/:id
router.delete("/:id", deleteTodo);

module.exports = router;
