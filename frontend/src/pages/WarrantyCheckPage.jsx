import React, { useState } from "react";
import ApiService from "../service/ApiService";
import Layout from "../component/Layout"; 
import { ShieldCheck, Search, Calendar, Package, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const WarrantyCheckPage = () => {
  const [serialNumber, setSerialNumber] = useState("");
  const [warrantyData, setWarrantyData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    setLoading(true);
    setError("");
    setWarrantyData(null);

    try {
      const response = await ApiService.checkWarranty(serialNumber);
      
      // 🌟 GIỮ NGUYÊN BIẾN GỐC: Bóc lớp vỏ bọc 'productItem' từ Backend của bạn
      if (response && response.productItem) {
        setWarrantyData(response.productItem);
      } else if (response && (response.data || response.warranty)) {
        setWarrantyData(response.data || response.warranty);
      } else {
        setWarrantyData(response); 
      }
      
    } catch (err) {
      setError(
        err.response?.data?.message || "Không tìm thấy thông tin bảo hành cho số Serial này."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🌟 GIỮ NGUYÊN HÀM FORMAT TIẾNG VIỆT GỐC CỦA BẠN
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xuất kho";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 font-sans bg-[#f4f7f9] min-h-screen text-slate-800">
        <div className="max-w-3xl mx-auto">
          
          {/* === TIÊU ĐỀ TRANG PREMIUM === */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#00a884] tracking-tight mb-1">
                  Tra Cứu Bảo Hành
                </h1>
                <p className="text-sm text-slate-500 font-medium">Kiểm tra thời hạn, trạng thái thiết bị và lịch sử xuất kho</p>
              </div>
            </div>
          </div>

          {/* KHỐI TÌM KIẾM TÂN TRANG */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 mb-8">
            <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a884] transition-colors" />
                <input
                  type="text"
                  placeholder="Nhập số Serial / IMEI sản phẩm..."
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] transition-all text-sm text-slate-700 font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00a884] text-white font-bold h-[46px] px-8 rounded-xl hover:bg-teal-700 active:scale-95 disabled:bg-slate-300 transition-all shadow-[0_4px_12px_rgba(0,168,132,0.15)] text-sm cursor-pointer whitespace-nowrap flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Kiểm Tra"
                )}
              </button>
            </form>
            {error && (
              <div className="text-rose-500 mt-4 font-semibold flex items-center gap-1.5 text-sm animate-fadeIn">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          {/* KHỐI KẾT QUẢ HIỂN THỊ CHUẨN XÁC CHỐNG CRASH */}
          {warrantyData && (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-6 relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00a884]"></div>
              
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                <Package size={20} className="text-[#00a884]" /> Thông Tin Hồ Sơ Sản Phẩm
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số Serial / IMEI</span>
                  {/* Đảm bảo hiển thị chuẩn xác mã số serial từ object của bạn */}
                  <span className="text-base font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block self-start">
                    {warrantyData.serialNumber}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng Thái Vận Hành</span>
                  <div>
                    {warrantyData.status === 'SOLD' || warrantyData.status === 'Đã bán' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
                        <Clock size={13} /> Đã xuất bán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <CheckCircle2 size={13} /> Đang lưu kho
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Calendar size={13}/> Ngày Thực Hiện Đơn (Xuất kho)</span>
                  {/* Hiển thị chuẩn xác ngày xuất kho bằng hàm định dạng của bạn */}
                  <span className="text-base font-bold text-slate-700">
                    {formatDate(warrantyData.soldDate)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời Hạn Bảo Hành Quy Định</span>
                  <span className="text-base font-extrabold text-[#00a884]">
                    {warrantyData.warrantyMonths || 0} Tháng
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WarrantyCheckPage;