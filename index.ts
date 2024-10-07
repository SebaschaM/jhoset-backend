import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./src/routes/authRoute";
import adminRoute from "./src/routes/adminRoute";
import employeeRoute from "./src/routes/userRoute";
import qrRoute from "./src/routes/qrRoute";
import userRoute from "./src/routes/userRoute";
import { runSeed } from "./src/seed/seed";
import { logError, logInfo, logSystem, logWarning } from "./src/utils/logger";
import requestLogger from "./src/utils/requestLogger";
import { verifyToken } from "./src/middleware/verifyToken";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.SEED === "true") {
    logSystem("Running seed...");
    try {
      await runSeed();
      logInfo("Seed completed!");
    } catch (error) {
      if (error instanceof Error) {
        logError(error);
      } else {
        logError(new Error(String(error)));
      }
    }
  } else {
    logWarning("Seed not executed because SEED is set to false.");
  }

  const corsOptions = {
    exposedHeaders: ["X-QR-Token"], // Exponer la cabecera para que el frontend pueda acceder a ella
  };

  app.use(express.json());
  app.use(requestLogger);
  app.use(cors(corsOptions));
  app.use("/api", authRoute);
  //app.use("/api/admin", verifyToken, adminRoute);
  app.use("/api/admin", adminRoute);
  //app.use("/api/employee", verifyToken, adminRoute);
  app.use("/api/employee", employeeRoute);
  app.use("/api/qr", qrRoute);
  app.use("/api/user", userRoute);

  app.listen(PORT, () => {
    logSystem(`Server running at PORT: ${PORT}`);
  });
}

startServer().catch((e) => {
  logError(e);
  process.exit(1);
});
