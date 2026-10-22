import React, { useState } from 'react';
import { 
  Download, Calendar, Filter, PlayCircle, 
  Settings, ArrowUpRight, ArrowDownRight, IndianRupee, Search, 
  X, Save, CheckCircle2, AlertCircle
} from 'lucide-react';

// Dummy Data
const initialPayroll = [
  { id: 'WB-024', name: 'Rahul Sharma', base: 45000, adjustment: 2000, net: 46000, status: 'Pending' },
  { id: 'WB-019', name: 'Priya Verma', base: 40000, adjustment: -1000, net: 39000, status: 'Paid' },
  { id: 'WB-031', name: 'Aman Kumar', base: 35000, adjustment: 0, net: 35000, status: 'Paid' },
  { id: 'WB-012', name: 'Neha Singh', base: 38000, adjustment: -500, net: 37500, status: 'Pending' },
  { id: 'WB-045', name: 'Karan Patel', base: 52000, adjustment: 5000, net: 57000, status: 'Paid' },
];

const SalaryManagement = () => {
  const [payrollData, setPayrollData] = useState(initialPayroll);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [isRunPayrollModalOpen, setIsRunPayrollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  
  // States for Editing
  const [tempData, setTempData] = useState([]); 
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredData = payrollData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(Math.abs(amount));
  };

  // Calculate dynamic stats
  const totalPayroll = payrollData.reduce((acc, curr) => acc + curr.net, 0);
  const pendingData = payrollData.filter(emp => emp.status === 'Pending');
  const pendingAmount = pendingData.reduce((acc, curr) => acc + curr.net, 0);
  const paidData = payrollData.filter(emp => emp.status === 'Paid');
  const paidAmount = paidData.reduce((acc, curr) => acc + curr.net, 0);

  // --- WORKING BUTTON LOGIC ---

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setPayrollData(prev => prev.map(emp => ({ ...emp, status: 'Paid' })));
      setIsProcessing(false);
      setIsRunPayrollModalOpen(false);
      alert("Payroll processed successfully! All pending payments are now marked as Paid.");
    }, 1000);
  };

  const openBulkEditModal = () => {
    setTempData(JSON.parse(JSON.stringify(payrollData))); 
    setIsEditModalOpen(true);
  };

  const handleTempSalaryChange = (id, newBase) => {
    const baseValue = Math.max(0, Number(newBase));
    setTempData(prev => 
      prev.map(emp => {
        if (emp.id === id) {
          return { 
            ...emp, 
            base: baseValue,
            net: baseValue + emp.adjustment 
          };
        }
        return emp;
      })
    );
  };

  const handleSaveAllSalaries = () => {
    setPayrollData(tempData);
    setIsEditModalOpen(false);
    alert("All salary structures updated successfully!");
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Base Salary (INR)', 'Adjustments (INR)', 'Net Pay (INR)', 'Status'];
    const csvRows = [
      headers.join(','),
      ...payrollData.map(emp => [
        emp.id, 
        `"${emp.name}"`, 
        emp.base, 
        emp.adjustment, 
        emp.net, 
        emp.status
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-green-500/10 text-green-400 border-green-500/20">
            <span className="w-1 h-1 rounded-full bg-green-400"></span> Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <span className="w-1 h-1 rounded-full bg-yellow-400"></span> Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-white font-sans selection:bg-blue-500/30 relative">
      
      {/* SCROLLBAR HIDE CSS */}
      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-1.5">
              Salary & Payroll
            </h1>
            <p className="text-gray-400 text-xs md:text-sm">
              Manage monthly salary, deductions, bonuses and payroll status for each employee.
            </p>
          </div>
          <button 
            onClick={() => setIsRunPayrollModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg border border-blue-500/50 transition-all text-xs font-medium shadow-lg shadow-blue-900/20 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <PlayCircle size={16} /> Run Payroll
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-blue-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Monthly Payroll</p>
              <div className="w-6 h-6 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 bg-blue-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl text-gray-400 font-medium"><IndianRupee size={18} className="inline mb-0.5"/></span>
              <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(totalPayroll)}</h3>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Gross salary total</p>
          </div>

          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-yellow-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Pending Payments</p>
              <div className="w-6 h-6 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-400 bg-yellow-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl text-gray-400 font-medium"><IndianRupee size={18} className="inline mb-0.5"/></span>
              <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(pendingAmount)}</h3>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{pendingData.length} employees</p>
          </div>

          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-green-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Paid This Month</p>
              <div className="w-6 h-6 rounded-full border border-green-500/30 flex items-center justify-center text-green-400 bg-green-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl text-gray-400 font-medium"><IndianRupee size={18} className="inline mb-0.5"/></span>
              <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(paidAmount)}</h3>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{paidData.length} employees</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#111111]/80 backdrop-blur-md border border-gray-800/80 rounded-xl p-3 mb-6 flex flex-col lg:flex-row gap-3 items-center justify-between shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={14} className="text-gray-500" />
              </div>
              <select className="appearance-none w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-9 pr-8 p-2 outline-none cursor-pointer hover:bg-[#222] transition-colors">
                <option>Pay period: October 2026</option>
                <option>Pay period: September 2026</option>
              </select>
            </div>
            <div className="relative w-full sm:w-36">
              <select className="appearance-none w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-3 pr-8 p-2 outline-none cursor-pointer hover:bg-[#222] transition-colors">
                <option>Department: All</option>
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-36">
              <select className="appearance-none w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-3 pr-8 p-2 outline-none cursor-pointer hover:bg-[#222] transition-colors">
                <option>Status: All</option>
                <option>Paid</option>
                <option>Pending</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block pl-9 p-2 outline-none transition-all placeholder-gray-500"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-400">
              <thead className="text-[10px] text-gray-500 uppercase bg-[#0d0d0d]/50 border-b border-gray-800/80">
                <tr>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Employee</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Base Salary</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Adjustments</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Net Pay</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredData.map((emp, index) => (
                  <tr key={index} className="hover:bg-[#1a1a1a]/60 transition-colors group">
                    
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200 text-sm group-hover:text-white transition-colors">{emp.name}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">• {emp.id}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-gray-300 flex items-center gap-1">
                        <IndianRupee size={12} className="text-gray-500" /> {formatCurrency(emp.base)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`font-medium flex items-center gap-1 ${
                        emp.adjustment > 0 ? 'text-green-400' : 
                        emp.adjustment < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {emp.adjustment > 0 ? <ArrowUpRight size={12} /> : 
                         emp.adjustment < 0 ? <ArrowDownRight size={12} /> : null}
                        {emp.adjustment !== 0 && <IndianRupee size={10} />}
                        {formatCurrency(emp.adjustment)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-gray-200 flex items-center gap-1">
                        <IndianRupee size={12} className="text-gray-400" /> {formatCurrency(emp.net)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      {getStatusBadge(emp.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Actions */}
          <div className="p-3 border-t border-gray-800 bg-[#161616] flex flex-wrap gap-2.5 justify-between items-center">
            <p className="text-[10px] text-gray-500 ml-1">Showing {filteredData.length} records</p>
            <div className="flex gap-2.5">
              <button 
                onClick={openBulkEditModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors active:scale-95"
              >
                <Settings size={14} /> Edit Salary Structure
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors active:scale-95"
              >
                <Download size={14} /> Export Payroll
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- RUN PAYROLL MODAL --- */}
      {isRunPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-700 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <PlayCircle size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Run Payroll?</h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                This will process all pending payments (₹{formatCurrency(pendingAmount)}) and mark them as Paid. This action cannot be undone.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsRunPayrollModalOpen(false)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunPayroll}
                  disabled={isProcessing || pendingData.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Run'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BULK EDIT SALARY MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-700 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800 bg-[#161616] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings size={18} className="text-blue-500" /> Edit Salary Structure
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Update base salary for all employees one by one.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2.5">
              {tempData.map((emp) => (
                <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1a1a] p-3 rounded-lg border border-gray-800">
                  
                  {/* Employee Info */}
                  <div>
                    <p className="text-xs font-semibold text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-500">{emp.id}</p>
                  </div>

                  {/* Input for Base Salary */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400">Base Salary:</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <IndianRupee size={12} className="text-gray-500" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={emp.base}
                        onChange={(e) => handleTempSalaryChange(emp.id, e.target.value)}
                        className="w-28 bg-[#111] border border-gray-700 text-white font-bold text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 pl-7 p-1.5 outline-none"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-800 bg-[#161616] flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAllSalaries}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
              >
                <Save size={14} /> Save All Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SalaryManagement;