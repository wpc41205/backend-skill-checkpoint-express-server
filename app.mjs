import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

// Simple Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Q&A API",
      version: "1.0.0",
      description: "Simple API for questions and answers",
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  apis: ["./app.mjs"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});


/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "What is Express.js?"
 *               description:
 *                 type: string
 *                 example: "I want to learn about Express.js"
 *               category:
 *                 type: string
 *                 example: "Software"
 *     responses:
 *       201:
 *         description: Question created
 */
app.post("/questions", async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  try {
    const query = `
      INSERT INTO questions (title, description, category, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, title, description, category, created_at, updated_at;
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

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: List of questions
 */
app.get("/questions", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM questions ORDER BY created_at DESC");

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

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         example: "express"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: "software"
 *     responses:
 *       200:
 *         description: Search results
 */
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

    query += " ORDER BY created_at DESC";
    const result = await connectionPool.query(query, values);

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

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Question updated
 */
app.put("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Invalid request data. Only title and description can be updated." });
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

    const updateResult = await connectionPool.query(
      "UPDATE questions SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING id, title, description, category, created_at, updated_at",
      [title, description, questionId]
    );

    return res.status(200).json({ 
      message: "Question updated successfully.",
      data: updateResult.rows[0]
    });
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

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

    // Delete answers first (cascade delete)
    await connectionPool.query(
      "DELETE FROM answers WHERE question_id = $1",
      [questionId]
    );
    
    // Then delete the question
    await connectionPool.query(
      "DELETE FROM questions WHERE id = $1",
      [questionId]
    );

    return res.status(200).json({ message: "Question and all its answers have been deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Create answer
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Express.js is a web framework for Node.js"
 *     responses:
 *       201:
 *         description: Answer created
 */
app.post("/questions/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  if (content.length > 300) {
    return res.status(400).json({
      message: "Answer content must not exceed 300 characters.",
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
      INSERT INTO answers (content, question_id, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, content, question_id, created_at, updated_at;
    `;
    const values = [content, questionId];
    const result = await connectionPool.query(query, values);

    return res.status(201).json({
      message: "Answer created successfully.",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return res.status(500).json({
      message: "Unable to create answers.",
    });
  }
});

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
      "SELECT id, content, created_at, updated_at FROM answers WHERE question_id = $1 ORDER BY created_at DESC",
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