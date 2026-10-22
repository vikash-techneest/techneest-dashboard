const renderEmailLayout = ({ title, bodyHtml }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0b;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0b;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#141414;border:1px solid #262626;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 30px;background-color:#1a1a1a;border-bottom:1px solid #262626;">
              <h1 style="margin:0;font-size:20px;color:#ffffff;">TechNeest HRMS &amp; Payroll</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;font-size:14px;line-height:1.6;color:#d1d5db;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 30px;background-color:#101010;border-top:1px solid #262626;font-size:12px;color:#6b7280;text-align:center;">
              &copy; ${new Date().getFullYear()} TechNeest. Automated system notification — please do not reply directly.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const renderPayslipEmailTemplate = ({
  employeeName,
  employeeId,
  monthName,
  year,
  netPayable,
  payableDays,
  payslipNumber,
}) => {
  return renderEmailLayout({
    title: `Salary Slip - ${monthName} ${year}`,
    bodyHtml: `
      <p>Dear <strong>${employeeName}</strong> (${employeeId}),</p>
      <p>Your salary slip for the pay period <strong>${monthName} ${year}</strong> has been finalized and generated.</p>
      <table width="100%" cellpadding="10" cellspacing="0" style="margin:20px 0;background-color:#1f1f1f;border:1px solid #333;border-radius:8px;">
        <tr>
          <td style="color:#9ca3af;">Payslip Number:</td>
          <td style="color:#ffffff;font-weight:bold;text-align:right;">${payslipNumber}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;">Pay Period:</td>
          <td style="color:#ffffff;font-weight:bold;text-align:right;">${monthName} ${year}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;">Approved Payable Days:</td>
          <td style="color:#ffffff;font-weight:bold;text-align:right;">${payableDays}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;">Net Payable Salary:</td>
          <td style="color:#4ade80;font-weight:bold;font-size:16px;text-align:right;">INR ${Number(netPayable).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </table>
      <p>Please find your official PDF salary slip attached to this email.</p>
      <p>Best regards,<br/><strong>TechNeest HR &amp; Payroll Team</strong></p>
    `,
  });
};

const renderPasswordResetTemplate = ({ name, resetToken, expiresInMinutes = 30 }) => {
  return renderEmailLayout({
    title: "Password Reset Request",
    bodyHtml: `
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your TechNeest account password. Use the secure reset token below within <strong>${expiresInMinutes} minutes</strong>:</p>
      <div style="margin:20px 0;padding:15px;background-color:#1f1f1f;border:1px solid #3b82f6;border-radius:8px;font-family:monospace;font-size:15px;color:#93c5fd;text-align:center;">
        ${resetToken}
      </div>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `,
  });
};

module.exports = {
  renderEmailLayout,
  renderPayslipEmailTemplate,
  renderPasswordResetTemplate,
};
