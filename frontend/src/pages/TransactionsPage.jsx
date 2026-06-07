import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";
import { ArrowLeftRight, Search, Calendar, Package, FileText, CheckCircle2, Clock, AlertTriangle, XCircle, Truck, Ban } from "lucide-react"; // Import bộ icon hiện đại

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [valueToSearch, setValueToSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await ApiService.getAllTransactions(
          currentPage - 1,
          itemsPerPage,
          valueToSearch
        );

        const data = response?.data ? response.data : response;

        if (data && (data.status === 200 || data.status === "200")) {
          let allTransactions = data.transactions || [];
          if (typeFilter !== "ALL") {
            allTransactions = allTransactions.filter(t => t.transactionType === typeFilter);
          }
          setTotalPages(data.totalPages || Math.ceil(allTransactions.length / itemsPerPage));
          setTransactions(allTransactions);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Lỗi tải danh sách giao dịch: " + error
        );
      }
    };

    getTransactions();
  }, [currentPage, valueToSearch, typeFilter ]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    setValueToSearch(filter);
  };

  const navigateToTransactionDetailsPage = (id) => {
    if (!id) {
      console.error("Lỗi: ID giao dịch truyền vào bị rỗng!");
      return;
    }
    navigate(`/transaction-detail/${id}`);
  };

  const translateType = (type) => {
    if (type === 'PURCHASE') return 'Nhập kho';
    if (type === 'SALE' || type === 'SELL') return 'Xuất kho';            
    if (type === 'RETURN_TO_SUPPLIER' || type === 'RETURN') return 'Trả hàng NCC';
    if (type === 'CUSTOMER_RETURN') return 'Khách trả hàng';
    return type; 
  };

  // Trả về class màu sắc hiện đại cho từng loại giao dịch
  const getTypeBadgeClass = (type) => {
    if (type === 'PURCHASE') return 'bg-sky-50 text-sky-700 border border-sky-200/60';
    if (type === 'SALE' || type === 'SELL') return 'bg-teal-50 text-teal-700 border border-teal-200/60';
    return 'bg-amber-50 text-amber-700 border border-amber-200/60';
  };

  // Render Badge Trạng thái kèm Icon trực quan
  const renderStatusBadge = (status) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          <CheckCircle2 size={13} className="shrink-0" />
          Hoàn thành
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
          <Clock size={13} className="shrink-0" />
          Đang xử lý
        </span>
      );
    }
    if (status === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/50">
          <Clock size={13} className="shrink-0" />
          Đang tiến hành
        </span>
      );
    }
    if (status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/50">
          <XCircle size={13} className="shrink-0" />
          Đã hủy
        </span>
      );
    }
    if (status === 'WAITING_DELIVERY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/50">
          <Truck size={13} className="shrink-0" />
          Chờ giao hàng
        </span>
      );
    }
    if (status === 'SUPPLIER_REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
          <Ban size={13} className="shrink-0" />
          NCC từ chối
        </span>
      );
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 font-sans bg-[#f4f7f9] min-h-screen text-slate-800">
        
        {/* LỚP THÔNG BÁO LỖI NẾU CÓ */}
        {message && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center mb-6 border border-rose-200 font-semibold shadow-sm animate-fadeIn">
            {message}
          </div>
        )}

        {/* === TIÊU ĐỀ TRANG CHUẨN PREMIUM (GIỐNG ẢNH MẪU 100%) === */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Khối Icon nền xanh mọng nước tiệp màu chữ tiêu đề */}
            <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <ArrowLeftRight size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00a884] tracking-tight mb-1">
                Danh Sách Giao Dịch
              </h1>
              <p className="text-sm text-slate-500 font-medium">Quản lý lịch sử phân loại, biến động nhập xuất hệ thống</p>
            </div>
          </div>
        </div>

        {/* --- KHỐI BỘ LỌC & TÌM KIẾM HIỆN ĐẠI --- */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 mb-8 flex flex-col gap-4">
          {/* Hàng 1: icon + form tìm kiếm */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#00a884] shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 leading-tight">Bộ lọc giao dịch</h2>
                <p className="text-xs text-slate-400 font-medium">Tìm kiếm thông tin đơn hàng</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-80 group">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a884] transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] transition-all text-sm text-slate-700 font-medium"
                  placeholder="Tìm kiếm mã đơn, loại, trạng thái..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  type="text"
                />
              </div>
              <button
                type="submit"
                className="bg-[#00a884] text-white font-bold h-[42px] px-6 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,168,132,0.15)] text-sm cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Hàng 2: Bộ lọc theo loại giao dịch */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Loại:</span>
            {[
              { key: "ALL",                 label: "Tất cả",       color: "bg-slate-700 text-white border-slate-700",   inactive: "bg-white text-slate-500 border-slate-200 hover:border-slate-400" },
              { key: "PURCHASE",            label: "Nhập kho",     color: "bg-sky-500 text-white border-sky-500",        inactive: "bg-white text-slate-500 border-slate-200 hover:border-sky-300" },
              { key: "SALE",                label: "Xuất kho",     color: "bg-teal-500 text-white border-teal-500",      inactive: "bg-white text-slate-500 border-slate-200 hover:border-teal-300" },
              { key: "RETURN_TO_SUPPLIER",  label: "Trả hàng NCC", color: "bg-amber-500 text-white border-amber-500",    inactive: "bg-white text-slate-500 border-slate-200 hover:border-amber-300" },
              { key: "CUSTOMER_RETURN",     label: "Khách trả",    color: "bg-rose-500 text-white border-rose-500",      inactive: "bg-white text-slate-500 border-slate-200 hover:border-rose-300" },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => { setTypeFilter(item.key); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide border transition-all cursor-pointer
                  ${typeFilter === item.key ? item.color : item.inactive}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {/* --- KHỐI BẢNG DỮ LIỆU ENTERPRISE --- */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="p-4 pl-6 text-slate-500 font-bold uppercase text-xs tracking-wider w-24">Mã GD</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-xs tracking-wider">Loại Giao Dịch</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-xs tracking-wider">Trạng Thái</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-xs tracking-wider">Tổng Giá Trị</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-xs tracking-wider">Sản phẩm</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-xs tracking-wider">Thời gian tạo</th>
                  <th className="p-4 pr-6 text-slate-500 font-bold uppercase text-xs tracking-wider text-center w-36">Thao Tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Mã GD */}
                      <td className="p-4 pl-6 font-bold text-slate-700 text-sm">
                        <span className="text-slate-400 font-medium font-mono">#</span>{transaction.id}
                      </td>
                      
                      {/* Loại giao dịch */}
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeBadgeClass(transaction.transactionType)}`}>
                          {translateType(transaction.transactionType)}
                        </span>
                      </td>
                      
                      {/* Trạng thái */}
                      <td className="p-4">
                        {renderStatusBadge(transaction.status)}
                      </td>
                      
                      {/* Tổng Tiền */}
                      <td className="p-4 font-extrabold text-[#00a884] text-base">
                        {transaction.totalPrice ? Number(transaction.totalPrice).toLocaleString("vi-VN") : 0}<span className="text-xs font-bold ml-0.5">₫</span>
                      </td>
                      
                      {/* Số lượng sản phẩm */}
                      <td className="p-4 text-slate-600 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Package size={14} className="text-slate-400" />
                          {transaction.totalProducts || 0} mục
                        </span>
                      </td>
                      
                      {/* Ngày Tạo */}
                      <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Calendar size={13} className="text-slate-400" />
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("vi-VN", {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : "---"}
                        </span>
                      </td>

                      {/* Nút Xem chi tiết */}
                      <td className="p-4 pr-6 text-center">
                        <button 
                          type="button"
                          className="w-full bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-[#00a884] hover:border-[#00a884] px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(0,168,132,0.15)] active:scale-95 cursor-pointer"
                          onClick={() => navigateToTransactionDetailsPage(transaction.id)}
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-400 font-medium bg-slate-50/20">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertTriangle size={32} className="text-slate-300" />
                        <p className="text-sm">Không tìm thấy bản ghi dữ liệu giao dịch nào hợp lệ.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- KHỐI PHÂN TRANG CHUYÊN NGHIỆP --- */}
        {totalPages > 0 && (
          <div className="mt-8 flex justify-end">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default TransactionsPage;