import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Users,
  CreditCard,
  Wallet,
  QrCode,
  MapPin,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Lock,
  MessageCircle,
  Check,
  Eye,
  Clock,
  CalendarDays,
} from "lucide-react";

// --- CONFIGURATION ---
const WHATSAPP_NUMBER = "919679812235";
const COMPANY_NAME = "DD Tours & Travels";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- DATA STATE ---
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [viewers, setViewers] = useState(3);

  // --- FORM STATE ---
  const [guests, setGuests] = useState(1);
  // We no longer let user pick dates. This holds the Admin's setting.
  const [scheduleValue, setScheduleValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_on_arrival");

  const [userDetails, setUserDetails] = useState({
    fullName: "",
    phone: "",
    address: "",
    aadharNo: "",
  });
  const [isPhoneValid, setIsPhoneValid] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 1. FETCH DATA
  useEffect(() => {
    setViewers(Math.floor(Math.random() * 5) + 2);
    const loadData = async () => {
      try {
        setLoading(true);
        const [tripRes, profileRes] = await Promise.all([
          api.get(`/trips/${id}`),
          api.get("/users/profile").catch(() => ({ data: {} })),
        ]);

        const tripData = tripRes.data.trip || tripRes.data;
        setTrip(tripData);

        // --- 🔒 LOGIC: AUTO-SET DATE FROM ADMIN ---
        if (tripData.fixedDate) {
          setScheduleValue(tripData.fixedDate);
        } else if (tripData.expectedMonth) {
          setScheduleValue(tripData.expectedMonth);
        } else {
          setScheduleValue("TBA");
        }

        const savedDraft = localStorage.getItem("bookingDraft");
        const profile = profileRes.data || {};

        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          setUserDetails(draft);
          if (draft.phone) validatePhone(draft.phone);
        } else {
          setUserDetails({
            fullName: profile.fullName || user?.displayName || "",
            phone: profile.phone || "",
            address: profile.address || "",
            aadharNo: profile.aadharNo || "",
          });
          if (profile.phone) validatePhone(profile.phone);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Could not access mission data.");
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [id, user]);

  const validatePhone = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    setIsPhoneValid(phoneRegex.test(number));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...userDetails, [name]: value };
    setUserDetails(updatedDetails);
    localStorage.setItem("bookingDraft", JSON.stringify(updatedDetails));
    if (name === "phone") validatePhone(value);
  };

  const pricePerPerson = trip?.price || 0;
  const taxes = pricePerPerson * guests * 0.03;
  const totalAmount = pricePerPerson * guests + taxes;

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!isPhoneValid)
      return setError("A valid contact frequency (Phone) is required.");

    if (paymentMethod === "pay_on_arrival") {
      finalizeBooking();
    } else {
      setShowPaymentModal(true);
      finalizeBooking();
    }
  };

  const finalizeBooking = async () => {
    setSubmitting(true);

    // Payload Setup
    const bookingPayload = {
      tripId: trip._id || trip.id,
      userId: user.uid,
      seats: parseInt(guests),
      tripTitle: trip.title,
      // We send the Auto-Set value (Date or Month string)
      bookingDate: scheduleValue,
      totalAmount,
      userDetails: { ...userDetails, paymentMethod },
      // Pass the scheduling type so backend knows if it's tentative
      isFixedDate: !!trip.fixedDate,
      paymentStatus: "pending",
    };

    if (paymentMethod === "pay_on_arrival") {
      try {
        const res = await api.post("/bookings/book", bookingPayload);
        localStorage.removeItem("bookingDraft");
        navigate("/success", {
          state: { booking: { id: res.data.bookingId } },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Booking failed.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Online Payment Flow
    setPaymentProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed.");

      const orderRes = await api.post("/payments/create-order", {
        amount: totalAmount,
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "DD Tours",
        description: `Expedition: ${trip.title}`,
        image: "https://your-logo-url.com/logo.png",
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails: {
                ...bookingPayload,
                userEmail: user.email,
                userDetails: { ...userDetails, email: user.email },
              },
            });
            if (verifyRes.data.success) {
              localStorage.removeItem("bookingDraft");
              setShowPaymentModal(false);
              navigate("/success", {
                state: { booking: { id: verifyRes.data.bookingId } },
              });
            }
          } catch (err) {
            setError("Payment verification failed.");
            setPaymentProcessing(false);
            setSubmitting(false);
          }
        },
        prefill: {
          name: userDetails.fullName,
          email: user.email,
          contact: userDetails.phone,
        },
        theme: { color: "#ea580c" },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setSubmitting(false);
            setShowPaymentModal(false);
          },
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError("Payment initiation failed.");
      setSubmitting(false);
      setPaymentProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const whatsappUrl = trip ? `https://wa.me/${WHATSAPP_NUMBER}?text=Hi` : "#";

  if (loading)
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0c0a09] text-gray-200 py-12 px-6 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-header text-white uppercase mb-2">
              Confirm Expedition
            </h1>
            <p className="text-gray-400">
              Secure your seat for{" "}
              <span className="text-primary font-bold">{trip.title}</span>.
            </p>
          </div>

          <form onSubmit={handleInitialSubmit} className="space-y-8">
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
              {/* STATUS BANNER */}
              <div className="absolute top-0 right-0 px-4 py-2 rounded-bl-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-l border-b bg-white/5 border-white/10">
                {trip.fixedDate ? (
                  <span className="text-emerald-400">
                    <Lock size={12} /> Date Confirmed
                  </span>
                ) : (
                  <span className="text-purple-400">
                    <Clock size={12} /> Tentative Schedule
                  </span>
                )}
              </div>

              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary" size={20} /> Mission Timeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- READ ONLY SCHEDULE DISPLAY --- */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Launch Schedule
                  </label>
                  <div
                    className={`w-full border rounded-xl p-4 flex items-center gap-3 ${trip.fixedDate ? "bg-emerald-900/10 border-emerald-500/30" : "bg-purple-900/10 border-purple-500/30"}`}
                  >
                    {trip.fixedDate ? (
                      <>
                        <CalendarDays className="text-emerald-500" size={24} />
                        <div>
                          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
                            Official Date
                          </p>
                          <p className="text-white font-bold text-lg">
                            {new Date(trip.fixedDate).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className="text-purple-500" size={24} />
                        <div>
                          <p className="text-xs text-purple-500 font-bold uppercase tracking-wider">
                            Expected Launch
                          </p>
                          <p className="text-white font-bold text-lg">
                            {trip.expectedMonth || "To Be Announced"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Disclaimer */}
                  <p className="text-[10px] text-gray-500 mt-1">
                    *{" "}
                    {trip.fixedDate
                      ? "Date is locked by Mission Control."
                      : "Exact dates will be communicated upon confirmation."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Explorers
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-4 top-4 text-gray-500"
                      size={20}
                    />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-primary outline-none"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ... Explorer Data & Payment Sections (Keep existing code from previous step) ... */}
            {/* COPY PASTE THE REST OF THE FORM FROM PREVIOUS STEP HERE (Name, Phone, Payment, Summary) */}
            {/* For brevity, I am showing the critical DATE fix above. Assume standard form below. */}

            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} /> Explorer Data
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                    value={userDetails.fullName}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className={`w-full bg-black/20 border rounded-xl p-4 text-white focus:outline-none ${isPhoneValid === false ? "border-red-500" : "border-white/10"}`}
                    value={userDetails.phone}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                    value={userDetails.address}
                    onChange={handleUserChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <Wallet className="text-primary" size={20} /> Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ... Payment Options (Same as before) ... */}
                <label
                  className={`cursor-pointer relative p-4 rounded-xl border-2 flex flex-col items-center gap-3 ${paymentMethod === "upi" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    className="hidden"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    checked={paymentMethod === "upi"}
                  />
                  <QrCode size={28} />
                  <span className="font-bold text-sm">UPI / QR</span>
                </label>
                <label
                  className={`cursor-pointer relative p-4 rounded-xl border-2 flex flex-col items-center gap-3 ${paymentMethod === "card" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    className="hidden"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    checked={paymentMethod === "card"}
                  />
                  <CreditCard size={28} />
                  <span className="font-bold text-sm">Card</span>
                </label>
                <label
                  className={`cursor-pointer relative p-4 rounded-xl border-2 flex flex-col items-center gap-3 ${paymentMethod === "pay_on_arrival" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pay_on_arrival"
                    className="hidden"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    checked={paymentMethod === "pay_on_arrival"}
                  />
                  <MapPin size={28} />
                  <span className="font-bold text-sm">Pay at Office</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-primary hover:bg-orange-600 text-white font-bold text-lg rounded-full shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all"
            >
              {submitting
                ? "Processing..."
                : `Confirm & Pay ₹${totalAmount.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* RIGHT SUMMARY COLUMN */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#1c1917] p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-header text-white mb-6">
              Manifest Summary
            </h3>
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/5">
              <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden">
                <img
                  src={trip.images?.[0]?.url || trip.imageUrl}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-white leading-tight mb-1">
                  {trip.title}
                </h4>
                <p className="text-xs text-gray-500">{trip.duration}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Total
              </span>
              <span className="text-3xl font-header text-white">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="text-white">Loading Payment...</div>
        </div>
      )}
    </div>
  );
};

export default Booking;
