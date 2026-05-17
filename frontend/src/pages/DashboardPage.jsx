import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");
  //veruble to store and set transaction data formated for chart display
  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionResponse = await ApiService.getAllTransactions();
        if (transactionResponse.status === 200) {
            setTransactionData(
            transformTransactionData(
              transactionResponse.transactions,
              selectedMonth,
              selectedYear
            )
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Loggin in a User: " + error
        );
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear, selectedData]);

  const transformTransactionData = (transactions, month, year) => {
    const dailyData = {};
    //get nimber of dayas in the selected month year
    const daysInMonths = new Date(year, month, 0).getDate();
    //initilaize each day in the month with default values
    for (let day = 1; day <= daysInMonths; day++) {
      dailyData[day] = {
        day,
        count: 0,
        quantity: 0,
        amount: 0,
      };
    }
    //process each transactions to accumulate daily counts, quantity and amount
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();

      //If transaction falls withing selected month and year, accumulate data for the day
      if (transactionMonth === month && transactionYear === year) {
        const day = transactionDate.getDate();
        dailyData[day].count += 1;
        dailyData[day].quantity += transaction.totalProducts;
        dailyData[day].amount += transaction.totalPrice;
      }
    });
    //convert dailyData object for chart compatibility
    return Object.values(dailyData);
  };

  //event handler for month selection or change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  //event handler for year selection or change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
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
      <div className="p-5 font-['Poppins']">
        <div className="flex justify-center gap-2.5 mb-8">
          <button 
            className={`p-[10px_20px] border-none rounded-md cursor-pointer transition-colors duration-300 ${selectedData === 'count' ? 'bg-[#2F4F4F] text-white' : 'bg-[#008080] text-white hover:bg-[#2F4F4F]'}`}
            onClick={() => setSelectedData("count")}
          >
            ToTal No Of Transactions
          </button>
          <button 
            className={`p-[10px_20px] border-none rounded-md cursor-pointer transition-colors duration-300 ${selectedData === 'quantity' ? 'bg-[#2F4F4F] text-white' : 'bg-[#008080] text-white hover:bg-[#2F4F4F]'}`}
            onClick={() => setSelectedData("quantity")}
          >
            Product Quantity
          </button>
          <button 
            className={`p-[10px_20px] border-none rounded-md cursor-pointer transition-colors duration-300 ${selectedData === 'amount' ? 'bg-[#2F4F4F] text-white' : 'bg-[#008080] text-white hover:bg-[#2F4F4F]'}`}
            onClick={() => setSelectedData("amount")}
          >
            Amount
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex gap-5 mb-8 items-center bg-[#f9f9f9] p-5 rounded-lg shadow-sm">
            <label htmlFor="month-select" className="font-semibold text-[#2F4F4F]">Select Month:</label>
            <select 
              id="month-select" 
              value={selectedMonth} 
              onChange={handleMonthChange}
              className="p-2 border border-[#ccc] rounded-md outline-none focus:border-[#008080]"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <label htmlFor="year-select" className="font-semibold text-[#2F4F4F]">Select Year:</label>
            <select 
              id="year-select" 
              value={selectedYear} 
              onChange={handleYearChange}
              className="p-2 border border-[#ccc] rounded-md outline-none focus:border-[#008080]"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Display the chart */}
          <div className="w-full max-w-[1000px] bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#eee]">
            <div className="w-full">
                <h3 className="text-center text-[#2F4F4F] mb-5 text-xl font-bold">Daily Transactions</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={transactionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="day" label={{value: "Day", position: "insideBottomRight", offset: -5}}/>
                        <YAxis/>
                        <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                        <Legend verticalAlign="top" height={36}/>
                        <Line type={"monotone"}
                        dataKey={selectedData}
                        stroke="#008080"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#008080' }}
                        activeDot={{ r: 6 }}
                        fillOpacity={0.3}
                        fill="#008080"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default DashboardPage;