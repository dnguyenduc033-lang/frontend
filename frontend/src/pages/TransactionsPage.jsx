import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [valueToSearch, setValueToSearch] = useState("");

  const navigate = useNavigate();

  //Pagination Set-Up
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const transactionData = await ApiService.getAllTransactions(valueToSearch);

        if (transactionData.status === 200) {
          setTotalPages(Math.ceil(transactionData.transactions.length / itemsPerPage));

          setTransactions(
            transactionData.transactions.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting transactions: " + error
        );
      }
    };

    getTransactions();
  }, [currentPage, valueToSearch]);

  //Method to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  //handle search
  const handleSearch = () =>{
    console.log("Searcxh hit")
    console.log("FILTER IS: " + filter)
    setCurrentPage(1)
    setValueToSearch(filter)
  }

  //Navigate to transactions details page
  const navigateToTransactionDetailsPage = (transactionId) =>{
    navigate(`/transaction/${transactionId}`);
  }

  return (
    <Layout>
      {message && (
        <p className="bg-[#f8d7da] text-[#721c24] p-3 rounded-md text-center mb-6 border border-[#f5c6cb]">
          {message}
        </p>
      )}

      <div className="p-6 bg-white rounded-xl shadow-sm border border-[#eee] font-['Poppins']">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-[#008080]">Transactions</h1>
            
            <div className="flex w-full md:w-auto gap-2">
                <input 
                    className="flex-1 md:w-64 p-2.5 border border-[#ccc] rounded-md outline-none focus:border-[#008080] transition-all"
                    placeholder="Search transaction ..."
                    value={filter}
                    onChange={(e)=> setFilter(e.target.value)}
                    type="text" 
                />
                <button 
                    className="bg-[#008080] text-white px-6 py-2.5 rounded-md font-semibold hover:bg-[#2F4F4F] transition-colors shadow-sm"
                    onClick={()=> handleSearch()}
                > 
                    Search
                </button>
            </div>
        </div>

        {transactions && (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f9fcfb] border-b-2 border-[#eee]">
                            <th className="p-4 text-[#2F4F4F] font-bold uppercase text-sm tracking-wider">TYPE</th>
                            <th className="p-4 text-[#2F4F4F] font-bold uppercase text-sm tracking-wider">STATUS</th>
                            <th className="p-4 text-[#2F4F4F] font-bold uppercase text-sm tracking-wider">TOTAL PRICE</th>
                            <th className="p-4 text-[#2F4F4F] font-bold uppercase text-sm tracking-wider">TOTAL PRODUCTS</th>
                            <th className="p-4 text-[#2F4F4F] font-bold uppercase text-sm tracking-wider">DATE</th>
                            <th className="p-4 text-[#2F4F4F] font-bold uppercase text-sm tracking-wider text-center">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#eee]">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-[#f0f7f6] transition-colors group">
                                <td className="p-4 font-medium text-[#555]">{transaction.transactionType}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {transaction.status}
                                    </span>
                                </td>
                                <td className="p-4 font-bold text-[#008080]">${transaction.totalPrice}</td>
                                <td className="p-4 text-[#555]">{transaction.totalProducts} items</td>
                                <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(transaction.createdAt).toLocaleString()}
                                </td>

                                <td className="p-4 text-center">
                                    <button 
                                        className="bg-transparent border border-[#008080] text-[#008080] px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-[#008080] hover:text-white transition-all duration-300"
                                        onClick={()=> navigateToTransactionDetailsPage(transaction.id)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <div className="mt-8">
        <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
};

export default TransactionsPage;