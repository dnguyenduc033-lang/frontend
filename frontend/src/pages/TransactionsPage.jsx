import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";
import {
  ArrowLeftRight, Search, Calendar, Package, SlidersHorizontal,
  CheckCircle2, Clock, AlertTriangle, XCircle, Truck, Ban, Download
} from "lucide-react";
import * as XLSX from "xlsx";

const typeOptions = [
  { value: "", label: "-- Tất cả loại giao dịch --" },
  { value: "PURCHASE", label: "Nhập kho" },
  { value: "SALE", label: "Xuất kho" },
  { value: "RETURN_TO_SUPPLIER", label: "Trả hàng NCC" },
  { value: "CUSTOMER_RETURN", label: "Khách trả hàng" },
];

const statusOptions = [
  { value: "", label: "-- Tất cả trạng thái --" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "PENDING", label: "Đang xử lý" },
  { value: "PROCESSING", label: "Đang tiến hành" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "WAITING_DELIVERY", label: "Chờ giao hàng" },
  { value: "SUPPLIER_REJECTED", label: "NCC từ chối" },
];

const sortOptions = [
  { value: "", label: "-- Sắp xếp mặc định --" },
  { value: "date_desc", label: "Mới nhất trước" },
  { value: "date_asc", label: "Cũ nhất trước" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "price_asc", label: "Giá thấp đến cao" },
];

const formatDateInput = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseDdMmYyyy = (value) => {
  if (!value || value.length !== 10) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-600 font-bold transition-all cursor-pointer appearance-none pr-10"
      value={value}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value || "all"} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
  </div>
);

const FilterDateInput = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
      {label}
    </label>
    <div className="relative">
      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/yyyy"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(formatDateInput(e.target.value))}
        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-600 font-bold transition-all"
      />
    </div>
  </div>
);

const TransactionsPage = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await ApiService.getAllTransactions(0, 500, "");
        const data = response?.data ? response.data : response;

        if (data && (data.status === 200 || data.status === "200")) {
          const list = data.transactions || [];
          setAllTransactions(list);
          setFilteredTransactions(list);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || "Lỗi tải danh sách giao dịch.");
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = [...allTransactions];

    if (searchTerm.trim() !== "") {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter((t) =>
        String(t.id).includes(lowSearch) ||
        (t.description && t.description.toLowerCase().includes(lowSearch)) ||
        (t.note && t.note.toLowerCase().includes(lowSearch)) ||
        (t.transactionType && t.transactionType.toLowerCase().includes(lowSearch)) ||
        (t.status && t.status.toLowerCase().includes(lowSearch))
      );
    }

    if (selectedType) {
      result = result.filter((t) => t.transactionType === selectedType);
    }

    if (selectedStatus) {
      result = result.filter((t) => t.status === selectedStatus);
    }

    const from = parseDdMmYyyy(fromDate);
    if (from) {
      from.setHours(0, 0, 0, 0);
      result = result.filter((t) => t.createdAt && new Date(t.createdAt) >= from);
    }

    const to = parseDdMmYyyy(toDate);
    if (to) {
      to.setHours(23, 59, 59, 999);
      result = result.filter((t) => t.createdAt && new Date(t.createdAt) <= to);
    }

    if (selectedSort === "date_desc") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (selectedSort === "date_asc") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (selectedSort === "price_desc") {
      result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    } else if (selectedSort === "price_asc") {
      result.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    } else {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    setFilteredTransactions(result);
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedStatus, selectedSort, fromDate, toDate, allTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const navigateToTransactionDetailsPage = (id) => {
    if (!id) return;
    navigate(`/transaction-detail/${id}`);
  };

  const translateType = (type) => {
    if (type === "PURCHASE") return "Nhập kho";
    if (type === "SALE" || type === "SELL") return "Xuất kho";
    if (type === "RETURN_TO_SUPPLIER" || type === "RETURN") return "Trả hàng NCC";
    if (type === "CUSTOMER_RETURN") return "Khách trả hàng";
    return type;
  };

  const translateStatus = (status) => {
    const labels = {
      COMPLETED: "Hoàn thành",
      PENDING: "Đang xử lý",
      PROCESSING: "Đang tiến hành",
      CANCELLED: "Đã hủy",
      WAITING_DELIVERY: "Chờ giao hàng",
      SUPPLIER_REJECTED: "NCC từ chối",
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const exportToExcel = () => {
    if (!filteredTransactions.length) {
      alert("Không có dữ liệu để xuất file Excel!");
      return;
    }

    const dataToExport = filteredTransactions.map((t, index) => ({
      STT: index + 1,
      "Mã GD": t.id,
      "Loại giao dịch": translateType(t.transactionType),
      "Trạng thái": translateStatus(t.status),
      "Tổng giá trị (VNĐ)": t.totalPrice ? Number(t.totalPrice) : 0,
      "Số lượng SP": t.totalProducts || 0,
      "Mô tả": t.description || "",
      "Ghi chú": t.note || "",
      "Thời gian tạo": formatDateTime(t.createdAt),
      "Cập nhật lúc": formatDateTime(t.updateAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Giao dich");

    const dateStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Danh_sach_Giao_dich_${dateStamp}.xlsx`);
  };

  const getTypeBadgeClass = (type) => {
    if (type === "PURCHASE") return "bg-sky-50 text-sky-700 border border-sky-200/60";
    if (type === "SALE" || type === "SELL") return "bg-teal-50 text-teal-700 border border-teal-200/60";
    return "bg-amber-50 text-amber-700 border border-amber-200/60";
  };

  const renderStatusBadge = (status) => {
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          <CheckCircle2 size={13} className="shrink-0" />
          Hoàn thành
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
          <Clock size={13} className="shrink-0" />
          Đang xử lý
        </span>
      );
    }
    if (status === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/50">
          <Clock size={13} className="shrink-0" />
          Đang tiến hành
        </span>
      );
    }
    if (status === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/50">
          <XCircle size={13} className="shrink-0" />
          Đã hủy
        </span>
      );
    }
    if (status === "WAITING_DELIVERY") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/50">
          <Truck size={13} className="shrink-0" />
          Chờ giao hàng
        </span>
      );
    }
    if (status === "SUPPLIER_REJECTED") {
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
        {message && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center mb-6 border border-rose-200 font-semibold shadow-sm animate-fadeIn">
            {message}
          </div>
        )}

        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
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

        {/* Bộ lọc — cùng layout với trang Sản phẩm */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 p-6 mb-10 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:flex-1 group">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a884] transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm mã GD, mô tả, ghi chú..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] transition-all text-sm text-slate-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl flex items-center justify-center gap-3 w-full md:w-auto shrink-0 shadow-inner">
              <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> TỔNG KẾT QUẢ:
              </span>
              <span className="text-lg font-black text-[#00a884]">{filteredTransactions.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FilterSelect
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typeOptions}
            />
            <FilterSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />
            <FilterSelect
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              options={sortOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterDateInput
              label="Từ ngày"
              value={fromDate}
              onChange={setFromDate}
            />
            <FilterDateInput
              label="Đến ngày"
              value={toDate}
              onChange={setToDate}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-emerald-600 text-white font-bold h-[42px] px-5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(5,150,105,0.2)] text-sm cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <Download size={16} strokeWidth={2.5} />
              Xuất Excel ({filteredTransactions.length})
            </button>
          </div>
        </div>

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
                {currentItems.length > 0 ? (
                  currentItems.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="p-4 pl-6 font-bold text-slate-700 text-sm">
                        <span className="text-slate-400 font-medium font-mono">#</span>{transaction.id}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeBadgeClass(transaction.transactionType)}`}>
                          {translateType(transaction.transactionType)}
                        </span>
                      </td>
                      <td className="p-4">{renderStatusBadge(transaction.status)}</td>
                      <td className="p-4 font-extrabold text-[#00a884] text-base">
                        {transaction.totalPrice ? Number(transaction.totalPrice).toLocaleString("vi-VN") : 0}
                        <span className="text-xs font-bold ml-0.5">₫</span>
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Package size={14} className="text-slate-400" />
                          {transaction.totalProducts || 0} mục
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Calendar size={13} className="text-slate-400" />
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "---"}
                        </span>
                      </td>
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

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
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
