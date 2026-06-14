import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { UserPlus, UserCheck, Save } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("STAFF");
  const [managerId, setManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await ApiService.getAllUsers();
        if (response.status === 200) {
          setManagers(response.users || []);
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Lỗi khi tải danh sách quản lý.");
      }
    };
    fetchManagers();
  }, []);

  const eligibleManagers = useMemo(() => {
    if (role === "MANAGER") {
      return managers.filter((user) => user.role === "ADMIN");
    }
    return managers.filter((user) => user.role === "ADMIN" || user.role === "MANAGER");
  }, [managers, role]);

  useEffect(() => {
    if (managerId && !eligibleManagers.some((user) => String(user.id) === String(managerId))) {
      setManagerId("");
    }
  }, [eligibleManagers, managerId]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!managerId) {
      showMessage("Vui lòng chọn quản lý trực tiếp.");
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        name,
        email,
        password,
        phoneNumber,
        role,
        managerId: Number(managerId),
      };
      await ApiService.registerUser(registerData);
      showMessage("Tạo tài khoản thành công!");
      setTimeout(() => navigate("/users"), 1200);
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tạo tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <div className="w-full font-['Poppins'] pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen text-slate-800">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#00a884] to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white shrink-0">
            <UserPlus size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[32px] font-black text-[#00a884] tracking-tight mb-1 leading-none">
              Tạo Tài Khoản
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1.5">
              Thêm nhân sự mới vào cây tổ chức
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl font-bold shadow-sm text-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 p-6 md:p-8 max-w-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Họ và tên
              </label>
              <input
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a884] outline-none transition-all"
                type="text"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Email
                </label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a884] outline-none transition-all"
                  type="email"
              
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Số điện thoại
                </label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a884] outline-none transition-all"
                  type="text"
                
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Mật khẩu
              </label>
              <input
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a884] outline-none transition-all"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Vai trò
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("MANAGER")}
                  className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer
                    ${role === "MANAGER"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"
                    }`}
                >
                  Quản lý
                </button>
                <button
                  type="button"
                  onClick={() => setRole("STAFF")}
                  className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer
                    ${role === "STAFF"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300"
                    }`}
                >
                  Nhân viên
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Quản lý trực tiếp
              </label>
              <div className="relative">
                <UserCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full p-3 pl-10 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a884] outline-none transition-all bg-white appearance-none cursor-pointer"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn quản lý trực tiếp --</option>
                  {eligibleManagers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {role === "MANAGER"
                  ? "Quản lý báo cáo trực tiếp cho Admin."
                  : "Nhân viên báo cáo trực tiếp cho Quản lý hoặc Admin."}
              </p>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 p-3.5 bg-[#00a884] hover:bg-teal-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              type="submit"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
