/**
 * Escapes special characters in PDF literal strings
 */
const escapePdfText = (text = "") => {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ");
};

/**
 * Generates a valid, multi-section PDF buffer for an employee salary slip without external binary dependencies
 */
const generatePayslipPdfBuffer = (payslipData) => {
  const {
    payslipNumber = "PS-0000",
    companyName = "TechNeest",
    monthName = "October",
    year = 2026,
    generatedAt = new Date().toISOString().slice(0, 10),
    employee = {},
    attendanceSummary = {},
    earnings = {},
    deductions = {},
    netPayable = 0,
    currency = "INR",
  } = payslipData;

  const lines = [];
  const addText = (x, y, size, font, text) => {
    lines.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
  };
  const addLine = (x1, y1, x2, y2) => {
    lines.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // Header
  addText(50, 780, 18, "F2", `${companyName.toUpperCase()} - OFFICIAL SALARY SLIP`);
  addText(50, 760, 10, "F1", `Payslip No: ${payslipNumber}   |   Pay Period: ${monthName} ${year}   |   Generated: ${generatedAt}`);
  addLine(50, 750, 545, 750);

  // Employee Details
  addText(50, 730, 12, "F2", "EMPLOYEE INFORMATION");
  addText(50, 712, 10, "F1", `Employee ID: ${employee.employeeId || "-"}`);
  addText(300, 712, 10, "F1", `Name: ${employee.fullName || "-"}`);
  addText(50, 696, 10, "F1", `Department: ${employee.department || "-"}`);
  addText(300, 696, 10, "F1", `Designation: ${employee.designation || employee.role || "-"}`);
  addText(50, 680, 10, "F1", `Email: ${employee.email || "-"}`);
  addText(300, 680, 10, "F1", `Joining Date: ${employee.joiningDate || "-"}`);
  addLine(50, 668, 545, 668);

  // Attendance Summary
  addText(50, 648, 12, "F2", "ATTENDANCE & PAYABLE DAYS SUMMARY");
  addText(50, 630, 10, "F1", `Total Working Days: ${attendanceSummary.totalWorkingDays ?? 0}`);
  addText(220, 630, 10, "F1", `Approved Present Days: ${attendanceSummary.presentDays ?? 0}`);
  addText(400, 630, 10, "F1", `Half Days: ${attendanceSummary.halfDays ?? 0}`);
  addText(50, 614, 10, "F1", `Paid Leave Days: ${attendanceSummary.paidLeaveDays ?? 0}`);
  addText(220, 614, 10, "F1", `Unpaid Leave / Absent: ${attendanceSummary.unpaidAbsences ?? 0}`);
  addText(400, 614, 10, "F2", `Payable Days: ${attendanceSummary.payableDays ?? 0}`);
  addLine(50, 600, 545, 600);

  // Earnings & Deductions Table Header
  addText(50, 580, 12, "F2", `EARNINGS (${currency})`);
  addText(310, 580, 12, "F2", `DEDUCTIONS (${currency})`);
  addLine(50, 572, 545, 572);

  const earningRows = [
    ["Basic Salary (Earned)", earnings.basicEarned ?? earnings.baseSalary ?? 0],
    ["House Rent Allowance (HRA)", earnings.hraEarned ?? 0],
    ["Dearness Allowance (DA)", earnings.daEarned ?? 0],
    ["Special Allowance", earnings.specialAllowanceEarned ?? 0],
    ["Overtime Pay", earnings.overtimePay ?? 0],
    ["Bonus & Incentives", (Number(earnings.bonus || 0) + Number(earnings.incentives || 0))],
    ["Positive Adjustments", earnings.positiveAdjustments ?? 0],
  ];

  const deductionRows = [
    ["Provident Fund (PF)", deductions.pf ?? 0],
    ["Employee State Insurance (ESI)", deductions.esi ?? 0],
    ["Professional Tax (PT)", deductions.professionalTax ?? 0],
    ["TDS / Income Tax", deductions.tds ?? 0],
    ["Unpaid Leave Deduction", deductions.unpaidLeaveDeduction ?? 0],
    ["Other Deductions / Adjustments", deductions.otherDeductions ?? 0],
  ];

  let yPos = 554;
  const maxRows = Math.max(earningRows.length, deductionRows.length);
  for (let i = 0; i < maxRows; i++) {
    if (earningRows[i]) {
      addText(50, yPos, 10, "F1", earningRows[i][0]);
      addText(220, yPos, 10, "F1", Number(earningRows[i][1]).toFixed(2));
    }
    if (deductionRows[i]) {
      addText(310, yPos, 10, "F1", deductionRows[i][0]);
      addText(480, yPos, 10, "F1", Number(deductionRows[i][1]).toFixed(2));
    }
    yPos -= 18;
  }

  addLine(50, yPos, 545, yPos);
  yPos -= 18;

  addText(50, yPos, 11, "F2", "GROSS EARNINGS:");
  addText(210, yPos, 11, "F2", `${currency} ${Number(earnings.grossEarned || 0).toFixed(2)}`);
  addText(310, yPos, 11, "F2", "TOTAL DEDUCTIONS:");
  addText(470, yPos, 11, "F2", `${currency} ${Number(deductions.totalDeductions || 0).toFixed(2)}`);

  yPos -= 12;
  addLine(50, yPos, 545, yPos);
  yPos -= 26;

  addText(50, yPos, 14, "F2", `NET PAYABLE SALARY: ${currency} ${Number(netPayable).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  yPos -= 40;
  addText(50, yPos, 9, "F1", "Note: This is a computer-generated salary slip and does not require a physical signature.");

  const streamContent = lines.join("\n");
  const streamByteLength = Buffer.byteLength(streamContent, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 595 842] /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    `6 0 obj\n<< /Length ${streamByteLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
};

module.exports = {
  generatePayslipPdfBuffer,
};
