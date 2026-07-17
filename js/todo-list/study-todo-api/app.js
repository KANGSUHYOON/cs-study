const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const todoRoutes = require("./routes/todoRoutes");
const calendarRoutes = require("./routes/calendarRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API 라우터 연결
app.use("/todos", todoRoutes);
app.use("/calendar", calendarRoutes);

app.get("/", (req, res) => {
  res.send("공부 TODO 서버가 정상적으로 실행 중입니다!");
});

// public 폴더의 프론트엔드 정적 파일 제공
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// MySQL 연결을 확인한 후 서버 실행
async function startServer() {
  try {
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
