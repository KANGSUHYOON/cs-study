const path = require("path");
const dotenv = require("dotenv");

// db.js와 같은 폴더의 .env 파일을 명시적으로 불러옴
const envResult = dotenv.config({
    path: path.join(__dirname, ".env"),
});

// .env 파일 자체를 찾지 못한 경우
if (envResult.error) {
    throw new Error(`.env 파일 로드 실패: ${envResult.error.message}`);
}

// 필요한 환경변수가 빠졌는지 확인
const requiredEnv = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
    throw new Error(
    `.env 환경변수가 누락되었습니다: ${missingEnv.join(", ")}`
    );
}

const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db;    