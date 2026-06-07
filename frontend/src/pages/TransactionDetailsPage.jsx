import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
// 🌟 CHỈ DÙNG CÁC ICON ĐÃ CHỨNG MINH LÀ AN TOÀN TRONG DỰ ÁN CỦA BẠN
import { 
  FileText, 
  Package, 
  User, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Calendar,
  Hash 
} from "lucide-react";

const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getTransaction = async () => {
      if (!transactionId || transactionId === "undefined") {
        console.warn("Chờ tham số ID giao dịch hợp lệ từ URL...");
        return;
      }

      try {
        setLoading(true);
        // LOGIC GIỮ NGUYÊN 100% NHƯ CŨ
        const response = await ApiService.getTransactionById(transactionId);
        const data = response?.data ? response.data : response;

        if (data && data.transaction) {
            setTransaction(data.transaction);
            
            setMessage(""); 
        } else {
            setMessage(data?.message || "Không tìm thấy dữ liệu giao dịch.");
        }
      } catch (error) {
        console.error("Lỗi kết nối API chi tiết đơn:", error);
        setMessage(
          error.response?.data?.message || "Hệ thống không thể kết nối tới máy chủ API."
        );
      } finally {
        setLoading(false);
      }
    };

    getTransaction();
  }, [transactionId]);

  const translateType = (type) => {
    if (type === 'PURCHASE') return 'Nhập kho';
    if (type === 'SALE' || type === 'SELL') return 'Xuất kho';            
    if (type === 'RETURN_TO_SUPPLIER' || type === 'RETURN') return 'Trả hàng';
    return type; 
  };

  const getTypeBadgeClass = (type) => {
    if (type === 'PURCHASE') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (type === 'SALE' || type === 'SELL') return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const renderStatusBadge = (statusValue) => {
    if (statusValue === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          <CheckCircle2 size={16} /> Hoàn thành
        </span>
      );
    }
    if (statusValue === 'PENDING' || statusValue === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
          <Clock size={16} /> Đang xử lý
        </span>
      );
    }
    if (statusValue === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-rose-50 text-rose-600 border border-rose-200/50">
          <XCircle size={16} /> Đã hủy
        </span>
      );
    }
    return <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200">{statusValue}</span>;
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 font-sans bg-[#f4f7f9] min-h-screen text-slate-800">
        
        {message && (
          <div className={`p-4 rounded-xl text-center mb-6 font-bold shadow-sm ${message.includes("thành công") ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}>
            {message}
          </div>
        )}

        {/* === TIÊU ĐỀ TRANG PREMIUM === */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate("/transaction")} 
              className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:text-[#00a884] hover:border-[#00a884] hover:shadow-md transition-all shrink-0"
              title="Quay lại danh sách"
            >
              {/* SVG thuần an toàn tuyệt đối thay thế ArrowLeft */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <FileText size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00a884] tracking-tight mb-1">
                Chi Tiết Giao Dịch
              </h1>
              <p className="text-sm text-slate-500 font-medium">Xem hồ sơ chứng từ và thông tin chi tiết</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00a884] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải dữ liệu hồ sơ...</p>
          </div>
        ) : transaction ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* CỘT TRÁI: THÔNG TIN CHỨNG TỪ & CẬP NHẬT TRẠNG THÁI */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* KHỐI 1: THÔNG TIN CHỨNG TỪ */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <FileText size={120} />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#00a884]">
                    <FileText size={18} />
                  </span>
                  Hồ Sơ Chứng Từ
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mã Giao Dịch</p>
                    <p className="text-base font-extrabold text-slate-700">#{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={14}/> Thời Gian Tạo</p>
                    <p className="text-base font-bold text-slate-700">
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("vi-VN") : "---"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loại Nghiệp Vụ</p>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getTypeBadgeClass(transaction.transactionType)}`}>
                      {translateType(transaction.transactionType)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={14}/> Trạng Thái Hiện Tại</p>
                    {renderStatusBadge(transaction.status)}
                  </div>
                  <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú / Mô tả</p>
                    <p className="text-sm font-medium text-slate-700 italic">
                      {transaction.description ? `"${transaction.description}"` : "Không có ghi chú cho giao dịch này."}
                    </p>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between p-4 bg-teal-50/50 rounded-xl border border-teal-100/50 mt-2">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng Giá Trị:</p>
                    <p className="text-2xl font-black text-[#00a884]">
                      {transaction.totalPrice ? Number(transaction.totalPrice).toLocaleString("vi-VN") : 0}<span className="text-lg ml-1">₫</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
            
            {/* KHỐI 2: DANH SÁCH SERIAL */}
            {transaction.productItems && transaction.productItems.length > 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                    <Hash size={18} />
                  </span>
                  Danh Sách Mã Serial / IMEI Giao Dịch
                  <span className="ml-auto text-xs font-bold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-lg border border-violet-100">
                    {transaction.productItems.length} chiếc
                  </span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {transaction.productItems.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono border bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {item.serialNumber}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center py-8 text-slate-400">
                <p className="text-sm font-medium">Không tìm thấy mã sê-ri riêng lẻ đính kèm cho giao dịch này.</p>
              </div>
            )}

            {/* CỘT PHẢI: NGƯỜI THỰC HIỆN & THÔNG TIN SẢN PHẨM */}
            <div className="space-y-6">
              
              {/* KHỐI 3: THÔNG TIN NGƯỜI THỰC HIỆN (Bảo vệ object cẩn thận) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <User size={18} />
                  </span>
                  Người Thực Hiện
                </h2>
                
                {transaction.user && typeof transaction.user === 'object' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                      {transaction.user.avatarUrl || transaction.user.imageUrl ? (
                        <img src={transaction.user.avatarUrl || transaction.user.imageUrl} alt={transaction.user.name || "User"} className="w-full h-full object-cover" />
                      ) : (
                        <User size={28} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">{transaction.user.name || "Nhân viên hệ thống"}</p>
                      <p className="text-sm text-slate-500 font-medium">{transaction.user.email || transaction.user.phoneNumber || "---"}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                        {transaction.user.role || "Nhân Sự"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Hệ thống Auto</p>
                      <p className="text-xs text-slate-500 font-medium">Không ghi nhận chi tiết tài khoản</p>
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 4: THÔNG TIN SẢN PHẨM */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <Package size={18} />
                  </span>
                  Thiết Bị Giao Dịch
                </h2>

                {transaction.product && typeof transaction.product === 'object' ? (
                  <div className="flex flex-col gap-5">
                    {/* Ảnh sản phẩm */}
                    <div className="w-full h-40 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                      {transaction.product.imageUrl ? (
                        <img 
                          src={transaction.product.imageUrl} 
                          alt={transaction.product.name || "Product"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-300">
                          {/* SVG Icon Hình ảnh thuần */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tên thiết bị</p>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{transaction.product.name || "Chưa xác định"}</p>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mã SKU</p>
                          <p className="text-sm font-bold text-indigo-600 font-mono">{transaction.product.sku || "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số lượng</p>
                          <p className="text-sm font-bold text-slate-800">{transaction.totalProducts || 1} <span className="text-xs text-slate-500 font-medium">chiếc</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Package size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Không đính kèm dữ liệu sản phẩm</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold text-slate-600">Không tìm thấy hồ sơ giao dịch</p>
            <p className="text-sm mt-1">Dữ liệu có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;