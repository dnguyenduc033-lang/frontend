import React, { useState, useEffect, useMemo } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import PaginationComponent from "../component/PaginationComponent";
import { 
  Users, Search, Trash2, ShieldAlert, UserCog, 
  AlertTriangle, Eye, X, Mail, Phone, Briefcase, User, Lock, Pencil, Check
} from "lucide-react";

const UserPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");   
  const [showOrgChart, setShowOrgChart] = useState(false); 

  // State quản lý xem chi tiết người dùng
  const [selectedUser, setSelectedUser] = useState(null);

  // 🌟 CÁC STATE MỚI: Phục vụ tính năng chỉnh sửa mật khẩu
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ApiService.getAllUsers();
        if (response.status === 200) {
          setAllUsers(response.users || []);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Lỗi khi tải danh sách người dùng."
        );
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...allUsers];
    if (searchTerm.trim() !== "") {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.name && u.name.toLowerCase().includes(lowSearch)) ||
        (u.email && u.email.toLowerCase().includes(lowSearch)) ||
        (u.phoneNumber && u.phoneNumber.includes(lowSearch))
      );
    }
    // THÊM: lọc theo role
    if (roleFilter !== "ALL") {
      result = result.filter(u => u.role === roleFilter);
    }
    return result;
  }, [allUsers, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn vô hiệu hóa và xóa tài khoản này?")) {
      try {
        await ApiService.deleteUser(userId);
        showMessage("Xóa tài khoản thành công");
        setAllUsers(prev => prev.filter(user => user.id !== userId));
        
        if (selectedUser && selectedUser.id === userId) {
          handleCloseModal();
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Lỗi khi xóa người dùng."
        );
      }
    }
  };

  // 🌟 HÀM MỚI: Xử lý lưu mật khẩu mới xuống Backend Spring Boot
  const handleSavePassword = async () => {
    if (!newPassword || newPassword.trim().length < 6) {
      alert("Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!");
      return;
    }

    try {
      // Đóng gói DTO gửi lên: giữ nguyên ID và truyền kèm password mới
      const userDTO = {
        id: selectedUser.id,
        password: newPassword
      };

      const response = await ApiService.updateUser(selectedUser.id, userDTO);
      if (response.status === 200) {
        showMessage(`Đổi mật khẩu tài khoản ${selectedUser.name} thành công!`);
        handleCloseModal();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.");
    }
  };

  // Hàm đóng Modal an toàn, tự động dọn dẹp bộ nhớ state
  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsEditingPassword(false);
    setNewPassword("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      <div className="w-full font-['Poppins'] pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen text-slate-800 relative">
        
        {/* TIÊU ĐỀ */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#00a884] to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white shrink-0">
            <Users size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[32px] font-black text-[#00a884] tracking-tight mb-1 leading-none">
              Quản Lý Nhân Sự
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1.5">
              Phân quyền và kiểm soát tài khoản truy cập hệ thống
            </p>
          </div>
        </div>

        {/* THÔNG BÁO HỆ THỐNG */}
        {message && (
          <div className="mb-8 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl font-bold shadow-sm text-sm flex items-center gap-3 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            {message}
          </div>
        )}

        {/* THANH CÔNG CỤ */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 p-6 mb-8 flex flex-col gap-4">
          {/* Hàng 1: Tìm kiếm + Tổng + Nút cây */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:max-w-md group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a884] transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] transition-all text-sm text-slate-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <div className="bg-teal-50 border border-teal-100 px-5 py-2.5 rounded-xl flex items-center justify-center gap-3 shadow-inner">
                <span className="text-xs font-bold text-teal-700 tracking-wider">TỔNG NHÂN SỰ:</span>
                <span className="text-lg font-black text-[#00a884]">{filteredUsers.length}</span>
              </div>
              {/* NÚT CÂY NHÂN SỰ */}
              <button
                onClick={() => setShowOrgChart(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00a884] hover:bg-teal-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Users size={16} />
                Cây nhân sự
              </button>
            </div>
          </div>

          {/* Hàng 2: Bộ lọc Role */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Lọc:</span>
            {["ALL", "ADMIN", "MANAGER", "STAFF"].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide border transition-all cursor-pointer
                  ${roleFilter === r
                    ? r === "ALL"      ? "bg-slate-700 text-white border-slate-700"
                    : r === "ADMIN"    ? "bg-rose-500 text-white border-rose-500"
                    : r === "MANAGER"  ? "bg-blue-500 text-white border-blue-500"
                                      : "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
              >
                {r === "ALL" ? "Tất cả" : r}
              </button>
            ))}
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
          {currentItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-slate-400 font-black uppercase text-xs tracking-widest w-[80px]">ID</th>
                    <th className="p-5 text-slate-400 font-black uppercase text-xs tracking-widest">Hồ sơ nhân sự</th>
                    <th className="p-5 text-slate-400 font-black uppercase text-xs tracking-widest">Liên hệ</th>
                    <th className="p-5 text-slate-400 font-black uppercase text-xs tracking-widest">Vai trò</th>
                    <th className="p-5 text-slate-400 font-black uppercase text-xs tracking-widest text-center w-[160px]">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 text-sm font-bold text-slate-400">#{user.id}</td>
                      <td className="p-5">
                        <div className="font-bold text-slate-800 text-[15px] mb-0.5">{user.name}</div>
                        <div className="text-xs font-medium text-slate-500">{user.email}</div>
                      </td>
                      <td className="p-5 text-sm font-semibold text-slate-600">
                        {user.phoneNumber || <span className="text-slate-300 italic">Chưa cập nhật</span>}
                      </td>
                      <td className="p-5">
                        {user.role === 'ADMIN' ? (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide flex items-center gap-1.5 w-fit shadow-sm">
                            <ShieldAlert size={14} /> ADMIN
                          </span>
                        ) : user.role === 'MANAGER' ? (
                          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide flex items-center gap-1.5 w-fit shadow-sm">
                            <UserCog size={14} /> MANAGER
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide flex items-center gap-1.5 w-fit shadow-sm">
                            <User size={14} /> STAFF
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* Nút Xem Chi Tiết */}
                          <button
                            className="w-10 h-10 bg-white border border-slate-200 text-teal-600 hover:text-white hover:bg-[#00a884] hover:border-[#00a884] rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            onClick={() => setSelectedUser(user)}
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye size={18} strokeWidth={2.5} />
                          </button>
                          
                          {/* Nút Xóa */}
                          <button
                            className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <AlertTriangle size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Không có dữ liệu</h3>
              <p className="text-slate-400 font-medium text-sm">
                Chưa có nhân sự nào khớp với điều kiện tìm kiếm.
              </p>
            </div>
          )}
        </div>

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
        
        {/* MODAL HỒ SƠ CHI TIẾT + TÍNH NĂNG ĐỔI MẬT KHẨU TẠI CHỖ */}
        {selectedUser && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all animate-fade-in"
              onClick={e => e.stopPropagation()}
            >
              {/* Dải bìa màu bên trên */}
              <div className="h-32 bg-gradient-to-r from-[#00a884] to-teal-500 relative">
                <button 
                  onClick={handleCloseModal} 
                  className="absolute top-4 right-4 text-white hover:text-rose-200 transition-colors bg-white/20 hover:bg-rose-500 rounded-full p-1 cursor-pointer"
                  title="Đóng"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Phần nội dung thông tin cá nhân */}
              <div className="px-8 pb-10 relative">
                
                {/* Ảnh đại diện Avatar */}
                <div className="w-24 h-24 bg-white rounded-full mx-auto -mt-12 flex items-center justify-center shadow-md border-[5px] border-white text-teal-600 relative z-10">
                  <User size={40} strokeWidth={2} />
                </div>
                
                <div className="text-center mt-3 mb-6">
                  {/* name đại diện trực tiếp cho Tên thật của nhân viên */}
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {selectedUser.name || "Chưa cập nhật tên"}
                  </h3>
                  <p className="text-xs font-black text-slate-400 mt-1.5 uppercase tracking-widest">
                    ID Nhân sự: #{selectedUser.id}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Ô Email */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                      <Mail size={18} strokeWidth={2.5} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email liên hệ</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Ô Số điện thoại */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                      <Phone size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                      <p className="text-sm font-bold text-slate-700">{selectedUser.phoneNumber || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  {/* Ô Cấp độ phân quyền */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                      <Briefcase size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cấp độ phân quyền</p>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide ${
                        selectedUser.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-700'
                          : selectedUser.role === 'MANAGER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>

                  {/* 🌟 Ô CHỈNH SỬA MẬT KHẨU ĐỘNG: Xuất hiện khi bấm nút Icon Chỉnh sửa */}
                  {isEditingPassword && (
                    <div className="flex items-center gap-4 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl animate-fadeIn">
                      <div className="w-10 h-10 bg-white shadow-sm text-amber-500 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                        <Lock size={18} strokeWidth={2.5} />
                      </div>
                      <div className="w-full flex gap-2 items-end">
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Nhập mật khẩu mới</p>
                          <input 
                            type="text" 
                            placeholder="Tối thiểu 6 ký tự..." 
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg outline-none text-xs font-bold text-slate-700 focus:border-amber-500 transition-colors"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        {/* Nút lưu nhanh mật khẩu */}
                        <button 
                          onClick={handleSavePassword}
                          className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                          title="Lưu mật khẩu mới"
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                

              </div>
            </div>
          </div>
        )}

        {/* MODAL CÂY NHÂN SỰ */}
        {showOrgChart && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowOrgChart(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white">
                    <Users size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Cây Nhân Sự</h3>
                </div>
                <button
                  onClick={() => setShowOrgChart(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nội dung cây */}
              <div className="p-8 overflow-x-auto">
                {/* Tầng ADMIN */}
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quản trị hệ thống</p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {allUsers.filter(u => u.role === "ADMIN").map(u => (
                      <div key={u.id} className="flex flex-col items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 min-w-[120px]">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                          <User size={20} />
                        </div>
                        <p className="text-sm font-black text-rose-700 text-center">{u.name}</p>
                        <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">ADMIN</span>
                      </div>
                    ))}
                  </div>

                  {/* Đường kẻ dọc nối xuống */}
                  {allUsers.some(u => u.role === "MANAGER" || u.role === "STAFF") && (
                    <div className="w-0.5 h-8 bg-slate-200 my-2" />
                  )}

                  {/* Tầng MANAGER */}
                  {allUsers.some(u => u.role === "MANAGER") && (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quản lý</p>
                      <div className="flex gap-3 flex-wrap justify-center">
                        {allUsers.filter(u => u.role === "MANAGER").map(u => (
                          <div key={u.id} className="flex flex-col items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 min-w-[120px]">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                              <User size={20} />
                            </div>
                            <p className="text-sm font-black text-blue-700 text-center">{u.name}</p>
                            <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">MANAGER</span>
                          </div>
                        ))}
                      </div>
                      {allUsers.some(u => u.role === "STAFF") && (
                        <div className="w-0.5 h-8 bg-slate-200 my-2" />
                      )}
                    </>
                  )}

                  {/* Tầng STAFF */}
                  {allUsers.some(u => u.role === "STAFF") && (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nhân viên</p>
                      <div className="flex gap-3 flex-wrap justify-center">
                        {allUsers.filter(u => u.role === "STAFF").map(u => (
                          <div key={u.id} className="flex flex-col items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 min-w-[120px]">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
                              <User size={20} />
                            </div>
                            <p className="text-sm font-black text-emerald-700 text-center">{u.name}</p>
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">STAFF</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserPage;