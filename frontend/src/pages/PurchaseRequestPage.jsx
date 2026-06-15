import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { ClipboardList, Plus, X, Check, Clock, XCircle, PackageCheck, ScanBarcode } from "lucide-react";
import ScannerModal from "../component/ScannerModal";

const STATUS_LABEL = {
  AWAITING_APPROVAL: { label: "Chờ duyệt",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  APPROVED:          { label: "Đã duyệt",        color: "bg-blue-100 text-blue-700 border-blue-200" },
  REJECTED:          { label: "Từ chối",          color: "bg-rose-100 text-rose-700 border-rose-200" },
  WAITING_DELIVERY:  { label: "Chờ giao hàng",   color: "bg-sky-100 text-sky-700 border-sky-200" },
  SUPPLIER_REJECTED: { label: "NCC từ chối",      color: "bg-rose-100 text-rose-700 border-rose-200" },
  COMPLETED:         { label: "Hoàn thành",       color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const PurchaseRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [note, setNote] = useState("");

  const [completingRequest, setCompletingRequest] = useState(null);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [currentSerial, setCurrentSerial] = useState("");

  // THÊM MỚI TỪ ĐÂY
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanSuccess = (decodedSerial) => {
    const val = decodedSerial.trim();
    if (val && !serialNumbers.includes(val)) {
      if (serialNumbers.length < completingRequest.quantity) {
        setSerialNumbers(prev => [...prev, val]);
      } else {
        showMessage("Đã đủ số lượng serial!", "error");
      }
    } else if (serialNumbers.includes(val)) {
      showMessage("Mã Seri này đã được quét!", "error");
    }
  };
  // ĐẾN ĐÂY

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [reqRes, prodRes, supRes] = await Promise.all([
        ApiService.getMyPurchaseRequests(),
        ApiService.getAllProducts(),
        ApiService.getAllSuppliers()
      ]);
      setRequests(reqRes.purchaseRequests || []);
      setProducts(prodRes.products || []);
      setSuppliers(supRes.suppliers || []);
    } catch (error) {
      showMessage("Lỗi khi tải dữ liệu.", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiService.createPurchaseRequest({
        productId: Number(productId),
        supplierId: Number(supplierId),
        quantity: parseInt(quantity),
        purchasePrice: parseFloat(purchasePrice),
        note
      });
      showMessage(res.message, "success");
      setShowCreateForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tạo yêu cầu.", "error");
    }
  };

  const handleSerialKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = currentSerial.trim();
      if (val && !serialNumbers.includes(val)) {
        if (serialNumbers.length < completingRequest.quantity) {
          setSerialNumbers([...serialNumbers, val]);
          setCurrentSerial("");
        } else {
          showMessage("Đã đủ số lượng serial!", "error");
        }
      }
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showMessage("Đang đọc file Excel...", "info");
      const extracted = await ApiService.extractSerialsFromExcel(file);
      if (extracted && extracted.length > 0) {
        const unique = [...new Set([...serialNumbers, ...extracted])];
        setSerialNumbers(unique);
        showMessage(`Đã tải ${extracted.length} mã Serial thành công!`, "success");
      }
    } catch {
      showMessage("Lỗi khi đọc file Excel.", "error");
    } finally {
      e.target.value = null;
    }
  };

  const handleComplete = async () => {
    if (serialNumbers.length !== completingRequest.quantity) {
      showMessage(`Cần đúng ${completingRequest.quantity} serial. Hiện có ${serialNumbers.length}.`, "error");
      return;
    }
    try {
      const res = await ApiService.completePurchaseRequest(completingRequest.id, serialNumbers);
      showMessage(res.message, "success");
      setCompletingRequest(null);
      setSerialNumbers([]);
      fetchData();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi hoàn tất nhập kho.", "error");
    }
  };

  const resetForm = () => {
    setProductId(""); setSupplierId(""); setQuantity(""); setPurchasePrice(""); setNote("");
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

  return (
    <Layout>
      <div className="p-4 md:p-8 bg-[#f4f7f9] min-h-screen font-['Poppins']">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00a884] to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ClipboardList size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#00a884]">Yêu Cầu Nhập Hàng</h2>
              <p className="text-sm text-slate-500 mt-1">Tạo và theo dõi phiếu yêu cầu nhập kho</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#00a884] hover:bg-teal-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={18} /> Tạo yêu cầu mới
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border text-sm font-semibold ${msgStyle[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {requests.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nhà cung cấp</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">SL</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-slate-400">#{r.id}</td>
                    <td className="p-4 text-sm font-semibold text-slate-700">{r.productName}</td>
                    <td className="p-4 text-sm text-slate-600">{r.supplierName}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{r.quantity}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black border ${STATUS_LABEL[r.status]?.color}`}>
                        {STATUS_LABEL[r.status]?.label || r.status}
                      </span>
                      {r.status === "REJECTED" && r.rejectReason && (
                        <p className="text-xs text-rose-500 mt-1">Lý do: {r.rejectReason}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-center">
                      {r.status === "WAITING_DELIVERY" && (
                        <button
                          onClick={() => { setCompletingRequest(r); setSerialNumbers([]); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer mx-auto"
                        >
                          <PackageCheck size={14} /> Nhập kho
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Chưa có yêu cầu nhập hàng nào.</p>
            </div>
          )}
        </div>

        {/* Modal tạo yêu cầu */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreateForm(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800">Tạo yêu cầu nhập hàng</h3>
                <button onClick={() => setShowCreateForm(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-1.5 block">Sản phẩm <span className="text-red-500">*</span></label>
                  <select className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00a884] text-sm bg-white cursor-pointer" value={productId} onChange={e => setProductId(e.target.value)} required>
                    <option value="">---Chọn sản phẩm---</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-1.5 block">Nhà cung cấp <span className="text-red-500">*</span></label>
                  <select className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00a884] text-sm bg-white cursor-pointer" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                    <option value="">---Chọn nhà cung cấp---</option>
                    {/* Đã xóa phần hiển thị email ở dòng dưới này, chỉ giữ lại tên s.name */}
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 block">Số lượng <span className="text-red-500">*</span></label>
                    <input 
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00a884] text-sm" 
                      type="text" 
                      inputMode="numeric"
                      value={quantity} 
                      // Chặn mọi ký tự không phải là số ngay lúc gõ
                      onChange={e => setQuantity(e.target.value.replace(/[^0-9]/g, ''))} 
                      required 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 block">Đơn giá (VNĐ) <span className="text-red-500">*</span></label>
                    <input 
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00a884] text-sm" 
                      type="text" 
                      inputMode="numeric"
                      value={purchasePrice} 
                      // Chặn mọi ký tự không phải là số ngay lúc gõ
                      onChange={e => setPurchasePrice(e.target.value.replace(/[^0-9]/g, ''))} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-1.5 block">Ghi chú</label>
                  <input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00a884] text-sm" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Yêu cầu đặc biệt nếu có..." />
                </div>
                <button type="submit" className="mt-2 p-3 bg-[#00a884] hover:bg-teal-600 text-white font-bold rounded-xl transition-colors cursor-pointer">
                  Gửi yêu cầu
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal nhập serial khi hàng về */}
        {completingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setCompletingRequest(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Hoàn tất nhập kho</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{completingRequest.productName} — {completingRequest.quantity} chiếc</p>
                </div>
                <button onClick={() => setCompletingRequest(null)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-600">Nhập mã Serial/IMEI <span className="text-red-500">*</span></label>
                  <div>
                    <input type="file" id="serial-excel" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                    <label htmlFor="serial-excel" className="bg-teal-500 text-white px-4 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-teal-600 font-bold flex items-center gap-1.5">
                      📁 Tải file Excel
                    </label>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl min-h-[80px] flex flex-wrap gap-2 focus-within:border-[#00a884]">
                  {serialNumbers.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {s}
                      <button type="button" onClick={() => setSerialNumbers(serialNumbers.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-bold">&times;</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[150px] outline-none text-sm bg-transparent p-1"
                    placeholder="Quét hoặc nhập mã Serial rồi Enter..."
                    value={currentSerial}
                    onChange={e => setCurrentSerial(e.target.value)}
                    onKeyDown={handleSerialKeyDown}
                    disabled={serialNumbers.length >= completingRequest.quantity}
                  />
                  {/* THÊM NÚT NÀY VÀO DƯỚI THẺ INPUT */}
                  <button 
                    type="button" 
                    onClick={() => setIsScannerOpen(true)}
                    disabled={serialNumbers.length >= completingRequest.quantity}
                    className="p-1.5 ml-auto text-teal-600 hover:bg-teal-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Sử dụng Camera để quét mã"
                  >
                    <ScanBarcode size={22} strokeWidth={2.5} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  Đã nhập: <span className={serialNumbers.length === completingRequest.quantity ? "text-emerald-600" : "text-[#00a884]"}>{serialNumbers.length}</span> / {completingRequest.quantity}
                </p>
                <button
                  onClick={handleComplete}
                  disabled={serialNumbers.length !== completingRequest.quantity}
                  className="mt-2 p-3 bg-[#00a884] hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Xác nhận nhập kho
                </button>
              </div>
            </div>
          </div>
        )}

        {/* THÊM KHỐI NÀY VÀO CUỐI */}
        <ScannerModal 
          isOpen={isScannerOpen} 
          onClose={() => setIsScannerOpen(false)} 
          onScanSuccess={handleScanSuccess} 
        />

      </div>
    </Layout>
  );
};

export default PurchaseRequestPage;