import React from "react";

const PaginationComponent = ({currentPage, totalPages, onPageChange}) =>{
    //Generate page numbers based on total pages
    const pageNumbers = Array.from({length: totalPages}, (_, i) => i+1);

    return(
        <div className="flex justify-center items-center mt-5">
            <button 
            className="bg-[#555] text-white px-[15px] py-2.5 mx-[5px] cursor-pointer transition-colors duration-300 ease-in-out disabled:bg-[#d3d3d3] disabled:cursor-not-allowed hover:bg-[#2F4F4F]"
            disabled={currentPage === 1}
            onClick={()=> onPageChange(currentPage - 1)}
            >
                &laquo; Prev
            </button>

            {pageNumbers.map((number) =>(
                <button key={number}
                className={`px-[15px] py-2.5 mx-[5px] cursor-pointer transition-colors duration-300 ease-in-out hover:bg-[#2F4F4F] ${currentPage === number ? "bg-[#008080] text-white font-bold": "bg-[#555] text-white"} ` }
                onClick={()=> onPageChange(number)}>
                {number}
                </button>
            ))}

            <button className="bg-[#555] text-white px-[15px] py-2.5 mx-[5px] cursor-pointer transition-colors duration-300 ease-in-out disabled:bg-[#d3d3d3] disabled:cursor-not-allowed hover:bg-[#2F4F4F]"
            disabled={currentPage === totalPages}
            onClick={()=> onPageChange(currentPage + 1)}>
                    Next &raquo;
            </button>

        </div>
    )
}
export default PaginationComponent;