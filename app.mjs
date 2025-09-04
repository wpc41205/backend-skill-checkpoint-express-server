import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});


// ผู้ใช้งานสามารถสร้างคำถามได้
// - คำถามจะมีหัวข้อ และคำอธิบาย
// - คำถามจะมีหมวดหมู่กำกับ เช่น Software, Food, Travel, Science, Etc.
app.post("/questions", async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  try {
    const query = `
      INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, category;
    `;
    const values = [title, description, category];
    const result = await connectionPool.query(query, values);

    return res.status(201).json({
      message: "Question created successfully.",
      data: result.rows[0], 
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({
      message: "Unable to create question.",
    });
  }
});

// ผู้ใช้งานสามารถที่จะดูคำถามทั้งหมดได้
app.get("/questions", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM questions");

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No questions found.",
      });
    }

    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

// ผู้ใช้งานสามารถที่จะค้นหาคำถามจากหัวข้อ หรือหมวดหมู่ได้
app.get("/questions/search", async (req, res) => {
  const { title, category } = req.query;

  if (!title && !category) {
    return res.status(400).json({
      message: "Invalid search parameters."
    });
  }

  try {
    let query = "SELECT * FROM questions WHERE 1=1";
    let values = [];
    let paramCount = 0;

    if (title) {
      paramCount++;
      query += ` AND title ILIKE $${paramCount}`;
      values.push(`%${title}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category ILIKE $${paramCount}`;
      values.push(`%${category}%`);
    }

    const result = await connectionPool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No questions found matching your search criteria."
      });
    }

    return res.status(200).json({
      data: result.rows
    });
  } catch (error) {
    console.error("Error searching questions:", error);
    return res.status(500).json({
      message: "Unable to search questions."
    });
  }
});

// ผู้ใช้งานสามารถที่จะดูคำถามแต่ละอันได้ ด้วย Id ของคำถามได้
app.get("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;

  if (isNaN(questionId)) {
    return res.status(400).json({
      message: "Invalid question ID.",
    });
  }

  try {
    const result = await connectionPool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    return res.status(500).json({
      message: "Unable to fetch question.",
    });
  }
});

// ผู้ใช้งานสามารถที่จะแก้ไขหัวข้อ หรือคำอธิบายของคำถามได้
app.put("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  if (isNaN(questionId)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const check = await connectionPool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      "UPDATE questions SET title = $1, description = $2, category = $3 WHERE id = $4",
      [title, description, category, questionId]
    );

    return res.status(200).json({ message: "Question updated successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

// ผู้ใช้งานสามารถที่จะลบคำถามได้
app.delete("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;

  if (isNaN(questionId)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const check = await connectionPool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      "DELETE FROM questions WHERE id = $1",
      [questionId]
    );

    return res.status(200).json({ message: "Question post has been deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

// ผู้ใช้งานสามารถสร้างคำตอบของคำถามนั้นได้
//  - คำตอบจะเป็นข้อความยาวๆ ไม่เกิน 300 ตัวอักษร
app.post("/questions/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  if (isNaN(questionId)) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  try {
    const checkQuestion = await connectionPool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId]
    );

    if (checkQuestion.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const query = `
      INSERT INTO answers (content, question_id)
      VALUES ($1, $2)
      RETURNING id, content, question_id;
    `;
    const values = [content, questionId];
    const result = await connectionPool.query(query, values);

    return res.status(201).json({
      message: "Answer created successfully.",
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return res.status(500).json({
      message: "Unable to create answers.",
    });
  }
});

// ผู้ใช้งานสามารถที่จะดูคำตอบของคำถามแต่ละอันได้
app.get("/questions/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;

  if (isNaN(questionId)) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  try {
    const checkQuestion = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1",
      [questionId]
    );

    if (checkQuestion.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const answersResult = await connectionPool.query(
      "SELECT id, content FROM answers WHERE question_id = $1",
      [questionId]
    );

    return res.status(200).json({
      data: answersResult.rows,
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return res.status(500).json({
      message: "Unable to fetch answers.",
    });
  }
});

// ผู้ใช้งานสามารถที่จะลบคำถามได้
//  - เมื่อลบคำถามออก คำตอบก็จะถูกลบตามคำถามนั้นๆ ไปด้วย
app.delete("/questions/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;

  if (isNaN(questionId)) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  try {
    const checkQuestion = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1",
      [questionId]
    );

    if (checkQuestion.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    await connectionPool.query(
      "DELETE FROM answers WHERE question_id = $1",
      [questionId]
    );

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting answers:", error);
    return res.status(500).json({
      message: "Unable to delete answers.",
    });
  }
});

app.listen(port, async () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

export default app;