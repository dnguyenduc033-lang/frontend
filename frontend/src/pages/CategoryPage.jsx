import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom"; 

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
  </svg>
);

const CategoryPage = () => {
  const [activeTab, setActiveTab] = useState("CATEGORY"); // THÊM MỚI: Quản lý Tab
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // THÊM MỚI: Lưu danh sách hãng
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const canManage = ApiService.isAdminOrManager();

  // THÊM MỚI: State cho Modal Hãng
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
    fetchBrands(); // THÊM MỚI: Gọi API lấy hãng
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await ApiService.getAllCategory();
      if (response.status === 200) setCategories(response.categories || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tải danh mục");
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await ApiService.getAllBrands();
      if (response.status === 200) setBrands(response.brands || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tải hãng");
    }
  };

  // --- THÊM MỚI TOÀN BỘ CÁC HÀM XỬ LÝ HÃNG ---
  const openBrandModal = (brand = null) => {
    if (brand) {
      setEditingBrandId(brand.id);
      setBrandForm({ name: brand.name, description: brand.description || "" });
    } else {
      setEditingBrandId(null);
      setBrandForm({ name: "", description: "" });
    }
    setShowBrandModal(true);
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return showMessage("Tên hãng không được để trống!");
    try {
      if (editingBrandId) {
        await ApiService.updateBrand(editingBrandId, brandForm);
        showMessage("Cập nhật hãng thành công!");
      } else {
        await ApiService.createBrand(brandForm);
        showMessage("Thêm hãng mới thành công!");
      }
      setShowBrandModal(false);
      fetchBrands();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi lưu hãng");
    }
  };

  const deleteBrand = async (brandId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hãng này không?")) {
      try {
        await ApiService.deleteBrand(brandId);
        showMessage("Đã xóa hãng thành công");
        fetchBrands();
      } catch (error) {
        showMessage(error.response?.data?.message || "Lỗi khi xóa hãng");
      }
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      try {
        await ApiService.deleteCategory(categoryId);
        showMessage("Đã xóa danh mục thành công");
        setCategories(prev => prev.filter(c => c.id !== categoryId));
      } catch (error) {
        showMessage(error.response?.data?.message || "Lỗi khi xóa danh mục: " + error);
      }
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const renderSpecsPreview = (rawSpecs) => {
    if (!rawSpecs) return <span className="text-slate-400 italic text-[12px]">Chưa cấu hình thông số</span>;
    try {
      const groups = JSON.parse(rawSpecs);
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {groups.map((g, i) => (
            <span key={i} className="text-[11px] bg-teal-50 text-[#008080] border border-teal-100 px-2 py-0.5 rounded-md font-medium">
              {g.groupName} ({g.specs.length})
            </span>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-slate-400 text-[12px]">Thông số: {rawSpecs}</span>;
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 font-sans bg-[#f4f7f9] min-h-screen text-slate-800 w-full">
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#008080] to-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#008080] to-emerald-500 tracking-tight mb-1.5">
                Danh Mục Sản Phẩm
              </h1>
              <p className="text-sm text-slate-500 font-medium">Thiết lập phân loại cấu hình động hệ thống</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {canManage && activeTab === "CATEGORY" && (
              <button onClick={() => navigate("/category/add")} className="px-5 py-2.5 bg-[#008080] hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2">
                ➕ Thêm danh mục mới
              </button>
            )}
            {canManage && activeTab === "BRAND" && (
              <button onClick={() => openBrandModal()} className="px-5 py-2.5 bg-[#008080] hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2">
                ➕ Thêm hãng mới
              </button>
            )}
          </div>
        </div>

        {message && <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl text-center mb-6 text-sm border border-emerald-200 font-semibold shadow-sm animate-fadeIn">{message}</div>}

        {/* --- KHU VỰC ĐIỀU HƯỚNG TAB --- */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
            <button onClick={() => setActiveTab("CATEGORY")} className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors border-b-2 ${activeTab === "CATEGORY" ? "bg-white text-[#008080] border-[#008080]" : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100"}`}>
                Danh mục thiết bị ({categories.length})
            </button>
            <button onClick={() => setActiveTab("BRAND")} className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors border-b-2 ${activeTab === "BRAND" ? "bg-white text-[#008080] border-[#008080]" : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100"}`}>
                Hãng sản xuất ({brands.length})
            </button>
        </div>

        {/* --- NỘI DUNG TAB DANH MỤC --- */}
        {activeTab === "CATEGORY" && (
            <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <div className="flex justify-between items-center p-5 bg-white hover:bg-slate-50/40" key={category.id}>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-slate-700 tracking-wide">{category.name}</span>
                        </div>
                        {canManage && (
                          <div className="flex items-center gap-1">
                              <button className="p-2 text-teal-600" onClick={() => navigate(`/category/edit/${category.id}`)}><EditIcon /></button>
                              <button className="p-2 text-red-600" onClick={() => deleteCategory(category.id)}><TrashIcon /></button>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>
        )}

        {/* --- NỘI DUNG TAB HÃNG SẢN XUẤT --- */}
        {activeTab === "BRAND" && (
            <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                  {brands.map((brand) => (
                    <div className="flex justify-between items-center p-5 bg-white hover:bg-slate-50/40" key={brand.id}>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700 tracking-wide">{brand.name}</span>
                            {brand.description && <span className="text-xs text-slate-400 mt-0.5">{brand.description}</span>}
                        </div>
                        {canManage && (
                          <div className="flex items-center gap-1">
                              <button className="p-2 text-orange-600" onClick={() => openBrandModal(brand)}><EditIcon /></button>
                              <button className="p-2 text-red-600" onClick={() => deleteBrand(brand.id)}><TrashIcon /></button>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>
        )}

        {/* --- MODAL (POPUP) THÊM / SỬA HÃNG SẢN XUẤT --- */}
        {showBrandModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-700 text-lg">{editingBrandId ? "Sửa Hãng" : "Thêm Hãng"}</h3>
                <button onClick={() => setShowBrandModal(false)} className="text-slate-400 hover:text-red-500 font-bold">&times;</button>
              </div>
              <form onSubmit={handleSaveBrand} className="p-6 flex flex-col gap-4">
                <input type="text" required className="w-full p-3 border rounded-xl" placeholder="Tên hãng..." value={brandForm.name} onChange={(e) => setBrandForm({...brandForm, name: e.target.value})} />
                <textarea className="w-full p-3 border rounded-xl" rows={3} placeholder="Mô tả..." value={brandForm.description} onChange={(e) => setBrandForm({...brandForm, description: e.target.value})} />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setShowBrandModal(false)} className="flex-1 p-3 rounded-xl bg-slate-100">Hủy</button>
                  <button type="submit" className="flex-1 p-3 rounded-xl text-white bg-[#008080]">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;