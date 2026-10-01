import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try { const result = await requestPasswordReset(email); setMessage(result.message); }
    catch { setMessage("Could not request a reset link right now. Please try again."); }
    finally { setLoading(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-6 text-[#2B2118]"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow"><h1 className="text-2xl font-bold">Reset your password</h1><p className="mt-2 text-sm text-gray-600">Enter your account email. If it exists, we’ll send a one-time reset link.</p><form onSubmit={submit} className="mt-6 space-y-4"><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="w-full rounded-xl border border-gray-300 p-3 text-sm"/><button disabled={loading} className="w-full rounded-xl bg-[#8B3A1B] p-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Sending…" : "Send reset link"}</button></form>{message && <p role="status" className="mt-4 text-sm text-gray-700">{message}</p>}<Link to="/login" className="mt-6 inline-block text-sm font-semibold text-[#8B3A1B]">Back to login</Link></section></main>;
}
