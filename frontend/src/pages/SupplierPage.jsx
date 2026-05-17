import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    //fetech all suppliers
    const getSuppliers = async () => {
      try {
        const responseData = await ApiService.getAllSuppliers();
        if (responseData.status === 200) {
          setSuppliers(responseData.suppliers);
        } else {
          showMessage(responseData.message);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Suppliers: " + error
        );
        console.log(error);
      }
    };
    getSuppliers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  //Delete Supplier
  const handleDeleteSupplier = async (supplierId) => {
    try {
      if (window.confirm("Are you sure you want to delete this supplier? ")) {
        await ApiService.deleteSupplier(supplierId);
        window.location.reload();
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Deleting a Suppliers: " + error
      );
    }
  };

  return (
    <Layout>
      {message && (
        <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px] border border-[#c3e6cb]">
          {message}
        </div>
      )}
      
      <div className="p-5 font-['Poppins']">
        <div className="flex justify-between items-center mb-8 border-b border-[#eee] pb-4">
          <h1 className="text-3xl font-bold text-[#008080]">Suppliers</h1>
          <div className="add-sup">
            <button 
              className="bg-[#008080] text-white p-[12px_24px] border-none rounded-md cursor-pointer text-base font-semibold transition-colors duration-300 hover:bg-[#2F4F4F] shadow-sm"
              onClick={() => navigate("/add-supplier")}
            >
              Add Supplier
            </button>
          </div>
        </div>

        {suppliers && (
          <ul className="list-none p-0 flex flex-col gap-3">
            {suppliers.map((supplier) => (
              <li 
                className="flex justify-between items-center p-5 bg-[#f9f9f9] border border-[#eee] rounded-[12px] transition-all duration-300 hover:bg-[#f0f7f6] hover:shadow-md" 
                key={supplier.id}
              >
                <span className="text-xl font-semibold text-[#2F4F4F]">{supplier.name}</span>

                <div className="flex gap-3">
                  <button 
                    className="p-[8px_20px] bg-[#008080] text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300 hover:bg-[#2F4F4F]"
                    onClick={() => navigate(`/edit-supplier/${supplier.id}`)}
                  >
                    Edit
                  </button>
                  <button 
                    className="p-[8px_20px] bg-[#dc3545] text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300 hover:bg-[#a5202e]"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default SupplierPage;