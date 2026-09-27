import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";

import KaarigarDashboard from "./pages/kaarigar/KaarigarDashboard";
import MyProfile from "./pages/kaarigar/MyProfile";
import MyApplications from "./pages/kaarigar/MyApplications";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminKaarigars from "./pages/admin/AdminKaarigars";
import AdminEventVisitors from "./pages/admin/AdminEventVisitors";

import VisitorDashboard from "./pages/visitor/VisitorDashboard";
import MyRegistrations from "./pages/visitor/MyRegistrations";
import VisitorProfile from "./pages/visitor/VisitorProfile";

import AdminEventParticipants from "./pages/admin/AdminEventParticipants";

import ProtectedRoute from "./routes/ProtectedRoute";
import AccountMenu from "./components/AccountMenu";
import Profile from "./pages/Profile";
import AdminCheckIn from "./pages/admin/AdminCheckIn";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <AccountMenu />

        <Routes>

          {/* ======================================== */}
          {/* PUBLIC ROUTES */}
          {/* ======================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />

          {/* ======================================== */}
          {/* ADMIN */}
          {/* ======================================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEvents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/kaarigars"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminKaarigars />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events/:id/visitors"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEventVisitors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events/:id/participants"
            element={<AdminEventParticipants />}
          />

          <Route
            path="/admin/check-in"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCheckIn />
              </ProtectedRoute>
            }
          />

          {/* ======================================== */}
          {/* KAARIGAR */}
          {/* ======================================== */}

          <Route
            path="/kaarigar"
            element={
              <ProtectedRoute role="KAARIGAR">
                <KaarigarDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kaarigar/profile"
            element={
              <ProtectedRoute role="KAARIGAR">
                <MyProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kaarigar/applications"
            element={
              <ProtectedRoute role="KAARIGAR">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* ======================================== */}
          {/* VISITOR */}
          {/* ======================================== */}

          <Route
            path="/visitor"
            element={
              <ProtectedRoute role="VISITOR">
                <VisitorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/visitor/registrations"
            element={
              <ProtectedRoute role="VISITOR">
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/visitor/profile"
            element={
              <ProtectedRoute role="VISITOR">
                <VisitorProfile />
              </ProtectedRoute>
            }
          />

          {/* ======================================== */}
          {/* FALLBACK */}
          {/* ======================================== */}

          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">

                <div className="text-center">

                  <h1 className="text-5xl font-bold text-[#2B2118]">
                    404
                  </h1>

                  <p className="mt-3 text-gray-600">
                    Page not found.
                  </p>

                  <a
                    href="/"
                    className="mt-6 inline-block rounded-lg bg-[#B4532D] px-6 py-3 font-semibold text-white"
                  >
                    Go Home
                  </a>

                </div>

              </div>
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;
