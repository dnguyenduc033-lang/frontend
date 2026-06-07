import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("STAFF");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const registerData = { name, email, password, phoneNumber, role };
      await ApiService.registerUser(registerData);
      setMessage("Đăng ký tài khoản thành công");
      // --- CHỈNH SỬA: Admin đăng ký cho nhân viên xong thì đẩy về Dashboard (hoặc trang danh sách nhân viên nếu có), không đẩy ra trang Login nữa ---
      navigate("/dashboard");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Lỗi khi đăng ký tài khoản: " + error
      );
      console.log(error);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-400 p-5">
      <div className="bg-white p-10 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] w-full max-w-[450px]">
        <h2 className="text-center text-[#2F4F4F] text-3xl font-bold mb-8">Đăng ký tài khoản</h2>

        {message && (
          <p className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-5 text-sm border border-[#c3e6cb]">
            {message}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="text"
            placeholder="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="text"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Vai trò</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("MANAGER")}
                className={`flex-1 p-3 rounded-md border-2 text-sm font-bold transition-all duration-200 cursor-pointer
                  ${role === "MANAGER"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-[#ccc] bg-white text-slate-500 hover:border-blue-300"
                  }`}
              >
                QUẢN LÝ
              </button>
              <button
                type="button"
                onClick={() => setRole("STAFF")}
                className={`flex-1 p-3 rounded-md border-2 text-sm font-bold transition-all duration-200 cursor-pointer
                  ${role === "STAFF"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-[#ccc] bg-white text-slate-500 hover:border-emerald-300"
                  }`}
              >
                NHÂN VIÊN
              </button>
            </div>
          </div>

          <button 
            className="p-3 bg-[#008080] text-white border-none rounded-md cursor-pointer text-lg font-semibold transition-colors duration-300 hover:bg-[#2F4F4F] mt-2"
            type="submit"
          >
            Đăng ký
          </button>
        </form>
        
        {/* --- CHỈNH SỬA: Đã xóa thẻ <p> chứa link quay về trang Login ở đây (Admin đang dùng nên không cần link này) --- */}
      </div>
    </div>
  );
};

export default RegisterPage;