import React, { useState, useEffect } from "react";
import ApiService from "../service/ApiService";
import Layout from "../component/Layout"; 
import { Newspaper, Plus, Calendar, User, FileText, AlertCircle, Sparkles, Send, X, ChevronDown, ChevronUp } from "lucide-react";

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // State quản lý danh sách các bài viết đang được mở rộng nội dung
  const [expandedNews, setExpandedNews] = useState({});

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setError(""); 
      const response = await ApiService.getAllNews();
      const list = response?.newsList || response?.data?.newsList || response;
      
      if (Array.isArray(list)) {
        setNewsList(list);
      } else {
        setNewsList([]);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API getAllNews:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách tin tức lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault(); 
    
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!");
      return;
    }

    try {
      setSubmitting(true);
      const newsData = {
        title: title,
        content: content,
        author: "ADMIN"
      };

      await ApiService.createNews(newsData);
      
      alert("Đăng tin tức mới thành công!");
      setTitle("");
      setContent("");
      setIsModalOpen(false); 
      await fetchNews(); 

    } catch (err) {
      console.error("Lỗi hệ thống khi đăng bài:", err);
      alert(err.response?.data?.message || "Không thể đăng bài viết lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatNewsDate = (dateString) => {
    if (!dateString) return "Mới đăng";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Mới đăng";
      return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return "Mới đăng";
    }
  };

  // Hàm đảo ngược trạng thái đóng/mở rộng
  const toggleExpand = (id) => {
    setExpandedNews(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 font-sans bg-[#f4f7f9] min-h-screen text-slate-800">
        <div className="max-w-7xl mx-auto">
          
          {/* === TIÊU ĐỀ TRANG PREMIUM === */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#00a884] text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                <Newspaper size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#00a884] tracking-tight mb-1">
                  Bảng Tin Nội Bộ
                </h1>
                <p className="text-sm text-slate-500 font-medium">Cập nhật quy định vận hành kho bãi và thông báo từ ban quản trị</p>
              </div>
            </div>
            
            {ApiService.isAdmin() && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-[#00a884] text-white font-bold h-[46px] px-6 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,168,132,0.15)] text-sm cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={2.5} /> Đăng tin mới
              </button>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 mb-6 rounded-xl font-semibold flex items-center gap-2 text-sm animate-fadeIn">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00a884] rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Đang tải danh mục tin tức...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {newsList.length > 0 ? (
                newsList.map((news, index) => {
                  const finalId = news.id || `news-key-${index}`;
                  const isExpanded = !!expandedNews[finalId];

                  return (
                    <div 
                      key={finalId} 
                      /* 🌟 HIỆU ỨNG Ý TƯỞNG: Nếu Mở rộng -> Chiều cao cố định to ra h-[420px], nếu Thu gọn -> Chiều cao vừa vặn h-[280px] */
                      className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group relative ${
                        isExpanded ? "h-[420px]" : "h-[280px]"
                      }`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00a884] to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="p-6 flex-1 flex flex-col min-h-0"> {/* Thêm min-h-0 để flex-child bọc scroll hoạt động chuẩn */}
                        <div className="flex items-center justify-between mb-4 text-xs font-bold shrink-0">
                          <span className="bg-teal-50 text-[#00a884] px-2.5 py-1 rounded-md border border-teal-100/50 uppercase tracking-wider">Thông báo</span>
                          <span className="text-slate-400 flex items-center gap-1"><Calendar size={13}/>{formatNewsDate(news.createdAt)}</span>
                        </div>
                        
                        <h3 className="text-base font-extrabold text-slate-800 mb-3 group-hover:text-[#00a884] transition-colors leading-snug shrink-0 line-clamp-2">
                          {news.title}
                        </h3>
                        
                        {/* 🌟 VÙNG CUỘN NỘI DUNG NÂNG CẤP: Khi mở rộng sẽ có thanh cuộn dọc overflow-y-auto, khi thu gọn thì giấu bớt bằng line-clamp */}
                        <div className={`flex-1 min-h-0 pr-1 text-sm text-slate-500 whitespace-pre-line leading-relaxed scrollbar-thin ${
                          isExpanded ? "overflow-y-auto text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50" : "line-clamp-3"
                        }`}>
                          {news.content}
                        </div>

                        {/* NÚT ĐIỀU HƯỚNG BẤM XEM THÊM / THU GỌN */}
                        {news.content && news.content.length > 130 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(finalId)}
                            className="mt-3 text-xs font-bold text-[#00a884] hover:text-teal-700 transition-colors flex items-center gap-1 self-start cursor-pointer shrink-0 pt-1"
                          >
                            {isExpanded ? (
                              <>Thu gọn nội dung <ChevronUp size={14} /></>
                            ) : (
                              <>Đọc toàn bộ văn bản <ChevronDown size={14} /></>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <User size={14} className="text-slate-400" />
                        <span>Đăng bởi: {news.author || "Quản trị viên"}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center">
                  <FileText size={44} className="text-slate-300 mb-3" />
                  <p className="text-slate-400 font-bold text-lg">Hiện chưa có bản tin nào</p>
                  <p className="text-slate-400 text-sm mt-0.5">Hệ thống bảng tin thông báo nội bộ đang trống.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === MODAL POPUP TẠO TIN TỨC MỚI === */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-black text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Sparkles size={20} className="text-[#00a884]" /> Tạo Tin Tức Mới
              </h3>
              
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề bài viết</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-700 font-semibold transition-all" 
                    placeholder="Nhập tiêu đề thông báo..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nội dung văn bản</label>
                  <textarea 
                    rows="5" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00a884] text-sm text-slate-700 font-medium transition-all resize-none" 
                    placeholder="Nhập toàn bộ nội dung bài viết..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2 bg-[#00a884] text-white font-bold text-sm rounded-xl hover:bg-teal-700 active:scale-95 disabled:bg-slate-300 transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,168,132,0.15)] cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={14} /> Đăng bài
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewsPage;