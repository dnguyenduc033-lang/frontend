import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const AddEditSupplierPage = () => {
  const { supplierId } = useParams("");
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
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
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Error Getting a SUpplier by Id: " + error
          );
        }
      };
      fetchSupplier();
    }
  }, [supplierId]);

  //handle form submission for both add and edit supplier
  const handleSubmit = async (e) => {
    e.preventDefault();
    const supplierData = { name, contactInfo, address };

    try {
      if (isEditing) {
        await ApiService.updateSupplier(supplierId, supplierData);
        showMessage("Supplier Edited succesfully");
        navigate("/supplier")
      } else {
        await ApiService.addSupplier(supplierData);
        showMessage("Supplier Added succesfully");
        navigate("/supplier")
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Error Getting a SUpplier by Id: " + error
      );
    }
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
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px]">{message}</div>}
      <div className="p-5 rounded-[10px] w-1/2 mx-auto mt-12 shadow-[0_1px_1px_#008080]">
        <h1 className="text-[2rem] font-bold color-[#008080] mb-6 text-center">{isEditing ? "Edit Supplier" : "Add Supplier"}</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Supplier Name</label>
            <input
              className="w-full p-2.5 text-base border border-[#ccc] rounded-md box-border transition-colors duration-300 ease focus:border-[#008080] outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
            />
          </div>

          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Contact Info</label>
            <input
              className="w-full p-2.5 text-base border border-[#ccc] rounded-md box-border transition-colors duration-300 ease focus:border-[#008080] outline-none"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              type="text"
            />
          </div>

          <div className="mb-5">
            <label className="block text-base font-bold text-[#2F4F4F] mb-2">Address</label>
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
            {isEditing ? "Edit Supplier" : "Add Supplier"}
          </button>
        </form>
      </div>
    </Layout>
  );
};
export default AddEditSupplierPage;