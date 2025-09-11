# Express Server - Q&A API

A RESTful API for managing questions and answers, built with Express.js and PostgreSQL.

## Features

- ✅ Create, read, update, and delete questions
- ✅ Create and read answers for questions
- ✅ Search questions by title or category
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Answer length validation (≤ 300 characters)
- ✅ Cascade delete (answers are deleted when question is deleted)
- ✅ Consistent response format
- ✅ Simple Swagger API documentation

## API Endpoints

### Questions

#### Create a Question
```http
POST /questions
Content-Type: application/json

{
  "title": "What is Express.js?",
  "description": "I want to learn about Express.js framework for Node.js",
  "category": "Software"
}
```

**Response:**
```json
{
  "message": "Question created successfully.",
  "data": {
    "id": 1,
    "title": "What is Express.js?",
    "description": "I want to learn about Express.js framework for Node.js",
    "category": "Software",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get All Questions
```http
GET /questions
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "What is Express.js?",
      "description": "I want to learn about Express.js framework for Node.js",
      "category": "Software",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Search Questions
```http
GET /questions/search?title=express&category=software
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "What is Express.js?",
      "description": "I want to learn about Express.js framework for Node.js",
      "category": "Software",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Question by ID
```http
GET /questions/1
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "What is Express.js?",
    "description": "I want to learn about Express.js framework for Node.js",
    "category": "Software",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Question
```http
PUT /questions/1
Content-Type: application/json

{
  "title": "What is Express.js framework?",
  "description": "I want to learn about Express.js framework for Node.js development"
}
```

**Response:**
```json
{
  "message": "Question updated successfully.",
  "data": {
    "id": 1,
    "title": "What is Express.js framework?",
    "description": "I want to learn about Express.js framework for Node.js development",
    "category": "Software",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

#### Delete Question
```http
DELETE /questions/1
```

**Response:**
```json
{
  "message": "Question and all its answers have been deleted successfully."
}
```

### Answers

#### Create an Answer
```http
POST /questions/1/answers
Content-Type: application/json

{
  "content": "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications."
}
```

**Response:**
```json
{
  "message": "Answer created successfully.",
  "data": {
    "id": 1,
    "content": "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.",
    "question_id": 1,
    "created_at": "2024-01-15T10:35:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Get Answers for a Question
```http
GET /questions/1/answers
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "content": "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.",
      "created_at": "2024-01-15T10:35:00.000Z",
      "updated_at": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

#### Delete All Answers for a Question
```http
DELETE /questions/1/answers
```

**Response:**
```json
{
  "message": "All answers for the question have been deleted successfully."
}
```

## Database Schema

### Questions Table
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Answers Table
```sql
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  content VARCHAR(300) NOT NULL,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request data."
}
```

### 404 Not Found
```json
{
  "message": "Question not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Unable to create question."
}
```

## Validation Rules

- **Questions**: title, description, and category are required
- **Answers**: content is required and must not exceed 300 characters
- **Updates**: Only title and description can be updated (category cannot be changed)
- **Search**: At least one search parameter (title or category) is required

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database with the schema above

3. Update database connection in `utils/db.mjs`

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:4000`

## API Documentation

Simple Swagger documentation available at: `http://localhost:4000/api-docs`

## Testing the API

You can test the API using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example curl commands:

```bash
# Create a question
curl -X POST http://localhost:4000/questions \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Question","description":"Test Description","category":"Test"}'

# Get all questions
curl http://localhost:4000/questions

# Search questions
curl "http://localhost:4000/questions/search?title=test"

# Create an answer
curl -X POST http://localhost:4000/questions/1/answers \
  -H "Content-Type: application/json" \
  -d '{"content":"This is a test answer"}'
```