import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { ShieldCheck, Check, X, Clock, Search, Calendar, SlidersHorizontal, Loader2 } from "lucide-react";

const STATUS_LABEL = {
  AWAITING_APPROVAL: { label: "Chờ duyệt",     color: "bg-amber-100 text-amber-700 border-amber-200" },
  APPROVED:          { label: "Đã duyệt",       color: "bg-blue-100 text-blue-700 border-blue-200" },
  REJECTED:          { label: "Từ chối",         color: "bg-rose-100 text-rose-700 border-rose-200" },
  WAITING_DELIVERY:  { label: "Chờ giao hàng",  color: "bg-sky-100 text-sky-700 border-sky-200" },
  SUPPLIER_REJECTED: { label: "NCC từ chối",     color: "bg-rose-100 text-rose-700 border-rose-200" },
  COMPLETED:         { label: "Hoàn thành",      color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const statusOptions = [
  { value: "", label: "-- Tất cả trạng thái --" },
  { value: "AWAITING_APPROVAL", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "WAITING_DELIVERY", label: "Chờ giao hàng" },
  { value: "SUPPLIER_REJECTED", label: "NCC từ chối" },
  { value: "COMPLETED", label: "Hoàn thành" },
];

const sortOptions = [
  { value: "date_desc", label: "Mới nhất trước" },
  { value: "date_asc", label: "Cũ nhất trước" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "qty_desc", label: "Số lượng cao đến thấp" },
  { value: "qty_asc", label: "Số lượng thấp đến cao" },
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
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-sm text-slate-600 font-bold transition-all cursor-pointer appearance-none pr-10"
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
        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-sm text-slate-600 font-bold transition-all"
      />
    </div>
  </div>
);

const PurchaseApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSort, setSelectedSort] = useState("date_desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [approving, setApproving] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    const isModalOpen = approveConfirm || rejectingId;
    if (!isModalOpen) return;

    document.body.classList.add("user-modal-open");
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("user-modal-open");
      document.body.style.overflow = "";
    };
  }, [approveConfirm, rejectingId]);

  useEffect(() => {
    let result = [...requests];

    if (searchTerm.trim() !== "") {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter((r) =>
        String(r.id).includes(lowSearch) ||
        (r.productName && r.productName.toLowerCase().includes(lowSearch)) ||
        (r.supplierName && r.supplierName.toLowerCase().includes(lowSearch)) ||
        (r.createdByName && r.createdByName.toLowerCase().includes(lowSearch)) ||
        (r.note && r.note.toLowerCase().includes(lowSearch))
      );
    }

    if (selectedStatus) {
      result = result.filter((r) => r.status === selectedStatus);
    }

    const from = parseDdMmYyyy(fromDate);
    if (from) {
      from.setHours(0, 0, 0, 0);
      result = result.filter((r) => r.createdAt && new Date(r.createdAt) >= from);
    }

    const to = parseDdMmYyyy(toDate);
    if (to) {
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => r.createdAt && new Date(r.createdAt) <= to);
    }

    if (selectedSort === "date_desc") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (selectedSort === "date_asc") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (selectedSort === "price_desc") {
      result.sort((a, b) => (Number(b.purchasePrice) || 0) - (Number(a.purchasePrice) || 0));
    } else if (selectedSort === "price_asc") {
      result.sort((a, b) => (Number(a.purchasePrice) || 0) - (Number(b.purchasePrice) || 0));
    } else if (selectedSort === "qty_desc") {
      result.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
    } else if (selectedSort === "qty_asc") {
      result.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredRequests(result);
  }, [searchTerm, selectedStatus, selectedSort, fromDate, toDate, requests]);

  const fetchRequests = async () => {
    try {
      const res = await ApiService.getAllPurchaseRequests();
      const list = res.purchaseRequests || [];
      setRequests(list);
      setFilteredRequests(list);
    } catch {
      showMessage("Lỗi khi tải danh sách yêu cầu.", "error");
    }
  };

  const confirmApprove = async () => {
    if (!approveConfirm) return;

    setApproving(true);
    try {
      if (approveConfirm.mode === "single") {
        const res = await ApiService.approvePurchaseRequest(approveConfirm.id);
        showMessage(res.message, "success");
        setSelectedIds((prev) => prev.filter((itemId) => itemId !== approveConfirm.id));
      } else {
        const res = await ApiService.bulkApprovePurchaseRequests(selectedIds);
        showMessage(res.message, "success");
        setSelectedIds([]);
      }
      setApproveConfirm(null);
      fetchRequests();
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          (approveConfirm.mode === "single" ? "Lỗi khi duyệt yêu cầu." : "Lỗi khi duyệt hàng loạt."),
        "error"
      );
    } finally {
      setApproving(false);
    }
  };

  const openBulkApproveModal = () => {
    if (selectedIds.length === 0) {
      showMessage("Vui lòng chọn ít nhất một yêu cầu để duyệt.", "error");
      return;
    }
    setApproveConfirm({ mode: "bulk" });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { showMessage("Vui lòng nhập lý do từ chối.", "error"); return; }
    try {
      const res = await ApiService.rejectPurchaseRequest(rejectingId, rejectReason);
      showMessage(res.message, "success");
      setRejectingId(null);
      setRejectReason("");
      fetchRequests();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi từ chối yêu cầu.", "error");
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const msgStyle = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error:   "bg-rose-50 text-rose-700 border-rose-200",
    info:    "bg-blue-50 text-blue-700 border-blue-200",
  };

  const pending = filteredRequests.filter(r => r.status === "AWAITING_APPROVAL");
  const others  = filteredRequests.filter(r => r.status !== "AWAITING_APPROVAL");
  const hasActiveFilter = searchTerm || selectedStatus || fromDate || toDate || selectedSort !== "date_desc";

  useEffect(() => {
    const pendingIdSet = new Set(
      requests.filter((r) => r.status === "AWAITING_APPROVAL").map((r) => r.id)
    );
    setSelectedIds((prev) => prev.filter((id) => pendingIdSet.has(id)));
  }, [requests]);

  const toggleSelectAllPending = () => {
    const pendingIds = pending.map((r) => r.id);
    const allSelected = pendingIds.length > 0 && pendingIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : pendingIds);
  };

  const approveTarget = approveConfirm?.mode === "single"
    ? pending.find((r) => r.id === approveConfirm.id)
    : null;

  return (
    <Layout>
      <div className="p-4 md:p-8 bg-[#f4f7f9] min-h-screen font-['Poppins']">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-rose-500">Duyệt Yêu Cầu Nhập Hàng</h2>
            <p className="text-sm text-slate-500 mt-1">Xem xét và phê duyệt các yêu cầu từ Manager</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border text-sm font-semibold ${msgStyle[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 p-6 mb-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:flex-1 group">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, nhà cung cấp, manager, ghi chú..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm text-slate-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl flex items-center justify-center gap-3 w-full md:w-auto shrink-0 shadow-inner">
              <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> TỔNG KẾT QUẢ:
              </span>
              <span className="text-lg font-black text-rose-500">{filteredRequests.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {pending.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                <h3 className="text-base font-black text-slate-700">Đang chờ duyệt ({pending.length})</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    checked={pending.length > 0 && pending.every((r) => selectedIds.includes(r.id))}
                    onChange={toggleSelectAllPending}
                    disabled={approving}
                  />
                  Chọn tất cả
                </label>
                <button
                  type="button"
                  onClick={openBulkApproveModal}
                  disabled={approving || selectedIds.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {approving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Duyệt hàng loạt ({selectedIds.length})
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {pending.map(r => (
                <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-6 transition-colors ${selectedIds.includes(r.id) ? "border-emerald-300 ring-2 ring-emerald-100" : "border-amber-100"}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        disabled={approving}
                      />
                      <div className="flex flex-col gap-1">
                      <p className="text-lg font-black text-slate-800">{r.productName}</p>
                      <p className="text-sm text-slate-500">Nhà cung cấp: <span className="font-semibold text-slate-700">{r.supplierName}</span>
                        {r.supplierEmail ? <span className="text-teal-600 ml-1">({r.supplierEmail})</span> : <span className="text-rose-400 ml-1">(Chưa có email)</span>}
                      </p>
                      <p className="text-sm text-slate-500">Số lượng: <span className="font-bold text-slate-700">{r.quantity} chiếc</span></p>
                      <p className="text-sm text-slate-500">Đơn giá: <span className="font-bold text-slate-700">{Number(r.purchasePrice).toLocaleString()} VNĐ</span></p>
                      {r.note && <p className="text-sm text-slate-500">Ghi chú: {r.note}</p>}
                      <p className="text-xs text-slate-400 mt-1">Tạo bởi: {r.createdByName} — {new Date(r.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start shrink-0">
                      <button
                        onClick={() => setApproveConfirm({ mode: "single", id: r.id })}
                        disabled={approving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Check size={16} /> Duyệt
                      </button>
                      <button
                        onClick={() => { setRejectingId(r.id); setRejectReason(""); }}
                        disabled={approving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <X size={16} /> Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <h3 className="text-base font-black text-slate-700 mb-4">Lịch sử ({others.length})</h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nhà cung cấp</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">SL</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Manager</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ngày duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {others.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{r.productName}</td>
                      <td className="p-4 text-sm text-slate-600">{r.supplierName}</td>
                      <td className="p-4 text-sm font-bold">{r.quantity}</td>
                      <td className="p-4 text-sm text-slate-600">{r.createdByName}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-black border ${STATUS_LABEL[r.status]?.color}`}>
                          {STATUS_LABEL[r.status]?.label || r.status}
                        </span>
                        {r.status === "REJECTED" && r.rejectReason && (
                          <p className="text-xs text-rose-500 mt-1">Lý do: {r.rejectReason}</p>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
            <ShieldCheck size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Chưa có yêu cầu nhập hàng nào.</p>
          </div>
        )}

        {requests.length > 0 && filteredRequests.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
            <Search size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Không tìm thấy yêu cầu phù hợp với bộ lọc.</p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("");
                  setSelectedSort("date_desc");
                  setFromDate("");
                  setToDate("");
                }}
                className="mt-4 text-sm font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {approveConfirm && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-transparent"
            onClick={() => !approving && setApproveConfirm(null)}
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/80" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Check size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                {approveConfirm.mode === "single" ? "Xác nhận duyệt yêu cầu" : "Xác nhận duyệt hàng loạt"}
              </h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                {approveConfirm.mode === "single"
                  ? "Bạn có chắc muốn duyệt yêu cầu này? Hệ thống sẽ gửi email cho nhà cung cấp."
                  : `Bạn có chắc muốn duyệt ${selectedIds.length} yêu cầu đã chọn? Hệ thống sẽ gửi email cho từng nhà cung cấp.`}
              </p>

              {approveTarget && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 text-sm space-y-1.5">
                  <p className="font-bold text-slate-800">{approveTarget.productName}</p>
                  <p className="text-slate-500">Nhà cung cấp: <span className="font-semibold text-slate-700">{approveTarget.supplierName}</span></p>
                  <p className="text-slate-500">Số lượng: <span className="font-semibold text-slate-700">{approveTarget.quantity} chiếc</span></p>
                  <p className="text-slate-500">Manager: <span className="font-semibold text-slate-700">{approveTarget.createdByName}</span></p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setApproveConfirm(null)}
                  disabled={approving}
                  className="flex-1 p-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmApprove}
                  disabled={approving}
                  className="flex-1 p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {approving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Xác nhận duyệt
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {rejectingId && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-transparent"
            onClick={() => setRejectingId(null)}
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/80" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black text-slate-800 mb-4">Lý do từ chối</h3>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-sm resize-none"
                rows={4}
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setRejectingId(null)} className="flex-1 p-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer">Hủy</button>
                <button onClick={handleReject} className="flex-1 p-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors cursor-pointer">Xác nhận từ chối</button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </Layout>
  );
};

export default PurchaseApprovalPage;
