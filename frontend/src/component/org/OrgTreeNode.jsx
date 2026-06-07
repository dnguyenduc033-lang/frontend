import { User } from "lucide-react";
import RoleBadge from "./RoleBadge";

const LEADERSHIP_ROLES = new Set(["ADMIN", "MANAGER"]);

const OrgTreeNode = ({ node, depth, expandedIds, childrenMap, loadingChildId, onToggleExpand, onPersonClick }) => {
  const isExpanded = expandedIds.has(node.id);
  const embeddedChildren = node.children || [];
  const lazyChildren = childrenMap[node.id];
  const children = lazyChildren ?? embeddedChildren;
  const isExpandable =
    node.hasChildren ||
    children.length > 0 ||
    LEADERSHIP_ROLES.has(node.role) ||
    loadingChildId === node.id;

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-slate-100 pl-4" : ""}>
      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => onPersonClick(node)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer group/person"
        >
          <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 group-hover/person:bg-teal-100 transition-colors">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate group-hover/person:text-[#00a884] transition-colors">
              {node.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{node.email}</p>
          </div>
        </button>
        <RoleBadge
          role={node.role}
          onClick={() => onToggleExpand(node)}
          isExpanded={isExpanded}
          isExpandable={isExpandable}
          isLoading={loadingChildId === node.id}
        />
      </div>

      {isExpanded && children.length > 0 && (
        <div className="mt-1">
          {children.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              childrenMap={childrenMap}
              loadingChildId={loadingChildId}
              onToggleExpand={onToggleExpand}
              onPersonClick={onPersonClick}
            />
          ))}
        </div>
      )}

      {isExpanded && isExpandable && children.length === 0 && loadingChildId !== node.id && (
        <p className="ml-12 pb-2 text-xs text-slate-400 italic">Không có cấp dưới</p>
      )}
    </div>
  );
};

export default OrgTreeNode;
