const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

dotenv.config();

const { connectDB, getConnectionStatus } = require("./config/db");
const { isSmtpConfigured, verifySmtpConnection } = require("./config/mailer");
const { mongoSanitizeMiddleware } = require("./middleware/validate");
const { apiRateLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const adminRoutes = require("./routes/admin");
const employeeRoutes = require("./routes/employee");

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Apply general rate limiter to API routes
app.use("/api", apiRateLimiter);

// Root & Health Check Endpoints
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Techneest Dashboard API is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "System health status",
    data: {
      database: getConnectionStatus(),
      smtpConfigured: isSmtpConfigured(),
      timezone: "Asia/Kolkata",
      timestamp: new Date().toISOString(),
    },
  });
});

// Mount Versioned API Routers
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/employee", employeeRoutes);

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn("WARNING: MONGO_URI missing; starting without database");
    }

    const smtpCheck = await verifySmtpConnection();
    if (!smtpCheck.configured) {
      console.warn(`[SMTP Notice] ${smtpCheck.warning}`);
    } else if (!smtpCheck.verified) {
      console.warn(`[SMTP Warning] SMTP connection could not be verified: ${smtpCheck.error}`);
    } else {
      console.log("SMTP connection verified successfully");
    }

    const server = app.listen(PORT, () => {
      console.log(`Backend running on URL http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error("Startup error:", error.message);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
