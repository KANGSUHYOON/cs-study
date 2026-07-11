const express = require("express");

const {
    getTodos,
    createTodo,
    updateTodoCompleted,
    deleteTodo,
} = require("../controllers/todoController");

const router = express.Router();

// GET /todos
router.get("/", getTodos);

// POST /todos
router.post("/", createTodo);

// PATCH /todos/:id
router.patch("/:id", updateTodoCompleted);

// DELETE /todos/:id
router.delete("/:id", deleteTodo);

module.exports = router;