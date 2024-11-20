# Scottish-Ashna-Ashri-Foundation

This project serves as the backend and admin panel for the Scottish Ashna Ashri Foundation, facilitating donation management, notifications, and administrative controls. Built with TypeScript for scalability and maintainability, the backend is powered by Express and MongoDB, while the admin panel uses React.

---

## 🚀 Features

- **Backend**:
  - Donation handling with Stripe (supports card, Google Pay, and Apple Pay).
  - Notifications for events and updates.
  - Authentication and role-based access control.

- **Admin Panel**:
  - Dashboard for managing donations and notifications.
  - Secure login system.
  - User-friendly UI built with React and TypeScript.

---

## 🛠️ Tech Stack

### Backend:
- **Node.js** with **Express** (REST API)
- **TypeScript**
- **MongoDB** (database)
- **Stripe** (donation payments)
- **Dotenv** (environment variables)

### Admin Panel:
- **React** (frontend framework)
- **TypeScript**
- **Tailwind CSS** (styling)

---

## 📂 Project Structure

### Backend
```
backend/ ├── src
         │ ├── config/ # Configuration files (e.g., database, Stripe) 
         │ ├── controllers/ # Business logic 
         │ ├── routes/ # API routes 
         │ ├── models/ # MongoDB schemas 
         │ ├── middlewares/ # Middleware functions 
         │ ├── app.ts # Express app setup 
         │ └── server.ts # Server entry point 
         ├── dist/ # Compiled JavaScript 
         ├── tsconfig.json # TypeScript configuration 
         └── .env # Environment variables
```
### Admin Panel
```
admin-panel/ ├── src/ 
             │ ├── components/ # Reusable UI components 
             │ ├── pages/ # Application pages 
             │ ├── services/ # API calls 
             │ ├── styles/ # Global and Tailwind CSS 
             │ └── App.tsx # Main app component 
             ├── public/ # Static files 
             ├── tsconfig.json # TypeScript configuration 
             └── .env # Environment variables
```
---

## 📦 Installation

### Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** (local or cloud)
- **npm** or **yarn**

#### Clone the repository:
```bash
  git clone https://github.com/your-repo/scottish-ashna-ashri-foundation.git
  cd scottish-ashna-ashri-foundation

  cd backend
  npm install
  cp .env.example .env # Add your environment variables
  npm run dev          # Starts the backend in watch mode

  cd admin-panel
  npm install
  cp .env.example .env # Add your environment variables
  npm start            # Starts the React admin panel
```

## ⚙️ Environment Variables
#### Create a .env file in the backend folder with the following variables:

PORT=3000\
MONGO_URI=<your-mongo-db-connection-string>\
STRIPE_SECRET_KEY=<your-stripe-secret-key>

#### For the admin-panel, add:

REACT_APP_API_URL=http://localhost:3000

## 🏗️ Scripts
### Backend Scripts:

```bash
  npm run dev   # Starts the backend in development mode.
  npm run build # Compiles TypeScript to JavaScript.
  npm start     # Runs the production build.
```
### Admin Panel Scripts:

```bash
  npm start # Starts the admin panel in development mode.
  npm build # Builds the React app for production.
```

### 🤝 Contributions
Contributions are welcome! Please follow these steps:

### Fork the repository.
Create a new branch (git checkout -b feature/your-feature).\
Commit your changes (git commit -m "Add your feature").\
Push to the branch (git push origin feature/your-feature).\
Open a pull request.

## 📜 License
This project is licensed under the MIT License.

## 📧 Contact
For inquiries, please contact [Your Name] at your-email@example.com.

### Notes:
1. Replace placeholder text (e.g., `your-repo`, `your-email@example.com`) with actual values.
2. Ensure the structure matches your actual folder setup.
3. If you want a `.env.example` file to guide environment variable setup, let me know!