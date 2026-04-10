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
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

