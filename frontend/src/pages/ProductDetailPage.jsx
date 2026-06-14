import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showSerials, setShowSerials] = useState(false);

  const canManage = ApiService.isAdminOrManager();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await ApiService.getProductById(productId);
        console.log("Dữ liệu Product từ Backend:", response?.product); 
        setProduct(response?.product || null);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        setMessage("Không thể lấy thông tin chi tiết của thiết bị này.");
      }
    };
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // ĐÃ ĐỒNG BỘ: Bóc tách Thông số kỹ thuật từ mảng product.specs của Java
  const groupedSpecs = React.useMemo(() => {
    if (!product || !product.specs || !Array.isArray(product.specs)) return {};
    
    return product.specs.reduce((acc, spec) => {
      const group = spec.groupName || "Thông số chung";
      if (!acc[group]) acc[group] = [];
      acc[group].push(spec);
      return acc;
    }, {});
  }, [product]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // ĐÃ ĐỒNG BỘ: Lấy danh sách item từ product.productItems của Java
  const currentItemsList = product?.productItems || [];

  const exportSerialsToExcel = () => {
    if (!currentItemsList || currentItemsList.length === 0) {
      alert("Không có dữ liệu mã máy sê-ri để xuất file!");
      return;
    }

    const dataToExport = currentItemsList.map((item, index) => ({
      "STT": index + 1,
      "Mã Số Sê-ri": item.serialNumber,
      "Tình Trạng Kho": item.status === 'AVAILABLE' ? "Sẵn sàng xuất" : "Đã xuất kho"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sach Seri");

    const safeFileName = product.name.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(workbook, `Danh_sach_Seri_${safeFileName}.xlsx`);
  };

  if (!product) {
    return (
      <Layout>
        <div className="w-full flex flex-col items-center justify-center py-20 font-['Poppins']">
          {message ? (
            <p className="text-rose-600 font-bold">{message}</p>
          ) : (
            <p className="text-slate-500 font-medium">Đang tải dữ liệu sản phẩm...</p>
          )}
          <button 
            className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            onClick={() => navigate("/product")}
          >
            Quay lại danh sách
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full font-['Poppins'] pb-10">
        <button
          type="button"
          onClick={() => navigate("/product")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00a884] mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>

        <div className="flex items-center gap-4 mb-8">
          
          {/* Icon Thẻ Thông Số */}
          <div className="w-14 h-14 bg-gradient-to-br from-[#00a884] to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white shrink-0">
            {/* Icon CPU/Microchip thể hiện phần cứng thiết bị */}
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          </div>

          {/* Khối chữ */}
          <div>
            <h1 className="text-[36px] font-black text-[#00a884] tracking-tight mb-1 leading-none">
              Thông tin chi tiết sản phẩm
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1.5">
              Quản lý thông số kỹ thuật và tình trạng lưu kho
            </p>
          </div>
          
        </div>

        {/* ========================================= */}
        {/* CONTAINER 1: ẢNH, GIÁ (TRÁI) VÀ THÔNG TIN (PHẢI) */}
        {/* ========================================= */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 md:p-6 lg:p-10 mb-8 flex flex-col xl:flex-row justify-between gap-10 items-start w-full">
          
          {/* CỘT TRÁI */}
          <div className="w-full xl:w-[430px] xl:min-w-[430px] shrink-0 flex flex-col gap-4">
            <div className="group w-full h-[360px] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-1 overflow-hidden relative shadow-inner">
               {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain block transition-transform duration-500 group-hover:scale-110 drop-shadow-sm" 
                />
              ) : (
                <span className="text-6xl opacity-50 transition-transform duration-500 group-hover:scale-110">🛠️</span>
              )}
              <span className="absolute top-3 left-3 bg-[#008080] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                {product.category?.name || "Chưa phân loại"}
              </span>
            </div>
            
            {/* Đơn giá */}
            <div className="w-full bg-teal-50 border border-teal-100 rounded-xl p-4 text-center shadow-sm">
              <p className="text-[10px] font-bold text-teal-800 uppercase tracking-widest mb-1 opacity-80">Đơn giá</p>
              <p className="text-xl font-black text-[#008080]">
                {product.price ? product.price.toLocaleString("vi-VN") : "0"} <span className="text-sm font-bold">đ</span>
              </p>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="w-full xl:max-w-[750px] flex flex-col">
            
            {/* Tiêu đề & SKU */}
            <div className="border-b border-slate-100 pb-5 mb-6">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 leading-snug">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mã SKU:</span>
                <span className="text-sm text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg font-mono font-semibold shadow-sm">
                  {product.sku}
                </span>
              </div>
            </div>

            {/* Lưới Thẻ Chỉ Số */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-2xl p-4 border border-slate-100 border-l-4 shadow-sm transition-colors ${product.stockQuantity <= (product.minStockLevel || 5) ? 'border-l-rose-500 bg-rose-50' : 'border-l-[#008080] bg-slate-50'}`}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tồn kho</p>
                <p className={`text-base font-black ${product.stockQuantity <= (product.minStockLevel || 5) ? 'text-rose-600' : 'text-slate-800'}`}>
                  {product.stockQuantity || 0} <span className="text-xs opacity-70">chiếc</span>
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 border-l-4 border-l-slate-300 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tồn tối thiểu</p>
                <p className="text-base font-black text-slate-800">
                  {product.minStockLevel || 5} <span className="text-xs opacity-70">chiếc</span>
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 border-l-4 border-l-amber-400 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bảo hành</p>
                <p className="text-base font-black text-slate-800">
                  {product.warrantyMonths || product.warrantyPeriod || 12} <span className="text-xs opacity-70">tháng</span>
                </p>
              </div>

              {/* VỊ TRÍ SẢN PHẨM */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 border-l-4 border-l-amber-500 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vị trí lưu kho</p>
                <p className="text-base font-black text-slate-800 uppercase tracking-wide">
                  {product.location || "Chưa xác định"}
                </p>
              </div>
            </div>

            {/* Mô tả thiết bị */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#008080] rounded-full"></span> Mô tả chi tiết
              </h3>
              <div className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                {product.description || "Chưa có thông tin mô tả chi tiết cho sản phẩm này."}
              </div>
            </div>

            {/* Khối nút hành động */}
            <div className="pt-2 flex flex-wrap gap-4">
              {canManage && (
                <button 
                  style={{ backgroundColor: "#1e293b", color: "#ffffff" }}
                  className="px-8 py-3.5 font-bold rounded-xl cursor-pointer text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                >
                  <span className="text-lg leading-none">✎</span> Sửa thông tin thiết bị
                </button>
              )}
              
              {/* NÚT BẤM TOGGLE */}
              <button 
                type="button"
                onClick={() => setShowSerials(!showSerials)}
                className={`px-8 py-3.5 font-bold rounded-xl cursor-pointer text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-white ${showSerials ? 'bg-rose-600' : 'bg-[#008080]'}`}
              >
                <span className="text-lg leading-none">{showSerials ? "✕" : "≣"}</span> 
                {showSerials ? "Đóng danh sách Seri" : "Xem danh sách mã Seri"}
              </button>
            </div>
          </div>
          
        </div>

        {/* ========================================================= */}
        {/* KHU VỰC CHỨA CONTAINER 2 (THÔNG SỐ) VÀ CONTAINER 3 (SERI) */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-6">
          
          {/* CONTAINER 2: THÔNG SỐ KỸ THUẬT */}
          {Object.keys(groupedSpecs).length > 0 && (
            <div className="w-full xl:w-[66%] bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-8 mb-8 relative overflow-hidden shrink-0">
              {/* Dải trang trí góc */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10"></div>
              
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1 h-5 bg-slate-800 rounded-full"></span> Thông số kỹ thuật
              </h3>
              
              {/* Khối chứa danh sách các nhóm thông số */}
              <div className="flex flex-col gap-4">
                {Object.keys(groupedSpecs).map((groupName) => (
                  <div key={groupName} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white transition-all duration-300">
                    
                    {/* Tiêu đề nhóm */}
                    <button 
                      type="button"
                      onClick={() => toggleGroup(groupName)}
                      className="w-full px-6 py-4 flex justify-between items-center bg-slate-50/80 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 text-[13px] uppercase tracking-wider">{groupName}</span>
                      <span className={`text-slate-400 font-bold text-sm transform transition-transform duration-300 ${expandedGroups[groupName] === false ? 'rotate-0' : 'rotate-180'}`}>
                        ▼
                      </span>
                    </button>

                    {/* Nội dung các thông số bên trong nhóm */}
                    {expandedGroups[groupName] !== false && (
                      <div className="border-t border-slate-200">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-slate-100">
                            {groupedSpecs[groupName].map((spec, index) => (
                              <tr key={spec.id || index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-teal-50/30 transition-colors`}>
                                <td className="px-6 py-3 font-bold text-slate-600 w-1/3 sm:w-1/4 border-r border-slate-100 text-[13px]">
                                  {spec.specKey}
                                </td>
                                <td className="px-6 py-3 text-slate-800 font-medium text-[13px] leading-relaxed">
                                  {spec.specValue}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTAINER 3: DANH SÁCH SERI */}
          {showSerials && (
            <div className="w-full xl:w-[32%] bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-8 shrink-0 animate-fade-in">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1 h-5 bg-[#008080] rounded-full"></span> Danh sách mã Seri
              </h3>

              {currentItemsList.length > 0 && (
                <div className="mb-4 w-full">
                  <button
                    type="button"
                    onClick={exportSerialsToExcel}
                    className="w-full px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📥</span> Xuất Excel danh sách mã
                  </button>
                </div>
              )}

              {/* Bảng chứa sê-ri lẻ hỗ trợ cuộn nội bộ */}
              <div className="max-h-[380px] overflow-y-auto overflow-x-auto custom-scrollbar pr-1">
                {currentItemsList.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs min-w-[350px]">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 text-slate-600 font-bold rounded-tl-xl w-[50px]">STT</th>
                        <th className="py-2.5 px-3 text-slate-600 font-bold">Mã Sê-ri lẻ</th>
                        <th className="py-2.5 px-3 text-slate-600 font-bold rounded-tr-xl w-[100px]">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentItemsList.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 font-medium">{index + 1}</td>
                          <td className="py-2.5 px-3 text-slate-800 font-bold font-mono tracking-wide">{item.serialNumber}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'AVAILABLE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-400 line-through'
                            }`}>
                              {item.status === 'AVAILABLE' ? "Sẵn kho" : "Đã xuất"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center bg-slate-50 rounded-xl">
                    <span className="text-3xl mb-2">📦</span>
                    <p className="text-xs font-semibold">Sản phẩm chưa có mã sê-ri nào.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </Layout>
  );
};

export default ProductDetailPage;