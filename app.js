const express = require("express");
const { WebSocketServer } = require("ws");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;
const socketServer = new WebSocketServer({ port: 3001 });

// const url =
//   "";
const client = new MongoClient(url);

// Connect MongoDB client once at the start
let db;
async function connectMongo() {
  try {
    await client.connect();
    db = client.db("test");
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
connectMongo();

app.get("/chart", (req, res) => {
  res.sendFile("chart.html", { root: __dirname });
});

app.get("/form", (req, res) => {
  res.sendFile("form.html", { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

socketServer.on("connection", (ws) => {
  console.log("New client connected.");

  ws.on("close", () => console.log("Client disconnected."));
  ws.on("error", (error) => console.error("WebSocket error:", error));

  async function getSales() {
    try {
      const data = await db
        .collection("uploads")
        .find({}, { projection: { tanggalUpload: 1, volumeBatu: 1, _id: 0 } })
        .limit(10)
        .toArray();
      socketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  }

  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, tanggalUpload, volumeBatu, jumlahBatu, namaFile } =
        parsedMessage;

      switch (type) {
        case "load":
          await getSales();
          break;

        case "add":
          await db
            .collection("uploads")
            .insertOne({ tanggalUpload, volumeBatu, jumlahBatu, namaFile });
          await getSales();
          break;

        case "edit":
          await db
            .collection("uploads")
            .updateOne({ tanggalUpload }, { $set: { volumeBatu } });
          await getSales();
          break;

        default:
          console.error("Unknown message type:", type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
});
