
# Stone Analysis & Real-Time IoT Monitoring System

![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg) ![Express](https://img.shields.io/badge/Express-v4.x-lightgrey.svg) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg) ![Status](https://img.shields.io/badge/Status-Active-success.svg)

A high-performance backend system designed for **IoT and Computer Vision** workflows. This service acts as a central orchestrator that handles image ingestion, communicates with an AI Inference Engine for object analysis (volume & quantity), persists telemetry data, and broadcasts real-time statistics to monitoring dashboards via WebSockets.

## 📋 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [WebSocket Protocol](#-websocket-protocol)
- [Installation & Setup](#-installation--setup)

## 🚀 Key Features

* **Middleware Gateway Pattern**: Seamlessly integrates with external AI/ML services (Python/Flask) to offload heavy image processing.
* **Real-Time Event Streaming**: Implements a native WebSocket server to push updates instantly to clients, eliminating the need for polling.
* **Robust Data Ingestion**: Handles multipart image uploads with strict validation (MIME type & size limits) using Multer.
* **NoSQL Persistence**: Utilizes MongoDB for flexible storage of telemetry data and historical analysis.
* **MVC Architecture**: Clean separation of concerns between Models, Views (Visualization), and Controllers.

## 📐 System Architecture

The system operates on a unidirectional data flow optimized for speed and reliability:

1.  **Ingest**: Client/IoT Device uploads an image via REST API (`POST /api/upload`).
2.  **Processing**:
    * Server validates the asset.
    * Asset is forwarded to the AI Engine (e.g., running on port `5000`).
    * AI returns analytical metadata (volume, count).
3.  **Persistence**: Results are stored in MongoDB via Mongoose.
4.  **Broadcast**: The WebSocket server triggers an event, pushing the new dataset to all connected dashboard clients.
5.  **Visualization**: Frontend dashboards render the data into Line/Bar charts.

## 🛠️ Tech Stack

**Backend Core:**
* **Runtime**: [Node.js](https://nodejs.org/)
* **Framework**: [Express.js](https://expressjs.com/)
* **Database**: [MongoDB](https://www.mongodb.com/) (Drivers: Mongoose & Native MongoDB)
* **Real-Time**: [ws](https://www.npmjs.com/package/ws) (Native WebSocket implementation)
* **File Management**: Multer & fs
* **HTTP Client**: Axios

**Visualization Layer (Frontend):**
* **Core**: HTML5, Bootstrap 5
* **Charting**: Chart.js

## 📂 Project Structure

```bash
├── controllers/
│   └── uploadController.js  # Orchestrates AI communication & DB storage
├── db/
│   └── mongo.js             # Native MongoDB connection setup
├── middleware/
│   └── uploadMiddleware.js  # Multer config, file validation & limits
├── models/
│   └── uploadModel.js       # Mongoose Schema definition
├── routes/
│   ├── routes.js            # View routing (HTML serving)
│   └── uploadRoutes.js      # REST API endpoints
├── sockets/
│   └── socket.js            # WebSocket event handlers & broadcasting logic
├── public/                  # Static assets & client-side scripts
├── uploads/                 # Temporary storage for processed images
└── server.js                # Application Entry Point (HTTP & WS Server)
````

## 🔌 API Documentation

### 1\. Upload & Analyze Image

This is the primary ingestion endpoint. It accepts an image, processes it via the AI engine, and returns the analysis.

  * **URL**: `/api/upload`
  * **Method**: `POST`
  * **Content-Type**: `multipart/form-data`

#### Request Parameters

| Key | Type | Description |
| :--- | :--- | :--- |
| `file` | `File` | **Required**. The image to analyze (JPG/PNG). Max 5MB. |

#### Success Response (200 OK)

```json
{
    "message": "File dan data batu berhasil disimpan",
    "uploadTime": "28/11/2024, 10:30:00",
    "file": "1732745000000.jpg",
    "data": {
        "tanggalUpload": "28/11/2024, 10:30:00",
        "volumeBatu": 85.5,
        "jumlahBatu": 3,
        "namaFile": "1732745000000.jpg",
        "_id": "6564..."
    }
}
```

#### Error Response (400 Bad Request)

```json
{
    "message": "Tipe file tidak valid, hanya gambar (jpeg, jpg, png) yang diperbolehkan"
}
```

## 📡 WebSocket Protocol

The system runs a dedicated WebSocket server to handle real-time data synchronization.

  * **Protocol**: `ws://`
  * **Port**: `3001` (Default)

### Client-to-Server Events

These messages are sent as JSON strings from the client.

| Event Type | Payload Structure | Description |
| :--- | :--- | :--- |
| `load` | `{ "type": "load" }` | Request the initial dataset (last 10 records) to populate the dashboard. |
| `add` | `{ "type": "add", "tanggalUpload": "...", "volumeBatu": 10, ... }` | Manually trigger a data broadcast (Secondary method). |
| `edit` | `{ "type": "edit", "tanggalUpload": "...", "volumeBatu": 12 }` | Update an existing record's volume. |

### Server-to-Client Broadcast

Whenever data changes, the server broadcasts an array of the latest records to **all** connected clients.

```json
[
  {
    "tanggalUpload": "28/11/2024, 10:30:00",
    "volumeBatu": 85.5
  },
  {
    "tanggalUpload": "28/11/2024, 10:35:00",
    "volumeBatu": 90.2
  }
]
```

## ⚙️ Installation & Setup

### Prerequisites

  * Node.js (v14 or higher)
  * MongoDB (Local service or Atlas URI)
  * *Optional*: AI Service running on `http://localhost:5000` (for full functionality)

### 1\. Clone the Repository

```bash
git clone [https://github.com/your-username/stone-analysis-backend.git](https://github.com/your-username/stone-analysis-backend.git)
cd stone-analysis-backend
```

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
WS_PORT=3001
MONGODB_URI=mongodb://localhost:27017/stone_analysis_db
NODE_ENV=development
```

### 4\. Run the Server

Start the application in development mode (with Morgan logging):

```bash
npm start
```

### 5\. Access the Dashboard

Once the server is running, you can view the visualization dashboard:

  * **Dashboard**: `http://localhost:3000/allinone`
  * **Chart View**: `http://localhost:3000/chart`

-----

```
```
