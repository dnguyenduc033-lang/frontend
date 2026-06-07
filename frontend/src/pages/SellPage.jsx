import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const SellPage = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const [serialNumbers, setSerialNumbers] = useState([]);
  const [currentSerial, setCurrentSerial] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        const pList = productData?.products || productData?.content || productData?.data || productData;
        setProducts(Array.isArray(pList) ? pList : []);
      } catch (error) {
        showMessage(error.response?.data?.message || "Lỗi khi lấy dữ liệu: " + error);
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
      e.stopPropagation();
      const val = currentSerial.trim();
      
      if (!productId) {
        showMessage("Vui lòng chọn sản phẩm trước.");
        return;
      }
      if (!quantity) {
          showMessage("Vui lòng nhập số lượng trước.");
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
      showMessage("Vui lòng chọn một sản phẩm trước.");
      e.target.value = null;
      return;
    }

    try {
      showMessage("Đang đọc dữ liệu file Excel...");
      const extractedSerials = await ApiService.extractSerialsFromExcel(file);
      
      if (extractedSerials && extractedSerials.length > 0) {
        const uniqueSerials = [...new Set([...serialNumbers, ...extractedSerials])];
        if (selectedProduct && uniqueSerials.length > selectedProduct.stockQuantity) {
          showMessage(`Lỗi: Số lượng xuất vượt quá tồn kho (${selectedProduct.stockQuantity})!`);
          e.target.value = null;
          return;
        }
        setSerialNumbers(uniqueSerials);
        setQuantity(uniqueSerials.length.toString()); 
        showMessage(`Đã ghi nhận ${extractedSerials.length} mã Seri xuất kho.`);
      } else {
        showMessage("Không tìm thấy mã Seri nào hợp lệ.");
      }
    } catch (error) {
      showMessage("Lỗi khi xử lý đọc file Excel.");
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
      showMessage("Vui lòng chọn sản phẩm và nhập đầy đủ thông tin!");
      return;
    }

    if (serialNumbers.length !== parseInt(quantity)) {
        showMessage(`Số lượng sê-ri (${serialNumbers.length}) không khớp với số lượng xuất (${quantity}).`);
        return;
    }
    
    const body = {
      productId: Number(productId),
      quantity: parseInt(quantity),
      description,
      note,
      serialNumbers: serialNumbers 
    };

    try {
      const response = await ApiService.sellProduct(body);
      showMessage(response.message);
      resetForm();
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi thực hiện giao dịch: " + error);
    }
  };

  const resetForm = () => {
    setProductId("");
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

  const unitPrice = selectedProduct ? selectedProduct.price : 0;
  const totalGoodsPrice = unitPrice * (parseInt(quantity) || 0);

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px] border border-[#c3e6cb] shadow-sm font-medium">{message}</div>}
      
      <div className="max-w-[800px] mx-auto p-4 md:p-8 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[15px] border-t-4 border-[#008080]">
        <h1 className="text-3xl font-bold text-[#008080] text-center mb-8">Xuất Kho Bán Hàng</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-base font-semibold text-[#2F4F4F]">Chọn sản phẩm <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none pr-10"
                placeholder="Gõ để tìm tên sản phẩm hoặc mã SKU..."
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
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#ccc] rounded-md shadow-lg max-h-[250px] overflow-y-auto z-50">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 cursor-pointer hover:bg-teal-50 flex justify-between items-center ${productId === String(product.id) ? "bg-teal-100 font-semibold" : ""}`}
                      onClick={() => {
                        setProductId(String(product.id));
                        setSearchTerm(product.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">SKU: {product.sku || "---"}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Tồn: {product.stockQuantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy sản phẩm nào...</div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Số lượng xuất kho <span className="text-red-500">*</span></label>
            <input className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-base font-semibold text-[#2F4F4F]">Mã Seri xuất kho <span className="text-red-500">*</span></label>
                <div>
                    <input type="file" id="sell-excel-upload" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                    <label htmlFor="sell-excel-upload" className="bg-[#20c997] text-white px-4 py-1.5 rounded-md text-sm cursor-pointer hover:bg-[#17a2b8] font-medium flex items-center gap-2">📁 Tải File Excel</label>
                </div>
            </div>

            <div className={`p-2 border rounded-md focus-within:border-[#008080] flex flex-wrap gap-2 bg-white min-h-[50px] ${!quantity ? 'bg-gray-100 cursor-not-allowed border-[#ccc]' : 'border-[#ccc]'}`}>
                {serialNumbers.map((serial, index) => (
                    <span key={index} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium border bg-[#fff3cd] text-[#856404] border-[#ffeeba]">
                        {serial}
                        <button type="button" onClick={() => removeSerial(index)} className="hover:text-red-500 font-bold ml-1">&times;</button>
                    </span>
                ))}
                <input type="text" className="flex-1 min-w-[150px] outline-none text-base bg-transparent p-1" placeholder={!quantity ? "Nhập số lượng trước..." : "Quét mã vạch vào đây..."} value={currentSerial} onChange={(e) => setCurrentSerial(e.target.value)} onKeyDown={handleSerialKeyDown} disabled={!quantity || serialNumbers.length >= parseInt(quantity)} />
            </div>
            <div className="flex justify-between text-xs font-semibold mt-1">
                <span className="text-gray-500">Đã sẵn sàng xuất: <span className={serialNumbers.length === parseInt(quantity) && quantity !== "0" ? "text-green-600 font-bold" : "text-[#856404]"}>{serialNumbers.length}</span> / {quantity || 0} mã</span>
                {serialNumbers.length > 0 && <button type="button" onClick={() => { setSerialNumbers([]); setQuantity(""); }} className="text-red-500 hover:underline">Xóa tất cả</button>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Mô tả</label>
            <input className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {selectedProduct && quantity > 0 && (
            <div className="p-5 bg-[#f8f9fa] border border-[#e9ecef] rounded-md mt-2 shadow-sm text-sm">
              <h3 className="font-bold text-[#2F4F4F] mb-3 border-b pb-2">Hóa đơn dự kiến</h3>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Giá trị xuất kho:</span>
                <span className="text-sm font-semibold">{totalGoodsPrice.toLocaleString()} đ</span>
              </div>
              <hr className="my-2 border-[#dee2e6]" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-[#2F4F4F]">TỔNG THU KHÁCH:</span>
                <span className="text-xl font-bold text-[#008080]">{totalGoodsPrice.toLocaleString()} đ</span>
              </div>
            </div>
          )}

          <button type="submit" className="mt-4 p-4 font-bold rounded-md text-lg cursor-pointer transition-colors duration-300 text-white bg-[#008080] hover:bg-[#2F4F4F]">
            Xác nhận xuất kho bán hàng
          </button>
        </form>
      </div>
      {isDropdownOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsDropdownOpen(false)} />}
    </Layout>
  );
};

export default SellPage;