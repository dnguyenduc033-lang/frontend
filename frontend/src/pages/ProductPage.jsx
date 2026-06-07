import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";
import { Package, Plus, Search, SlidersHorizontal, AlertTriangle, Eye, Trash2 } from "lucide-react"; // Import bộ icon hiện đại

const ProductPage = () => {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState([]);   
  const [suppliers, setSuppliers] = useState([]); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");      
  const [selectedSupplier, setSelectedSupplier] = useState(""); 
  const [selectedPriceRange, setSelectedPriceRange] = useState(""); 
  const [filteredProducts, setFilteredProducts] = useState([]); 

  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const navigate = useNavigate();
  const isAdmin = ApiService.isAdmin();

  const brands = ["Apple", "Samsung", "Xiaomi", "Lenovo", "Acer", "Asus"];

  const priceOptions = [
    { value: "1m_to_5m", label: "1.000.000đ - 5.000.000đ" },
    { value: "5m_to_10m", label: "5.000.000đ - 10.000.000đ" },
    { value: "10m_to_20m", label: "10.000.000đ - 20.000.000đ" },
    { value: "over_20m", label: "Trên 20.000.000đ" },
    { value: "sort_asc", label: "Thấp đến cao" },
    { value: "sort_desc", label: "Cao xuống thấp" }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        
        let pList = [];
        if (Array.isArray(productData)) {
          pList = productData; 
        } else if (productData) {
          pList = productData.products || productData.content || productData.data || []; 
        }
        
        setAllProducts(pList);
        setFilteredProducts(pList); 

        const catData = await ApiService.getAllCategory();
        setCategories(catData?.categories || []);

        if (typeof ApiService.getAllSuppliers === 'function') {
          const supData = await ApiService.getAllSuppliers();
          setSuppliers(supData?.suppliers || supData || []);
        }

      } catch (error) {
        console.error("Lỗi dòng nạp dữ liệu: ", error);
        setMessage("Không thể đồng bộ dữ liệu từ máy chủ ứng dụng.");
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    if (searchTerm.trim() !== "") {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(lowSearch)) ||
        (p.sku && p.sku.toLowerCase().includes(lowSearch))
      );
    }

    if (selectedCategory && selectedCategory !== "") {
      result = result.filter(p => {
        const catId = p.categoryId ? p.categoryId : (p.category ? p.category.id : null);
        if (!catId) return false; 
        return catId.toString() === selectedCategory.toString();
      });
    }

    if (selectedBrand && selectedBrand !== "") {
      result = result.filter(p => {
        const hasMatchingSpecBrand = p.specs && p.specs.some(s => 
          (s.specKey === "Hãng" || s.specKey === "Hãng sản xuất") && 
          s.specValue && s.specValue.toLowerCase() === selectedBrand.toLowerCase()
        );
        return hasMatchingSpecBrand || (p.name && p.name.toLowerCase().includes(selectedBrand.toLowerCase()));
      });
    }

    if (selectedSupplier && selectedSupplier !== "") {
      result = result.filter(p => {
        const supId = p.supplierId ? p.supplierId : (p.supplier ? p.supplier.id : null);
        if (!supId) return false;
        return supId.toString() === selectedSupplier.toString();
      });
    }

    if (selectedPriceRange && selectedPriceRange !== "") {
      if (!selectedPriceRange.startsWith("sort")) {
        // Xử lý Lọc giá
        result = result.filter(p => {
          const price = p.price || 0;
          switch (selectedPriceRange) {
            case "1m_to_5m": return price >= 1000000 && price <= 5000000;
            case "5m_to_10m": return price > 5000000 && price <= 10000000;
            case "10m_to_20m": return price > 10000000 && price <= 20000000;
            case "over_20m": return price > 20000000;
            default: return true;
          }
        });
      } else {
        // Xử lý Sắp xếp giá
        if (selectedPriceRange === "sort_asc") {
          result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (selectedPriceRange === "sort_desc") {
          result.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
      }
    }

    setFilteredProducts(result);
    setCurrentPage(1); 
  // Đã xóa biến selectedSort ra khỏi mảng phụ thuộc này
  }, [searchTerm, selectedCategory, selectedBrand, selectedSupplier, selectedPriceRange, allProducts]);
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn gỡ bỏ hoàn toàn thiết bị này?")) {
      try {
        const res = await ApiService.deleteProduct(productId);
        if (res.status === 200) {
          setMessage("Đã gỡ bỏ thiết bị thành công.");
          const updated = allProducts.filter(p => p.id !== productId);
          setAllProducts(updated);
          setTimeout(() => setMessage(""), 3000);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || "Lỗi khi yêu cầu xóa thiết bị.");
        setTimeout(() => setMessage(""), 4000);
      }
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout>
      <div className="w-full font-sans pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen text-slate-800">
        
        {/* === TIÊU ĐỀ TRANG CHUẨN PREMIUM (GIỐNG ẢNH MẪU 100%) === */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            {/* Khối Icon nền xanh mọng nước tiệp màu chữ tiêu đề */}
            <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00a884] tracking-tight mb-1">
                Quản Lý Sản Phẩm
              </h1>
              <p className="text-sm text-slate-500 font-medium">Tra cứu định danh, thông số và vị trí lưu trữ nội bộ.</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              className="bg-[#00a884] text-white font-bold h-[46px] px-6 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,168,132,0.15)] text-sm cursor-pointer whitespace-nowrap flex items-center gap-2"
              onClick={() => navigate("/add-product")}
            >
              <Plus size={18} strokeWidth={2.5} /> Thêm thiết bị mới
            </button>
          )}
        </div>

        {/* THÔNG BÁO HỆ THỐNG */}
        {message && (
          <div className="mb-8 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl font-bold shadow-sm text-sm flex items-center gap-3 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            {message}
          </div>
        )}

        {/* --- KHỐI BỘ LỌC & TÌM KIẾM TÂN TRANG --- */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 p-6 mb-10 flex flex-col gap-5">
          
          {/* Hàng 1: Tìm kiếm & Đếm số lượng */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:flex-1 group">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a884] transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tên thiết bị, mã SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] transition-all text-sm text-slate-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl flex items-center justify-center gap-3 w-full md:w-auto shrink-0 shadow-inner">
              <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> TỔNG KẾT QUẢ:
              </span>
              <span className="text-lg font-black text-[#00a884]">{filteredProducts.length}</span>
            </div>
          </div>

          {/* Hàng 2: Dropdowns bộ lọc thông minh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Lọc Danh mục */}
            <div className="relative">
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-600 font-bold transition-all cursor-pointer appearance-none pr-10"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Tất cả nhóm thiết bị --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>

            {/* 2. Lọc Hãng */}
            <div className="relative">
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-600 font-bold transition-all cursor-pointer appearance-none pr-10"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">-- Tất cả các hãng --</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>

            {/* 3. Lọc Nhà cung cấp */}
            <div className="relative">
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-600 font-bold transition-all cursor-pointer appearance-none pr-10"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">-- Tất cả nhà cung cấp --</option>
                {suppliers.length > 0 && suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>

            <div className="relative">
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-600 font-bold transition-all cursor-pointer appearance-none pr-10"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
              >
                <option value="">-- Tất cả mức giá --</option>
                {priceOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>
            
          </div>
        </div>

        {/* --- KHỐI CARDS THIẾT KẾ PREMIUM --- */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentItems.map((product) => {
              const isLowStock = product.stockQuantity <= (product.minStockLevel || 5);
              
              return (
                <div 
                  key={product.id} 
                  className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div>
                    {/* Vùng chứa Ảnh chân thực */}
                    <div className="w-full h-44 bg-slate-50/80 rounded-xl flex items-center justify-center overflow-hidden mb-4 border border-slate-100 relative shadow-inner">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-300">
                          <Package size={36} className="opacity-40" />
                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Danh mục sản phẩm */}
                    <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] uppercase tracking-wider rounded-md mb-2 border border-teal-100/30">
                      {product.category?.name || "Thiết bị/Linh kiện"}
                    </span>
                    
                    {/* Tên sản phẩm */}
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-3 group-hover:text-[#00a884] transition-colors leading-snug" title={product.name}>
                      {product.name}
                    </h3>

                    {/* Thanh Trạng thái Tồn kho */}
                    <div className="bg-slate-50 rounded-lg p-2.5 mb-4 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                          Tồn kho:
                        </span>
                        <span className={`font-bold text-sm ${isLowStock ? 'text-rose-600' : 'text-slate-700'}`}>
                          {product.stockQuantity} <span className="text-[10px] text-slate-400 font-normal">mục</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Giá tiền và Nút bấm */}
                  <div className="mt-auto border-t border-slate-50 pt-3">
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn giá định mức</span>
                      <span className="text-lg font-black text-slate-800">
                        {product.price ? product.price.toLocaleString("vi-VN") : "0"}<span className="text-xs font-bold ml-0.5">₫</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {/* Nút Chi tiết */}
                      <button 
                        className={`py-2 px-3 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-[#00a884] hover:border-[#00a884] rounded-xl font-bold text-xs shadow-sm hover:shadow-[0_4px_12px_rgba(0,168,132,0.12)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${isAdmin ? 'flex-[2]' : 'w-full'}`}
                        onClick={() => navigate(`/product-detail/${product.id}`)}
                      >
                        <Eye size={14} /> Chi tiết
                      </button>

                      {/* Nút Xóa (Chỉ Admin) */}
                      {isAdmin && (
                        <button 
                          className="flex-1 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center" 
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Xóa thiết bị"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TRẠNG THÁI KHÔNG TÌM THẤY KẾT QUẢ */
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-[600px] mx-auto mt-12 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <AlertTriangle size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Hệ thống đang trống</h3>
            <p className="text-slate-400 font-medium text-sm">
              Không tìm thấy thiết bị phần cứng nào khớp với bộ lọc dữ liệu hiện tại.
            </p>
          </div>
        )}

        {/* --- PHÂN TRANG --- */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductPage;