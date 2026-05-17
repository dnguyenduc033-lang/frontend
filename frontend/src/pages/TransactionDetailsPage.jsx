import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getTransaction = async () => {
      try {
        const transactionData = await ApiService.getTransactionById(transactionId);

        if (transactionData.status === 200) {
            setTransaction(transactionData.transaction);
            setStatus(transactionData.transaction.status);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting a transaction: " + error
        );
      }
    };

    getTransaction();
  }, [transactionId]);

  //update transaction status
  const handleUpdateStatus = async()=>{
    try {
        ApiService.updateTransactionStatus(transactionId, status);
        navigate("/transaction")
    } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Updating a transactions: " + error
        );
    }
  }

  //Method to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && (
        <p className="bg-[#f8d7da] text-[#721c24] p-3 rounded-md text-center mb-6 border border-[#f5c6cb]">
          {message}
        </p>
      )}
      
      <div className="p-6 max-w-[1200px] mx-auto font-['Poppins']">
        <h1 className="text-3xl font-bold text-[#008080] mb-8 border-b-2 border-[#008080] pb-2 inline-block">
          Transaction Details
        </h1>

        {transaction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction base information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#eee] hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-[#2F4F4F] mb-4 border-b pb-2">Transaction Information</h2>
              <div className="space-y-2 text-[#555]">
                <p><span className="font-semibold">Type:</span> {transaction.transactionType}</p>
                <p><span className="font-semibold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {transaction.status}
                  </span>
                </p>
                <p><span className="font-semibold">Description:</span> {transaction.description}</p>
                <p><span className="font-semibold">Note:</span> {transaction.note}</p>
                <p><span className="font-semibold">Total Products:</span> {transaction.totalProducts}</p>
                <p className="text-lg text-[#008080] font-bold">Total Price: ${transaction.totalPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400 italic">Created At: {new Date(transaction.createdAt).toLocaleString()}</p>
                {transaction.updatedAt && (
                  <p className="text-xs text-gray-400 italic">Updated At: {new Date(transaction.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Product information of the transaction */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#eee] hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-[#2F4F4F] mb-4 border-b pb-2">Product Information</h2>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2 text-[#555]">
                  <p><span className="font-semibold">Name:</span> {transaction.product.name}</p>
                  <p><span className="font-semibold">SKU:</span> {transaction.product.sku}</p>
                  <p><span className="font-semibold">Price:</span> ${transaction.product.price.toFixed(2)}</p>
                  <p><span className="font-semibold">Stock:</span> {transaction.product.stockQuantity}</p>
                </div>
                {transaction.product.imageUrl && (
                  <img 
                    src={transaction.product.imageUrl} 
                    alt={transaction.product.name} 
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>

            {/* User information who made the transaction */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#eee] hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-[#2F4F4F] mb-4 border-b pb-2">User Information</h2>
              <div className="space-y-2 text-[#555]">
                <p><span className="font-semibold">Name:</span> {transaction.user.name}</p>
                <p><span className="font-semibold">Email:</span> {transaction.user.email}</p>
                <p><span className="font-semibold">Phone:</span> {transaction.user.phoneNumber}</p>
                <p><span className="font-semibold">Role:</span> {transaction.user.role}</p>
              </div>
            </div>

            {/* Supplier information who made the transaction */}
            {transaction.suppliers && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#eee] hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-[#2F4F4F] mb-4 border-b pb-2">Supplier Information</h2>
                <div className="space-y-2 text-[#555]">
                  <p><span className="font-semibold">Name:</span> {transaction.supplier.name}</p>
                  <p><span className="font-semibold">Contact:</span> {transaction.supplier.contactInfo}</p>
                  <p><span className="font-semibold">Address:</span> {transaction.supplier.address}</p>
                </div>
              </div>
            )}

            {/* UPDATE TRANSACTION STATUS */}
            <div className="bg-[#f0f7f6] p-6 rounded-xl border-2 border-dashed border-[#008080] md:col-span-2 flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <label className="font-bold text-[#2F4F4F]">Status:</label>
                <select 
                  className="p-2 border border-[#ccc] rounded-md outline-none focus:border-[#008080] bg-white cursor-pointer"
                  value={status}
                  onChange={(e)=> setStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <button 
                className="bg-[#008080] text-white px-8 py-2 rounded-md font-bold hover:bg-[#2F4F4F] transition-colors shadow-sm"
                onClick={()=>handleUpdateStatus()}
              >
                Update Staus
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;