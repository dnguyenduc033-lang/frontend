import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Edit3, Trash2, Globe, Phone, MapPin, Search } from "lucide-react";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const isAdmin = ApiService.isAdmin();
  const isAdminOrManager = ApiService.isAdminOrManager();

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const responseData = await ApiService.getAllSuppliers();
        if (responseData.status === 200) {
          setSuppliers(responseData.suppliers);
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Lỗi khi lấy danh sách");
      }
    };
    getSuppliers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      try {
        await ApiService.deleteSupplier(supplierId);
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
        showMessage("Đã xóa nhà cung cấp thành công.");
      } catch (error) {
        showMessage("Lỗi khi xóa nhà cung cấp.");
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="w-full font-sans pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen text-slate-800">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00a884] tracking-tight mb-1">Các nhà cung cấp</h1>
              <p className="text-sm text-slate-500 font-medium">Quản lý mạng lưới đơn vị cung cấp thiết bị hệ thống.</p>
            </div>
          </div>
          {isAdminOrManager && (
            <button 
              className="bg-[#00a884] text-white font-bold h-[46px] px-6 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/add-supplier")}
            >
              <Plus size={18} strokeWidth={2.5} /> Thêm đối tác mới
            </button>
          )}
        </div>

        {/* SEARCH & STATS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm tên nhà cung cấp..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] transition-all text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang hợp tác:</span>
                <span className="text-xl font-black text-[#00a884]">{filteredSuppliers.length}</span>
            </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-100 text-teal-800 rounded-xl font-bold text-sm animate-fadeIn">
            {message}
          </div>
        )}

        {/* LISTING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div 
              key={supplier.id}
              onClick={() => navigate(`/supplier-detail/${supplier.id}`)}
              className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl hover:border-teal-100 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-[#00a884] transition-colors">
                    <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-700 group-hover:text-[#00a884] transition-colors">{supplier.name}</h3>
                  <div className="flex gap-4 mt-1">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1"><Phone size={12}/> Global Support</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={12}/> Verified Source</span>
                  </div>
                </div>
              </div>

              {isAdminOrManager && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    className="flex-1 sm:flex-none p-2.5 bg-slate-50 text-slate-600 hover:bg-teal-600 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-supplier/${supplier.id}`);
                    }}
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    className="flex-1 sm:flex-none p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer border border-rose-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSupplier(supplier.id);
                    }}
                    title="Xóa đối tác"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SupplierPage;