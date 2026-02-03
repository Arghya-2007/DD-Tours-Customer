import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { generateTicket } from "../utils/generateTicket";
import api from "../services/api";
import SEO from "../components/SEO";
import RatingModal from "../components/RatingModal";
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
  Loader2,
  Smartphone,
  Star,
  MessageCircle,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const container = useRef();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    dob: "",
    aadharNo: "",
    panNo: "",
  });

  const [ratingModal, setRatingModal] = useState({
    show: false,
    tripId: null,
    tripTitle: "",
  });

  // --- 1. DATA NORMALIZER ---
  const normalizeBooking = (b) => {
    const details = b.userDetails || {};
    const liveTrip = b.trip || {};
    const tripStatus = liveTrip.status || "upcoming";

    const methodRoot = (b.paymentMethod || "").toLowerCase();
    const methodNested = (details.paymentMethod || "").toLowerCase();
    const gateway = (b.gateway || "").toLowerCase();
    const paymentId = b.paymentId;

    const isOnline =
      methodRoot === "online" ||
      methodRoot === "upi" ||
      methodRoot === "card" ||
      methodNested === "online" ||
      methodNested === "upi" ||
      methodNested === "card" ||
      gateway === "razorpay" ||
      (paymentId && paymentId.startsWith("pay_"));

    const dateStr =
      liveTrip.fixedDate || b.bookingDate || b.tripDate || b.createdAt;
    const explicitFixed =
      b.isFixedDate === true || liveTrip.fixedDate !== undefined;
    const looksLikeDate =
      dateStr && dateStr.includes("-") && !isNaN(new Date(dateStr).getTime());
    const isDateFixed = explicitFixed || looksLikeDate;

    return {
      id: b.id || b._id,
      tripId: b.tripId || liveTrip._id || b.trip?._id,
      title: liveTrip.title || b.tripTitle || "Unknown Expedition",
      displayDate: dateStr,
      isDateFixed: isDateFixed,
      price: b.totalAmount || b.totalPrice || b.amount || 0,
      seats: b.seats || 1,
      status: b.status || "pending",
      isOnline: isOnline,
      tripStatus: tripStatus,
      raw: b,
    };
  };

  // --- 2. FETCH DATA ---
  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes] = await Promise.allSettled([
        api.get(`/users/profile?_t=${Date.now()}`),
        api.get(`/bookings/mine?_t=${Date.now()}`),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        setProfileData(profileRes.value.data);
        setFormData(profileRes.value.data);
      }

      if (
        bookingsRes.status === "fulfilled" &&
        Array.isArray(bookingsRes.value.data)
      ) {
        const cleanBookings = bookingsRes.value.data.map(normalizeBooking);
        const sorted = cleanBookings.sort(
          (a, b) =>
            new Date(b.raw.createdAt || Date.now()) -
            new Date(a.raw.createdAt || Date.now()),
        );
        setBookings(sorted);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      toast.error("Connection to Basecamp failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ANIMATIONS ---
  useGSAP(() => {
    if (!loading && profileData) {
      const tl = gsap.timeline();
      tl.fromTo(
        ".profile-header",
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      )
        .fromTo(
          ".dashboard-col",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
          "-=0.5",
        )
        .fromTo(
          ".mission-card",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power1.out" },
          "-=0.3",
        );
    }
  }, [loading, profileData]);

  // --- 4. UPDATE HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const loadingToast = toast.loading("Encrypting & Uploading...");
    try {
      const res = await api.put("/users/profile", formData);
      setProfileData(res.data);
      setIsEditing(false);
      toast.success("Data Updated Successfully!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Update Failed", { id: loadingToast });
    }
    setIsSaving(false);
  };

  const getProfileImage = () =>
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${user?.displayName || "User"}&background=ea580c&color=fff`;
  const handleImageError = (e) =>
    (e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName || "User"}&background=ea580c&color=fff`);
  const isProfileComplete = profileData?.phone && profileData?.aadharNo;

  // WhatsApp Support Link
  const whatsappLink = `https://wa.me/919679812235?text=${encodeURIComponent(`Hi DD Tours, I have a problem with my booking/profile. User ID: ${user?.uid}`)}`;

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
      className="min-h-screen bg-[#0c0a09] text-gray-200 p-6 pb-24 overflow-hidden font-sans"
    >
      <SEO
        title="Customer and User Profile"
        description="Manage your operative profile, view trip logs, and update personal information securely."
      />
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: "#333", color: "#fff" } }}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="profile-header relative bg-[#1c1917] rounded-3xl p-8 border border-white/10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
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
                <div className="absolute bottom-1 right-1 bg-green-500 text-black p-1.5 rounded-full border-4 border-[#1c1917]">
                  <Shield size={16} fill="currentColor" />
                </div>
              )}
            </div>
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
                  {isProfileComplete
                    ? "Account Verified"
                    : "Incomplete Profile"}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                  <Compass size={14} /> {bookings.length} Tours Logged
                </span>
              </div>
            </div>
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
          {/* --- LEFT COL: INTEL --- */}
          <div className="dashboard-col space-y-8 lg:col-span-1">
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-header text-white mb-6 flex items-center gap-3">
                <User size={20} className="text-primary" /> Contact Intel
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
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-header text-white mb-6 flex items-center gap-3">
                <Shield size={20} className="text-primary" /> Primary Docs
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
              <Compass size={24} className="text-primary" /> Trips Logged
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
                  Your trip log is empty. Check available expeditions and start
                  your journey.
                </p>
                <a
                  href="/tours"
                  className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
                >
                  Find a Tour
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="mission-card group bg-[#1c1917] p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-2 text-[10px] text-gray-700 font-mono opacity-50 select-none">
                      #{booking.id.slice(0, 6)}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                      {/* Trip Info */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={booking.status} />
                          {booking.isOnline ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                              <Smartphone size={10} /> Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
                              <MapPin size={10} /> Pay at Office
                            </span>
                          )}
                        </div>

                        <h4 className="text-2xl font-header text-white group-hover:text-primary transition-colors">
                          {booking.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                          {/* DYNAMIC DATE DISPLAY */}
                          <span
                            className={`flex items-center gap-1.5 ${booking.isDateFixed ? "text-gray-300" : "text-purple-400"}`}
                          >
                            {booking.isDateFixed ? (
                              <Calendar size={14} className="text-primary" />
                            ) : (
                              <Clock size={14} />
                            )}
                            {booking.isDateFixed
                              ? new Date(
                                  booking.displayDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : `Expected: ${booking.displayDate}`}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <User size={14} className="text-primary" />{" "}
                            {booking.seats} Explorers
                          </span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 border-white/10 pt-4 md:pt-0 min-w-[160px] gap-4">
                        <div className="text-left md:text-right w-full">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                            Total Cost
                          </p>
                          <p className="text-2xl font-header text-white">
                            ₹{Number(booking.price).toLocaleString()}
                          </p>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${booking.isOnline ? "text-green-500" : "text-yellow-500"}`}
                          >
                            {booking.isOnline
                              ? "PAID ONLINE"
                              : "PAYMENT PENDING"}
                          </p>
                        </div>

                        {/* --- TRIP COMPLETED / RATE / DOWNLOAD --- */}
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          {/* 1. If Trip is Completed */}
                          {booking.tripStatus === "completed" ? (
                            <div className="flex flex-col gap-2 w-full">
                              <span className="text-xs text-center text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 py-2 px-2 rounded-lg border border-emerald-500/20">
                                Trip Completed
                              </span>
                              <button
                                onClick={() =>
                                  setRatingModal({
                                    show: true,
                                    tripId: booking.tripId,
                                    tripTitle: booking.title,
                                  })
                                }
                                className="text-xs flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-3 rounded-lg border border-yellow-500/20 transition-all w-full"
                              >
                                <Star size={14} fill="currentColor" /> Rate Tour
                              </button>
                            </div>
                          ) : (
                            /* 2. If Trip is NOT Completed (Show Ticket if Confirmed) */
                            booking.status === "confirmed" &&
                            (booking.isDateFixed ? (
                              <button
                                onClick={() => generateTicket(booking)}
                                className="text-xs flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-lg text-gray-300 transition-colors border border-white/5 w-full md:w-auto"
                              >
                                <FileText size={12} /> Download Pass
                              </button>
                            ) : (
                              <div className="text-xs flex items-center justify-center gap-2 bg-purple-500/10 px-4 py-3 rounded-lg text-purple-400 border border-purple-500/20 w-full md:w-auto cursor-not-allowed opacity-80">
                                <Clock size={12} /> Date Pending
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => !isSaving && setIsEditing(false)}
          />
          <div className="relative bg-[#1c1917] w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-3xl border-x border-white/10 sm:border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#1c1917] z-10">
              <h2 className="text-xl sm:text-2xl font-header text-white uppercase tracking-tight">
                Update Personnel File
              </h2>
              <button
                onClick={() => !isSaving && setIsEditing(false)}
                className={`p-2 -mr-2 text-gray-500 hover:text-white transition-colors ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSaving}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-24 sm:pb-0">
                {/* ... (Existing Form Fields remain same) ... */}
                <div className="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4 mb-2">
                  <img
                    src={getProfileImage()}
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border-2 border-primary/20"
                    alt="Profile"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest truncate">
                      Verified Google ID
                    </p>
                    <p className="font-bold text-white truncate">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Input
                  label="Comms (Phone)"
                  type="tel"
                  value={formData.phone}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={isSaving}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  disabled={isSaving}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                />
                <div className="md:col-span-2">
                  <Input
                    label="Base Address"
                    value={formData.address}
                    placeholder="Full Street Address"
                    disabled={isSaving}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Aadhar UID"
                  value={formData.aadharNo}
                  placeholder="12 Digit UID"
                  disabled={isSaving}
                  onChange={(e) =>
                    setFormData({ ...formData, aadharNo: e.target.value })
                  }
                />
                <Input
                  label="PAN Number"
                  value={formData.panNo}
                  placeholder="ABCDE1234F"
                  disabled={isSaving}
                  onChange={(e) =>
                    setFormData({ ...formData, panNo: e.target.value })
                  }
                />
              </form>
            </div>
            <div className="p-6 border-t border-white/10 bg-[#1c1917] flex gap-3 z-10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-3 text-gray-400 hover:text-white font-bold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                disabled={isSaving}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${isSaving ? "opacity-80 cursor-wait" : "hover:bg-orange-600 shadow-lg shadow-orange-900/20"}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Syncing...
                  </>
                ) : (
                  "Save Data"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ HOISTED RATING MODAL */}
      <RatingModal
        isOpen={ratingModal.show}
        onClose={() =>
          setRatingModal({
            ...ratingModal,
            show: false,
          })
        }
        tripId={ratingModal.tripId}
        tripTitle={ratingModal.tripTitle}
        onSuccess={() => {
          fetchUserData();
        }}
      />

      {/* 🚀 FIXED WHATSAPP BUTTON (Moved UP to clear bottom nav) */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-3 md:p-4 rounded-full shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-all hover:scale-110 group flex items-center gap-2"
        aria-label="Chat on WhatsApp"
      >
        {/* Simple Icon on Mobile, Expandable on Desktop */}
        <MessageCircle size={24} className="md:w-7 md:h-7" fill="white" />
        <span className="hidden md:block max-w-0 overflow-hidden md:group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap font-bold text-sm">
          Have any problem? Tell us
        </span>
      </a>
    </div>
  );
};

// --- Sub-Components ---
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
      className="bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:bg-white/5 transition-all placeholder-gray-600 disabled:opacity-50"
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
