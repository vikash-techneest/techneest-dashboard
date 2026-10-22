const EmailLog = require("../../models/EmailLog");
const {
  isSmtpConfigured,
  getMailerTransporter,
  verifySmtpConnection,
} = require("../../config/mailer");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends an email with controlled retry handling and MongoDB EmailLog tracking.
 * If SMTP is not configured, preserves the Pending state and returns a clear warning without crashing.
 */
const sendEmail = async ({
  to,
  recipientName = "",
  subject,
  html,
  attachments = [],
  templateName = "GENERIC",
  relatedEntityType = null,
  relatedEntityId = null,
  maxRetries = 2,
}) => {
  const emailLog = await EmailLog.create({
    recipientEmail: to,
    recipientName,
    subject,
    templateName,
    relatedEntityType,
    relatedEntityId,
    status: "Pending",
    attempts: 0,
    maxRetries,
  });

  if (!isSmtpConfigured()) {
    const warningMsg =
      "SMTP credentials are not configured in environment variables. Email preserved in Pending state.";
    console.warn(`[EmailService] ${warningMsg} (Recipient: ${to})`);
    emailLog.errorMessage = warningMsg;
    await emailLog.save();

    return {
      sent: false,
      status: "Pending",
      warning: warningMsg,
      emailLogId: emailLog._id,
    };
  }

  const transporter = getMailerTransporter();
  const fromAddress =
    process.env.SMTP_FROM || `"TechNeest HRMS" <${process.env.SMTP_USER}>`;

  let lastError = null;
  const totalAttemptsAllowed = Math.max(1, maxRetries);

  for (let attempt = 1; attempt <= totalAttemptsAllowed; attempt++) {
    emailLog.attempts = attempt;
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        attachments,
      });

      emailLog.status = "Sent";
      emailLog.messageId = info.messageId || null;
      emailLog.sentAt = new Date();
      emailLog.errorMessage = null;
      await emailLog.save();

      return {
        sent: true,
        status: "Sent",
        messageId: info.messageId,
        attempts: attempt,
        emailLogId: emailLog._id,
      };
    } catch (error) {
      lastError = error;
      emailLog.errorMessage = error.message;
      if (attempt < totalAttemptsAllowed) {
        await sleep(300 * attempt);
      }
    }
  }

  emailLog.status = "Failed";
  await emailLog.save();

  return {
    sent: false,
    status: "Failed",
    error: lastError ? lastError.message : "SMTP delivery failed",
    attempts: emailLog.attempts,
    emailLogId: emailLog._id,
  };
};

module.exports = {
  sendEmail,
  verifySmtpConnection,
  isSmtpConfigured,
};
