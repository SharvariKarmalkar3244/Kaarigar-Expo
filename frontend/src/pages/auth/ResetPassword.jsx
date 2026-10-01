import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try { const result = await resetPassword(params.get("token") || "", password); setMessage(result.message); setComplete(true); }
    catch (error) { setMessage(error.response?.data?.message || "The reset link is invalid or expired."); }
    finally { setLoading(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-6 text-[#2B2118]"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow"><h1 className="text-2xl font-bold">Choose a new password</h1><form onSubmit={submit} className="mt-6 space-y-4"><input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-xl border border-gray-300 p-3 text-sm"/><p className="text-xs text-gray-500">Use at least 8 characters with uppercase, lowercase, number, and special character.</p><button disabled={loading || !params.get("token")} className="w-full rounded-xl bg-[#8B3A1B] p-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving…" : "Update password"}</button></form>{message && <p role="status" className="mt-4 text-sm text-gray-700">{message}</p>}{complete && <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-[#8B3A1B]">Sign in with your new password</Link>}</section></main>;
}
