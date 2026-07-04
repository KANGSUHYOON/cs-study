const progressText = document.getElementById("progress");
const addBtn = document.getElementById("addBtn");
const newTaskInput = document.getElementById("newTask");
const todoBox = document.getElementById("todoList");

// 진행률을 계산하는 함수
function updateProgress() {
  // 현재 화면에 존재하는 모든 체크박스를 가져옴
  const tasks = document.querySelectorAll(".task");

  let checked = 0;

  tasks.forEach((task) => {
    if (task.checked) {
      checked++;
    }
  });

  const percent =
    tasks.length === 0
      ? 0
      : Math.round((checked / tasks.length) * 100);

  progressText.textContent = `진행률: ${percent}%`;
}

// Todo 객체 하나를 HTML 요소로 만들어 화면에 추가하는 함수
// Todo 객체 하나를 HTML 요소로 만들어 화면에 추가하는 함수
function renderTodo(todo) {
  // <label> 생성
  const label = document.createElement("label");

  // <input> 생성
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.className = "task";

  // 서버의 completed 값에 따라 체크 상태 설정
  checkbox.checked = todo.completed;

  // 서버의 Todo ID를 HTML 요소에 저장
  checkbox.dataset.id = todo.id;

  // checkbox를 label 안에 추가
  label.appendChild(checkbox);

  // Todo 제목 추가
  label.append(" " + todo.title);

  // 완성된 label을 화면에 추가
  todoBox.appendChild(label);

  // 체크박스 상태가 변경되면 서버의 Todo 수정
  checkbox.addEventListener("change", async () => {
    const newCompleted = checkbox.checked;

    // 요청 중 중복 클릭 방지
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

      console.log("서버에서 수정된 Todo:", updatedTodo);

      // 서버의 최종 값으로 화면 상태 맞추기
      checkbox.checked = updatedTodo.completed;

      updateProgress();
    } catch (error) {
      console.error("Todo를 수정하는 중 오류 발생:", error);

      // 실패했다면 기존 상태로 되돌림
      checkbox.checked = !newCompleted;

      updateProgress();
    } finally {
      checkbox.disabled = false;
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

    const todos = await response.json();

    console.log("서버에서 가져온 Todo:", todos);

    // 기존에 화면에 있던 Todo 제거
    todoBox.innerHTML = "";

    // 서버에서 가져온 Todo를 하나씩 화면에 출력
    todos.forEach((todo) => {
      renderTodo(todo);
    });

    // 서버 데이터 출력 후 진행률 계산
    updateProgress();
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

// 아직은 화면에만 Todo를 추가하는 코드
// 다음 단계에서 POST /todos와 연결할 예정
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

    // 서버에서 받은 Todo를 화면에 출력
    renderTodo(newTodo);

    // 입력창 비우기
    newTaskInput.value = "";

    // 진행률 다시 계산
    updateProgress();
  } catch (error) {
    console.error("Todo를 추가하는 중 오류 발생:", error);
  }
});

// 페이지가 열릴 때 서버 Todo 불러오기
loadTodos();