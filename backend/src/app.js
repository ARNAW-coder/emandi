import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import mandiRoutes from "./routes/mandi.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import procurementRoutes from "./routes/procurement.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/mandis", mandiRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

export default app;