import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const dashboards = { ADMIN: "/admin", KAARIGAR: "/kaarigar", VISITOR: "/visitor" };

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    setOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="account-menu relative z-[100] flex min-h-14 w-full items-center justify-end gap-2 border-b border-[#E2D8CB] bg-white px-4 py-2 sm:px-6">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        className="account-control flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      {user && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Open account menu"
            className="account-control flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition"
          >
            <UserRound size={17} />
          </button>
          {open && (
            <div className="account-popover absolute right-4 top-full mt-2 w-60 overflow-hidden rounded-xl border p-2 shadow-xl sm:right-6">
              <div className="border-b px-3 py-2">
                <p className="truncate text-sm font-semibold">{user.name || "Account"}</p>
                <p className="truncate text-xs opacity-70">{user.email}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-60">{user.role}</p>
              </div>
              <Link to="/profile" onClick={() => setOpen(false)} className="account-menu-item mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                <UserRound size={16} /> My profile
              </Link>
              <Link to={dashboards[user.role] || "/"} onClick={() => setOpen(false)} className="account-menu-item flex items-center rounded-lg px-3 py-2 text-sm">
                My dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link to="/admin/check-in" onClick={() => setOpen(false)} className="account-menu-item flex items-center rounded-lg px-3 py-2 text-sm">
                  Event check-in scanner
                </Link>
              )}
              <button type="button" onClick={signOut} className="account-menu-item mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold">
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
