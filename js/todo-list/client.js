const API_URL = "http://localhost:3000/todos";

const progressText = document.getElementById("progress");
const addBtn = document.getElementById("addBtn");
const newTaskInput = document.getElementById("newTask");
const todoBox = document.getElementById("todoList");

function updateProgress() {
  const tasks = document.querySelectorAll(".task");
  const checked = [...tasks].filter((task) => task.checked).length;
  const percent = tasks.length === 0 ? 0 : Math.round((checked / tasks.length) * 100);
  progressText.textContent = `진행률: ${percent}%`;
}

function renderTodo(todo) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.className = "task";
  checkbox.checked = todo.completed;
  checkbox.dataset.id = todo.id;

  label.appendChild(checkbox);
  label.append(` ${todo.title}`);
  todoBox.appendChild(label);

  checkbox.addEventListener("change", async () => {
    const nextCompleted = checkbox.checked;
    checkbox.disabled = true;

    try {
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!response.ok) {
        throw new Error(`Todo 수정 실패: ${response.status}`);
      }

      const updatedTodo = await response.json();
      checkbox.checked = updatedTodo.completed;
      updateProgress();
    } catch (error) {
      console.error(error);
      checkbox.checked = !nextCompleted;
      updateProgress();
    } finally {
      checkbox.disabled = false;
    }
  });
}

async function loadTodos() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Todo 조회 실패: ${response.status}`);
    }

    const todos = await response.json();
    todoBox.innerHTML = "";
    todos.forEach(renderTodo);
    updateProgress();
  } catch (error) {
    console.error(error);
  }
}

newTaskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addBtn.click();
  }
});

addBtn.addEventListener("click", async () => {
  const title = newTaskInput.value.trim();

  if (!title) {
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Todo 추가 실패: ${response.status}`);
    }

    const newTodo = await response.json();
    renderTodo(newTodo);
    newTaskInput.value = "";
    updateProgress();
  } catch (error) {
    console.error(error);
  }
});

loadTodos();
