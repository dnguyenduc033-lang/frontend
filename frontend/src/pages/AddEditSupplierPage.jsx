import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const AddEditSupplierPage = () => {
  const { supplierId } = useParams("");
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (supplierId) {
      setIsEditing(true);

      const fetchSupplier = async () => {
        try {
          const supplierData = await ApiService.getSupplierById(supplierId);
          if (supplierData.status === 200) {
            setName(supplierData.supplier.name);
            setContactInfo(supplierData.supplier.contactInfo);
            setAddress(supplierData.supplier.address);
            setEmail(supplierData.supplier.email || "");
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Lỗi khi lấy thông tin nhà cung cấp: " + error
          );
        }
      };
      fetchSupplier();
    }
  }, [supplierId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supplierData = { name, contactInfo, address, email };

    try {
      if (isEditing) {
        await ApiService.updateSupplier(supplierId, supplierData);
        showMessage("Cập nhật thông tin nhà cung cấp thành công");
        navigate("/supplier")
      } else {
        await ApiService.addSupplier(supplierData);
        showMessage("Thêm nhà cung cấp thành công");
        navigate("/supplier")
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Lỗi khi xử lý thông tin nhà cung cấp: " + error
      );
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px]">{message}</div>}
      <div className="p-5 rounded-[10px] w-full md:w-1/2 mx-auto mt-12 shadow-[0_1px_1px_#008080]">
        <h1 className="text-[2rem] font-bold text-[#008080] mb-6 text-center">{isEditing ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}</h1>

        <form onSubmit={handleSubmit}>
          
          {/* 1. Tên nhà cung cấp */}
          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Tên nhà cung cấp</label>
            <input
              className="w-full p-2.5 text-base border border-[#ccc] rounded-md box-border transition-colors duration-300 ease focus:border-[#008080] outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
            />
          </div>

          {/* 2. Email (Đã được chuyển lên vị trí số 2) */}
          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Email nhà cung cấp</label>
            <input
              className="w-full p-2.5 text-base border border-[#ccc] rounded-md box-border transition-colors duration-300 ease focus:border-[#008080] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              
            />
          </div>

          {/* 3. Thông tin liên hệ */}
          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Số điện thoại liên hệ</label>
            <input
              className="w-full p-2.5 text-base border border-[#ccc] rounded-md box-border transition-colors duration-300 ease focus:border-[#008080] outline-none"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              type="text"
            />
          </div>

          {/* 4. Địa chỉ */}
          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Địa chỉ</label>
            <input
              className="w-full p-2.5 text-base border border-[#ccc] rounded-md box-border transition-colors duration-300 ease focus:border-[#008080] outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              type="text"
            />
          </div>

          <button 
            type="submit"
            className="p-[13px_20px] bg-[#008080] text-white border-none rounded-md cursor-pointer text-base w-full mt-5 transition-colors duration-300 ease hover:bg-[#2F4F4F]"
          >
            {isEditing ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
          </button>
        </form>
      </div>
    </Layout>
  );
};
export default AddEditSupplierPage;