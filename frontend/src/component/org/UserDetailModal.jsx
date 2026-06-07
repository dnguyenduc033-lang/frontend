import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, Mail, Phone, Briefcase, User, Lock, Check, Calendar, UserCheck, Pencil, Loader2
} from "lucide-react";
import ApiService from "../../service/ApiService";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <div className="text-sm font-bold text-slate-700 break-words">{value}</div>
    </div>
  </div>
);

const roleBadgeClass = {
  ADMIN: "bg-rose-100 text-rose-700",
  MANAGER: "bg-blue-100 text-blue-700",
  STAFF: "bg-emerald-100 text-emerald-700",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  return new Date(dateStr).toLocaleString("vi-VN");
};

const UserDetailModal = ({ user, loading, onClose, onSuccess }) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.classList.add("user-modal-open");
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("user-modal-open");
      document.body.style.overflow = "";
    };
  }, []);

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.trim().length < 6) {
      alert("Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!");
      return;
    }

    setSaving(true);
    try {
      const response = await ApiService.updateUser(user.id, {
        id: user.id,
        password: newPassword,
      });
      if (response.status === 200) {
        onSuccess(`Đổi mật khẩu tài khoản ${user.name} thành công!`);
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-transparent"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-title"
    >
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-28 bg-gradient-to-r from-[#00a884] to-teal-500 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-rose-200 transition-colors bg-white/20 hover:bg-rose-500 rounded-full p-1 cursor-pointer"
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-8 pb-8 relative">
          <div className="w-20 h-20 bg-white rounded-full mx-auto -mt-10 flex items-center justify-center shadow-md border-[4px] border-white text-teal-600 relative z-10">
            {loading ? <Loader2 size={32} className="animate-spin" /> : <User size={36} />}
          </div>

          <div className="text-center mt-3 mb-6">
            <h3 id="user-detail-title" className="text-2xl font-black text-slate-800">{user.name}</h3>
            <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">
              Mã nhân sự #{user.id}
            </p>
          </div>

          <div className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Số điện thoại" value={user.phoneNumber || "Chưa cập nhật"} />
            <InfoRow
              icon={Briefcase}
              label="Vai trò"
              value={
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide ${roleBadgeClass[user.role] || roleBadgeClass.STAFF}`}>
                  {user.role}
                </span>
              }
            />
            <InfoRow
              icon={UserCheck}
              label="Quản lý trực tiếp"
              value={user.managerName || "Không có"}
            />
            <InfoRow icon={Calendar} label="Ngày tạo tài khoản" value={formatDate(user.createdAt)} />

            {!isEditingPassword ? (
              <button
                type="button"
                onClick={() => setIsEditingPassword(true)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors cursor-pointer"
              >
                <Pencil size={16} />
                Đổi mật khẩu
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <Lock size={18} className="text-amber-500 shrink-0" />
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg outline-none text-sm font-medium focus:border-amber-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  onClick={handleSavePassword}
                  disabled={saving}
                  className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg cursor-pointer"
                  title="Lưu mật khẩu"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserDetailModal;
