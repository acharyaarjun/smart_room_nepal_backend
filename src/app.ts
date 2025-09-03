import env from "@/utils/validateEnv";
import express, { Request, Response, json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { mw } from "request-ip";

import { errorHandlerMiddleware } from "@/middlewares";
import ApiError from "@/utils/apiError";
import { uploadsDir } from "@/utils/fileStorageUtil";
import { morganMiddleware } from "./logger";
import limiter from "@/utils/rateLimiterConfig";

// Routes
import V1Router from "@/routes/v1";

const app = express();

app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(compression());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser middleware
app.use(cookieParser(env.COOKIE_SECRET));

// Request IP middleware to get the IP address of the client
app.use(mw());

// CORS configuration to allow only specific origins
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.split(",").includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// CORS middleware
app.use(cors(corsOptions));

app.set("trust proxy", 1);

// serve static files
app.use("/uploads", express.static(uploadsDir));

// mount morgan logger
app.use(morganMiddleware);

// apply rate limiter middleware
app.use(limiter);

// Routes
app.use("/api/v1", V1Router);

// catch 404 and forward to error handler
app.use((req: Request, res: Response) => {
  // if error occurs while accessing files, send 404 without json
  if (req.originalUrl.startsWith("/uploads")) {
    res.status(404).end();
    return;
  }

  throw new ApiError({
    status: 404,
    message: "Not Found",
    errors: [
      {
        message: `Cannot ${req.method} ${req.originalUrl}`,
      },
    ],
  });
});

//handle all errors
app.use(errorHandlerMiddleware);

export default app;
