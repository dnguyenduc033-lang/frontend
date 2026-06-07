import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  // Khởi tạo trạng thái: Mở trên PC (>768px), Đóng trên Điện thoại
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Lắng nghe sự kiện thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f6] overflow-x-hidden relative">
      {/* LỚP NỀN MỜ (OVERLAY): Chỉ hiện trên mobile khi Sidebar đang mở */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* VÙNG NỘI DUNG CHÍNH */}
      <div id="app-main-content" className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-[270px]' : 'ml-0'}`}>
        
        {/* HEADER DÀNH RIÊNG CHO MOBILE */}
        <div className="md:hidden flex items-center justify-between bg-white px-5 py-4 shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-black tracking-tighter text-[#111827]">
              IMS<span className="text-teal-500">.</span>
            </span>
          </div>
          {/* Nút Hamburger (3 gạch ngang) */}
          <button 
            onClick={toggleSidebar}
            className="p-2 bg-slate-50 text-slate-600 rounded-lg focus:outline-none border border-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* BỌC NỘI DUNG TRANG: Tự động bóp lề trên điện thoại */}
        <div className="p-3 md:p-6 lg:p-8 w-full max-w-[100vw] md:max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;