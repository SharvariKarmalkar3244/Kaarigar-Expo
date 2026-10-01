import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      showToast("Google sign-in did not complete. Please try again.", "error");
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    getCurrentUser()
      .then((user) => {
        login({ ...user, token });
        showToast("Signed in with Google.", "success");
        navigate(user.role === "ADMIN" ? "/admin" : user.role === "KAARIGAR" ? "/kaarigar" : "/visitor/profile", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        showToast("Unable to finish Google sign-in. Please try again.", "error");
        navigate("/login", { replace: true });
      });
  }, [login, navigate]);

  return <div className="flex min-h-screen items-center justify-center gap-3 bg-[#FDFBF7] text-[#6B4226]"><Loader2 className="animate-spin" /> Finishing sign-in...</div>;
}
