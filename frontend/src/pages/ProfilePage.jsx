import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await ApiService.getLoggedInUsesInfo();
        setUser(userInfo);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Loggin in a User: " + error
        );
      }
    };
    fetchUserInfo();
  }, []);

  //Method> to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px]">{message}</div>}
      <div className="flex justify-center p-10 font-['Poppins']">
        {user && (
          <div className="bg-white p-10 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full max-w-[600px] border-t-[5px] border-[#008080]">
            <h1 className="text-[#008080] text-3xl font-bold mb-8 text-center">Hello, {user.name} 🥳</h1>
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center p-4 bg-[#f9fcfb] rounded-lg border-b border-[#eee] transition-colors hover:bg-[#f0f7f6]">
                <label className="font-bold text-[#2F4F4F] text-base">Name</label>
                <span className="text-[#555] text-lg">{user.name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#f9fcfb] rounded-lg border-b border-[#eee] transition-colors hover:bg-[#f0f7f6]">
                <label className="font-bold text-[#2F4F4F] text-base">Email</label>
                <span className="text-[#555] text-lg">{user.email}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#f9fcfb] rounded-lg border-b border-[#eee] transition-colors hover:bg-[#f0f7f6]">
                <label className="font-bold text-[#2F4F4F] text-base">Phone Number</label>
                <span className="text-[#555] text-lg">{user.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#f9fcfb] rounded-lg border-b border-[#eee] transition-colors hover:bg-[#f0f7f6]">
                <label className="font-bold text-[#2F4F4F] text-base">Role</label>
                <span className="bg-[#008080] text-white px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default ProfilePage;