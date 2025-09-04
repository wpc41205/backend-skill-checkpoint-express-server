# Express Server - Question & Answer API

A RESTful API server built with Express.js and PostgreSQL for managing questions and answers, similar to Quora.

## 🚀 Features

- **Question Management**: Create, read, update, and delete questions
- **Answer System**: Add answers to questions with content validation
- **Category Support**: Organize questions by categories (Software, Food, Travel, Science, etc.)
- **Search Functionality**: Search questions by title or category
- **PostgreSQL Database**: Robust data persistence with connection pooling
- **RESTful API**: Clean and intuitive API endpoints

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Database Driver**: `pg` (node-postgres)
- **Development**: Nodemon for auto-restart
- **Language**: ES6+ (ES Modules)

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- PostgreSQL database server
- npm or yarn package manager

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-skill-checkpoint-express-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a PostgreSQL database named `Quora Mock`
   - Update the database connection string in `utils/db.mjs`:
     ```javascript
     const connectionPool = new Pool({
       connectionString: "postgresql://username:password@localhost:5432/Quora Mock",
     });
     ```

4. **Create Database Tables**
   ```sql
   -- Questions table
   CREATE TABLE questions (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT NOT NULL,
     category VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Answers table
   CREATE TABLE answers (
     id SERIAL PRIMARY KEY,
     content VARCHAR(300) NOT NULL,
     question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The server will start running on `http://localhost:4000`

## 📚 API Endpoints

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/questions` | Create a new question |
| `GET` | `/questions` | Get all questions |
| `GET` | `/questions/:questionId` | Get a specific question by ID |
| `PUT` | `/questions/:questionId` | Update a question |
| `DELETE` | `/questions/:questionId` | Delete a question |
| `GET` | `/questions/search` | Search questions by title or category |

### Answers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/questions/:questionId/answers` | Add an answer to a question |
| `GET` | `/questions/:questionId/answers` | Get all answers for a question |
| `DELETE` | `/questions/:questionId/answers` | Delete all answers for a question |

### Test Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/test` | Test if the server is running |

## 📝 API Usage Examples

### Create a Question
```bash
curl -X POST http://localhost:4000/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What is Express.js?",
    "description": "I want to learn about Express.js framework for Node.js",
    "category": "Software"
  }'
```

### Get All Questions
```bash
curl http://localhost:4000/questions
```

### Search Questions
```bash
curl "http://localhost:4000/questions/search?category=Software&title=Express"
```

### Add an Answer
```bash
curl -X POST http://localhost:4000/questions/1/answers \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications."
  }'
```

## 🔧 Configuration

### Environment Variables
You can configure the following:

- **Port**: Default is 4000 (change in `app.mjs`)
- **Database**: Update connection string in `utils/db.mjs`

### Database Connection
The application uses a connection pool for better performance and reliability. The pool configuration can be customized in `utils/db.mjs`.

## 📁 Project Structure

```
backend-skill-checkpoint-express-server/
├── app.mjs                 # Main application file
├── package.json            # Project dependencies and scripts
├── README.md              # This file
└── utils/
    └── db.mjs            # Database connection configuration
```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```
This uses nodemon for automatic server restart on file changes.

### Production Mode
```bash
node app.mjs
```

## 🧪 Testing

Test the API endpoints using tools like:
- Postman
- cURL
- Insomnia
- Thunder Client (VS Code extension)

## 📊 Database Schema

### Questions Table
- `id`: Primary key (auto-increment)
- `title`: Question title (VARCHAR)
- `description`: Question description (TEXT)
- `category`: Question category (VARCHAR)
- `created_at`: Timestamp of creation

### Answers Table
- `id`: Primary key (auto-increment)
- `content`: Answer content (VARCHAR, max 300 chars)
- `question_id`: Foreign key to questions table
- `created_at`: Timestamp of creation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Happy Coding! 🎉**
