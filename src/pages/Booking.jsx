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
  X,
  Lock,
} from "lucide-react";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- DATA STATE ---
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- FORM STATE ---
  const [guests, setGuests] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_on_arrival");

  // --- USER DETAILS ---
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    phone: "",
    address: "",
    aadharNo: "",
  });

  // --- PAYMENT MODAL STATE ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // 1. FETCH DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tripRes, profileRes] = await Promise.all([
          api.get(`/trips/${id}`),
          api.get("/users/profile").catch(() => ({ data: {} })), // Handle no profile gracefully
        ]);

        const tripData = tripRes.data.trip || tripRes.data;
        setTrip(tripData);
        if (tripData.expectedDate)
          setBookingDate(tripData.expectedDate.split("T")[0]);

        const profile = profileRes.data || {};
        setUserDetails({
          fullName: profile.fullName || user?.displayName || "",
          phone: profile.phone || "",
          address: profile.address || "",
          aadharNo: profile.aadharNo || "",
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Could not access mission data.");
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [id, user]);

  // 2. CALCULATIONS
  const pricePerPerson = trip?.price || 0;
  const taxes = pricePerPerson * guests * 0.05; // 5% Tax simulation
  const totalAmount = pricePerPerson * guests + taxes;

  // 3. HANDLERS
  const handleUserChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!bookingDate) return setError("Please select a mission date.");
    if (!userDetails.phone)
      return setError("Contact frequency (Phone) is required.");

    // Decision: Open Modal OR Submit Directly
    if (paymentMethod === "pay_on_arrival") {
      finalizeBooking();
    } else {
      setShowPaymentModal(true); // Open the overlay
    }
  };

  const finalizeBooking = async () => {
    setSubmitting(true);
    setPaymentProcessing(true); // Visual feedback inside modal

    try {
      // Simulate network delay for "Processing Payment" feeling
      if (paymentMethod !== "pay_on_arrival") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const payload = {
        tripId: trip._id || trip.id,
        seats: parseInt(guests),
        tripTitle: trip.title,
        bookingDate,
        totalAmount,
        userDetails: {
          name: userDetails.fullName,
          email: user.email,
          phone: userDetails.phone,
          address: userDetails.address,
          aadhar: userDetails.aadharNo,
          paymentMethod,
        },
      };

      await api.post("/bookings/book", payload);

      // Success!
      setShowPaymentModal(false);
      navigate("/profile");
      // You could navigate to a /success page if you build one
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.message || "Booking transmission failed.");
      setSubmitting(false);
      setPaymentProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0c0a09] text-gray-200 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {/* --- LEFT: BOOKING FORM --- */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-header text-white uppercase mb-2">
              Confirm Expedition
            </h1>
            <p className="text-gray-400">Secure your spot for {trip.title}.</p>
          </div>

          <form onSubmit={handleInitialSubmit} className="space-y-8">
            {/* 1. MISSION DETAILS */}
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary" size={20} /> Mission Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Team Size
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
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Phone Frequency
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
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

            {/* 3. PAYMENT SELECTION */}
            <div className="bg-[#1c1917] p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-header text-white mb-6 flex items-center gap-2">
                <Wallet className="text-primary" size={20} /> Funding Source
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* UPI */}
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

                {/* Card */}
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

                {/* Pay Later */}
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
                  <span className="font-bold text-sm">Pay at Base</span>
                </label>
              </div>
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
                ? "Initiating..."
                : `Confirm & Pay ₹${totalAmount.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* --- RIGHT: ORDER SUMMARY (Sticky) --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#1c1917] p-6 rounded-3xl border border-white/10">
            <h3 className="text-xl font-header text-white mb-6">
              Manifest Summary
            </h3>

            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/5">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                {/* Reusing existing logic for image would go here, simplified for brevity */}
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  Trip Image
                </div>
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
                <span>Taxes & Permits (5%)</span>
                <span className="text-white">₹{taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="text-primary">Waived</span>
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

      {/* --- 4. PAYMENT MODAL OVERLAY --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => !paymentProcessing && setShowPaymentModal(false)}
          />

          <div className="relative bg-[#1c1917] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            {!paymentProcessing && (
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>
            )}

            {/* HEADER */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-header text-white mb-2">
                Complete Payment
              </h3>
              <p className="text-gray-400">
                Total Amount:{" "}
                <span className="text-primary font-bold">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </p>
            </div>

            {/* DYNAMIC CONTENT BASED ON METHOD */}
            {paymentProcessing ? (
              <div className="py-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-white font-bold text-lg">
                  Processing Transaction
                </h4>
                <p className="text-gray-500 text-sm mt-2">
                  Do not close this window...
                </p>
              </div>
            ) : paymentMethod === "upi" ? (
              <div className="text-center space-y-6">
                [Image of QR code for UPI payment]
                <div className="bg-white p-4 rounded-xl inline-block">
                  {/* Placeholder QR */}
                  <QrCode size={150} className="text-black" />
                </div>
                <p className="text-sm text-gray-400">
                  Scan with GPay, Paytm, or PhonePe
                </p>
                <button
                  onClick={finalizeBooking}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                >
                  I Have Paid
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase">
                    Card Number
                  </label>
                  <div className="flex items-center bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                    <CreditCard size={20} className="text-gray-500 mr-3" />
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="bg-transparent text-white w-full outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={finalizeBooking}
                  className="w-full py-4 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors mt-4"
                >
                  Pay Securely
                </button>
              </div>
            )}

            {!paymentProcessing && (
              <div className="mt-6 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest flex justify-center items-center gap-2">
                  <Lock size={10} /> 256-Bit SSL Encrypted
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
