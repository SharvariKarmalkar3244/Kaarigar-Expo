import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, BriefcaseBusiness, ImagePlus, Mail, MapPin, Pencil, Phone, Save, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createProfile, getMyProfile, updateProfile } from "../../api/kaarigarApi";
import { uploadImage } from "../../api/mediaApi";
import ProfileAvatar from "../../components/ProfileAvatar";
import WorkImageGallery from "../../components/WorkImageGallery";
import { useAuth } from "../../context/AuthContext";

const blankForm = (user) => ({ name: user?.name || "", craft: "", description: "", photoUrl: "", phone: "", location: "" });

export default function MyProfile() {
  const { user } = useAuth();
  const location = useLocation();
  const returnTo = location.state?.returnTo;
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(() => blankForm(user));
  const [photoFile, setPhotoFile] = useState(null);
  const [workFiles, setWorkFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    getMyProfile().then((data) => {
      if (!active) return;
      setProfile(data);
      setForm({ name: data.name || user?.name || "", craft: data.craft || "", description: data.description || "", photoUrl: data.photoUrl || "", phone: data.phone || "", location: data.location || "" });
    }).catch((err) => {
      if (!active) return;
      if (err.response?.status !== 404) setError(err.response?.data?.message || "Unable to load your profile.");
      setForm(blankForm(user));
      setEditing(true);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const photoUrl = photoFile ? await uploadImage(photoFile, "profile") : form.photoUrl.trim();
      const newWorkImageUrls = await Promise.all(workFiles.map(uploadImage));
      const payload = {
        ...form,
        photoUrl,
        phone: form.phone.trim(),
        location: form.location.trim(),
        email: user?.email || "",
        workImageUrls: [...(profile?.workImageUrls || []), ...newWorkImageUrls],
      };
      const data = profile ? await updateProfile(payload) : await createProfile(payload);
      setProfile(data);
      setForm((current) => ({ ...current, photoUrl: data.photoUrl || "" }));
      setPhotoFile(null);
      setWorkFiles([]);
      setEditing(false);
      setSuccess("Your Kaarigar profile has been saved.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to save your profile. Check the image files and try again.");
    } finally {
      setSaving(false);
    }
  };

  const value = (key) => profile?.[key] || "Not provided";

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#2B2118]">
      <header className="border-b border-gray-100 bg-white px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/kaarigar" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B3A1B] hover:underline"><ArrowLeft size={16} /> Back to Dashboard</Link>
          <h1 className="mt-3 font-serif text-2xl font-bold">My Kaarigar profile</h1>
          <p className="mt-1 text-sm text-gray-500">Your profile details are shown to event organizers when you are approved.</p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        {error && <div role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} />{error}</div>}
        {success && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}{returnTo && <Link to={returnTo} className="ml-2 font-semibold underline">Continue</Link>}</div>}
        {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500">Loading profile…</div> : (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {profile && !editing ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <ProfileAvatar src={profile.photoUrl} name={profile.name} />
                    <div className="min-w-0"><h2 className="truncate text-xl font-bold">{profile.name}</h2><p className="mt-1 text-sm text-gray-500">Kaarigar account</p></div>
                  </div>
                  <button onClick={() => { setError(""); setEditing(true); }} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-semibold text-[#B4532D]"><Pencil size={15} /> Edit profile</button>
                </div>
                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  <ProfileItem icon={<User size={16} />} label="Name" value={value("name")} />
                  <ProfileItem icon={<Mail size={16} />} label="Email" value={profile.email || user?.email || "—"} />
                  <ProfileItem icon={<Phone size={16} />} label="Phone" value={value("phone")} />
                  <ProfileItem icon={<MapPin size={16} />} label="Location" value={value("location")} />
                  <ProfileItem icon={<BriefcaseBusiness size={16} />} label="Craft" value={value("craft")} />
                  <ProfileItem icon={<User size={16} />} label="About your work" value={value("description")} />
                </dl>
                <WorkImageGallery images={profile.workImageUrls} title="My work" className="mt-7" />
              </>
            ) : (
              <form onSubmit={save} className="space-y-4">
                <div><h2 className="text-xl font-bold">{profile ? "Edit your profile" : "Complete your profile"}</h2><p className="mt-1 text-sm text-gray-500">Add a profile photo and photos of your work. Organizers use these details to identify participants.</p></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" value={form.name} onChange={change} required />
                  <Field label="Craft / specialization" name="craft" value={form.craft} onChange={change} required />
                  <Field label="Phone" name="phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} />
                  <Field label="Location" name="location" value={form.location} onChange={change} required />
                  <label className="grid gap-1.5 text-sm font-medium">Profile photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="block w-full rounded-lg border border-gray-300 p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:font-semibold" />{form.photoUrl && <span className="break-all text-xs font-normal text-gray-500">Current photo is saved. Choose a file to replace it.</span>}</label>
                  <p className="self-end pb-2 text-xs text-gray-500">Account email: {user?.email}</p>
                </div>
                <label className="grid gap-1.5 text-sm font-medium">Photos of your work<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setWorkFiles(Array.from(e.target.files || []).slice(0, 10))} className="block w-full rounded-lg border border-gray-300 p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:font-semibold" /><span className="inline-flex items-center gap-1 text-xs font-normal text-gray-500"><ImagePlus size={14} /> JPG, PNG, WebP, or GIF; up to 4 MB each.</span></label>
                <label className="grid gap-1.5 text-sm font-medium">About your work<textarea name="description" value={form.description} onChange={change} required rows={4} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#8B3A1B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{saving ? "Saving…" : "Save profile"}</button>
                  {profile && <button type="button" onClick={() => { setEditing(false); setPhotoFile(null); setWorkFiles([]); }} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button>}
                </div>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}<input {...props} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>;
}

function ProfileItem({ icon, label, value }) {
  return <div className="rounded-xl border border-[#F3EFE6] bg-[#FDFBF7] p-4"><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B3A1B]">{icon}{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd></div>;
}
