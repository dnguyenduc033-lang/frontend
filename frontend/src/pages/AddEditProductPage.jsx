import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

// 🌟 BỔ SUNG 1: Danh sách các Hãng sản xuất (Bạn có thể thêm/bớt tùy ý)
const BRANDS = [
  "Dell", "HP", "Lenovo", "Asus", "Acer", 
  "Apple", "Xiaomi", "Gigabyte", "Samsung", "LG", 
  "Sony", "Logitech", "Khác"
];

const LOCATIONS = [];
for (let tang = 1; tang <= 3; tang++) {
  LOCATIONS.push(`Kệ 1 - Tầng ${tang}`);
  LOCATIONS.push(`Kệ 2 - Tầng ${tang}`);
  LOCATIONS.push(`Kệ 3 - Tầng ${tang}`);
}

const AddEditProductPage = () => {
  const { productId } = useParams();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0); 
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [minStockLevel, setMinStockLevel] = useState(5);

  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("");
  const [specValues, setSpecValues] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getAllCategory();
        setCategories(categoriesData.categories || []);
      } catch (error) {
        showMessage("Lỗi khi tải danh sách danh mục: " + error);
      }
    };

    const fetchProductById = async () => {
      if (productId) {
        setIsEditing(true);
        try {
          const productData = await ApiService.getProductById(productId);
          if (productData.status === 200) {
            const p = productData.product;
            setName(p.name || "");
            setSku(p.sku || "");
            setPrice(p.price || "");
            setStockQuantity(p.stockQuantity || 0);
            setCategoryId(p.categoryId || "");
            setDescription(p.description || "");
            setImageUrl(p.imageUrl || "");
            setWarrantyMonths(p.warrantyMonths || 12);
            setMinStockLevel(p.minStockLevel || 5);
            setLocation(p.location || "");
            
            if (p.specs) {
              const loadedSpecs = {};
              p.specs.forEach(s => {
                if (s.specKey === "Hãng" || s.specKey === "Hãng sản xuất") {
                  setBrand(s.specValue || "");
                } else {
                  loadedSpecs[s.specKey] = s.specValue || "";
                }
              });
              setSpecValues(loadedSpecs);
            }
          }
        } catch (error) {
          showMessage("Lỗi tải sản phẩm: " + error);
        }
      }
    };

    fetchCategories();
    if (productId) fetchProductById();
  }, [productId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result); 
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
    setSpecValues({}); 
  };

  const handleValueChange = (specKey, value) => {
    setSpecValues(prev => ({ ...prev, [specKey]: value }));
  };

  const currentCategory = categories.find(c => c.id.toString() === categoryId.toString());
  let parsedTemplateGroups = [];
  if (currentCategory && currentCategory.requiredSpecs) {
    try {
      parsedTemplateGroups = JSON.parse(currentCategory.requiredSpecs);
    } catch (e) {
      const oldKeys = currentCategory.requiredSpecs.split(",").map(k => k.trim()).filter(Boolean);
      parsedTemplateGroups = [{ groupName: "Thông số kỹ thuật", specs: oldKeys }];
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !name.trim() || !sku || !sku.trim() || !price || !categoryId || !brand || !brand.trim() || !location || !location.trim() || (!isEditing && !imageFile)) {
      setMessage("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc và tải lên hình ảnh thiết bị khi thêm mới!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const formattedSpecs = [];
    formattedSpecs.push({
      groupName: "Thông tin chung",
      specKey: "Hãng",
      specValue: brand.trim()
    });

    if (parsedTemplateGroups && parsedTemplateGroups.length > 0) {
      parsedTemplateGroups.forEach(group => {
        if (group && group.specs) {
          group.specs.forEach(key => {
            if (key === "Hãng" || key === "Hãng sản xuất") return; 
            const value = specValues[key];
            if (value && value.trim() !== "") {
              formattedSpecs.push({
                groupName: group.groupName || "Thông số kỹ thuật",
                specKey: key,
                specValue: value.trim()
              });
            }
          });
        }
      });
    }

    // Trích xuất ID trực tiếp từ đường dẫn URL của trình duyệt
    const urlParts = window.location.pathname.split("/");
    const safeProductId = urlParts[urlParts.length - 1];
    const parsedId = safeProductId ? parseInt(safeProductId) : null;

    const productDTO = {
      id: isEditing ? parsedId : null,
      productId: isEditing ? parsedId : null, 
      name: name.trim(),
      sku: sku.trim(),
      price: parseFloat(price),
      stockQuantity: isEditing ? parseInt(stockQuantity) : 0, 
      categoryId: parseInt(categoryId),
      description: description ? description.trim() : "",
      location: location.trim(),
      warrantyMonths: parseInt(warrantyMonths) || 12,
      minStockLevel: parseInt(minStockLevel) || 5,
      specs: formattedSpecs,
      productItems: null 
    };

    try {
      if (isEditing) {
        await ApiService.updateProduct(imageFile, productDTO);
        setMessage("Cập nhật sản phẩm thành công 🤩");
      } else {
        await ApiService.addProduct(imageFile, productDTO);
        setMessage("Lưu sản phẩm thành công 🤩");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/product"), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định";
      setMessage("❌ Lỗi khi lưu sản phẩm: " + errorMsg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-3.5 rounded-xl text-center mb-[30px] font-bold border border-[#c3e6cb]">{message}</div>}

      <div className="max-w-[800px] mx-auto p-6 bg-[#fefefe] shadow-[0_2px_8px_rgba(0,128,128,0.1)] rounded-2xl border border-slate-100">
        <h1 className="text-2xl font-black text-[#008080] text-center mb-8 uppercase tracking-tight">{isEditing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          
          <div className="flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Danh mục sản phẩm *</label>
            <select className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none bg-white cursor-pointer font-medium text-slate-700" value={categoryId} onChange={handleCategoryChange} required>
              <option value="">Chọn một danh mục</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Tên sản phẩm *</label>
            <input className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none font-medium text-slate-800" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 🌟 THAY ĐỔI: Chuyển input Hãng thành select dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Hãng *</label>
              <select 
                className="p-2.5 border border-[#008080] rounded-lg focus:border-[#008080] font-bold text-[#008080] bg-teal-50/10 outline-none cursor-pointer" 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)} 
                required
              >
                <option value="">-- Chọn Hãng --</option>
                {BRANDS.map((b, idx) => (
                  <option key={idx} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* 🌟 THAY ĐỔI: Chuyển input Vị trí thành select dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Vị trí kho hàng *</label>
              <select 
                className="p-2.5 border border-[#008080] rounded-lg focus:border-[#008080] font-bold text-amber-700 bg-amber-50/10 outline-none cursor-pointer" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required
              >
                <option value="">-- Chọn Vị trí --</option>
                {LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Mã SKU *</label>
              <input className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none font-semibold text-slate-700" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Số lượng tồn kho</label>
              <input className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-bold" type="number" value={isEditing ? stockQuantity : 0} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Thời hạn bảo hành (Tháng)</label>
              <input className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none font-medium" type="number" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Ngưỡng tồn kho tối thiểu (Báo động)</label>
              <input className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none font-medium" type="number" value={minStockLevel} onChange={(e) => setMinStockLevel(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Giá bán hệ thống (VNĐ) *</label>
            <input className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none font-bold text-slate-800" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <div className="flex flex-col p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <label className="text-sm text-[#008080] font-black uppercase tracking-wider mb-1">Thông số kỹ thuật mở rộng</label>
            {parsedTemplateGroups.length > 0 ? (
              <div className="flex flex-col gap-4 mt-3">
                {parsedTemplateGroups.map((group, gIdx) => (
                  <div key={gIdx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-xs font-black text-[#008080] bg-teal-50 px-2.5 py-1 rounded-md inline-block mb-3">⚙️ {group.groupName}</h3>
                    <div className="flex flex-col gap-3">
                      {group.specs.map((key, sIdx) => {
                        if (key === "Hãng sản xuất" || key === "Hãng") return null;
                        return (
                          <div key={sIdx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <label className="sm:w-[160px] text-xs font-bold text-slate-500 sm:text-right">{key}:</label>
                            <input type="text" placeholder={`Điền thông số ${key}...`} value={specValues[key] || ""} onChange={(e) => handleValueChange(key, e.target.value)} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#008080] font-medium" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-400 italic mt-1">Hãy chọn danh mục sản phẩm phía trên để hiển thị form nạp linh kiện thông số chi tiết.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Mô tả tóm tắt sản phẩm</label>
            <textarea className="p-2.5 border border-slate-200 rounded-lg focus:border-[#008080] outline-none min-h-[80px] font-medium text-slate-700" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Hình ảnh thiết bị *</label>
            <input className="p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 text-sm font-medium" type="file" onChange={handleImageChange} />
            {imageUrl && <img src={imageUrl} alt="preview" className="w-full max-h-[250px] object-contain rounded-xl mt-3 border border-slate-100 bg-slate-50/50 p-2" />}
          </div>
          
          <button className="p-3.5 bg-[#008080] hover:bg-teal-700 text-white font-black rounded-xl cursor-pointer transition-all uppercase text-sm tracking-wide border-none shadow-md shadow-teal-700/15 mt-3 active:scale-[0.98]" type="submit">
            LƯU SẢN PHẨM VÀO KHO
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;