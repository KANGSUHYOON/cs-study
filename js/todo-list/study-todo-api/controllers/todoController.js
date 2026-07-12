const db = require("../db");

// 전체 Todo 목록 조회
async function getTodos(req, res) {
    try {
        const [rows] = await db.execute(`
            SELECT id, title, completed, created_at
            FROM todos
            ORDER BY id ASC
        `);

    const todos = rows.map((row) => ({
        ...row,
        completed: Boolean(row.completed),
    }));

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
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
        message: "title을 입력해주세요.",
        });
    }

    try {
    const [result] = await db.execute(
        `
        INSERT INTO todos (title, completed)
        VALUES (?, ?)
        `,
        [title.trim(), false]
    );

    const [rows] = await db.execute(
        `
        SELECT id, title, completed, created_at
        FROM todos
        WHERE id = ?
        `,
        [result.insertId]
    );

    const newTodo = {
        ...rows[0],
        completed: Boolean(rows[0].completed),
    };

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
    const { completed } = req.body;

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
        SET completed = ?
        WHERE id = ?
        `,
        [completed, todoId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "해당 Todo를 찾을 수 없습니다.",
        });
    }

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
}

// Todo 제목 수정
async function updateTodoTitle(req, res) {
    const todoId = Number(req.params.id);
    const { title } = req.body;

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
            SELECT id, title, completed, created_at
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

        const updatedTodo = {
            ...rows[0],
            completed: Boolean(rows[0].completed),
        };

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error("Todo 제목 수정 중 DB 오류:", error);

        res.status(500).json({
            message: "Todo 제목 수정 중 서버 오류가 발생했습니다.",
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
}

module.exports = {
    getTodos,
    createTodo,
    updateTodoCompleted,
    updateTodoTitle,
    deleteTodo,
};