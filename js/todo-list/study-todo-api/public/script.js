const progressText = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");
const progressTrack = document.querySelector(".progress-track");
const addBtn = document.getElementById("addBtn");
const newTaskInput = document.getElementById("newTask");
const todoBox = document.getElementById("todoList");
const filterButtons = document.querySelectorAll(".filter-btn");
const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const weatherHero = document.getElementById("weatherHero");
const koreanDateText = document.getElementById("koreanDate");
const timeGreetingText = document.getElementById("timeGreeting");
const koreanTimeText = document.getElementById("koreanTime");

const TIME_PERIOD_CONTENT = {
  morning: {
    greeting: "좋은 아침이야. 가볍게 시작해보자.",
  },
  day: {
    greeting: "좋은 오후야. 오늘 계획을 이어가보자.",
  },
  evening: {
    greeting: "좋은 저녁이야.\n남은 할 일을 마무리하자.",
  },
  night: {
    greeting: "오늘도 수고했어. 무리하지 말고 정리해보자.",
  },
};

let timeSceneTimer = null;
let todos = [];
let currentFilter = "all";

// 사용자의 로컬 시간대와 관계없이 한국 표준시의 각 값을 구함
function getKoreanDateTimeParts() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const displayTime = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    displayTime,
  };
}

function getTimePeriod(hour) {
  if (hour >= 5 && hour < 11) {
    return "morning";
  }

  if (hour >= 11 && hour < 17) {
    return "day";
  }

  if (hour >= 17 && hour < 20) {
    return "evening";
  }

  return "night";
}

function updateTimeScene() {
  if (
    !weatherHero ||
    !koreanDateText ||
    !timeGreetingText ||
    !koreanTimeText
  ) {
    return;
  }

  const koreanDateTime = getKoreanDateTimeParts();
  const timePeriod = getTimePeriod(koreanDateTime.hour);
  const content = TIME_PERIOD_CONTENT[timePeriod];

  weatherHero.dataset.time = timePeriod;
  koreanDateText.textContent = `${koreanDateTime.month}월 ${koreanDateTime.day}일 ${koreanDateTime.weekday}`;
  timeGreetingText.textContent = content.greeting;
  koreanTimeText.textContent = koreanDateTime.displayTime;
}

function startTimeScene() {
  updateTimeScene();

  if (timeSceneTimer === null) {
    timeSceneTimer = setInterval(updateTimeScene, 60 * 1000);
  }
}

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function getEmptyMessage() {
  if (currentFilter === "active") {
    return "남은 일정이 없어요. 모두 완료했어요!";
  }

  if (currentFilter === "completed") {
    return "아직 완료된 일정이 없어요.";
  }

  return "아직 등록된 일정이 없어요.";
}

function updateFilterCounts() {
  const completedTodosCount = todos.filter((todo) => todo.completed).length;

  allCount.textContent = String(todos.length);
  activeCount.textContent = String(todos.length - completedTodosCount);
  completedCount.textContent = String(completedTodosCount);
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

// 전체 Todo 상태를 기준으로 진행률을 계산하는 함수
function updateProgress() {
  const completedTodosCount = todos.filter((todo) => todo.completed).length;

  const percent =
    todos.length === 0
      ? 0
      : Math.round((completedTodosCount / todos.length) * 100);

  progressText.textContent = `진행률: ${percent}%`;
  progressBar.style.width = `${percent}%`;
  progressTrack.setAttribute("aria-valuenow", String(percent));
}

function renderTodoList() {
  todoBox.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = getEmptyMessage();
    todoBox.appendChild(emptyMessage);
  } else {
    filteredTodos.forEach((todo) => {
      renderTodo(todo);
    });
  }

  updateFilterCounts();
  updateProgress();
}

// Todo 객체 하나를 HTML 요소로 만들어 화면에 추가하는 함수
function renderTodo(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = "todo-item";

  const label = document.createElement("label");
  label.className = "todo-content";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task";
  checkbox.checked = todo.completed;
  checkbox.dataset.id = todo.id;

  // 제목을 수정할 수 있도록 별도의 span 요소로 생성
  const titleSpan = document.createElement("span");
  titleSpan.className = "todo-title";
  titleSpan.textContent = todo.title;

  label.appendChild(checkbox);
  label.appendChild(titleSpan);

  // 수정·삭제 버튼을 담을 영역
  const buttonBox = document.createElement("div");
  buttonBox.className = "button-box";

  const editBtn = document.createElement("button");
  editBtn.textContent = "수정";
  editBtn.className = "edit-btn";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "삭제";
  deleteBtn.className = "delete-btn";

  buttonBox.appendChild(editBtn);
  buttonBox.appendChild(deleteBtn);

  todoItem.appendChild(label);
  todoItem.appendChild(buttonBox);

  todoBox.appendChild(todoItem);

  // 수정 완료 또는 취소 후 기본 버튼 상태로 돌아가는 함수
  function restoreButtons() {
    buttonBox.innerHTML = "";
    buttonBox.appendChild(editBtn);
    buttonBox.appendChild(deleteBtn);

    checkbox.disabled = false;
  }

  // 체크박스 상태가 변경되면 서버의 Todo 완료 상태 수정
  checkbox.addEventListener("change", async () => {
    const newCompleted = checkbox.checked;

    checkbox.disabled = true;

    try {
      const response = await fetch(
        `http://localhost:3000/todos/${todo.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newCompleted,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Todo 수정 실패: ${response.status}`);
      }

      const updatedTodo = await response.json();

      todo.completed = updatedTodo.completed;
      renderTodoList();
    } catch (error) {
      console.error("Todo를 수정하는 중 오류 발생:", error);

      // 서버 수정에 실패하면 체크 상태를 원래대로 되돌림
      checkbox.checked = !newCompleted;
      updateProgress();
    } finally {
      checkbox.disabled = false;
    }
  });

  // 수정 버튼을 누르면 제목을 입력창으로 변경
  editBtn.addEventListener("click", () => {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "edit-input";
    editInput.value = todo.title;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "저장";
    saveBtn.className = "save-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "취소";
    cancelBtn.className = "cancel-btn";

    // 수정 중에는 체크박스 사용 중지
    checkbox.disabled = true;

    // 기존 제목을 입력창으로 교체
    titleSpan.replaceWith(editInput);

    // 수정·삭제 버튼을 저장·취소 버튼으로 교체
    buttonBox.innerHTML = "";
    buttonBox.appendChild(saveBtn);
    buttonBox.appendChild(cancelBtn);

    editInput.focus();
    editInput.select();

    // 수정 취소
    function cancelEdit() {
      editInput.replaceWith(titleSpan);
      restoreButtons();
    }

    // 수정 내용 저장
    async function saveEdit() {
      const newTitle = editInput.value.trim();

      if (newTitle === "") {
        alert("수정할 제목을 입력해주세요.");
        editInput.focus();
        return;
      }

      saveBtn.disabled = true;
      cancelBtn.disabled = true;
      editInput.disabled = true;

      try {
        const response = await fetch(
          `http://localhost:3000/todos/${todo.id}/title`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newTitle,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || `Todo 제목 수정 실패: ${response.status}`
          );
        }

        const updatedTodo = await response.json();

        // 서버에서 받은 새로운 제목을 현재 Todo 객체와 화면에 반영
        todo.title = updatedTodo.title;
        titleSpan.textContent = updatedTodo.title;

        editInput.replaceWith(titleSpan);
        restoreButtons();

        console.log("수정된 Todo:", updatedTodo);
      } catch (error) {
        console.error("Todo 제목을 수정하는 중 오류 발생:", error);
        alert(error.message);

        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        editInput.disabled = false;
        editInput.focus();
      }
    }

    saveBtn.addEventListener("click", saveEdit);
    cancelBtn.addEventListener("click", cancelEdit);

    // 입력창에서 Enter를 누르면 저장
    // Escape를 누르면 수정 취소
    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveEdit();
      }

      if (event.key === "Escape") {
        cancelEdit();
      }
    });
  });

  // 삭제 버튼을 누르면 서버에서 Todo 삭제
  deleteBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/todos/${todo.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Todo 삭제 실패: ${response.status}`);
      }

      const deletedTodo = await response.json();

      console.log("삭제된 Todo:", deletedTodo);

      todos = todos.filter((item) => item.id !== todo.id);
      renderTodoList();
    } catch (error) {
      console.error("Todo를 삭제하는 중 오류 발생:", error);
    }
  });
}

// 서버에서 전체 Todo 목록을 가져오는 함수
async function loadTodos() {
  try {
    const response = await fetch("http://localhost:3000/todos");

    if (!response.ok) {
      throw new Error(`Todo 조회 실패: ${response.status}`);
    }

    const loadedTodos = await response.json();

    console.log("서버에서 가져온 Todo:", loadedTodos);

    todos = loadedTodos;
    renderTodoList();
  } catch (error) {
    console.error("Todo를 불러오는 중 오류 발생:", error);
  }
}

// 엔터 키를 누르면 추가 버튼 클릭
newTaskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addBtn.click();
  }
});

function initializeFilterButtons() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      updateFilterButtons();
      renderTodoList();
    });
  });

  updateFilterButtons();
}

// 추가 버튼을 누르면 새로운 Todo를 서버에 저장
addBtn.addEventListener("click", async () => {
  // 입력창의 앞뒤 공백을 제거
  const taskText = newTaskInput.value.trim();

  // 빈 값이면 요청을 보내지 않음
  if (taskText === "") {
    return;
  }

  try {
    // 서버의 POST /todos API에 요청
    const response = await fetch("http://localhost:3000/todos", {
      method: "POST",

      // 서버에 JSON 데이터를 보낸다고 알려줌
      headers: {
        "Content-Type": "application/json",
      },

      // JavaScript 객체를 JSON 문자열로 변환해서 전송
      body: JSON.stringify({
        title: taskText,
      }),
    });

    // 서버가 오류 상태 코드를 반환했는지 확인
    if (!response.ok) {
      throw new Error(`Todo 추가 실패: ${response.status}`);
    }

    // 서버에서 생성한 Todo 객체를 받음
    const newTodo = await response.json();

    console.log("서버에 추가된 Todo:", newTodo);

    todos.push(newTodo);
    renderTodoList();

    newTaskInput.value = "";
    newTaskInput.focus();
  } catch (error) {
    console.error("Todo를 추가하는 중 오류 발생:", error);
  }
});

// 페이지가 열릴 때 서버 Todo 불러오기
startTimeScene();
initializeFilterButtons();
loadTodos();
