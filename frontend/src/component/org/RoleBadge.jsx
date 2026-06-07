import { ShieldAlert, UserCog, User, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

const roleStyles = {
  ADMIN: "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100",
  MANAGER: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
  STAFF: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
};

const RoleBadge = ({ role, onClick, isExpanded, isExpandable, isLoading }) => {
  const icons = { ADMIN: ShieldAlert, MANAGER: UserCog, STAFF: User };
  const Icon = icons[role] || User;
  const className = `px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide flex items-center gap-1.5 border transition-all shadow-sm w-fit ${roleStyles[role] || roleStyles.STAFF} ${isExpandable ? "cursor-pointer" : "cursor-default"}`;

  const content = (
    <>
      {isExpandable && (
        isLoading ? <Loader2 size={14} className="animate-spin" /> :
        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
      )}
      <Icon size={14} />
      {role}
    </>
  );

  if (!isExpandable) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      title="Nhấn để xem cấp dưới"
      aria-expanded={isExpanded}
    >
      {content}
    </button>
  );
};

export default RoleBadge;
