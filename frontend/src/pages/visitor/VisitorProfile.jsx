import { useEffect, useState } from "react";
import { User, Mail, Phone, RefreshCw, AlertCircle, Save, CheckCircle2, ArrowLeft, Pencil, ImagePlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createVisitorProfile, getVisitorProfile, updateVisitorProfile } from "../../api/visitorApi";
import { uploadImage } from "../../api/mediaApi";
import ProfileAvatar from "../../components/ProfileAvatar";

export default function VisitorProfile() {
  const { user } = useAuth();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/visitor";
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "", photoUrl: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getVisitorProfile();
      setProfile(data);
      setForm({ name: data?.name || "", email: data?.email || "", phone: data?.phone || "", photoUrl: data?.photoUrl || "" });
    } catch (err) {
      if (err.response?.status !== 404) setError(err.response?.data?.detail || err.response?.data?.message || "Unable to load visitor profile.");
      else setProfile(null);
      setEditing(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleChange = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const photoUrl = photoFile ? await uploadImage(photoFile) : form.photoUrl;
      const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), photoUrl };
      const data = profile ? await updateVisitorProfile(payload) : await createVisitorProfile(payload);
      setProfile(data);
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", photoUrl: data.photoUrl || "" });
      setPhotoFile(null); setEditing(false);
      setSuccess(profile ? "Visitor profile updated successfully." : "Visitor profile created successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to save visitor profile.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#2B2118]">
      <header className="border-b border-[#D8C9B5] bg-white"><div className="mx-auto max-w-6xl px-6 py-4"><h1 className="text-xl font-bold text-[#6B4226]">Kaarigar Expo</h1><p className="text-xs text-gray-500">Visitor Profile</p></div></header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link to="/visitor" className="mb-6 inline-flex items-center gap-2 font-medium text-[#6B4226]"><ArrowLeft size={18} />Back to Dashboard</Link>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-3xl font-bold">My Profile</h2><p className="mt-1 text-sm text-[#5B6B82]">Manage your visitor details and profile photo.</p></div><button onClick={loadProfile} disabled={loading} className="flex items-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm text-[#B4532D] disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button></div>
        {error && <div role="alert" className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
        {success && <div role="status" className="mb-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><div>{success}<Link to={returnTo} className="ml-2 font-semibold text-green-900 underline">Continue</Link></div></div>}
        {loading ? <div className="flex justify-center rounded-xl border border-[#E2D6C7] bg-white py-16"><RefreshCw size={28} className="animate-spin text-[#B4532D]" /></div> : profile && !editing ? (
          <section className="rounded-xl border border-[#E2D6C7] bg-white p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2D6C7] pb-6"><div className="flex items-center gap-4"><ProfileAvatar src={profile.photoUrl} name={profile.name} /><div><h3 className="text-xl font-bold">{profile.name}</h3><p className="text-sm text-gray-500">Visitor</p></div></div><button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-semibold text-[#B4532D]"><Pencil size={15} />Edit profile</button></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2"><ProfileItem icon={<User size={16} />} label="Name" value={profile.name} /><ProfileItem icon={<Mail size={16} />} label="Email" value={profile.email} /><ProfileItem icon={<Phone size={16} />} label="Phone" value={profile.phone || "Not provided"} /></div>
          </section>
        ) : (
          <section className="rounded-xl border border-[#E2D6C7] bg-white p-7 shadow-sm"><div className="mb-6 flex items-center gap-4 border-b border-[#E2D6C7] pb-5"><ProfileAvatar src={profile?.photoUrl} name={form.name} /><div><h3 className="text-xl font-bold">{profile ? "Edit Visitor Profile" : "Create Visitor Profile"}</h3><p className="mt-1 text-sm text-gray-500">Add a profile photo and contact details for event check-in.</p></div></div>
            <form onSubmit={handleSubmit} className="space-y-5"><Field label="Name" icon={<User size={17} />} name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={100} /><Field label="Email" icon={<Mail size={17} />} name="email" type="email" value={form.email} onChange={handleChange} required maxLength={254} /><Field label="Phone" icon={<Phone size={17} />} name="phone" type="tel" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
              <label className="grid gap-1.5 text-sm font-medium">Profile photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="block w-full rounded-lg border border-gray-300 p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:font-semibold" />{profile?.photoUrl && <span className="text-xs font-normal text-gray-500">Choose a file to replace your current photo.</span>}<span className="inline-flex items-center gap-1 text-xs font-normal text-gray-500"><ImagePlus size={14} />JPG, PNG, WebP, or GIF; up to 4 MB.</span></label>
              <div className="flex gap-2"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#8B3A1B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{saving ? "Saving…" : "Save profile"}</button>{profile && <button type="button" onClick={() => { setEditing(false); setPhotoFile(null); }} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button>}</div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, icon, ...props }) { return <label className="grid gap-1.5 text-sm font-medium">{label}<span className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span><input {...props} className="w-full rounded-lg border border-[#D8C9B5] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#B4532D]" /></span></label>; }
function ProfileItem({ icon, label, value }) { return <div className="rounded-lg bg-[#F8F3EA] p-4"><div className="flex items-center gap-2 text-sm font-medium text-[#B4532D]">{icon}{label}</div><p className="mt-2 break-words text-sm">{value || "—"}</p></div>; }
