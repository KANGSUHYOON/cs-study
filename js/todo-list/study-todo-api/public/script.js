const progressText = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");
const progressTrack = document.querySelector(".progress-track");
const addBtn = document.getElementById("addBtn");
const newTaskInput = document.getElementById("newTask");
const todoDateInput = document.getElementById("todoDate");
const todoBox = document.getElementById("todoList");
const filterButtons = document.querySelectorAll(".filter-btn");
const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const weatherHero = document.getElementById("weatherHero");
const koreanDateText = document.getElementById("koreanDate");
const timeGreetingText = document.getElementById("timeGreeting");
const koreanTimeText = document.getElementById("koreanTime");
const calendarToggle = document.getElementById("calendarToggle");
const calendarOverlay = document.getElementById("calendarOverlay");
const calendarDrawer = document.getElementById("calendarDrawer");
const calendarClose = document.getElementById("calendarClose");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const calendarDayDetail = document.getElementById("calendarDayDetail");

const API_BASE_URL = "http://localhost:3000";
const WEEKDAY_NAMES = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];
const WEEKDAY_SHORT_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

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
let calendarMonthRequestId = 0;
let calendarDayRequestId = 0;
let calendarCloseTimer = null;

const initialKoreanDate = getKoreanDateTimeParts();
const calendarState = {
  year: initialKoreanDate.year,
  month: initialKoreanDate.month,
  selectedDate: createDateString(
    initialKoreanDate.year,
    initialKoreanDate.month,
    initialKoreanDate.day
  ),
  monthSummary: [],
  selectedTodos: [],
  isOpen: false,
  isMonthLoading: false,
  isDayLoading: false,
  monthError: "",
  dayError: "",
  actionError: "",
  pendingTodoIds: new Set(),
};

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

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function createDateString(year, month, day) {
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

function getKoreanTodayDateString() {
  const { year, month, day } = getKoreanDateTimeParts();
  return createDateString(year, month, day);
}

function isLeapYear(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function getDaysInMonth(year, month) {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

function getFirstWeekday(year, month) {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

function getDateParts(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
}

function getKoreanDateTitle(dateString) {
  const { year, month, day } = getDateParts(dateString);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${year}년 ${month}월 ${day}일 ${WEEKDAY_NAMES[weekday]}`;
}

function getShortDateLabel(dateString) {
  const { month, day } = getDateParts(dateString);
  return `${month}월 ${day}일`;
}

async function requestJson(url, options = {}) {
  const requestUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const response = await fetch(requestUrl, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `요청 실패: ${response.status}`);
  }

  return response.json();
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

  const todoCopy = document.createElement("span");
  todoCopy.className = "todo-copy";

  // 제목을 수정할 수 있도록 별도의 span 요소로 생성
  const titleSpan = document.createElement("span");
  titleSpan.className = "todo-title";
  titleSpan.textContent = todo.title;

  todoCopy.appendChild(titleSpan);

  if (todo.scheduled_date) {
    const dateText = document.createElement("span");
    dateText.className = "todo-date";
    dateText.textContent = getShortDateLabel(todo.scheduled_date);
    todoCopy.appendChild(dateText);
  }

  label.appendChild(checkbox);
  label.appendChild(todoCopy);

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
      const updatedTodo = await requestJson(`/todos/${todo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newCompleted,
          }),
        });

      replaceTodoInMainState(updatedTodo);
      renderTodoList();
      await refreshOpenCalendar();
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
        const updatedTodo = await requestJson(`/todos/${todo.id}/title`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newTitle,
            }),
          });

        // 서버에서 받은 새로운 제목을 현재 Todo 객체와 화면에 반영
        todo.title = updatedTodo.title;
        titleSpan.textContent = updatedTodo.title;
        replaceTodoInMainState(updatedTodo);
        replaceTodoInCalendarState(updatedTodo);
        renderCalendarDayDetail();

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
    deleteBtn.disabled = true;

    try {
      const deletedTodo = await requestJson(`/todos/${todo.id}`, {
        method: "DELETE",
      });

      console.log("삭제된 Todo:", deletedTodo);

      todos = todos.filter((item) => item.id !== todo.id);
      renderTodoList();
      await refreshOpenCalendar();
    } catch (error) {
      console.error("Todo를 삭제하는 중 오류 발생:", error);
      deleteBtn.disabled = false;
    }
  });
}

function replaceTodoInMainState(updatedTodo) {
  const todoIndex = todos.findIndex((todo) => todo.id === updatedTodo.id);

  if (todoIndex !== -1) {
    todos[todoIndex] = updatedTodo;
  }
}

function replaceTodoInCalendarState(updatedTodo) {
  const todoIndex = calendarState.selectedTodos.findIndex(
    (todo) => todo.id === updatedTodo.id
  );

  if (updatedTodo.scheduled_date !== calendarState.selectedDate) {
    if (todoIndex !== -1) {
      calendarState.selectedTodos.splice(todoIndex, 1);
    }
    return;
  }

  if (todoIndex === -1) {
    calendarState.selectedTodos.push(updatedTodo);
  } else {
    calendarState.selectedTodos[todoIndex] = updatedTodo;
  }
}

function updateCalendarNavigationState() {
  const isBusy =
    calendarState.isMonthLoading ||
    calendarState.isDayLoading ||
    calendarState.pendingTodoIds.size > 0;

  calendarPrev.disabled = isBusy;
  calendarNext.disabled = isBusy;
}

function createCalendarStatus(message, className, retryAction) {
  const status = document.createElement("div");
  status.className = `calendar-status ${className}`;

  const text = document.createElement("p");
  text.textContent = message;
  status.appendChild(text);

  if (retryAction) {
    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.dataset.action = retryAction;
    retryButton.textContent = "다시 시도";
    status.appendChild(retryButton);
  }

  return status;
}

function renderCalendarMonth() {
  calendarMonthLabel.textContent = `${calendarState.year}년 ${calendarState.month}월`;
  calendarGrid.innerHTML = "";
  calendarGrid.setAttribute(
    "aria-busy",
    String(calendarState.isMonthLoading)
  );
  updateCalendarNavigationState();

  if (calendarState.isMonthLoading) {
    calendarGrid.appendChild(
      createCalendarStatus("월별 일정을 불러오는 중이야.", "is-loading")
    );
  } else if (calendarState.monthError) {
    calendarGrid.appendChild(
      createCalendarStatus(
        calendarState.monthError,
        "is-error",
        "retry-month"
      )
    );
  }

  WEEKDAY_SHORT_NAMES.forEach((weekday, index) => {
    const weekdayLabel = document.createElement("span");
    weekdayLabel.className = "calendar-weekday";
    weekdayLabel.classList.toggle("is-sunday", index === 0);
    weekdayLabel.classList.toggle("is-saturday", index === 6);
    weekdayLabel.textContent = weekday;
    calendarGrid.appendChild(weekdayLabel);
  });

  const firstWeekday = getFirstWeekday(calendarState.year, calendarState.month);
  const daysInMonth = getDaysInMonth(calendarState.year, calendarState.month);
  const summaryByDate = new Map(
    calendarState.monthSummary.map((summary) => [summary.date, summary])
  );
  const today = getKoreanTodayDateString();

  for (let index = 0; index < firstWeekday; index += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "calendar-empty-cell";
    emptyCell.setAttribute("aria-hidden", "true");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = createDateString(calendarState.year, calendarState.month, day);
    const summary = summaryByDate.get(date);
    const total = summary?.total || 0;
    const completed = summary?.completed || 0;
    const pending = summary?.pending || 0;
    const isSelected = date === calendarState.selectedDate;
    const isToday = date === today;
    const dayButton = document.createElement("button");

    dayButton.type = "button";
    dayButton.className = "calendar-day";
    dayButton.dataset.date = date;
    dayButton.classList.toggle("is-selected", isSelected);
    dayButton.classList.toggle("is-today", isToday);
    dayButton.classList.toggle("has-todos", total > 0);
    dayButton.classList.toggle("is-complete", total > 0 && pending === 0);
    dayButton.classList.toggle("has-pending", pending > 0);
    dayButton.disabled =
      calendarState.isMonthLoading || calendarState.isDayLoading;
    dayButton.setAttribute("aria-pressed", String(isSelected));

    if (isToday) {
      dayButton.setAttribute("aria-current", "date");
    }

    dayButton.setAttribute(
      "aria-label",
      total > 0
        ? `${calendarState.month}월 ${day}일, 전체 ${total}개, 완료 ${completed}개, 미완료 ${pending}개`
        : `${calendarState.month}월 ${day}일, 등록된 일정 없음`
    );

    const dayNumber = document.createElement("span");
    dayNumber.className = "calendar-day-number";
    dayNumber.textContent = String(day);
    dayButton.appendChild(dayNumber);

    if (total > 0) {
      const indicator = document.createElement("span");
      indicator.className = "calendar-day-indicator";
      indicator.setAttribute("aria-hidden", "true");

      const dot = document.createElement("span");
      dot.className = "calendar-day-dot";

      const count = document.createElement("span");
      count.className = "calendar-day-count";
      count.textContent = String(total);

      indicator.appendChild(dot);
      indicator.appendChild(count);
      dayButton.appendChild(indicator);
    }

    calendarGrid.appendChild(dayButton);
  }
}

function getSelectedTodoGroups() {
  const today = getKoreanTodayDateString();
  const completed = [];
  const active = [];
  const overdue = [];

  calendarState.selectedTodos.forEach((todo) => {
    if (todo.completed === true) {
      completed.push(todo);
    } else if (todo.scheduled_date && todo.scheduled_date < today) {
      overdue.push(todo);
    } else {
      active.push(todo);
    }
  });

  return { completed, active, overdue };
}

function createCalendarTodoGroup(title, todosInGroup, groupName) {
  const group = document.createElement("section");
  group.className = `calendar-todo-group ${groupName}`;

  const heading = document.createElement("h4");
  heading.textContent = `${title} ${todosInGroup.length}`;
  group.appendChild(heading);

  const list = document.createElement("div");
  list.className = "calendar-todo-list";

  todosInGroup.forEach((todo) => {
    const item = document.createElement("div");
    item.className = "calendar-todo-item";

    const label = document.createElement("label");
    label.className = "calendar-todo-content";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.dataset.action = "toggle-calendar-todo";
    checkbox.dataset.id = String(todo.id);
    checkbox.disabled = calendarState.pendingTodoIds.has(todo.id);
    checkbox.setAttribute("aria-label", `${todo.title} 완료 상태`);

    const titleText = document.createElement("span");
    titleText.textContent = todo.title;

    label.appendChild(checkbox);
    label.appendChild(titleText);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "calendar-todo-delete";
    deleteButton.dataset.action = "delete-calendar-todo";
    deleteButton.dataset.id = String(todo.id);
    deleteButton.disabled = calendarState.pendingTodoIds.has(todo.id);
    deleteButton.setAttribute("aria-label", `${todo.title} 삭제`);
    deleteButton.textContent = "삭제";

    item.appendChild(label);
    item.appendChild(deleteButton);
    list.appendChild(item);
  });

  group.appendChild(list);
  return group;
}

function renderCalendarDayDetail() {
  calendarDayDetail.innerHTML = "";
  calendarDayDetail.setAttribute(
    "aria-busy",
    String(calendarState.isDayLoading)
  );
  updateCalendarNavigationState();

  const title = document.createElement("h3");
  title.textContent = getKoreanDateTitle(calendarState.selectedDate);
  calendarDayDetail.appendChild(title);

  if (calendarState.isDayLoading) {
    calendarDayDetail.appendChild(
      createCalendarStatus("선택한 날짜의 일정을 불러오는 중이야.", "is-loading")
    );
    return;
  }

  if (calendarState.dayError) {
    calendarDayDetail.appendChild(
      createCalendarStatus(
        calendarState.dayError,
        "is-error",
        "retry-day"
      )
    );
    return;
  }

  if (calendarState.actionError) {
    const actionError = document.createElement("p");
    actionError.className = "calendar-action-error";
    actionError.textContent = calendarState.actionError;
    calendarDayDetail.appendChild(actionError);
  }

  const groups = getSelectedTodoGroups();
  const counts = document.createElement("div");
  counts.className = "calendar-detail-counts";

  [
    ["전체", calendarState.selectedTodos.length],
    ["완료", groups.completed.length],
    ["진행 중", groups.active.length],
    ["기한 초과", groups.overdue.length],
  ].forEach(([label, count]) => {
    const countItem = document.createElement("span");
    const countLabel = document.createElement("span");
    const countValue = document.createElement("strong");
    countLabel.textContent = label;
    countValue.textContent = String(count);
    countItem.appendChild(countLabel);
    countItem.appendChild(countValue);
    counts.appendChild(countItem);
  });

  calendarDayDetail.appendChild(counts);

  if (calendarState.selectedTodos.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "calendar-detail-empty";
    emptyMessage.textContent = "이 날짜에는 등록된 일정이 없어.";
    calendarDayDetail.appendChild(emptyMessage);
    return;
  }

  if (groups.completed.length > 0) {
    calendarDayDetail.appendChild(
      createCalendarTodoGroup("완료한 일", groups.completed, "is-completed")
    );
  }

  if (groups.active.length > 0) {
    calendarDayDetail.appendChild(
      createCalendarTodoGroup("진행 중인 일", groups.active, "is-active")
    );
  }

  if (groups.overdue.length > 0) {
    calendarDayDetail.appendChild(
      createCalendarTodoGroup("기한 초과", groups.overdue, "is-overdue")
    );
  }
}

async function loadCalendarMonth() {
  const requestId = ++calendarMonthRequestId;
  const requestYear = calendarState.year;
  const requestMonth = calendarState.month;

  calendarState.isMonthLoading = true;
  calendarState.monthError = "";
  calendarState.monthSummary = [];
  renderCalendarMonth();

  try {
    const summary = await requestJson(
      `/calendar?year=${requestYear}&month=${requestMonth}`
    );

    if (requestId === calendarMonthRequestId) {
      calendarState.monthSummary = summary;
    }
  } catch (error) {
    console.error("월별 캘린더를 불러오는 중 오류 발생:", error);

    if (requestId === calendarMonthRequestId) {
      calendarState.monthError =
        "월별 일정을 불러오지 못했어. 잠시 후 다시 시도해줘.";
    }
  } finally {
    if (requestId === calendarMonthRequestId) {
      calendarState.isMonthLoading = false;
      renderCalendarMonth();
    }
  }
}

async function loadSelectedDateTodos() {
  const requestId = ++calendarDayRequestId;
  const requestDate = calendarState.selectedDate;

  calendarState.isDayLoading = true;
  calendarState.dayError = "";
  calendarState.actionError = "";
  calendarState.selectedTodos = [];
  renderCalendarMonth();
  renderCalendarDayDetail();

  try {
    const selectedTodos = await requestJson(
      `/todos?date=${encodeURIComponent(requestDate)}`
    );

    if (requestId === calendarDayRequestId) {
      calendarState.selectedTodos = selectedTodos;
    }
  } catch (error) {
    console.error("날짜별 Todo를 불러오는 중 오류 발생:", error);

    if (requestId === calendarDayRequestId) {
      calendarState.dayError =
        "선택한 날짜의 일정을 불러오지 못했어. 다시 시도해줘.";
    }
  } finally {
    if (requestId === calendarDayRequestId) {
      calendarState.isDayLoading = false;
      renderCalendarMonth();
      renderCalendarDayDetail();
    }
  }
}

async function refreshOpenCalendar() {
  if (!calendarState.isOpen) {
    return;
  }

  await Promise.all([loadCalendarMonth(), loadSelectedDateTodos()]);
}

async function refreshAfterCalendarMutation() {
  await Promise.all([
    loadTodos(),
    loadCalendarMonth(),
    loadSelectedDateTodos(),
  ]);
}

async function navigateCalendarMonth(offset) {
  if (
    calendarState.isMonthLoading ||
    calendarState.isDayLoading ||
    calendarState.pendingTodoIds.size > 0
  ) {
    return;
  }

  let nextYear = calendarState.year;
  let nextMonth = calendarState.month + offset;

  if (nextMonth === 0) {
    nextYear -= 1;
    nextMonth = 12;
  } else if (nextMonth === 13) {
    nextYear += 1;
    nextMonth = 1;
  }

  calendarState.year = nextYear;
  calendarState.month = nextMonth;
  calendarState.selectedDate = createDateString(nextYear, nextMonth, 1);
  calendarState.monthSummary = [];
  calendarState.selectedTodos = [];
  calendarState.monthError = "";
  calendarState.dayError = "";
  renderCalendarMonth();
  renderCalendarDayDetail();

  await Promise.all([loadCalendarMonth(), loadSelectedDateTodos()]);
}

async function selectCalendarDate(date) {
  if (calendarState.isMonthLoading || calendarState.isDayLoading) {
    return;
  }

  calendarState.selectedDate = date;
  calendarState.selectedTodos = [];
  calendarState.dayError = "";
  renderCalendarMonth();
  renderCalendarDayDetail();
  await loadSelectedDateTodos();
}

async function handleCalendarTodoToggle(checkbox) {
  const todoId = Number(checkbox.dataset.id);
  const todo = calendarState.selectedTodos.find((item) => item.id === todoId);

  if (!todo || calendarState.pendingTodoIds.has(todoId)) {
    return;
  }

  calendarState.pendingTodoIds.add(todoId);
  calendarState.actionError = "";
  renderCalendarDayDetail();

  try {
    const updatedTodo = await requestJson(`/todos/${todoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    replaceTodoInMainState(updatedTodo);
    replaceTodoInCalendarState(updatedTodo);
    renderTodoList();
    await refreshAfterCalendarMutation();
  } catch (error) {
    console.error("캘린더 Todo 상태를 수정하는 중 오류 발생:", error);
    calendarState.actionError =
      "완료 상태를 바꾸지 못했어. 잠시 후 다시 시도해줘.";
  } finally {
    calendarState.pendingTodoIds.delete(todoId);
    renderCalendarMonth();
    renderCalendarDayDetail();
  }
}

async function handleCalendarTodoDelete(todoId) {
  if (calendarState.pendingTodoIds.has(todoId)) {
    return;
  }

  calendarState.pendingTodoIds.add(todoId);
  calendarState.actionError = "";
  renderCalendarDayDetail();

  try {
    await requestJson(`/todos/${todoId}`, { method: "DELETE" });
    todos = todos.filter((todo) => todo.id !== todoId);
    calendarState.selectedTodos = calendarState.selectedTodos.filter(
      (todo) => todo.id !== todoId
    );
    renderTodoList();
    await refreshAfterCalendarMutation();
  } catch (error) {
    console.error("캘린더 Todo를 삭제하는 중 오류 발생:", error);
    calendarState.actionError =
      "일정을 삭제하지 못했어. 잠시 후 다시 시도해줘.";
  } finally {
    calendarState.pendingTodoIds.delete(todoId);
    renderCalendarMonth();
    renderCalendarDayDetail();
  }
}

async function openCalendar() {
  if (calendarState.isOpen) {
    return;
  }

  if (calendarCloseTimer !== null) {
    clearTimeout(calendarCloseTimer);
    calendarCloseTimer = null;
  }

  calendarState.isOpen = true;
  calendarOverlay.hidden = false;
  calendarDrawer.inert = false;
  calendarDrawer.setAttribute("aria-hidden", "false");
  calendarToggle.setAttribute("aria-expanded", "true");
  calendarToggle.setAttribute("aria-label", "캘린더 닫기");
  document.body.classList.add("calendar-open");

  requestAnimationFrame(() => {
    calendarOverlay.classList.add("is-open");
    calendarDrawer.classList.add("is-open");
    calendarClose.focus();
  });

  renderCalendarMonth();
  renderCalendarDayDetail();
  await Promise.all([loadCalendarMonth(), loadSelectedDateTodos()]);
}

function closeCalendar() {
  if (!calendarState.isOpen) {
    return;
  }

  calendarState.isOpen = false;
  calendarOverlay.classList.remove("is-open");
  calendarDrawer.classList.remove("is-open");
  calendarDrawer.setAttribute("aria-hidden", "true");
  calendarToggle.setAttribute("aria-expanded", "false");
  calendarToggle.setAttribute("aria-label", "캘린더 열기");
  document.body.classList.remove("calendar-open");
  calendarToggle.focus();
  calendarDrawer.inert = true;

  calendarCloseTimer = setTimeout(() => {
    if (!calendarState.isOpen) {
      calendarOverlay.hidden = true;
    }
    calendarCloseTimer = null;
  }, 280);
}

function initializeCalendar() {
  renderCalendarMonth();
  renderCalendarDayDetail();

  calendarToggle.addEventListener("click", openCalendar);
  calendarClose.addEventListener("click", closeCalendar);
  calendarOverlay.addEventListener("click", closeCalendar);
  calendarPrev.addEventListener("click", () => navigateCalendarMonth(-1));
  calendarNext.addEventListener("click", () => navigateCalendarMonth(1));

  calendarGrid.addEventListener("click", (event) => {
    const retryButton = event.target.closest('[data-action="retry-month"]');
    if (retryButton) {
      loadCalendarMonth();
      return;
    }

    const dayButton = event.target.closest(".calendar-day[data-date]");
    if (dayButton) {
      selectCalendarDate(dayButton.dataset.date);
    }
  });

  calendarDayDetail.addEventListener("change", (event) => {
    if (event.target.matches('[data-action="toggle-calendar-todo"]')) {
      handleCalendarTodoToggle(event.target);
    }
  });

  calendarDayDetail.addEventListener("click", (event) => {
    const retryButton = event.target.closest('[data-action="retry-day"]');
    if (retryButton) {
      loadSelectedDateTodos();
      return;
    }

    const deleteButton = event.target.closest(
      '[data-action="delete-calendar-todo"]'
    );
    if (deleteButton) {
      handleCalendarTodoDelete(Number(deleteButton.dataset.id));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && calendarState.isOpen) {
      closeCalendar();
    }
  });
}

// 서버에서 전체 Todo 목록을 가져오는 함수
async function loadTodos() {
  try {
    const loadedTodos = await requestJson("/todos");

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
    const newTodo = await requestJson("/todos", {
      method: "POST",

      // 서버에 JSON 데이터를 보낸다고 알려줌
      headers: {
        "Content-Type": "application/json",
      },

      // JavaScript 객체를 JSON 문자열로 변환해서 전송
      body: JSON.stringify({
        title: taskText,
        scheduledDate: todoDateInput.value || null,
      }),
    });

    console.log("서버에 추가된 Todo:", newTodo);

    todos.push(newTodo);
    renderTodoList();
    await refreshOpenCalendar();

    newTaskInput.value = "";
    newTaskInput.focus();
  } catch (error) {
    console.error("Todo를 추가하는 중 오류 발생:", error);
  }
});

// 페이지가 열릴 때 서버 Todo 불러오기
todoDateInput.value = getKoreanTodayDateString();
startTimeScene();
initializeFilterButtons();
initializeCalendar();
loadTodos();
