const express = require("express");
const cors = require("cors");
const db = require("./db");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Todo API 라우터 연결
app.use("/todos", todoRoutes);

app.get("/", (req, res) => {
  res.send("공부 TODO 서버가 정상적으로 실행 중입니다!");
});

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