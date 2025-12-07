import http from "http";
import https from "https";
import fs from "fs";
import app from "./app.js";
import { PORT } from "./constants.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/socket.js";
import { appointmentReminderCron } from "./utils/cron.util.js";
import dotenv from "dotenv";
dotenv.config();

const PORT_ENV = PORT || 4000;


connectDB()
  .then(() => {
    const options = {
    };

    const server = http.createServer(options, app);
    initSocket(server);

    server.listen(PORT_ENV, "0.0.0.0", () => {
      console.log(`🚀 Node HTTPS server running on port: ${PORT_ENV}`);
      appointmentReminderCron()
        .then(() => console.log("✅ Cron jobs initialized"))
        .catch(err => console.error("❌ Cron jobs failed to initialize:", err));
    });
  })
  .catch(err => {
    console.error("❌ Failed to start server due to DB error:", err.message);
    process.exit(1);
  });
