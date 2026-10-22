const nodemailer = require("nodemailer");

let transporter = null;

const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
  );
};

const getMailerTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
};

const verifySmtpConnection = async () => {
  const transport = getMailerTransporter();
  if (!transport) {
    return {
      configured: false,
      verified: false,
      warning:
        "SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD) are not configured. Emails will be logged in Pending state.",
    };
  }

  try {
    await transport.verify();
    return { configured: true, verified: true };
  } catch (error) {
    return {
      configured: true,
      verified: false,
      error: error.message,
    };
  }
};

module.exports = {
  isSmtpConfigured,
  getMailerTransporter,
  verifySmtpConnection,
};
