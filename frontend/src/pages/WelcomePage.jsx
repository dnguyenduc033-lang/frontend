import React from "react";
import { useNavigate } from "react-router-dom";

// --- BỘ ICON CHO GIAO DIỆN (Giữ nguyên gốc) ---
const BoxIconFilled = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 21.0001L3 16.5001V7.50005L12 3.00005L21 7.50005V16.5001L12 21.0001Z" fill="#008080" />
    <path d="M12 12.0001V21.0001M12 12.0001L3 7.50005M12 12.0001L21 7.50005" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 5.25L16.5 9.75 M16.5 5.25L7.5 9.75 M7.5 9.75V18.75 M16.5 9.75V18.75" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7.5 C9.5 4.5 7 7 12 7.5 C14.5 4.5 17 7 12 7.5 Z" fill="white" />
    <circle cx="12" cy="7.5" r="1.2" fill="#008080" />
  </svg>
);

const TagIcon = ({ className = "w-7 h-7 text-[#008080]" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const ChartIcon = ({ className = "w-7 h-7 text-[#008080]" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const BoltIcon = ({ className = "w-7 h-7 text-[#008080]" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.273-3.973-6.869-6.869l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

// Component con cho từng Thẻ Tính năng (Đã thiết kế lại chuẩn SaaS)
const FeatureCard = ({ icon, title, description }) => (
  <div 
    className="group relative p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_20px_40px_rgba(0,128,128,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center cursor-pointer overflow-hidden"
    role="button"
    tabIndex={0}
  >
    {/* Thanh accent line ở mép trên xuất hiện cực mượt khi hover */}
    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#008080] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>

    {/* Khối chứa Icon (Tăng kích thước và làm hiệu ứng) */}
    <div className="w-20 h-20 bg-gradient-to-br from-[#e0f2f1] to-teal-50 rounded-2xl flex items-center justify-center shrink-0 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
      {/* Thuộc tính scale-125 giúp bù lại kích thước icon cũ để vừa vặn với khung to hơn */}
      <div className="scale-125">
        {icon}
      </div>
    </div>

    {/* Nội dung chữ */}
    <h3 className="text-xl font-bold text-[#1e293b] mb-3 group-hover:text-[#008080] transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-500 text-sm leading-relaxed px-2">
      {description}
    </p>
  </div>
);

const WelcomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Định danh Seri / IMEI",
      description: "Quản lý nghiêm ngặt từng sản phẩm vật lý...",
      icon: <TagIcon />
    },
    {
      title: "Tài chính Minh Bạch",
      description: "Tự động tính toán giá vốn lưu kho...",
      icon: <ChartIcon />
    },
    {
      title: "Xử Lý Hàng Loạt",
      description: "Hỗ trợ cơ chế tải tệp dữ liệu Excel...",
      icon: <BoltIcon />
    }
  ];

  return (
    <div className="min-h-screen font-['Poppins'] flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-[0_20px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 select-none">
            <BoxIconFilled className="w-20 h-20 shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="text-3xl font-extrabold text-[#008080] leading-none mb-1">IMS</span>
              <span className="text-sm font-semibold text-gray-400 leading-none">| Quản lý kho thông minh</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-[#008080] transition-colors">Tính năng</a>
              
              <a href="#guides" className="hover:text-[#008080] transition-colors">Hướng dẫn</a>
              
            </nav>
            <div className="hidden lg:block w-px h-6 bg-gray-300"></div>
            <button
              onClick={() => navigate("/login")}
              className="border border-[#008080] text-[#008080] font-semibold px-6 py-2 rounded-md hover:bg-[#e0f2f1] transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 px-6 py-24 bg-gradient-to-b from-teal-100 to-white shadow-[0_15px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch text-left md:text-left">
          
          {/* Cột trái: Văn bản (Đã tinh chỉnh chiều cao và khoảng cách để cao ngang ngửa ảnh bên phải) */}
          <div className="text-center md:text-left flex flex-col justify-between items-center md:items-start py-2">
            <div className="w-full">
              <span className="bg-[#008080] text-white text-sm font-bold uppercase tracking-widest px-5 py-1.5 rounded-md mb-6 shadow-sm inline-block">
                HỆ THỐNG THẾ HỆ MỚI
              </span>
              {/* Tăng kích thước font chữ và độ giãn dòng để tiêu đề chiếm không gian tốt hơn */}
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#008080] leading-[1.2] mb-6">
                Quản Lý Sản Phẩm Điện Tử 
                <br />
                Trong Kho Hàng
              </h1>
              {/* Tăng cỡ chữ mô tả lên text-xl và nới rộng khoảng cách dòng */}
              <p className="text-gray-500 text-base md:text-xl max-w-2xl md:max-w-xl mb-8 leading-relaxed mx-auto md:mx-0">
                Inventory Management System (IMS) là nền tảng quản lý kho hàng hiện đại, tự động hóa quy trình nhập xuất và theo dõi chi tiết sản phẩm với độ chính xác tuyệt đối.
              </p>
            </div>
            
            {/* Nút bấm giữ nguyên kích thước w-56 theo ý bạn nhưng được đặt ở đáy của khối content nhờ justify-between */}
            <button
              onClick={() => navigate("/login")}
              className="bg-[#008080] text-white font-semibold text-lg h-14 w-56 rounded-md shadow-[0_4px_14px_rgba(0,128,128,0.3)] hover:bg-[#006666] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto md:mx-0 shrink-0"
            >
              <span>Bắt đầu ngay</span>
              <span className="text-white font-bold">&rarr;</span>
            </button>
          </div>

          {/* Cột phải: Hình ảnh (Giữ nguyên cấu trúc xịn của bạn) */}
          <div className="relative flex justify-center items-center.">
            <img 
              src="/AnhMinhHoa.jpg" 
              alt="Hệ thống quản lý kho thông minh"
              className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-100 rounded-full blur-2xl opacity-60 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-60 -z-10"></div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-200 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Cụm Tiêu đề */}
          <div className="text-center mb-16">
            <span className="text-[#008080] font-bold tracking-widest uppercase text-sm mb-3 block opacity-90">
              Khám Phá Giải Pháp
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e293b]">
              Tính Năng Nổi Bật & Tiện Ích Cốt Lõi
            </h2>
            <div className="w-24 h-1.5 bg-[#008080] mx-auto mt-6 rounded-full opacity-80"></div>
          </div>

          {/* Lưới Thẻ Tính năng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-gray-400 py-10 text-center text-sm mt-auto">
        <p>&copy; 2026 Inventory Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;