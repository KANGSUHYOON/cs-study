const db = require("../db");
const {
    isValidDateString,
    normalizeScheduledDate,
} = require("../utils/dateUtils");

const TODO_SELECT_FIELDS = `
    id,
    title,
    completed,
    DATE_FORMAT(scheduled_date, '%Y-%m-%d') AS scheduled_date,
    DATE_FORMAT(completed_at, '%Y-%m-%dT%H:%i:%sZ') AS completed_at,
    created_at
`;

function formatTodo(row) {
    return {
        ...row,
        completed: Boolean(row.completed),
    };
}

// 전체 Todo 목록 조회
async function getTodos(req, res) {
    const { date } = req.query;

    if (date !== undefined && !isValidDateString(date)) {
        return res.status(400).json({
            message: "date는 YYYY-MM-DD 형식의 유효한 날짜여야 합니다.",
        });
    }

    try {
        let sql = `
            SELECT ${TODO_SELECT_FIELDS}
            FROM todos
        `;
        const params = [];

        if (date !== undefined) {
            sql += " WHERE scheduled_date = ?";
            params.push(date);
        }

        sql += " ORDER BY id ASC";

        const [rows] = await db.execute(sql, params);

        const todos = rows.map(formatTodo);

        res.status(200).json(todos);
    } catch (error) {
        console.error("Todo 조회 중 DB 오류:", error);

        res.status(500).json({
            message: "Todo 목록을 불러오지 못했습니다.",
        });
    }
}

// 새로운 Todo 추가
async function createTodo(req, res) {
    const body = req.body || {};
    const { title } = body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "title을 입력해주세요.",
        });
    }

    const hasScheduledDate = Object.prototype.hasOwnProperty.call(
        body,
        "scheduledDate"
    );
    const scheduledDateResult = normalizeScheduledDate(
        hasScheduledDate ? body.scheduledDate : null
    );

    if (!scheduledDateResult.isValid) {
        return res.status(400).json({
            message:
                "scheduledDate는 YYYY-MM-DD 형식의 유효한 날짜여야 합니다.",
        });
    }

    try {
        const [result] = await db.execute(
            `
            INSERT INTO todos (title, completed, scheduled_date)
            VALUES (?, ?, ?)
            `,
            [title.trim(), false, scheduledDateResult.value]
        );

        const [rows] = await db.execute(
            `
            SELECT ${TODO_SELECT_FIELDS}
            FROM todos
            WHERE id = ?
            `,
            [result.insertId]
        );

        const newTodo = formatTodo(rows[0]);

        res.status(201).json(newTodo);
    } catch (error) {
        console.error("Todo 추가 중 DB 오류:", error);

        res.status(500).json({
            message: "Todo 추가 중 서버 오류가 발생했습니다.",
        });
    }
}

// Todo 완료 상태 수정
async function updateTodoCompleted(req, res) {
    const todoId = Number(req.params.id);
    const { completed } = req.body || {};

    if (!Number.isInteger(todoId) || todoId <= 0) {
        return res.status(400).json({
            message: "올바른 Todo ID를 입력해주세요.",
        });
    }

    if (typeof completed !== "boolean") {
        return res.status(400).json({
        message: "completed 값은 true 또는 false여야 합니다.",
        });
    }

    try {
        const [result] = await db.execute(
        `
        UPDATE todos
        SET
            completed = ?,
            completed_at = CASE
                WHEN ? = TRUE THEN UTC_TIMESTAMP()
                ELSE NULL
            END
        WHERE id = ?
        `,
        [completed, completed, todoId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "해당 Todo를 찾을 수 없습니다.",
        });
    }

    const [rows] = await db.execute(
        `
        SELECT ${TODO_SELECT_FIELDS}
        FROM todos
        WHERE id = ?
        `,
        [todoId]
    );

    const updatedTodo = formatTodo(rows[0]);

    res.status(200).json(updatedTodo);
    } catch (error) {
        console.error("Todo 수정 중 DB 오류:", error);

        res.status(500).json({
        message: "Todo 수정 중 서버 오류가 발생했습니다.",
        });
    }
}

// Todo 제목 수정
async function updateTodoTitle(req, res) {
    const todoId = Number(req.params.id);
    const { title } = req.body || {};

    // URL로 받은 ID가 올바른 숫자인지 검사
    if (!Number.isInteger(todoId) || todoId <= 0) {
        return res.status(400).json({
            message: "올바른 Todo ID를 입력해주세요.",
        });
    }

    // title이 문자열인지, 빈 문자열은 아닌지 검사
    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "수정할 title을 입력해주세요.",
        });
    }

    try {
        // 해당 Todo의 제목 수정
        await db.execute(
            `
            UPDATE todos
            SET title = ?
            WHERE id = ?
            `,
            [title.trim(), todoId]
        );

        // 수정 결과 확인
        const [rows] = await db.execute(
            `
            SELECT ${TODO_SELECT_FIELDS}
            FROM todos
            WHERE id = ?
            `,
            [todoId]
        );

        // 존재하지 않는 Todo ID인 경우
        if (rows.length === 0) {
            return res.status(404).json({
                message: "해당 Todo를 찾을 수 없습니다.",
            });
        }

        const updatedTodo = formatTodo(rows[0]);

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error("Todo 제목 수정 중 DB 오류:", error);

        res.status(500).json({
            message: "Todo 제목 수정 중 서버 오류가 발생했습니다.",
        });
    }
}

// Todo 예정 날짜 수정
async function updateTodoDate(req, res) {
    const todoId = Number(req.params.id);

    if (!Number.isInteger(todoId) || todoId <= 0) {
        return res.status(400).json({
            message: "올바른 Todo ID를 입력해주세요.",
        });
    }

    const scheduledDateResult = normalizeScheduledDate(
        req.body?.scheduledDate
    );

    if (!scheduledDateResult.isValid) {
        return res.status(400).json({
            message:
                "scheduledDate는 YYYY-MM-DD 형식의 유효한 날짜여야 합니다.",
        });
    }

    try {
        await db.execute(
            `
            UPDATE todos
            SET scheduled_date = ?
            WHERE id = ?
            `,
            [scheduledDateResult.value, todoId]
        );

        const [rows] = await db.execute(
            `
            SELECT ${TODO_SELECT_FIELDS}
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

        res.status(200).json(formatTodo(rows[0]));
    } catch (error) {
        console.error("Todo 예정 날짜 수정 중 DB 오류:", error);

        res.status(500).json({
            message: "Todo 예정 날짜 수정 중 서버 오류가 발생했습니다.",
        });
    }
}

// 특정 Todo 삭제
async function deleteTodo(req, res) {
    const todoId = Number(req.params.id);

    if (!Number.isInteger(todoId) || todoId <= 0) {
        return res.status(400).json({
            message: "올바른 Todo ID를 입력해주세요.",
        });
    }

    try {
    const [rows] = await db.execute(
        `
        SELECT ${TODO_SELECT_FIELDS}
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

    await db.execute(
        `
        DELETE FROM todos
        WHERE id = ?
        `,
        [todoId]
    );

    const deletedTodo = formatTodo(rows[0]);

    res.status(200).json(deletedTodo);
    } catch (error) {
    console.error("Todo 삭제 중 DB 오류:", error);

    res.status(500).json({
        message: "Todo 삭제 중 서버 오류가 발생했습니다.",
        });
    }
}

module.exports = {
    getTodos,
    createTodo,
    updateTodoCompleted,
    updateTodoTitle,
    updateTodoDate,
    deleteTodo,
};
