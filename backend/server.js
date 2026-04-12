require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentPortfolio";

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Student Portfolio Management System API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      login: "/api/auth/login",
      register: "/api/auth/register",
      students: "/api/auth/students"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

