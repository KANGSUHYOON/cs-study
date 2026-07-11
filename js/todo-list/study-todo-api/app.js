/*설치한 EXPRESS 라이브러리를 현재 파일에서 사용할 수 있게 불러오는 코드*/
const express = require("express");
const cors = require("cors")
const db = require("./db"); //db.js에서 내보낸 db 연결 풀을 불러옴

const app = express(); //Express  기반 서버 애플리케이션을 생성
const PORT = 3000; //서버가 사용할 포트 번호를 지정

//프론트엔드에서 백엔드 API를 호출할 수 있도록 허용
app.use(cors()) //다른 주소에서 실행 중인 웹페이지가 우리 서버에 요청하는 것을 허용하겠다 라는 의미

/*클라이언트가 보낸 JSON 데이터를 req.body로 읽게 해줌*/
app.use(express.json());

/*클라이언트가 /주소로 GET 요청을 보내면 문자열을 응답*/
app.get("/", (req, res) => {
  res.send("공부 TODO 서버가 정상적으로 실행 중입니다!");
});

// MySQL에서 전체 Todo 목록 조회
app.get("/todos", async (req, res) => {
  try {
    /* mysql에 sql을 보내고 결과를 기다린다 */
    const [rows] = await db.query(`             
      SELECT id, title, completed, created_at
      FROM todos
      ORDER BY id ASC
    `);

    // completed 값을 true 또는 false로 변환
    const formattedTodos = rows.map((row) => ({
      ...row,
      completed: Boolean(row.completed),
    }));

    res.status(200).json(formattedTodos);
  } catch (error) {
    console.error("Todo 조회 중 DB 오류:", error);

    res.status(500).json({
      message: "Todo 목록을 불러오지 못했습니다.",
    });
  }
});

// 새로운 TODO 추가
app.post("/todos", async (req, res) => {
  const { title } = req.body;

  // title이 없거나 공백만 입력된 경우
  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "title을 입력해주세요.",
    });
  }

  try {
    // MySQL todos 테이블에 새로운 TODO 저장
    const [result] = await db.execute(
      `
      INSERT INTO todos (title, completed)
      VALUES (?, ?)
      `,
      [title.trim(), false]
    );

    // 프론트엔드에 돌려줄 새로운 TODO 객체
    const newTodo = {
      id: result.insertId,
      title: title.trim(),
      completed: false,
    };

    res.status(201).json(newTodo);
  } catch (error) {
    console.error("TODO 추가 실패:", error);

    res.status(500).json({
      message: "TODO 추가 중 서버 오류가 발생했습니다.",
    });
  }
});

// 특정 Todo의 완료 상태를 수정하는 API
app.patch("/todos/:id", async (req, res) => {
  const todoId = Number(req.params.id);
  const { completed } = req.body;

  // ID 유효성 검사
  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({
      message: "올바른 Todo ID를 입력해주세요.",
    });
  }

  // completed 유효성 검사
  if (typeof completed !== "boolean") {
    return res.status(400).json({
      message: "completed 값은 true 또는 false여야 합니다.",
    });
  }

  try {
    // MySQL에서 완료 상태 수정
    const [result] = await db.execute(
      `
      UPDATE todos
      SET completed = ?
      WHERE id = ?
      `,
      [completed, todoId]
    );

    // 해당 ID의 Todo가 없는 경우
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "해당 Todo를 찾을 수 없습니다.",
      });
    }

    // 수정된 Todo 다시 조회
    const [rows] = await db.execute(
      `
      SELECT id, title, completed, created_at
      FROM todos
      WHERE id = ?
      `,
      [todoId]
    );

    const updatedTodo = {
      ...rows[0],
      completed: Boolean(rows[0].completed),
    };

    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error("Todo 수정 중 DB 오류:", error);

    res.status(500).json({
      message: "Todo 수정 중 서버 오류가 발생했습니다.",
    });
  }
});

// 특정 Todo 삭제
app.delete("/todos/:id", async (req, res) => {
  const todoId = Number(req.params.id);

  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({
      message: "올바른 Todo ID를 입력해주세요.",
    });
  }

  try {
    // 삭제 전에 해당 Todo 조회
    const [rows] = await db.execute(
      `
      SELECT id, title, completed, created_at
      FROM todos
      WHERE id = ?
      `,
      [todoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "해당 Todo를 찾을 수 없습니다.",
      });
    }

    // MySQL에서 Todo 삭제
    await db.execute(
      `
      DELETE FROM todos
      WHERE id = ?
      `,
      [todoId]
    );

    const deletedTodo = {
      ...rows[0],
      completed: Boolean(rows[0].completed),
    };

    res.status(200).json(deletedTodo);
  } catch (error) {
    console.error("Todo 삭제 중 DB 오류:", error);

    res.status(500).json({
      message: "Todo 삭제 중 서버 오류가 발생했습니다.",
    });
  }
});


// MySQL 연결을 확인한 후 서버 실행
async function startServer() {
  try {
    // 간단한 SQL을 실행하여 DB 연결 확인
    await db.query("SELECT 1");

    console.log("MySQL 연결 성공");

    app.listen(PORT, () => {
      console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MySQL 연결 실패:", error.message);
  }
}

startServer();