import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  //Pagination Set-Up
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();

        if (productData.status === 200) {
          setTotalPages(Math.ceil(productData.products.length / itemsPerPage));

          setProducts(
            productData.products.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Products: " + error
        );
      }
    };

    getProducts();
  }, [currentPage]);

  //Delete a product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this Product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product sucessfully Deleted");
        window.location.reload(); //relode page
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error Deleting in a product: " + error
        );
      }
    }
  };

  //metjhod to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px]">{message}</div>}

      <div className="p-5 font-['Poppins']">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#008080]">Products</h1>
          <button
            className="bg-[#008080] text-white p-[12px_20px] border-none rounded-md cursor-pointer text-base transition-colors duration-300 hover:bg-[#2F4F4F]"
            onClick={() => navigate("/add-product")}
          >
            Add Product
          </button>
        </div>

        {products && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white border border-[#eee] rounded-[15px] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-[5px] flex flex-col items-center text-center">
                <img
                  className="w-full h-[200px] object-cover rounded-lg mb-[15px]"
                  src={product.imageUrl}
                  alt={product.name}
                />

                <div className="w-full mb-[15px]">
                    <h3 className="text-xl font-bold text-[#2F4F4F] mb-2.5 truncate">{product.name}</h3>
                    <p className="text-sm text-[#777] m-[5px_0]">Sku: {product.su}</p>
                    <p className="text-lg font-bold text-[#008080] m-[5px_0]">Price: {product.price}</p>
                    <p className="text-sm text-[#555] m-[5px_0]">Quantity: {product.stockQuantity}</p>
                </div>

                <div className="flex gap-2.5 w-full">
                    <button className="flex-1 p-[10px] bg-[#008080] text-white border-none rounded-md cursor-pointer text-sm transition-colors duration-300 hover:bg-[#2F4F4F]" onClick={()=> navigate(`/edit-product/${product.id}`)}>Edit</button>
                    <button className="flex-1 p-[10px] bg-[#dc3545] text-white border-none rounded-md cursor-pointer text-sm transition-colors duration-300 hover:bg-[#a5202e]" onClick={()=> handleDeleteProduct(product.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaginationComponent
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      />
    </Layout>
  );
};
export default ProductPage;