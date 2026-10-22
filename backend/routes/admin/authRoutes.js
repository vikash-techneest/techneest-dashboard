const express = require("express");
const router = express.Router();

const authController = require("../../controllers/admin/authController");
const { authenticateAdmin } = require("../../middleware/auth");
const { validateRequest } = require("../../middleware/validate");
const { authRateLimiter } = require("../../middleware/rateLimiter");
const {
  setupAdminValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../../validators/authValidators");

// Public / Rate-limited Admin Auth Routes
router.post(
  "/setup",
  authRateLimiter,
  setupAdminValidator,
  validateRequest,
  authController.setupAdmin
);

router.post(
  "/login",
  authRateLimiter,
  loginValidator,
  validateRequest,
  authController.login
);

router.post("/refresh", authRateLimiter, authController.refresh);

router.post(
  "/forgot-password",
  authRateLimiter,
  forgotPasswordValidator,
  validateRequest,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authRateLimiter,
  resetPasswordValidator,
  validateRequest,
  authController.resetPassword
);

// Protected Admin Auth Routes
router.use(authenticateAdmin);

router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.put(
  "/change-password",
  changePasswordValidator,
  validateRequest,
  authController.changePassword
);
router.get("/sessions", authController.getAdminSessions);
router.delete("/sessions/:sessionId", authController.revokeAdminSession);
router.get("/login-history", authController.getAdminLoginHistory);

module.exports = router;
