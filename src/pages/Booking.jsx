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
  Lock,
  MessageCircle,
  Check,
  Eye,
  CalendarDays,
  Clock,
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
  const [scheduleValue, setScheduleValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_on_arrival");

  // --- USER DETAILS ---
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

        // --- SMART DATE LOGIC (Admin Driven) ---
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

    if (name === "phone") {
      validatePhone(value);
    }
  };

  // 3. CALCULATIONS
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

    const bookingPayload = {
      tripId: trip._id || trip.id,
      userId: user.uid,
      seats: parseInt(guests),
      tripTitle: trip.title,
      bookingDate: scheduleValue, // Using the auto-set date
      totalAmount,
      userDetails: { ...userDetails, paymentMethod },
      isFixedDate: !!trip.fixedDate,
      paymentStatus: "pending",
    };

    // SCENARIO 1: PAY ON ARRIVAL
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

    // SCENARIO 2: ONLINE PAYMENT
    setPaymentProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet.");
      }

      const orderRes = await api.post("/payments/create-order", {
        amount: totalAmount,
      });
      const orderData = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "DD Tours",
        description: `Expedition: ${trip.title}`,
        image: "https://your-logo-url.com/logo.png",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails: {
                ...bookingPayload,
                userEmail: user.email,
                userDetails: {
                  ...userDetails,
                  paymentMethod,
                  email: user.email,
                },
              },
            });

            if (verifyRes.data.success) {
              localStorage.removeItem("bookingDraft");
              setShowPaymentModal(false);
              navigate("/success", {
                state: { booking: { id: verifyRes.data.bookingId } },
              });
            } else {
              throw new Error("Payment verification failed.");
            }
          } catch (err) {
            setError("Payment verified failed at backend.");
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
          ondismiss: function () {
            setPaymentProcessing(false);
            setSubmitting(false);
            setShowPaymentModal(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Payment Error:", err);
      setError("Payment initiation failed.");
      setSubmitting(false);
      setPaymentProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const whatsappUrl = trip
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hi ${COMPANY_NAME}, I'm interested in the '${trip.title}' expedition for ${guests} people. Can you help me with some details before I book?`,
      )}`
    : "#";

  if (loading)
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0c0a09] text-gray-200 py-12 px-6 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {/* --- LEFT: BOOKING FORM --- */}
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
            {/* 1. MISSION DETAILS (Smart Date Display) */}
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
              {/* Fixed Date Watermark */}
              {trip.fixedDate && (
                <div className="absolute top-0 right-0 bg-emerald-500/10 border-l border-b border-emerald-500/20 px-4 py-2 rounded-bl-2xl">
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Lock size={12} /> Fixed Schedule
                  </span>
                </div>
              )}

              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary" size={20} /> Mission Timeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- READ ONLY SCHEDULE DISPLAY (ADMIN CONTROLLED) --- */}
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
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-primary focus:outline-none transition-colors"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. EXPLORER DATA */}
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
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between">
                    Phone Number
                    {isPhoneValid === true && (
                      <span className="text-green-500 text-[10px] flex items-center gap-1">
                        <Check size={10} /> Valid
                      </span>
                    )}
                    {isPhoneValid === false && (
                      <span className="text-red-500 text-[10px] flex items-center gap-1">
                        <AlertCircle size={10} /> Invalid Format
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      className={`w-full bg-black/20 border rounded-xl p-4 text-white focus:outline-none transition-colors ${
                        isPhoneValid === false
                          ? "border-red-500/50 focus:border-red-500"
                          : isPhoneValid === true
                            ? "border-green-500/50 focus:border-green-500"
                            : "border-white/10 focus:border-primary"
                      }`}
                      placeholder="10-digit Mobile Number"
                      value={userDetails.phone}
                      onChange={handleUserChange}
                    />
                    {isPhoneValid === true && (
                      <CheckCircle
                        className="absolute right-4 top-4 text-green-500"
                        size={20}
                      />
                    )}
                  </div>
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

            {/* 3. PAYMENT SELECTION */}
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <Wallet className="text-primary" size={20} /> Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label
                  className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "upi" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20 hover:bg-white/5"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    className="hidden"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    checked={paymentMethod === "upi"}
                  />
                  <QrCode
                    className={
                      paymentMethod === "upi" ? "text-primary" : "text-gray-400"
                    }
                    size={28}
                  />
                  <span className="font-bold text-sm">UPI / QR</span>
                </label>

                <label
                  className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "card" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20 hover:bg-white/5"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    className="hidden"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    checked={paymentMethod === "card"}
                  />
                  <CreditCard
                    className={
                      paymentMethod === "card"
                        ? "text-primary"
                        : "text-gray-400"
                    }
                    size={28}
                  />
                  <span className="font-bold text-sm">Credit Card</span>
                </label>

                <label
                  className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "pay_on_arrival" ? "border-primary bg-primary/10" : "border-white/5 bg-black/20 hover:bg-white/5"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pay_on_arrival"
                    className="hidden"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    checked={paymentMethod === "pay_on_arrival"}
                  />
                  <MapPin
                    className={
                      paymentMethod === "pay_on_arrival"
                        ? "text-primary"
                        : "text-gray-400"
                    }
                    size={28}
                  />
                  <span className="font-bold text-sm">Pay at Office</span>
                </label>
              </div>
            </div>

            {/* --- RESTORED: WHATSAPP DISCUSSION OPTION --- */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full text-black">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    Have doubts about this Tour?
                  </h4>
                  <p className="text-gray-400 text-xs">
                    Chat with Management Team directly before booking.
                  </p>
                </div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Discuss on WhatsApp
              </a>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-primary hover:bg-orange-600 text-white font-bold text-lg rounded-full shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-all transform hover:scale-[1.01]"
            >
              {submitting
                ? "Processing..."
                : `Confirm & Pay ₹${totalAmount.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* --- RIGHT: ORDER SUMMARY (Restored) --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#1c1917] p-6 rounded-3xl border border-white/10 shadow-2xl">
            {/* FOMO BADGE */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
              <Eye size={12} /> {viewers} Others Viewing
            </div>

            <h3 className="text-xl font-header text-white mb-6">
              Manifest Summary
            </h3>

            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/5">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 border border-white/10">
                {/* Fallback Image Logic */}
                <img
                  src={
                    trip.images?.[0]?.url ||
                    trip.imageUrl ||
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"
                  }
                  alt="Thumb"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-white leading-tight mb-1">
                  {trip.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {trip.duration} • {trip.location}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Base Cost</span>
                <span className="text-white">
                  ₹{pricePerPerson.toLocaleString()} x {guests}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Permits (3%)</span>
                <span className="text-white">₹{taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="text-primary font-bold uppercase text-xs">
                  Waived
                </span>
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

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
              <Lock size={12} /> Secure Encryption
            </div>
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative bg-[#1c1917] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="text-white font-bold text-lg">
                Connecting to Secure Gateway
              </h4>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we initialize Razorpay...
              </p>
              <p className="text-xs text-gray-600 mt-4">
                Do not refresh the page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
