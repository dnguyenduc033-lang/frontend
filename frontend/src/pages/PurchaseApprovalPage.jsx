import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { ShieldCheck, Check, X, Clock } from "lucide-react";

const STATUS_LABEL = {
  AWAITING_APPROVAL: { label: "Chờ duyệt",     color: "bg-amber-100 text-amber-700 border-amber-200" },
  APPROVED:          { label: "Đã duyệt",       color: "bg-blue-100 text-blue-700 border-blue-200" },
  REJECTED:          { label: "Từ chối",         color: "bg-rose-100 text-rose-700 border-rose-200" },
  WAITING_DELIVERY:  { label: "Chờ giao hàng",  color: "bg-sky-100 text-sky-700 border-sky-200" },
  SUPPLIER_REJECTED: { label: "NCC từ chối",     color: "bg-rose-100 text-rose-700 border-rose-200" },
  COMPLETED:         { label: "Hoàn thành",      color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const PurchaseApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await ApiService.getAllPurchaseRequests();
      setRequests(res.purchaseRequests || []);
    } catch {
      showMessage("Lỗi khi tải danh sách yêu cầu.", "error");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận duyệt yêu cầu này và gửi email cho nhà cung cấp?")) return;
    try {
      const res = await ApiService.approvePurchaseRequest(id);
      showMessage(res.message, "success");
      fetchRequests();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi duyệt yêu cầu.", "error");
    }
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

  const pending = requests.filter(r => r.status === "AWAITING_APPROVAL");
  const others  = requests.filter(r => r.status !== "AWAITING_APPROVAL");

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

        {pending.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-amber-500" />
              <h3 className="text-base font-black text-slate-700">Đang chờ duyệt ({pending.length})</h3>
            </div>
            <div className="flex flex-col gap-3">
              {pending.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
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
                    <div className="flex gap-3 items-start shrink-0">
                      <button onClick={() => handleApprove(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">
                        <Check size={16} /> Duyệt
                      </button>
                      <button onClick={() => { setRejectingId(r.id); setRejectReason(""); }} className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">
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

        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRejectingId(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black text-slate-800 mb-4">Lý do từ chối</h3>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 text-sm resize-none"
                rows={4}
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setRejectingId(null)} className="flex-1 p-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer">Hủy</button>
                <button onClick={handleReject} className="flex-1 p-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors cursor-pointer">Xác nhận từ chối</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default PurchaseApprovalPage;