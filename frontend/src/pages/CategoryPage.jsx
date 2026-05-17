import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  //fetcg the categories form our backend

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await ApiService.getAllCategory();
        if (response.status === 200) {
          setCategories(response.categories);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Loggin in a User: " + error
        );
      }
    };
    getCategories();
  }, []);

  //add category
  const addCategory = async () => {
    if (!categoryName) {
      showMessage("Category name cannot be empty");
      return;
    }
    try {
      await ApiService.createCategory({ name: categoryName });
      showMessage("Category sucessfully added");
      setCategoryName(""); //clear input
      window.location.reload(); //relode page
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Loggin in a User: " + error
      );
    }
  };

  //Edit category
  const editCategory = async () => {
    try {
      await ApiService.updateCategory(editingCategoryId, {
        name: categoryName,
      });
      showMessage("Category sucessfully Updated");
      setIsEditing(false);
      setCategoryName(""); //clear input
      window.location.reload(); //relode page
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Loggin in a User: " + error
      );
    }
  };

  //populate the edit category data
  const handleEditCategory = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
  };

  //delete category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ApiService.deleteCategory(categoryId);
        showMessage("Category sucessfully Deleted");
        window.location.reload(); //relode page
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Deleting in a Category: " + error
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
      <div className="p-5">
        <div className="ml-3 flex items-center mb-5">
          <h1 className="text-[#008080] text-2xl font-bold">Categories</h1>
          <div className="mx-auto">
            <input
              className="p-2.5 mr-2.5 w-[300px] border border-[#ddd] text-base focus:border-[#008080] outline-none"
              value={categoryName}
              type="text"
              placeholder="Category Name"
              onChange={(e) => setCategoryName(e.target.value)}
            />

            {!isEditing ? (
              <button className="p-[12px_12px] bg-[#008080] text-base text-white border-none cursor-pointer hover:bg-[#2F4F4F] transition-colors" onClick={addCategory}>Add Category</button>
            ) : (
              <button className="p-[12px_12px] bg-[#008080] text-base text-white border-none cursor-pointer hover:bg-[#2F4F4F] transition-colors" onClick={editCategory}>Edit Cateogry</button>
            )}
          </div>
        </div>

        {categories && (
          <ul className="list-none p-0 mt-[50px]">
            {categories.map((category) => (
              <li className="flex justify-between p-[18px] m-[5px] text-xl bg-[#f9f9f9] border-b border-[#eee] rounded-[10px] color-[#2F4F4F] font-[550] hover:bg-[#f9ffff] transition-colors" key={category.id}>
                <span>{category.name}</span>

                <div className="category-actions">
                  <button className="ml-2.5 p-[10px_20px] bg-[#008080] text-base text-white border-none cursor-pointer hover:bg-[#2F4F4F] transition-colors" onClick={() => handleEditCategory(category)}>
                    Edit
                  </button>
                  <button className="ml-2.5 p-[10px_20px] bg-[#dc3545] text-base text-white border-none cursor-pointer hover:bg-[#a5202e] transition-colors" onClick={() => handleDeleteCategory(category.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;