// server.js
require("dotenv").config(); 
const express = require("express");
const { WebSocketServer } = require("ws");
const { connectMongo } = require("./db/mongo");
const socketHandler = require("./sockets/socket");
const routes = require("./routes/routes"); 
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const PORT = process.env.PORT || 3000; 
const socketServer = new WebSocketServer({ port: process.env.WS_PORT || 3001 }); // WS_PORT 3001

// Middleware CORS 
app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Connect to MongoDB
connectMongo();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files 
app.use(express.static("public"));

// Folder uploads untuk file gambar yang diupload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", uploadRoutes);

// Use the consolidated routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Set up WebSocket server
socketHandler(socketServer);
