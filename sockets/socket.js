const { getDb } = require("../db/mongo");

function socketHandler(socketServer) {
  socketServer.on("connection", (ws) => {
    console.log("New client connected.");

    ws.on("close", () => console.log("Client disconnected."));
    ws.on("error", (error) => console.error("WebSocket error:", error));

    async function getSales() {
      try {
        const db = getDb();
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
        const db = getDb();

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
}

module.exports = socketHandler;
