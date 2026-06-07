import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Layers, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck, 
  Newspaper, 
  UserPlus, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Bell,
  Building2
} from "lucide-react"; 
import ApiService from "../service/ApiService";

const logout = () => {
  ApiService.logout();
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = ApiService.isAdmin();
  const isManager = ApiService.isManager();

  useEffect(() => {
      if (!isManager) return; // Chỉ Manager mới gọi API thông báo
      const fetchUnread = async () => {
          try {
              const res = await ApiService.getUnreadCount();
              setUnreadCount(parseInt(res.message || "0"));
          } catch {}
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
  }, [isManager]);
  const isAdminOrManager = ApiService.isAdminOrManager();
  const isStaff = ApiService.isStaff();
  const isAuth = ApiService.isAuthenticated();

  // Hàm helper để render từng mục menu
  const MenuItem = ({ to, icon: Icon, label, onClick = null }) => {
    const isActive = location.pathname === to;
    
    return (
      <li className="mb-1 group px-3">
        <Link
          to={to}
          onClick={onClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
            isActive
              ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20"
              : "text-gray-400 hover:bg-white/5 hover:text-teal-400"
          }`}
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          <span className="text-[0.95rem] tracking-wide">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 w-[270px] h-screen bg-[#111827] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* NÚT TOGGLE HIỆN ĐẠI HƠN */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute top-1/2 right-0 translate-x-full -translate-y-1/2 bg-white border border-gray-200 rounded-md px-1 py-3 min-h-[56px] shadow-sm hover:bg-gray-50 text-gray-500 z-50 items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className={`w-4 h-4 transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* LOGO IMS */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3 select-none">
          <div className="p-2 bg-teal-600/10 rounded-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 shrink-0">
              <path d="M12 21L3 16.5V7.5L12 3L21 7.5V16.5L12 21Z" fill="#0d9488" stroke="#5eead4" strokeWidth="1.5" />
              <path d="M12 12V21M12 12L3 7.5M12 12L21 7.5" stroke="#5eead4" strokeWidth="1.5" />
              <path d="M7.5 5.25L16.5 9.75V18.75" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            IMS<span className="text-teal-500">.</span>
          </span>
        </div>
      </div>

      {/* DANH SÁCH MENU */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        {/* Nhóm: Tổng quan — chỉ ADMIN và MANAGER */}
        {isAdminOrManager && (
          <div className="mb-6">
            <p className="px-7 mb-2 text-[0.7rem] uppercase font-bold text-gray-500 tracking-[2px]">Bảng điều khiển</p>
            <ul>
              <MenuItem to="/dashboard" icon={LayoutDashboard} label="Bảng điều khiển" />
              <MenuItem to="/transaction" icon={ArrowLeftRight} label="Các giao dịch" />
            </ul>
          </div>
        )}

        {/* Nhóm: Kho hàng */}
        {(isAdminOrManager || isStaff) && (
          <div className="mb-6">
            <p className="px-7 mb-2 text-[0.7rem] uppercase font-bold text-gray-500 tracking-[2px]">Quản lý kho</p>
            <ul>
              {isAdminOrManager && <MenuItem to="/category" icon={Layers} label="Danh mục" />}
              <MenuItem to="/product" icon={Package} label="Sản phẩm" />
              {isAdminOrManager && <MenuItem to="/supplier" icon={Building2} label="Nhà cung cấp" />}
              {!isAdmin && !isStaff && <MenuItem to="/purchase-request" icon={ShoppingCart} label="Yêu cầu nhập hàng" />}
              {isAdmin && <MenuItem to="/purchase-approval" icon={ShoppingCart} label="Duyệt nhập hàng" />}
              {(isStaff || !isAdmin) && <MenuItem to="/sell" icon={TrendingUp} label="Xuất kho" />}
              {(isStaff || !isAdmin) && <MenuItem to="/return" icon={RotateCcw} label="Đổi / Trả hàng" />}
            </ul>
          </div>
        )}

        {/* Nhóm: Hệ thống */}
        {(isAdminOrManager || isStaff) && (
          <div className="mb-6">
            <p className="px-7 mb-2 text-[0.7rem] uppercase font-bold text-gray-500 tracking-[2px]">Hệ thống</p>
            <ul>
              {(isStaff || !isAdmin) && <MenuItem to="/warranty-check" icon={ShieldCheck} label="Bảo hành" />}
              <MenuItem to="/news" icon={Newspaper} label="Tin tức" />
            </ul>
          </div>
        )}

        {/* Nhóm: Admin */}
        {isAdmin && (
          <div className="mb-6">
            <p className="px-7 mb-2 text-[0.7rem] uppercase font-bold text-gray-500 tracking-[2px]">Quản trị viên</p>
            <ul>
              <MenuItem to="/register" icon={UserPlus} label="Tạo tài khoản" />
              <MenuItem to="/users" icon={Users} label="Quản lý nhân sự" />
            </ul>
          </div>
        )}
      </nav>

      {/* FOOTER: CÁ NHÂN */}
      <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
        <ul>
          {isAuth && (
            <>
              {isManager && (
                <li className="mb-1 px-3">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="relative flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                  >
                    <Bell size={20} strokeWidth={2} />
                    <span className="text-[0.95rem] tracking-wide">Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              )}

              <MenuItem to="/profile" icon={User} label="Hồ sơ cá nhân" />

              <MenuItem to="/login" icon={LogOut} label="Đăng xuất" onClick={logout} />
            </>
          )}
        </ul>
      </div>

      {/* Style phụ trợ cho scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default Sidebar;