import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  User,
  Shield,
  Edit,
  AlertTriangle,
  MapPin,
  Calendar,
  LogOut,
  Compass,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const container = useRef();

  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    dob: "",
    aadharNo: "",
    panNo: "",
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes] = await Promise.allSettled([
        api.get("/users/profile"),
        api.get("/bookings/mine"),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        setProfileData(profileRes.value.data);
        setFormData(profileRes.value.data);
      }

      if (
        bookingsRes.status === "fulfilled" &&
        Array.isArray(bookingsRes.value.data)
      ) {
        setBookings(bookingsRes.value.data);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      toast.error("Connection to Basecamp failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ANIMATIONS (FIXED with fromTo) ---
  useGSAP(() => {
    if (!loading && profileData) {
      const tl = gsap.timeline();

      // 1. Header Drops In (Force End State)
      tl.fromTo(
        ".profile-header",
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      )

        // 2. Columns Slide Up
        .fromTo(
          ".dashboard-col",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
          "-=0.5",
        )

        // 3. Mission Cards Cascade
        .fromTo(
          ".mission-card",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power1.out" },
          "-=0.3",
        );
    }
  }, [loading, profileData]);

  // --- 3. UPDATE HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating personnel file...");
    try {
      const res = await api.put("/users/profile", formData);
      setProfileData(res.data);
      setIsEditing(false);
      toast.success("Data Updated Successfully!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Update Failed", { id: loadingToast });
    }
  };

  // --- 4. IMAGE HELPERS ---
  const getProfileImage = () => {
    return (
      user?.photoURL ||
      `https://ui-avatars.com/api/?name=${user?.displayName || "User"}&background=ea580c&color=fff`
    );
  };

  const handleImageError = (e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName || "User"}&background=ea580c&color=fff`;
  };

  const isProfileComplete = profileData?.phone && profileData?.aadharNo;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0c0a09]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#0c0a09] text-gray-200 p-6 pb-20 overflow-hidden"
    >
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#333", color: "#fff" },
        }}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- HEADER: OPERATIVE ID CARD --- */}
        <div className="profile-header relative bg-[#1c1917] rounded-3xl p-8 border border-white/10 overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <img
                src={getProfileImage()}
                onError={handleImageError}
                referrerPolicy="no-referrer"
                alt="Profile"
                className="relative w-32 h-32 rounded-full border-4 border-[#1c1917] object-cover shadow-xl"
              />
              {isProfileComplete && (
                <div
                  className="absolute bottom-1 right-1 bg-green-500 text-black p-1.5 rounded-full border-4 border-[#1c1917]"
                  title="Verified Operative"
                >
                  <Shield size={16} fill="currentColor" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div>
                <h1 className="text-4xl font-header text-white uppercase tracking-wide">
                  {user?.displayName || "Unknown Operative"}
                </h1>
                <p className="text-primary font-mono text-sm uppercase tracking-widest">
                  ID: {user?.uid?.slice(0, 8) || "UNREGISTERED"}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${isProfileComplete ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}
                >
                  {isProfileComplete ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  {isProfileComplete ? "Clearance Granted" : "Incomplete Data"}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                  <Compass size={14} /> {bookings.length} Missions Logged
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold border border-white/10 transition-all hover:scale-105"
              >
                <Edit size={18} /> Update Data
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl font-bold border border-red-500/20 transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COL: INTEL & DOCS --- */}
          <div className="dashboard-col space-y-8 lg:col-span-1">
            {/* Contact Intel */}
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-header text-white mb-6 flex items-center gap-3">
                <User size={20} className="text-primary" /> Operative Data
              </h3>
              <div className="space-y-4">
                <DetailRow
                  icon={MapPin}
                  label="Base Location"
                  value={profileData?.address}
                />
                <DetailRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={profileData?.dob}
                />
                <DetailRow
                  icon={User}
                  label="Contact Comms"
                  value={profileData?.phone}
                />
                <DetailRow icon={FileText} label="Email" value={user?.email} />
              </div>
            </div>

            {/* Clearance Docs */}
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-header text-white mb-6 flex items-center gap-3">
                <Shield size={20} className="text-primary" /> Clearance Docs
              </h3>
              <div className="space-y-4">
                <DetailRow
                  label="Aadhar ID"
                  value={
                    profileData?.aadharNo
                      ? `XXXX-XXXX-${profileData.aadharNo.slice(-4)}`
                      : null
                  }
                  isSecure
                />
                <DetailRow
                  label="PAN Record"
                  value={profileData?.panNo}
                  isSecure
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT COL: MISSION LOG --- */}
          <div className="dashboard-col lg:col-span-2">
            <h3 className="text-2xl font-header text-white mb-6 flex items-center gap-3">
              <Compass size={24} className="text-primary" /> Mission Log
            </h3>

            {bookings.length === 0 ? (
              <div className="bg-[#1c1917] p-12 rounded-3xl border border-dashed border-white/10 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Compass size={40} className="text-gray-500 opacity-50" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  No Expeditions Found
                </h4>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Your mission log is empty. Check available expeditions and
                  start your journey.
                </p>
                <a
                  href="/tours"
                  className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
                >
                  Find a Mission
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="mission-card group bg-[#1c1917] p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      {/* Trip Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <StatusBadge status={booking.status} />
                          <span className="text-gray-500 text-xs font-mono tracking-widest uppercase">
                            ID: #{booking.id.slice(0, 8)}
                          </span>
                        </div>
                        <h4 className="text-xl font-header text-white mb-2 group-hover:text-primary transition-colors">
                          {booking.tripTitle}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />{" "}
                            {new Date(booking.tripDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} /> {booking.seats} Explorers
                          </span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-row md:flex-col justify-between items-end text-right border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                            Total Cost
                          </p>
                          <p className="text-2xl font-header text-white">
                            ₹{Number(booking.totalPrice).toLocaleString()}
                          </p>
                        </div>
                        {booking.status === "confirmed" && (
                          <button className="mt-2 text-xs flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-gray-300 transition-colors">
                            <FileText size={12} /> Download Orders
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- EDIT MODAL (Tactical Overlay) --- */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />

          <div className="relative bg-[#1c1917] w-full max-w-2xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-header text-white uppercase">
                Update Personnel File
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                <img
                  src={getProfileImage()}
                  onError={handleImageError}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full opacity-80"
                  alt=""
                />
                <div>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                    Google Identity
                  </p>
                  <p className="font-bold text-white">{user?.displayName}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>

              <Input
                label="Comms (Phone)"
                type="tel"
                value={formData.phone}
                placeholder="+91"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
              <div className="md:col-span-2">
                <Input
                  label="Base Address"
                  value={formData.address}
                  placeholder="Full Address"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <Input
                label="Aadhar UID"
                value={formData.aadharNo}
                placeholder="12 Digit UID"
                onChange={(e) =>
                  setFormData({ ...formData, aadharNo: e.target.value })
                }
              />
              <Input
                label="PAN Number"
                value={formData.panNo}
                placeholder="ABCDE1234F"
                onChange={(e) =>
                  setFormData({ ...formData, panNo: e.target.value })
                }
              />

              <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-900/20 transition-all"
                >
                  Save Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const DetailRow = ({ icon: Icon, label, value, isSecure }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="text-gray-500">
          <Icon size={16} />
        </div>
      )}
      <span className="text-sm text-gray-400 font-medium">{label}</span>
    </div>
    <span
      className={`text-sm font-bold text-gray-200 ${isSecure ? "font-mono tracking-wider" : ""}`}
    >
      {value || <span className="text-gray-600 italic">Not Assigned</span>}
    </span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      {...props}
      className="bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:bg-white/5 transition-all placeholder-gray-600"
    />
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  const icons = {
    confirmed: <CheckCircle size={12} />,
    cancelled: <XCircle size={12} />,
    pending: <Clock size={12} />,
  };

  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}
    >
      {icons[status] || icons.pending} {status}
    </span>
  );
};

export default Profile;
