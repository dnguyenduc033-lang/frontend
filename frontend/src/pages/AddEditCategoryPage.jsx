import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { Layers, Plus, Trash2, ChevronRight, Save, X, Info } from "lucide-react";

const AddEditCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [groups, setGroups] = useState([{ groupName: "", specs: [""] }]);

  useEffect(() => {
    const fetchCategory = async () => {
      if (categoryId) {
        setIsEditing(true);
        try {
          const response = await ApiService.getCategoryById(categoryId);
          if (response.status === 200) {
            setName(response.category.name);
            if (response.category.requiredSpecs) {
              try {
                setGroups(JSON.parse(response.category.requiredSpecs));
              } catch (e) {
                const oldSpecs = response.category.requiredSpecs.split(",").map(s => s.trim());
                setGroups([{ groupName: "Thông số cơ bản", specs: oldSpecs }]);
              }
            }
          }
        } catch (error) {
          setMessage("Lỗi khi tải thông tin danh mục.");
        }
      }
    };
    fetchCategory();
  }, [categoryId]);

  const addGroup = () => setGroups([...groups, { groupName: "", specs: [""] }]);
  const removeGroup = (gIndex) => setGroups(groups.filter((_, i) => i !== gIndex));
  const handleGroupNameChange = (gIndex, value) => {
    const updated = [...groups];
    updated[gIndex].groupName = value;
    setGroups(updated);
  };

  const addSpec = (gIndex) => {
    const updated = [...groups];
    updated[gIndex].specs.push("");
    setGroups(updated);
  };
  const removeSpec = (gIndex, sIndex) => {
    const updated = [...groups];
    updated[gIndex].specs = updated[gIndex].specs.filter((_, i) => i !== sIndex);
    setGroups(updated);
  };
  const handleSpecNameChange = (gIndex, sIndex, value) => {
    const updated = [...groups];
    updated[gIndex].specs[sIndex] = value;
    setGroups(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { showMessage("⚠️ Tên danh mục không được trống!"); return; }
    
    const payload = {
      name: name.trim(),
      requiredSpecs: JSON.stringify(groups.map(g => ({
        groupName: g.groupName.trim(),
        specs: g.specs.map(s => s.trim())
      })))
    };

    try {
      if (isEditing) {
        await ApiService.updateCategory(categoryId, payload);
      } else {
        await ApiService.createCategory(payload);
      }
      showMessage("Lưu thiết lập thành công! 🎉");
      setTimeout(() => navigate("/category"), 1500);
    } catch (error) {
      showMessage("Lỗi xử lý hệ thống.");
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans">
        
        {/* HEADER BLOCK */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center">
                <Layers size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                    {isEditing ? "Chỉnh sửa cấu trúc" : "Khởi tạo danh mục mới"}
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Định nghĩa thuộc tính kỹ thuật</p>
            </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            
            {/* PHẦN TÊN DANH MỤC */}
            <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Định danh nhóm thiết bị</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: LAPTOP WORKSTATION, MÀN HÌNH ĐỒ HỌA..."
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#00a884] transition-all text-lg font-bold text-slate-700 placeholder:text-slate-300"
                />
            </div>

            {/* BUILDER AREA */}
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-[#00a884]">
                        <Info size={16} />
                        <span className="text-sm font-bold">Cấu trúc thông số kỹ thuật</span>
                    </div>
                    <button 
                        type="button" onClick={addGroup}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00a884] text-white rounded-xl font-bold text-xs hover:bg-teal-700 transition-all cursor-pointer shadow-md shadow-teal-500/20"
                    >
                        <Plus size={14} /> Thêm nhóm thông số
                    </button>
                </div>

                <div className="space-y-6">
                    {groups.map((group, gIndex) => (
                        <div key={gIndex} className="group relative bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-teal-100 transition-all">
                            
                            {/* Group Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-sm shadow-lg">
                                    {gIndex + 1}
                                </div>
                                <input 
                                    type="text"
                                    value={group.groupName}
                                    onChange={(e) => handleGroupNameChange(gIndex, e.target.value)}
                                    placeholder="Tên nhóm (VD: Vi xử lý, Bộ nhớ...)"
                                    className="flex-1 text-sm font-black text-slate-700 outline-none border-b-2 border-transparent focus:border-teal-500 py-1"
                                />
                                {groups.length > 1 && (
                                    <button type="button" onClick={() => removeGroup(gIndex)} className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Specs list */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12 border-l-2 border-slate-100 space-y-0">
                                {group.specs.map((spec, sIndex) => (
                                    <div key={sIndex} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 group/item">
                                        <ChevronRight size={14} className="text-teal-500" />
                                        <input 
                                            type="text"
                                            value={spec}
                                            onChange={(e) => handleSpecNameChange(gIndex, sIndex, e.target.value)}
                                            placeholder="Thuộc tính (VD: CPU, RAM...)"
                                            className="flex-1 bg-transparent outline-none text-xs font-bold text-slate-600"
                                        />
                                        {group.specs.length > 1 && (
                                            <button type="button" onClick={() => removeSpec(gIndex, sIndex)} className="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-rose-500 transition-all cursor-pointer">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    type="button" onClick={() => addSpec(gIndex)}
                                    className="flex items-center gap-1.5 text-[11px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-800 transition-colors p-2 cursor-pointer"
                                >
                                    <Plus size={12} /> Thêm thuộc tính
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm">
                    {message && <p className="text-[#00a884] font-black animate-pulse">{message}</p>}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        type="button" onClick={() => navigate("/category")}
                        className="flex-1 sm:flex-none px-8 py-3 bg-white text-slate-500 font-bold text-sm rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 sm:flex-none px-10 py-3 bg-[#00a884] text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Save size={18} /> {isEditing ? "Cập nhật cấu trúc" : "Lưu danh mục"}
                    </button>
                </div>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddEditCategoryPage;