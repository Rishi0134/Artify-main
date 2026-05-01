# Artify-Virtual_Art_Gallery
Artify,Virtual Art Gallery – MERN stack with DevOps
Artify – Virtual Art Gallery
📌 Project Overview
Artify is a full-stack MERN application that allows artists to upload and manage artworks, and customers to browse and place orders.

The backend provides:
User authentication (JWT based)
Role-based access control (Admin / Artist / Customer)
Artwork CRUD operations
Image upload handling (local storage for now)
Order management system
Input validation & error handling
Pagination & search support
This project is built with production-level backend architecture practices.

🛠 Tech Stack
Backend
Node.js
Express.js
MongoDB (MongoDB Atlas)
Mongoose
JWT Authentication
Express Validator
Multer (File Upload)
Morgan (Logging)
CORS
dotenv
Dev Tools
Nodemon
Git & GitHub

📂 Project Structure
backend/
 ├── src/
 │    ├── models/
 │    ├── routes/
 │    ├── middleware/
 │    ├── utils/
 │    ├── app.js
 │    └── server.js
 ├── uploads/
 ├── .env (not committed)
 └── package.json

⚙️ How To Run Backend Locally
1️⃣ Clone the repository
git clone https://github.com/Rishi0134/Artify-main.git
cd Artify-Virtual_Art_Gallery/backend

2️⃣ Install dependencies
npm install

3️⃣ Create .env file inside backend folder
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key

4️⃣ Start development server
npm run dev
Server will start at:
http://localhost:5000

🌐 API Base URL
http://localhost:5000/api

Example Endpoints
POST /api/auth/register
POST /api/auth/login
GET /api/artworks
POST /api/artworks (Artist only)
PUT /api/artworks/:id
DELETE /api/artworks/:id
POST /api/orders
GET /api/orders/my-orders

🔐 Authentication
This backend uses JWT-based authentication.
To access protected routes:
Login via /api/auth/login
Copy the returned token
Send it as:
Authorization: Bearer <your_token>
🚀 Future Improvements
AWS S3 image storage
Payment gateway integration
Admin dashboard
Deployment with Docker + CI/CD




