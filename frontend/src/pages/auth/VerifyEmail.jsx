import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../api/authApi";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email…");
  useEffect(() => {
    const token = params.get("token");
    Promise.resolve()
      .then(() => token
        ? verifyEmail(token)
        : { message: "This verification link is missing its token." })
      .then((result) => setMessage(result.message))
      .catch((error) => setMessage(error.response?.data?.message || "This verification link is invalid or expired."));
  }, [params]);
  return <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-6 text-[#2B2118]"><section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow"><h1 className="text-2xl font-bold">Email verification</h1><p className="my-6 text-sm">{message}</p><Link to="/login" className="font-semibold text-[#8B3A1B]">Continue to sign in</Link></section></main>;
}
