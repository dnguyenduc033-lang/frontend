import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { User, Mail, Phone, Briefcase, Lock, Pencil, Check, X, ShieldCheck } from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  // 🌟 CÁC STATE: Phục vụ tính năng chỉnh sửa mật khẩu tại chỗ
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiService.getLoggedInUserInfo();
        // Hỗ trợ đón nhận linh hoạt cả Object lồng .user hoặc Object phẳng
        const userData = response?.user || response;
        setProfile(userData || null);
      } catch (error) {
        setMessage(error.response?.data?.message || "Lỗi khi tải thông tin cá nhân.");
      }
    };
    fetchProfile();
  }, []);

  // 🌟 HÀM XỬ LÝ: Gửi yêu cầu đổi mật khẩu cá nhân xuống Backend
  const handleSavePassword = async () => {
    if (!newPassword || newPassword.trim().length < 6) {
      alert("Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!");
      return;
    }

    try {
      // Đóng gói dữ liệu bảo mật: Chỉ truyền ID và Mật khẩu mới theo đúng quy chuẩn
      const userDTO = {
        id: profile.id,
        password: newPassword
      };

      const response = await ApiService.updateUser(profile.id, userDTO);
      if (response.status === 200) {
        showMessage("Thay đổi mật khẩu cá nhân thành công!");
        setIsEditingPassword(false);
        setNewPassword("");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.");
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  if (!profile) {
    return (
      <Layout>
        <div className="w-full flex flex-col items-center justify-center py-20 font-['Poppins'] bg-[#f4f7f9] min-h-screen">
          {message ? (
            <p className="text-rose-600 font-bold">{message}</p>
          ) : (
            <p className="text-slate-500 font-medium">Đang tải hồ sơ cá nhân...</p>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full font-['Poppins'] pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen flex flex-col items-center justify-center text-slate-800">
        
        {/* THÔNG BÁO HỆ THỐNG */}
        {message && (
          <div className="w-full max-w-md mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl font-bold shadow-sm text-sm flex items-center gap-3 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            {message}
          </div>
        )}

        {/* ======================================================= */}
        {/* THẺ HỒ SƠ CÁ NHÂN TÂN TRANG (TÍCH HỢP NÚT ĐỔI MẬT KHẨU) */}
        {/* ======================================================= */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] w-full max-w-md overflow-hidden relative border border-slate-100/80 transition-all duration-300 hover:shadow-2xl">
          
          {/* Dải bìa màu xanh ngọc lục bảo đặc trưng phía trên */}
          <div className="h-32 bg-gradient-to-r from-[#00a884] to-teal-500 relative flex items-center justify-center">
            <div className="absolute -bottom-10 bg-white rounded-full p-1.5 shadow-md z-10 border border-slate-50">
              {/* Ảnh đại diện Avatar cá nhân */}
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-[#00a884]">
                <User size={36} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Huy hiệu bảo mật nhỏ ở góc trái */}
          <div className="absolute top-4 left-5 text-white/50 flex items-center gap-1.5 pointer-events-none">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black tracking-widest uppercase">Secure Profile</span>
          </div>

          {/* Phần nội dung hiển thị hồ sơ */}
          <div className="px-8 pt-14 pb-14 relative">
            
            <div className="text-center mb-8">
              {/* Trường profile.name đóng vai trò là Tên thật, hiển thị to nhất */}
              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2.5">
                {profile.name || "Chưa cập nhật tên"}
              </h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                ID Tài khoản: #{profile.id}
              </p>
            </div>

            {/* Danh sách thông tin dạng thẻ khối xếp dọc */}
            <div className="space-y-3.5">
              
              {/* Trường dữ liệu: Họ và tên */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-colors hover:bg-slate-100/40">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Họ và tên thật</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profile.name}</p>
                  </div>
                </div>
              </div>

              {/* Trường dữ liệu: Email */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-colors hover:bg-slate-100/40">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profile.email}</p>
                  </div>
                </div>
              </div>

              {/* Trường dữ liệu: Số điện thoại */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-colors hover:bg-slate-100/40">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                    <p className="text-sm font-bold text-slate-700">
                      {profile.phoneNumber || <span className="text-slate-300 italic font-medium">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trường dữ liệu: Chức vụ phân quyền */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-colors hover:bg-slate-100/40">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60">
                    <Briefcase size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quyền hạn hệ thống</p>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide ${
                      profile.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🌟 Ô NHẬP MẬT KHẨU MỚI: Tự động trượt xuất hiện khi kích hoạt trạng thái sửa */}
              {isEditingPassword && (
                <div className="flex items-center gap-4 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl animate-fadeIn">
                  <div className="w-10 h-10 bg-white shadow-sm text-amber-500 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <div className="w-full flex gap-2 items-end">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Nhập mật khẩu mới</p>
                      <input 
                        type="password" 
                        placeholder="Tối thiểu 6 ký tự..." 
                        className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg outline-none text-xs font-bold text-slate-700 focus:border-amber-500 transition-colors"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    {/* Nút lưu nhanh tích xanh */}
                    <button 
                      onClick={handleSavePassword}
                      className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center"
                      title="Lưu thay đổi"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 🌟 NÚT BIỂU TƯỢNG CÂY BÚT CHÌ KHÓA CỨNG Ở MÉP DƯỚI BÊN PHẢI FORM */}
            <div className="absolute bottom-4 right-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPassword(!isEditingPassword);
                  setNewPassword(""); // Dọn sạch text-box khi bấm đóng mở
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md cursor-pointer border ${
                  isEditingPassword 
                    ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-teal-500 hover:text-white hover:bg-[#00a884]'
                }`}
                title={isEditingPassword ? "Hủy thao tác" : "Thay đổi mật khẩu cá nhân"}
              >
                {isEditingPassword ? <X size={15} strokeWidth={2.5} /> : <Pencil size={15} strokeWidth={2.5} />}
              </button>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ProfilePage;