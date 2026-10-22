const assert = require("assert");
const {
  toISTDateString,
  toISTTimeString,
  getISTHoursAndMinutes,
  getMonthCalendarDetails,
} = require("../utils/dateTime");
const {
  evaluateAttendanceMetrics,
} = require("../services/attendance/attendanceService");
const {
  calculateEmployeePayrollNumbers,
} = require("../services/payroll/payrollService");
const { generatePayslipPdfBuffer } = require("../utils/pdfGenerator");

const runUnitTests = async () => {
  const results = [];
  const test = (name, fn) => {
    try {
      fn();
      results.push({ name, passed: true });
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
      console.error(`  [FAIL] ${name}: ${err.message}`);
    }
  };

  console.log("\n=== Running Automated Unit Tests (Attendance, Payroll, Timezone, PDF) ===");

  // 1. Timezone & Month Boundary Tests
  test("UTC to Asia/Kolkata (+05:30) date/time conversion across midnight boundary", () => {
    // 2026-10-31T20:00:00Z is 2026-11-01 01:30 AM in Asia/Kolkata
    const utcDate = new Date("2026-10-31T20:00:00.000Z");
    const istDateStr = toISTDateString(utcDate);
    const istParts = getISTHoursAndMinutes(utcDate);
    assert.strictEqual(istDateStr, "2026-11-01");
    assert.strictEqual(istParts.hours, 1);
    assert.strictEqual(istParts.minutes, 30);
  });

  test("Month boundary calendar calculation (February leap vs non-leap & October 31 days)", () => {
    const oct2026 = getMonthCalendarDetails(10, 2026, [0]); // Sunday off
    assert.strictEqual(oct2026.totalCalendarDays, 31);
    assert.strictEqual(oct2026.weeklyOffCount, 4); // 4 Sundays in Oct 2026
    assert.strictEqual(oct2026.standardWorkingDays, 27);

    const feb2024 = getMonthCalendarDetails(2, 2024, [0]); // Leap year
    assert.strictEqual(feb2024.totalCalendarDays, 29);

    const feb2026 = getMonthCalendarDetails(2, 2026, [0]); // Non-leap year
    assert.strictEqual(feb2026.totalCalendarDays, 28);
  });

  // 2. Attendance Calculation Engine Tests
  test("Attendance: On-time check-in (09:10 AM IST) and full-day check-out (06:05 PM IST)", () => {
    const checkIn = new Date("2026-10-19T03:40:00.000Z"); // 09:10 AM IST
    const checkOut = new Date("2026-10-19T12:35:00.000Z"); // 06:05 PM IST (8h 55m = 535m)
    const metrics = evaluateAttendanceMetrics({
      checkInTime: checkIn,
      checkOutTime: checkOut,
      policy: {
        standardLoginTime: "09:00",
        lateThresholdTime: "09:30",
        standardLogoutTime: "18:00",
        fullDayMinHours: 8,
        halfDayMinHours: 4,
        overtimeMinMinutesAfterShift: 30,
      },
    });

    assert.strictEqual(metrics.isLate, false);
    assert.strictEqual(metrics.lateByMinutes, 0);
    assert.strictEqual(metrics.workingDurationMinutes, 535);
    assert.strictEqual(metrics.attendanceStatus, "Present");
    assert.strictEqual(metrics.isHalfDay, false);
    assert.strictEqual(metrics.overtimeMinutes, 55); // > 480 + 30
  });

  test("Attendance: Late arrival detection after grace period (09:48 AM IST)", () => {
    const checkIn = new Date("2026-10-19T04:18:00.000Z"); // 09:48 AM IST
    const checkOut = new Date("2026-10-19T12:40:00.000Z"); // 06:10 PM IST (8h 22m)
    const metrics = evaluateAttendanceMetrics({
      checkInTime: checkIn,
      checkOutTime: checkOut,
      policy: {
        standardLoginTime: "09:00",
        lateThresholdTime: "09:30",
        standardLogoutTime: "18:00",
        fullDayMinHours: 8,
        halfDayMinHours: 4,
      },
    });

    assert.strictEqual(metrics.isLate, true);
    assert.strictEqual(metrics.lateByMinutes, 48);
    assert.strictEqual(metrics.lateByDisplay, "48m");
    assert.strictEqual(metrics.attendanceStatus, "Late");
  });

  test("Attendance: Half-day & early checkout detection (4h 30m worked)", () => {
    const checkIn = new Date("2026-10-19T03:30:00.000Z"); // 09:00 AM IST
    const checkOut = new Date("2026-10-19T08:00:00.000Z"); // 01:30 PM IST (4h 30m = 270m)
    const metrics = evaluateAttendanceMetrics({
      checkInTime: checkIn,
      checkOutTime: checkOut,
      policy: {
        standardLoginTime: "09:00",
        lateThresholdTime: "09:30",
        standardLogoutTime: "18:00",
        fullDayMinHours: 8,
        halfDayMinHours: 4,
      },
    });

    assert.strictEqual(metrics.isHalfDay, true);
    assert.strictEqual(metrics.attendanceStatus, "Half Day");
    assert.strictEqual(metrics.isEarlyCheckout, true);
  });

  // 3. Payroll Calculation Engine Tests
  test("Payroll: Full attendance (24/24 working days) with Bonus (+2000) & Deduction (-1000)", () => {
    const calc = calculateEmployeePayrollNumbers({
      salaryStructure: {
        baseSalary: 45000,
        basicPercent: 50,
        hraPercent: 25,
        daPercent: 10,
        specialAllowancePercent: 15,
        pfEnabled: false,
        esiEnabled: false,
        professionalTaxAmount: 0,
        salaryBasis: "WORKING_DAYS",
      },
      totalCalendarDays: 31,
      totalWorkingDays: 24,
      approvedPresentDays: 24,
      approvedHalfDays: 0,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      paidHolidays: 0,
      overtimeMinutes: 0,
      adjustmentsList: [
        { type: "Bonus", label: "Performance Bonus", amount: 2000 },
        { type: "Deduction", label: "Advance Recovery", amount: 1000 },
      ],
    });

    assert.strictEqual(calc.attendanceBreakdown.payableDays, 24);
    assert.strictEqual(calc.attendanceBreakdown.unpaidAbsences, 0);
    assert.strictEqual(calc.earnings.grossEarned, 47000);
    assert.strictEqual(calc.deductions.totalDeductions, 1000);
    assert.strictEqual(calc.netAdjustment, 1000);
    assert.strictEqual(calc.netPayable, 46000);
  });

  test("Payroll: Proration with Half-Days, Paid Leave, Unpaid Leave, Statutory PF/PT, and INR Rounding", () => {
    // 26 working days: 20 Present + 2 Half Days (1.0) + 2 Paid Leave = 23 Payable Days (3 Unpaid Absences)
    const calc = calculateEmployeePayrollNumbers({
      salaryStructure: {
        baseSalary: 52000, // 2000 per day across 26 days
        basicPercent: 50,
        hraPercent: 25,
        daPercent: 10,
        specialAllowancePercent: 15,
        pfEnabled: true,
        pfRatePercent: 12,
        esiEnabled: false,
        professionalTaxAmount: 200,
        salaryBasis: "WORKING_DAYS",
      },
      totalCalendarDays: 30,
      totalWorkingDays: 26,
      approvedPresentDays: 20,
      approvedHalfDays: 2,
      paidLeaveDays: 2,
      unpaidLeaveDays: 3,
      paidHolidays: 0,
      overtimeMinutes: 0,
      adjustmentsList: [],
    });

    assert.strictEqual(calc.attendanceBreakdown.payableDays, 23);
    assert.strictEqual(calc.attendanceBreakdown.unpaidAbsences, 3);
    // 23 / 26 of 52,000 = 46,000
    assert.strictEqual(calc.earnings.grossEarned, 46000);
    assert.strictEqual(calc.deductions.unpaidLeaveDeduction, 6000);
    // Basic earned = 50% of 46,000 = 23,000; PF = 12% of 23,000 = 2,760; PT = 200 -> Total deductions = 2,960
    assert.strictEqual(calc.deductions.pf, 2760);
    assert.strictEqual(calc.deductions.professionalTax, 200);
    assert.strictEqual(calc.deductions.totalDeductions, 2960);
    assert.strictEqual(calc.netPayable, 43040);
  });

  test("PDF Generator: Generates valid PDF binary buffer with header and EOF trailer", () => {
    const buffer = generatePayslipPdfBuffer({
      payslipNumber: "PS-202610-WB-024",
      companyName: "TechNeest",
      monthName: "October",
      year: 2026,
      employee: {
        employeeId: "WB-024",
        fullName: "Rahul Sharma",
        department: "Development",
        designation: "Frontend Dev",
        email: "rahul.sharma@company.com",
      },
      attendanceSummary: {
        totalWorkingDays: 24,
        presentDays: 22,
        halfDays: 0,
        paidLeaveDays: 2,
        unpaidAbsences: 0,
        payableDays: 24,
      },
      earnings: {
        basicEarned: 22500,
        hraEarned: 11250,
        daEarned: 4500,
        specialAllowanceEarned: 6750,
        grossEarned: 45000,
      },
      deductions: {
        totalDeductions: 0,
      },
      netPayable: 45000,
    });

    assert.ok(Buffer.isBuffer(buffer));
    const str = buffer.toString("utf8");
    assert.ok(str.startsWith("%PDF-1.4"));
    assert.ok(str.includes("TECHNEEST - OFFICIAL SALARY SLIP"));
    assert.ok(str.includes("PS-202610-WB-024"));
    assert.ok(str.trim().endsWith("%%EOF"));
  });

  const failed = results.filter((r) => !r.passed);
  return {
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  };
};

if (require.main === module) {
  runUnitTests().then((summary) => {
    console.log(
      `\nUnit Tests Summary: ${summary.passed}/${summary.total} Passed`
    );
    if (summary.failed > 0) process.exit(1);
  });
}

module.exports = { runUnitTests };
