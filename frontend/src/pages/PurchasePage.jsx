import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productId, setProductId] = useState("");
  const [supplierId, setSuppplierId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchproductsAndSuppliers = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        const supplierData = await ApiService.getAllSuppliers();
        setProducts(productData.products);
        setSuppliers(supplierData.suppliers);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Products: " + error
        );
      }
    };

    fetchproductsAndSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !supplierId || !quantity) {
      showMessage("Please fill in all required fields");
      return
    }
    const body = {
      productId,
      quantity: parseInt(quantity),
      supplierId,
      description,
      note,
    };
    console.log(body)

    try {
      const respone = await ApiService.purchaseProduct(body);
      showMessage(respone.message);
      resetForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Purchasing Products: " + error
      );
    }
  };

  const resetForm = () => {
    setProductId("");
    setSuppplierId("");
    setDescription("");
    setNote("");
    setQuantity("");
  };

  //metjhod to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && (
        <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px] border border-[#c3e6cb]">
          {message}
        </div>
      )}
      
      <div className="max-w-[800px] mx-auto p-8 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[15px] border-t-4 border-[#008080]">
        <h1 className="text-3xl font-bold text-[#008080] text-center mb-8">Receive Inventory</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Select Product</label>
            <select
              className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none transition-all appearance-none bg-white cursor-pointer"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Select Supplier</label>
            <select
              className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none transition-all appearance-none bg-white cursor-pointer"
              value={supplierId}
              onChange={(e) => setSuppplierId(e.target.value)}
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Description</label>
            <input
              className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none transition-all"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Note</label>
            <input
              className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none transition-all"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#2F4F4F]">Quantity</label>
            <input
              className="p-3 border border-[#ccc] rounded-md text-base w-full focus:border-[#008080] outline-none transition-all"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="mt-4 p-4 bg-[#008080] text-white font-bold rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-[#2F4F4F]"
          >
            Purchase Product
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default PurchasePage;