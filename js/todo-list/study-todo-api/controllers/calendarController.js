const db = require("../db");
const { getCalendarMonthRange } = require("../utils/dateUtils");

async function getCalendarSummary(req, res) {
  const dateRange = getCalendarMonthRange(req.query.year, req.query.month);

  if (!dateRange) {
    return res.status(400).json({
      message:
        "year는 1000~9998의 정수이고 month는 1~12의 정수여야 합니다.",
    });
  }

  try {
    const [rows] = await db.execute(
      `
        SELECT
          DATE_FORMAT(scheduled_date, '%Y-%m-%d') AS date,
          COUNT(*) AS total,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS pending
        FROM todos
        WHERE scheduled_date >= ?
          AND scheduled_date < ?
        GROUP BY scheduled_date
        ORDER BY scheduled_date ASC
      `,
      [dateRange.startDate, dateRange.endDate]
    );

    const summary = rows.map((row) => ({
      date: row.date,
      total: Number(row.total),
      completed: Number(row.completed),
      pending: Number(row.pending),
    }));

    res.status(200).json(summary);
  } catch (error) {
    console.error("월별 캘린더 집계 조회 중 DB 오류:", error);

    res.status(500).json({
      message: "월별 캘린더 집계를 불러오지 못했습니다.",
    });
  }
}

module.exports = {
  getCalendarSummary,
};
