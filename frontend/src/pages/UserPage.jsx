import React, { useState, useEffect, useCallback } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import OrgTreeNode from "../component/org/OrgTreeNode";
import UserDetailModal from "../component/org/UserDetailModal";
import { Users, Loader2 } from "lucide-react";

const UserPage = () => {
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const [orgRoots, setOrgRoots] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [childrenMap, setChildrenMap] = useState({});
  const [loadingChildId, setLoadingChildId] = useState(null);
  const [loadingTree, setLoadingTree] = useState(true);

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  }, []);

  const loadOrgTree = useCallback(async () => {
    setLoadingTree(true);
    try {
      const response = await ApiService.getUserOrgTree();
      if (response.status === 200) {
        const roots = response.userTree || [];
        setOrgRoots(roots);
        setChildrenMap({});
        setExpandedIds(new Set(roots.filter((node) => node.hasChildren).map((node) => node.id)));
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tải cây nhân sự.");
    } finally {
      setLoadingTree(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadOrgTree();
  }, [loadOrgTree]);

  const handleToggleExpand = useCallback(async (node) => {
    const nodeId = node.id;

    if (expandedIds.has(nodeId)) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
      return;
    }

    const embeddedChildren = node.children || [];
    if (embeddedChildren.length === 0 && !childrenMap[nodeId]) {
      setLoadingChildId(nodeId);
      try {
        const response = await ApiService.getUserChildren(nodeId);
        if (response.status === 200) {
          setChildrenMap((prev) => ({
            ...prev,
            [nodeId]: response.userTree || [],
          }));
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Lỗi khi tải cấp dưới.");
        setLoadingChildId(null);
        return;
      }
      setLoadingChildId(null);
    }

    setExpandedIds((prev) => new Set(prev).add(nodeId));
  }, [expandedIds, childrenMap, showMessage]);

  const handleOpenUserModal = useCallback(async (user) => {
    setLoadingUserDetail(true);
    setSelectedUser(user);

    try {
      const response = await ApiService.getUserById(user.id);
      if (response.status === 200 && response.user) {
        setSelectedUser(response.user);
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Lỗi khi tải thông tin nhân sự.");
      setSelectedUser(null);
    } finally {
      setLoadingUserDetail(false);
    }
  }, [showMessage]);

  const handleCloseModal = useCallback(() => {
    setSelectedUser(null);
    setLoadingUserDetail(false);
  }, []);

  return (
    <Layout>
      <div className="w-full font-['Poppins'] pb-10 px-4 md:p-8 bg-[#f4f7f9] min-h-screen text-slate-800 relative">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#00a884] to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white shrink-0">
            <Users size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[32px] font-black text-[#00a884] tracking-tight mb-1 leading-none">
              Quản Lý Nhân Sự
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1.5">
              Cây phân cấp nhân sự trong tổ chức
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl font-bold shadow-sm text-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">Sơ đồ nhân sự</h3>
            </div>
            <button
              type="button"
              onClick={loadOrgTree}
              disabled={loadingTree}
              className="text-xs font-bold text-[#00a884] hover:underline cursor-pointer disabled:opacity-50"
            >
              Tải lại
            </button>
          </div>

          {loadingTree ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Đang tải cây nhân sự...</span>
            </div>
          ) : orgRoots.length > 0 ? (
            orgRoots.map((node) => (
              <OrgTreeNode
                key={node.id}
                node={node}
                depth={0}
                expandedIds={expandedIds}
                childrenMap={childrenMap}
                loadingChildId={loadingChildId}
                onToggleExpand={handleToggleExpand}
                onPersonClick={handleOpenUserModal}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400 italic py-4">Chưa có dữ liệu cây nhân sự.</p>
          )}
        </div>

        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            loading={loadingUserDetail}
            onClose={handleCloseModal}
            onSuccess={showMessage}
          />
        )}
      </div>
    </Layout>
  );
};

export default UserPage;
