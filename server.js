require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const subscriptionRoutes = require("./routes/subscription");
const contentRoutes = require("./routes/content");

const app = express();

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Secure Authentication API is running"
  });
});

app.use("/", authRoutes);
app.use("/", subscriptionRoutes);
app.use("/content", contentRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});