import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { CORS_ORIGIN, PORT } from "./constants.js";
import { authGuard } from "./middlewares/guard.middleware.js";
import routes from "./routes/index.js";
// import { appointmentReminderCron } from "./utils/cron.util.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors({ credentials: true, origin: CORS_ORIGIN }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "assets")));
app.use("/", express.static(path.join(__dirname, "public")));
// await appointmentReminderCron();

app.use("/api", authGuard, routes);


app.get("/", (req, res) => {
  res.send(`App is running on port: ${PORT}`);
});

export default app;
