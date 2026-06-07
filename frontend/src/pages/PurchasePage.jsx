import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [message, setMessage] = useState("");
  
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [currentSerial, setCurrentSerial] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProductsAndSuppliers = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        const supplierData = await ApiService.getAllSuppliers();
        
        const pList = productData?.products || productData?.content || productData?.data || productData;
        const sList = supplierData?.suppliers || supplierData?.content || supplierData?.data || supplierData;
        
        setProducts(Array.isArray(pList) ? pList : []);
        setSuppliers(Array.isArray(sList) ? sList : []);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchProductsAndSuppliers();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setProductId(product.id.toString());
    setSearchTerm(product.name);
    setIsDropdownOpen(false);
  };

  const handleSerialKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = currentSerial.trim();
      
      if (!quantity) {
          showMessage("Vui lòng nhập số lượng trước khi quét mã Seri.");
          return;
      }

      if (val && !serialNumbers.includes(val)) {
        if (serialNumbers.length < parseInt(quantity)) {
          setSerialNumbers([...serialNumbers, val]);
          setCurrentSerial("");
        } else {
          showMessage("Đã quét đủ số lượng yêu cầu!");
        }
      } else if (serialNumbers.includes(val)) {
          showMessage("Mã Seri này đã được quét!");
      }
    }
  };

  const removeSerial = (indexToRemove) => {
    setSerialNumbers(serialNumbers.filter((_, index) => index !== indexToRemove));
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showMessage("Đang đọc file Excel...");
      const extractedSerials = await ApiService.extractSerialsFromExcel(file);
      
      if (extractedSerials && extractedSerials.length > 0) {
        const uniqueSerials = [...new Set([...serialNumbers, ...extractedSerials])];
        setSerialNumbers(uniqueSerials);
        setQuantity(uniqueSerials.length.toString()); 
        showMessage(`Đã tải lên và tìm thấy ${extractedSerials.length} mã Seri thành công!`);
      } else {
        showMessage("Không tìm thấy mã Seri nào hoặc file Excel bị trống.");
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tải file Excel lên.");
    } finally {
      e.target.value = null; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !supplierId || !quantity || !purchasePrice) {
      showMessage("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    if (serialNumbers.length !== parseInt(quantity)) {
        showMessage(`Vui lòng quét đủ ${quantity} mã Seri. Hiện đang có ${serialNumbers.length} mã.`);
        return;
    }
    
    const body = {
      productId: Number(productId),
      quantity: parseInt(quantity),
      supplierId: Number(supplierId),
      purchasePrice: parseFloat(purchasePrice),
      description: description,
      note,
      serialNumbers: serialNumbers,
      
    };

    try {
      const response = await ApiService.purchaseProduct(body);
      showMessage(response.message);
      resetForm();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi nhập kho sản phẩm: " + error);
    }
  };

  const resetForm = () => {
    setProductId("");
    setSupplierId("");
    setDescription("");
    setNote("");
    setQuantity("");
    setPurchasePrice("");
    setSerialNumbers([]);
    setCurrentSerial("");
    setSearchTerm("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const selectedProduct = products.find(p => p.id === parseInt(productId));
  const unitPrice = parseFloat(purchasePrice) || 0; 
  const totalGoodsPrice = unitPrice * (parseInt(quantity) || 0);
  const selectedProductBrand = selectedProduct?.specs?.find(s => s.specKey === "Hãng sản xuất" || s.specKey === "Hãng")?.specValue || "---";

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px] border border-[#c3e6cb] shadow-sm font-medium">{message}</div>}
      
      <div className="max-w-[800px] mx-auto p-4 md:p-8 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[15px] border-t-4 border-[#008080]">
        <h1 className="text-3xl font-bold text-[#008080] text-center mb-8">Nhập Kho Sản Phẩm Mới</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-base font-semibold text-[#2F4F4F]">Chọn sản phẩm <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none bg-white"
                placeholder="Nhập tên sản phẩm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setProductId(""); 
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} 
                required={!productId} 
              />
              {isDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-[#ccc] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-h-60 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <li key={product.id} className="p-3 hover:bg-[#e0f2f1] cursor-pointer border-b border-gray-100 last:border-none text-base transition-colors" onClick={() => handleSelectProduct(product)}>
                        {product.name}
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-gray-500 text-center italic">Không tìm thấy sản phẩm nào.</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Số lượng<span className="text-red-500">*</span></label>
            <input className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-6 p-5 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-[#2F4F4F]">Chọn nhà cung cấp <span className="text-red-500">*</span></label>
              <select className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none bg-white cursor-pointer" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                <option value="">Chọn một nhà cung cấp</option>
                {suppliers?.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-[#2F4F4F]">Đơn giá nhập kho (VNĐ) <span className="text-red-500">*</span></label>
              <input className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none" type="number" min="1" placeholder="Ví dụ: 12500000" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-[#2F4F4F]">Mô tả hóa đơn</label>
              <input className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Ghi chú (Lý do phụ)</label>
            <input className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-base font-semibold text-[#2F4F4F]">Mã Seri / IMEI <span className="text-red-500">*</span></label>
                <div>
                    <input type="file" id="excel-upload" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                    <label htmlFor="excel-upload" className="bg-[#20c997] text-white px-4 py-1.5 rounded-md text-sm cursor-pointer hover:bg-[#17a2b8] font-medium flex items-center gap-2">📁 Tải File Excel</label>
                </div>
            </div>

            <div className={`p-2 border rounded-md focus-within:border-[#008080] flex flex-wrap gap-2 bg-white min-h-[50px] ${!quantity ? 'bg-gray-100 cursor-not-allowed border-[#ccc]' : 'border-[#ccc]'}`}>
                {serialNumbers.map((serial, index) => (
                    <span key={index} className="flex items-center gap-1 bg-[#e0f2f1] text-[#008080] px-2.5 py-1 rounded-md text-sm font-medium">
                        {serial}
                        <button type="button" onClick={() => removeSerial(index)} className="text-[#008080] hover:text-red-500 font-bold ml-1">&times;</button>
                    </span>
                ))}
                <input type="text" className="flex-1 min-w-[150px] outline-none text-base bg-transparent p-1" placeholder={!quantity ? "Nhập số lượng trước..." : "Quét mã Seri vào đây..."} value={currentSerial} onChange={(e) => setCurrentSerial(e.target.value)} onKeyDown={handleSerialKeyDown} disabled={!quantity || serialNumbers.length >= parseInt(quantity)} />
            </div>
            <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Đã nhập: <span className={serialNumbers.length === parseInt(quantity) && quantity !== "0" ? "text-green-600" : "text-[#008080]"}>{serialNumbers.length}</span> / {quantity || 0}</span>
                {serialNumbers.length > 0 && <button type="button" onClick={() => { setSerialNumbers([]); setQuantity(""); }} className="text-red-500 hover:underline">Xóa tất cả</button>}
            </div>
          </div>

          {selectedProduct && quantity > 0 && (
            <div className="p-5 bg-[#f8f9fa] border border-[#e9ecef] rounded-md mt-2 shadow-sm">
              <h3 className="font-bold text-[#2F4F4F] mb-3 border-b pb-2">Bảng tính thanh toán dự kiến</h3>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Tổng tiền lô hàng:</span>
                <span className="text-sm font-semibold">{totalGoodsPrice.toLocaleString()} đ</span>
              </div>
              <hr className="my-2 border-[#dee2e6]" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-[#2F4F4F]">TỔNG THANH TOÁN (NCC):</span>
                <span className="text-xl font-bold text-[#008080]">{totalGoodsPrice.toLocaleString()} đ</span>
              </div>
            </div>
          )}

          <button type="submit" className="mt-4 p-4 bg-[#008080] text-white font-bold rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-[#2F4F4F]">
            Xác nhận nhập kho
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default PurchasePage;