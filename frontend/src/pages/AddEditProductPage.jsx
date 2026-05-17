import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const AddEditProductPage = () => {
  const { productId } = useParams("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStokeQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getAllCategory();
        setCategories(categoriesData.categories);
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error Getting all Categories: " + error
        );
      }
    };

    const fetProductById = async () => {
      if (productId) {
        setIsEditing(true);
        try {
          const productData = await ApiService.getProductById(productId);
          if (productData.status === 200) {
            setName(productData.product.name);
            setSku(productData.product.sku);
            setPrice(productData.product.price);
            setStokeQuantity(productData.product.stockQuantity);
            setCategoryId(productData.product.categoryId);
            setDescription(productData.product.description);
            setImageUrl(productData.product.imageUrl);
          } else {
            showMessage(productData.message);
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Error Getting a Product by Id: " + error
          );
        }
      }
    };

    fetchCategories();
    if (productId) fetProductById();
  }, [productId]);

  //metjhod to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result); //user imagurl to preview the image to upload
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("price", price);
    formData.append("stockQuantity", stockQuantity);
    formData.append("categoryId", categoryId);
    formData.append("description", description);
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    try {
      if (isEditing) {
        formData.append("productId", productId);
        await ApiService.updateProduct(formData);
        showMessage("Product successfully updated");
      } else {
        await ApiService.addProduct(formData);
        showMessage("Product successfully Saved 🤩");
      }
      navigate("/product");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Saving a Product: " + error
      );
    }
  };

  return (
    <Layout>
      {message && <div className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-[30px]">{message}</div>}

      <div className="max-w-[800px] mx-auto p-5 bg-[#fefefe] shadow-[0_1px_1px_#008080] rounded-[10px]">
        <h1 className="text-[2rem] font-bold text-[#008080] text-center mb-8">{isEditing ? "Edit Product" : "Add Product"}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Product Name</label>
            <input
              className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Sku</label>
            <input
              className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Stock Quantity</label>
            <input
              className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStokeQuantity(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Price</label>
            <input
              className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Description</label>

            <textarea
              className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none resize-vertical min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Category</label>

            <select
              className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col mb-[15px]">
            <label className="text-base text-[#2F4F4F] mb-2 font-semibold">Product Image</label>
            <input className="p-2.5 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none" type="file" onChange={handleImageChange} />

            {imageUrl && (
              <img src={imageUrl} alt="preview" className="w-full h-[200px] object-cover rounded-lg mt-[15px]" />
            )}
          </div>
          <button className="p-[12px_20px] bg-[#008080] text-white border-none rounded-md cursor-pointer text-base transition-colors duration-300 ease mt-[15px] hover:bg-[#2F4F4F]" type="submit">{isEditing ? "Edit Product" : "Add Product"}</button>

        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;