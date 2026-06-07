import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const ReturnPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState(""); 
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const [returnType, setReturnType] = useState("CUSTOMER_RETURN"); 

  const [serialNumbers, setSerialNumbers] = useState([]);
  const [currentSerial, setCurrentSerial] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        const supplierData = await ApiService.getAllSuppliers();
        
        const pList = productData?.products || productData?.content || productData?.data || productData;
        const sList = supplierData?.suppliers || supplierData?.content || supplierData?.data || supplierData;
        
        setProducts(Array.isArray(pList) ? pList : []);
        setSuppliers(Array.isArray(sList) ? sList : []);
      } catch (error) {
        showMessage("Lỗi khi lấy dữ liệu hệ thống.");
      }
    };
    fetchInitialData();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedProduct = products.find(p => p.id === Number(productId));

  useEffect(() => {
    if (selectedProduct) setSearchTerm(selectedProduct.name);
    else setSearchTerm("");
  }, [productId, products]);

  const handleSerialKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = currentSerial.trim();
      
      if (!productId || !quantity) {
        showMessage("Vui lòng chọn sản phẩm và nhập số lượng trước.");
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

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!productId) {
      showMessage("Vui lòng chọn sản phẩm trước.");
      e.target.value = null;
      return;
    }

    try {
      showMessage("Đang phân tích file Excel...");
      const extractedSerials = await ApiService.extractSerialsFromExcel(file);
      
      if (extractedSerials && extractedSerials.length > 0) {
        const uniqueSerials = [...new Set([...serialNumbers, ...extractedSerials])];
        
        if (returnType === "SUPPLIER_RETURN" && selectedProduct && uniqueSerials.length > selectedProduct.stockQuantity) {
            showMessage(`Lỗi: Số lượng xuất trả vượt quá tồn kho hiện tại (${selectedProduct.stockQuantity})!`);
            e.target.value = null;
            return;
        }

        setSerialNumbers(uniqueSerials);
        setQuantity(uniqueSerials.length.toString()); 
        showMessage(`Đã tải file thành công, ghi nhận ${extractedSerials.length} mã Seri.`);
      } else {
        showMessage("Không tìm thấy mã Seri hợp lệ trong file Excel.");
      }
    } catch (error) {
      showMessage("Lỗi khi đọc file Excel.");
    } finally {
      e.target.value = null; 
    }
  };

  const removeSerial = (indexToRemove) => {
    setSerialNumbers(serialNumbers.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !quantity) {
      showMessage("Vui lòng chọn sản phẩm và số lượng!");
      return;
    }

    if (returnType === "SUPPLIER_RETURN" && !supplierId) {
      showMessage("Vui lòng chọn Nhà cung cấp để xuất trả!");
      return;
    }

    if (serialNumbers.length !== parseInt(quantity)) {
        showMessage(`Số lượng sê-ri (${serialNumbers.length}) không khớp với số lượng báo cáo (${quantity}).`);
        return;
    }
    
    const body = {
      productId: Number(productId),
      supplierId: returnType === "SUPPLIER_RETURN" ? Number(supplierId) : null,
      quantity: parseInt(quantity),
      description: description || (returnType === "CUSTOMER_RETURN" ? "Khách hàng trả lại thiết bị" : "Xuất trả nhà cung cấp do lỗi"),
      note,
      taxRate: 0, 
      serialNumbers: serialNumbers 
    };

    try {
      let response;
      if (returnType === "CUSTOMER_RETURN") {
        response = await ApiService.returnFromCustomer(body);
      } else {
        response = await ApiService.returnToSupplier(body);
      }
      
      showMessage(response.message);
      resetForm();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi xử lý đổi trả: " + error);
    }
  };

  const resetForm = () => {
    setProductId("");
    setSupplierId("");
    setDescription("");
    setNote("");
    setQuantity("");
    setSerialNumbers([]);
    setCurrentSerial("");
    setSearchTerm("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      {message && <div className={`p-3 rounded-md text-center mb-6 font-medium shadow-sm border ${message.includes("thành công") ? "bg-[#d4edda] text-[#155724] border-[#c3e6cb]" : "bg-red-50 text-red-600 border-red-200"}`}>{message}</div>}
      
      <div className="max-w-[800px] mx-auto p-4 md:p-8 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[15px] border-t-4 border-orange-500">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-8">
          Quản Lý Hàng Đổi / Trả
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="text-base font-bold text-slate-700">Lựa chọn Nghiệp vụ xử lý <span className="text-red-500">*</span></label>
            <select 
              className="p-3 border border-orange-300 font-bold rounded-md text-base w-full outline-none bg-orange-50 cursor-pointer text-orange-800" 
              value={returnType} 
              onChange={(e) => {
                setReturnType(e.target.value);
                setSupplierId("");
              }}
              required
            >
              <option value="CUSTOMER_RETURN">📥 Nhận hàng từ Khách (Cộng lại Tồn kho)</option>
              <option value="SUPPLIER_RETURN">📤 Trả hàng cho Nhà cung cấp (Trừ Tồn kho)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-base font-semibold text-slate-700">Chọn Sản phẩm bảo hành/lỗi <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-md text-base w-full outline-none pr-10 focus:border-orange-500"
                placeholder="Gõ để tìm tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (!e.target.value) setProductId(""); 
                }}
                onFocus={() => setIsDropdownOpen(true)}
                required
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-gray-300 rounded-md shadow-lg max-h-[250px] overflow-y-auto z-50">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 cursor-pointer hover:bg-orange-50 flex justify-between items-center transition-colors border-b border-slate-100"
                      onClick={() => {
                        setProductId(String(product.id));
                        setSearchTerm(product.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="text-sm font-medium">{product.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy sản phẩm...</div>
                )}
              </div>
            )}
          </div>

          {returnType === "SUPPLIER_RETURN" && (
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-slate-700">Chọn Nhà cung cấp tiếp nhận <span className="text-red-500">*</span></label>
              <select className="p-3 border border-gray-300 rounded-md text-base w-full focus:border-orange-500 outline-none bg-white cursor-pointer" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                <option value="">-- Chọn Nhà cung cấp --</option>
                {suppliers?.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-slate-700">Số lượng thiết bị <span className="text-red-500">*</span></label>
            <input className="p-3 border border-gray-300 rounded-md text-base w-full focus:border-orange-500 outline-none" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-base font-semibold text-slate-700">Quét mã Sê-ri thiết bị lỗi <span className="text-red-500">*</span></label>
                <div>
                    <input type="file" id="return-excel-upload" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                    <label htmlFor="return-excel-upload" className="bg-[#20c997] text-white px-4 py-1.5 rounded-md text-sm cursor-pointer hover:bg-[#17a2b8] font-medium flex items-center gap-2">📁 File Excel</label>
                </div>
            </div>

            <div className={`p-2 border rounded-md focus-within:border-orange-500 flex flex-wrap gap-2 bg-white min-h-[50px] ${!quantity ? 'bg-gray-100 cursor-not-allowed border-gray-300' : 'border-gray-300'}`}>
                {serialNumbers.map((serial, index) => (
                    <span key={index} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium border bg-red-50 text-red-700 border-red-200">
                        {serial}
                        <button type="button" onClick={() => removeSerial(index)} className="hover:text-red-900 font-bold ml-1">&times;</button>
                    </span>
                ))}
                <input 
                  type="text" 
                  className="flex-1 min-w-[150px] outline-none text-base bg-transparent p-1" 
                  placeholder={!quantity ? "Nhập số lượng trước..." : "Tít mã vạch lỗi..."} 
                  value={currentSerial} 
                  onChange={(e) => setCurrentSerial(e.target.value)} 
                  onKeyDown={handleSerialKeyDown} 
                  disabled={!quantity || serialNumbers.length >= parseInt(quantity)} 
                />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-slate-700">Lý do lỗi / Mô tả tình trạng</label>
            <input className="p-3 border border-gray-300 rounded-md text-base w-full focus:border-orange-500 outline-none" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Máy bật không lên, xước màn hình..." />
          </div>

          <button type="submit" className="mt-6 p-4 font-bold rounded-md text-lg cursor-pointer transition-colors duration-300 text-white bg-orange-600 hover:bg-orange-700">
            {returnType === "CUSTOMER_RETURN" ? "Xác nhận nhận thiết bị lỗi về kho" : "Xác nhận xuất trả cho Nhà cung cấp"}
          </button>
        </form>
      </div>

      {isDropdownOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsDropdownOpen(false)} />}
    </Layout>
  );
};

export default ReturnPage;