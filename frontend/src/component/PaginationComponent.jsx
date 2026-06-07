import React from "react";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    // 🌟 THUẬT TOÁN CO GIÃN RÚT GỌN TRANG:
    const generatePagination = () => {
        // Nếu tổng số trang ít hơn hoặc bằng 7, hiển thị toàn bộ không cần ẩn
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Nếu đang đứng ở các trang đầu (1, 2, 3, 4)
        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "...", totalPages];
        }

        // Nếu đang đứng ở các trang cuối cùng (sát nút max)
        if (currentPage >= totalPages - 3) {
            return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        // Nếu đang lửng lơ ở các trang giữa bảng
        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    };

    const pageNumbers = generatePagination();

    // Nếu không có trang nào hoặc chỉ có 1 trang đơn lẻ thì ẩn thanh phân trang
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center mt-5">
            {/* Nút Trước */}
            <button 
                className="bg-[#555] text-white px-[15px] py-2.5 mx-[5px] cursor-pointer transition-colors duration-300 ease-in-out disabled:bg-[#d3d3d3] disabled:cursor-not-allowed hover:bg-[#2F4F4F]"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                &laquo; Trước
            </button>

            {/* Danh sách các nút số và dấu ba chấm */}
            {pageNumbers.map((number, index) => (
                <button 
                    key={index}
                    // Nếu là dấu "..." thì khóa bấm, đổi chuột về mặc định
                    disabled={number === "..."}
                    className={`px-[15px] py-2.5 mx-[5px] transition-colors duration-300 ease-in-out ${
                        number === "..." 
                            ? "bg-transparent text-[#555] cursor-default" 
                            : currentPage === number 
                                ? "bg-[#008080] text-white font-bold cursor-pointer hover:bg-[#2F4F4F]" 
                                : "bg-[#555] text-white cursor-pointer hover:bg-[#2F4F4F]"
                    }`}
                    onClick={() => number !== "..." && onPageChange(number)}
                >
                    {number}
                </button>
            ))}

            {/* Nút Sau */}
            <button 
                className="bg-[#555] text-white px-[15px] py-2.5 mx-[5px] cursor-pointer transition-colors duration-300 ease-in-out disabled:bg-[#d3d3d3] disabled:cursor-not-allowed hover:bg-[#2F4F4F]"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Sau &raquo;
            </button>
        </div>
    );
};

export default PaginationComponent;