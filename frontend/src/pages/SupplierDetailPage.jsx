import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { Building2, ArrowLeft, Phone, MapPin, Mail, ShieldCheck } from "lucide-react";

const SupplierDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSupplierDetail = async () => {
      try {
        const response = await ApiService.getSupplierById(id);
        if (response.status === 200) {
          setSupplier(response.supplier);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải thông tin nhà cung cấp.");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierDetail();
  }, [id]);

  return (
    <Layout>
      <div className="w-full font-sans pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen text-slate-800">
        
        {/* NÚT QUAY LẠI */}
        <button 
          onClick={() => navigate("/supplier")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00a884] mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại danh sách
        </button>

        {loading ? (
          <div className="text-center py-10 font-bold text-slate-400">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl font-bold text-sm">{error}</div>
        ) : supplier ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
            
            {/* BANNER HEADER */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#00a884] flex items-center justify-center border border-teal-100">
                <Building2 size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">{supplier.name}</h1>
                  <ShieldCheck size={18} className="text-[#00a884]" title="Đối tác xác minh" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Mã nhà cung cấp: #{supplier.id}</p>
              </div>
            </div>

            {/* THÔNG TIN CHI TIẾT ĐÃ ĐƯỢC LÀM SẠCH */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg mt-0.5"><Mail size={16} /></div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Thư điện tử (Email)</span>
                    <span className="text-sm font-semibold text-slate-700">{supplier.email || "Chưa cập nhật"}</span>
                  </div>
                </div>

                {/* Thông tin liên hệ / Số điện thoại */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg mt-0.5"><Phone size={16} /></div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin liên hệ</span>
                    <span className="text-sm font-semibold text-slate-700">{supplier.contactInfo || supplier.phone || "Chưa cập nhật"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Địa chỉ trụ sở */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg mt-0.5"><MapPin size={16} /></div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ trụ sở</span>
                    <span className="text-sm font-semibold text-slate-700">{supplier.address || "Chưa cập nhật"}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </Layout>
  );
};

export default SupplierDetailPage;