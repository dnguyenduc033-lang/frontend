import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

const ScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  useEffect(() => {
    // Nếu popup chưa mở thì không làm gì cả
    if (!isOpen) return;

    // Khởi tạo máy quét nhắm vào thẻ div có id="reader"
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      rememberLastUsedCamera: true
    });

    // Bắt đầu đọc hình ảnh
    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText); // Trả chuỗi mã vạch ra ngoài
        scanner.clear();            // Tắt camera
        onClose();                  // Đóng popup
      },
      (error) => {
        console.warn("Đang tìm mã...", error);
      }
    );

    // Dọn dẹp bộ nhớ khi tắt giao diện
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 flex items-center justify-between bg-teal-500 text-white">
          <span className="font-bold">Đưa mã Sê-ri vào khung ngắm</span>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6">
          {/* Nơi camera sẽ hiển thị */}
          <div id="reader" className="w-full rounded-xl overflow-hidden border-2 border-dashed border-slate-300"></div>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;