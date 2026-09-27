import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getAllKaarigars } from "../../api/kaarigarApi";
import { exportExcel } from "../../utils/exportExcel";
import ProfileAvatar from "../../components/ProfileAvatar";
import WorkImageGallery from "../../components/WorkImageGallery";

export default function AdminKaarigars() {
  const [kaarigars, setKaarigars] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadKaarigars = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAllKaarigars();

      console.log(
        "All Kaarigars:",
        response
      );

      const data = Array.isArray(response)
        ? response
        : response?.content || [];

      setKaarigars(data);
    } catch (err) {
      console.error(
        "Failed to load Kaarigars:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load Kaarigars."
      );
    } finally {
      setLoading(false);
    }
  };

  const exportKaarigars = () => exportExcel({
    fileName: "kaarigar-profiles",
    sheetName: "Kaarigars",
    columns: [
      { label: "Profile ID", value: "id" },
      { label: "User ID", value: "userId" },
      { label: "Name", value: (row) => row.name || row.fullName || row.user?.name },
      { label: "Email", value: (row) => row.email || row.user?.email },
      { label: "Phone", value: (row) => row.phone || row.mobile || row.phoneNumber },
      { label: "Location", value: (row) => row.location || row.city },
      { label: "Craft", value: (row) => row.craft || row.craftType || row.specialization },
      { label: "Description", value: "description" },
      { label: "Registered", value: "createdAt" },
    ],
    rows: kaarigars,
  });

  useEffect(() => {
    loadKaarigars();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      <header className="border-b border-[#D8CDBE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              to="/admin"
              className="mb-2 inline-flex items-center gap-2 font-medium text-[#6B4226]"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#2B2118]">
              Kaarigars
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              View registered artisan profiles.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={exportKaarigars} className="flex items-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#FFF7F1]">
              <Download size={16} /> Export Excel
            </button>
            <button
              onClick={loadKaarigars}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#B4532D] hover:text-white disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex gap-3">
              <AlertCircle size={22} />

              <div>
                <h2 className="font-semibold">
                  Unable to load Kaarigars
                </h2>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#E2D8CB] bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-[#6B4226]">
                <Loader2
                  size={25}
                  className="animate-spin"
                />
                Loading Kaarigars...
              </div>
            </div>
          ) : kaarigars.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <User
                size={45}
                className="mx-auto text-[#B4532D]"
              />

              <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
                No Kaarigars found
              </h2>

              <p className="mt-2 text-gray-500">
                No artisan profiles are currently registered.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-[#F8F3EA]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Location
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Craft
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Products / Work</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2D8CB]">
                  {kaarigars.map(
                    (kaarigar, index) => {
                      const user =
                        kaarigar.user || {};

                      const name =
                        kaarigar.name ||
                        kaarigar.fullName ||
                        user.name ||
                        "Kaarigar";

                      const email =
                        kaarigar.email ||
                        user.email ||
                        "—";

                      const phone =
                        kaarigar.phone ||
                        kaarigar.mobile ||
                        kaarigar.phoneNumber ||
                        "Not provided";

                      const location =
                        kaarigar.location ||
                        kaarigar.city ||
                        "Not provided";

                      const craft =
                        kaarigar.craft ||
                        kaarigar.craftType ||
                        kaarigar.specialization ||
                        "—";

                      return (
                        <tr
                          key={
                            kaarigar.id ||
                            index
                          }
                          className="hover:bg-[#FCF9F4]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <ProfileAvatar src={kaarigar.photoUrl} name={name} className="h-9 w-9" />

                              <span className="font-semibold text-[#2B2118]">
                                {name}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail
                                size={15}
                              />
                              {email}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Phone
                                size={15}
                              />
                              {phone}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin
                                size={15}
                              />
                              {location}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-[#6B4226]">
                            <div className="flex items-center gap-2">
                              <BriefcaseBusiness
                                size={15}
                              />
                              {craft}
                            </div>
                          </td>
                          <td className="px-6 py-5"><WorkImageGallery images={kaarigar.workImageUrls} title="Photos" className="max-w-56" /></td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
