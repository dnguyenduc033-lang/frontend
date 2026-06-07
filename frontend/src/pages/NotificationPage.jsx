import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { Bell, CheckCheck, Check } from "lucide-react";

const TYPE_STYLE = {
    APPROVED:          { color: "border-l-emerald-500 bg-emerald-50/30",  dot: "bg-emerald-500" },
    REJECTED:          { color: "border-l-rose-500 bg-rose-50/30",        dot: "bg-rose-500" },
    SUPPLIER_ACCEPTED: { color: "border-l-blue-500 bg-blue-50/30",        dot: "bg-blue-500" },
    SUPPLIER_REJECTED: { color: "border-l-amber-500 bg-amber-50/30",      dot: "bg-amber-500" },
};

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const res = await ApiService.getMyNotifications();
            setNotifications(res.notifications || []);
        } catch {
            showMessage("Lỗi khi tải thông báo.", "error");
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await ApiService.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch {
            showMessage("Lỗi khi đánh dấu đã đọc.", "error");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await ApiService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            showMessage("Đã đánh dấu tất cả là đã đọc.", "success");
        } catch {
            showMessage("Lỗi khi cập nhật.", "error");
        }
    };

    const showMessage = (text, type = "info") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const msgStyle = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        error:   "bg-rose-50 text-rose-700 border-rose-200",
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 bg-[#f4f7f9] min-h-screen font-['Poppins']">

                {/* Tiêu đề */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Bell size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-violet-600">Thông Báo</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {unreadCount > 0
                                    ? <span>Bạn có <span className="font-bold text-red-500">{unreadCount}</span> thông báo chưa đọc</span>
                                    : "Tất cả thông báo đã được đọc"
                                }
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                        >
                            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border text-sm font-semibold ${msgStyle[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {/* Danh sách thông báo */}
                <div className="flex flex-col gap-3">
                    {notifications.length > 0 ? notifications.map(n => {
                        const style = TYPE_STYLE[n.type] || { color: "border-l-slate-400 bg-white", dot: "bg-slate-400" };
                        return (
                            <div
                                key={n.id}
                                className={`relative border-l-4 rounded-2xl p-5 shadow-sm transition-all
                                    ${style.color}
                                    ${n.isRead ? "opacity-60" : "shadow-md"}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        {/* Dot chưa đọc */}
                                        {!n.isRead && (
                                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                                        )}
                                        <div className={!n.isRead ? "" : "ml-5"}>
                                            <p className="font-black text-slate-800 text-sm mb-1">{n.title}</p>
                                            <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                                {new Date(n.createdAt).toLocaleString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-violet-400 hover:text-violet-600 text-slate-500 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0"
                                        >
                                            <Check size={12} /> Đã đọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
                            <Bell size={40} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">Chưa có thông báo nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default NotificationPage;