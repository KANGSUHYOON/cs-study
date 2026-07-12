const express = require("express");

const {
    getTodos,
    createTodo,
    updateTodoCompleted,
    updateTodoTitle,
    deleteTodo,
} = require("../controllers/todoController");

const router = express.Router();

// GET /todos
router.get("/", getTodos);

// POST /todos
router.post("/", createTodo);

// PATCH /todos/:id
router.patch("/:id", updateTodoCompleted);

// Todo 제목 수정: PATCH /todos/:id/title
router.patch("/:id/title", updateTodoTitle);

// DELETE /todos/:id
router.delete("/:id", deleteTodo);

module.exports = router;