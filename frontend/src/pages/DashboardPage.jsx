import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { LayoutDashboard } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// --- BỘ ICON PREMIUM (Đã xóa Icon Thuế) ---
const RevenueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-teal-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ProfitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-emerald-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);
const CapitalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-sky-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedData, setSelectedData] = useState("amount");
  const [transactionData, setTransactionData] = useState([]);
  const [inputMonth, setInputMonth] = useState("");
  const [inputYear, setInputYear] = useState("");
  const [yearError, setYearError] = useState("");
  const [activeParams, setActiveParams] = useState(null);
  
  // Đã xóa tax
  const [summary, setSummary] = useState({ revenue: 0, profit: 0, count: 0, capital: 0 });

  const handleSearch = async (e) => {
    e.preventDefault();
    setYearError("");
    if (!inputYear) {
      setYearError("Năm không được để trống");
      return;
    }
    let mode = "year";
    if (inputMonth && inputYear) mode = "month";
    else if (inputYear && !inputMonth) mode = "year";

    try {
      const transactionResponse = await ApiService.getAllTransactions(0, 10000);
      const txList = transactionResponse?.transactions || transactionResponse?.content || transactionResponse?.data || [];
      const safeList = Array.isArray(txList) ? txList : [];
      const processedChartData = transformDataByMode(safeList, mode, parseInt(inputMonth, 10), parseInt(inputYear, 10));
      setTransactionData(processedChartData);
      setActiveParams({ mode, month: inputMonth, year: inputYear });
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi khi truy vấn dữ liệu: " + error);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const transformDataByMode = (transactions, mode, month, year) => {
    const chartMap = {};
    let filteredList = [];
    let totalRev = 0; let totalProf = 0; let totalCount = 0; let totalCap = 0;

    // 1. Khởi tạo trục đồ thị
    if (mode === "month") {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        chartMap[d] = { label: `${d}`, count: 0, quantity: 0, amount: 0, profit: 0, capital: 0 };
      }
      filteredList = transactions.filter(t => {
        const d = new Date(t.createdAt);
        return (d.getMonth() + 1) === month && d.getFullYear() === year;
      });
    } else if (mode === "year") {
      for (let m = 1; m <= 12; m++) {
        chartMap[m] = { label: `Thg ${m}`, count: 0, quantity: 0, amount: 0, profit: 0, capital: 0 };
      }
      filteredList = transactions.filter(t => {
        return new Date(t.createdAt).getFullYear() === year;
      });
    }

    // 2. Tính toán theo công thức mới
    filteredList.forEach(t => {
      const key = mode === "month" ? new Date(t.createdAt).getDate() : new Date(t.createdAt).getMonth() + 1;
      
      if (!chartMap[key]) return;

      totalCount += 1;
      chartMap[key].count += 1;
      chartMap[key].quantity += t.totalProducts || 0;

      const price = t.totalPrice || 0;
      const profitVal = t.profit || 0;
      const quantity = t.totalProducts || 0;

      // Vốn = Doanh thu - Lợi nhuận
      const capitalVal = (t.purchasePrice || 0) * (t.totalProducts || 1);

      if (t.transactionType === 'SALE') {
          totalRev  += price;
          totalProf += profitVal;
          totalCap  += capitalVal;
          
          chartMap[key].amount  += price;
          chartMap[key].profit  += profitVal;
          chartMap[key].capital += capitalVal;
          
      } else if (t.transactionType === 'CUSTOMER_RETURN') {
          const returnCapital = (t.purchasePrice || 0) * (t.totalProducts || 1);
          totalRev  -= Math.abs(price);
          totalProf -= Math.abs(profitVal);
          totalCap  -= returnCapital;

          chartMap[key].amount  -= Math.abs(price);
          chartMap[key].profit  -= Math.abs(profitVal);
          chartMap[key].capital -= returnCapital;

      } else if (t.transactionType === 'RETURN_TO_SUPPLIER') {
          totalCap  -= capitalVal;
          chartMap[key].capital -= capitalVal;
      }
      // Bỏ qua transactionType === 'PURCHASE' khi tính vốn theo công thức mới
    });
    
    setSummary({ revenue: totalRev, profit: totalProf, count: totalCount, capital: totalCap });
    return Object.values(chartMap);
  };

  const getChartLegendName = () => {
    if (selectedData === "count") return "Tổng số giao dịch";
    if (selectedData === "quantity") return "Tổng số lượng sản phẩm";
    if (selectedData === "amount") return "Doanh thu bán ra";
    if (selectedData === "profit") return "Lợi nhuận ròng";
    if (selectedData === "capital") return "Vốn hàng đã bán";
    return "";
  };

  const getChartColor = () => {
    if (selectedData === "profit") return "#2563eb"; 
    if (selectedData === "quantity") return "#9333ea"; 
    if (selectedData === "count") return "#d97706"; 
    if (selectedData === "capital") return "#0284c7"; 
    return "#0d9488"; 
  };

  return (
    <Layout>
      {message && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-center mb-6 border border-rose-200 font-semibold shadow-sm mx-8 mt-4">{message}</div>}
      
      <div className="p-4 md:p-8 font-sans bg-[#f4f7f9] min-h-screen text-slate-800">
        
        {/* === TIÊU ĐỀ === */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <LayoutDashboard size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#008080] to-emerald-500 tracking-tight mb-1.5">
                Bảng Điều Khiển
              </h1>
              <p className="text-sm text-slate-500 font-medium">Tổng quan số liệu phân tích và hiệu suất vận hành hệ thống kho</p>
            </div>
          </div>
        </div>

        {/* --- 1. HEADER & BỘ LỌC --- */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Bộ lọc báo cáo</h2>
              <p className="text-xs text-slate-500 font-medium">Tùy chỉnh khoảng thời gian</p>
            </div>
            <div className="hidden md:block h-10 w-px bg-slate-200 mx-2"></div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-wrap items-start md:items-end justify-start md:justify-end gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1.5 flex-1 md:flex-none md:w-40">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tháng</label>
              <select
                value={inputMonth}
                onChange={(e) => setInputMonth(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-sm text-slate-700 font-semibold"
              >
                <option value="">-- Tất cả --</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 md:flex-none md:w-40">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Năm <span className="text-rose-500">*</span></label>
              <select
                value={inputYear}
                onChange={(e) => {
                  setInputYear(e.target.value);
                  if (e.target.value) setYearError(""); 
                }}
                className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-sm text-slate-700 font-semibold ${yearError ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
              >
                <option value="">-- Chọn --</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>

            <button
              type="submit"
              className="bg-teal-600 text-white font-bold h-[44px] px-8 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(13,148,136,0.2)] text-sm cursor-pointer mt-1"
            >
              Xem số liệu
            </button>
          </form>
        </div>

        {/* --- 2. VÙNG DỮ LIỆU CHÍNH --- */}
        {activeParams ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tổng quan tài chính</h1>
              <span className="bg-teal-100/50 text-teal-700 font-bold px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider border border-teal-200/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                {activeParams.mode === 'month' ? `Tháng ${activeParams.month} / ${activeParams.year}` : `Năm ${activeParams.year}`}
              </span>
            </div>

            {/* Đã cập nhật Grid thành 3 cột do xóa Thẻ Thuế */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <RevenueIcon />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doanh Thu Bán</p>
                  <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{summary.revenue.toLocaleString()}₫</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CapitalIcon />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vốn Hàng Đã Bán</p>
                  <p className="text-2xl font-extrabold text-sky-600 tracking-tight">{summary.capital.toLocaleString()}₫</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ProfitIcon />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lợi Nhuận</p>
                  <p className="text-2xl font-extrabold text-emerald-600 tracking-tight">+{summary.profit.toLocaleString()}₫</p>
                </div>
              </div>
            </div>

            {/* --- 3. ĐỒ THỊ RECHARTS --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 mb-6">
              
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-1">
                    Đồ thị diễn biến
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Chỉ số đang xem: <span className="text-teal-600 font-bold">{getChartLegendName()}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  {/* Đã xóa nút chọn đồ thị Thuế */}
                  {[
                    { key: "amount", label: "Doanh thu" },
                    { key: "capital", label: "Vốn hàng bán" },
                    { key: "profit", label: "Lợi nhuận" },
                    { key: "count", label: "Đơn hàng" },
                    { key: "quantity", label: "Sản phẩm" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedData(item.key)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedData === item.key 
                          ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60' 
                          : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transactionData} margin={{ right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toLocaleString()}k` : val}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontWeight: 600, padding: '12px' }}
                    formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value), getChartLegendName()]}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedData}
                    name={getChartLegendName()}
                    stroke={getChartColor()}
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#fff', stroke: getChartColor(), strokeWidth: 2 }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: getChartColor(), className: "shadow-lg" }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 p-16 rounded-2xl text-center max-w-[600px] mx-auto mt-12 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-teal-600/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Chưa có dữ liệu hiển thị</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Vui lòng chọn <span className="font-bold text-slate-700">Năm</span> (và Tháng nếu cần) ở bộ lọc phía trên, sau đó bấm <strong className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Xem số liệu</strong> để trích xuất báo cáo.
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default DashboardPage;