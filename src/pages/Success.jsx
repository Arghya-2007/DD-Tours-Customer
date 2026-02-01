import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Home, FileText, Download, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // 1. Safety Check: Redirect if no state exists
    if (!location.state || !location.state.booking) {
      navigate("/");
      return;
    }

    setBooking(location.state.booking);

    // 2. Trigger Confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [location, navigate]);

  if (!booking) return null;

  // --- SAFEGUARD HELPERS ---
  // If ID exists, slice it. If not, return empty string.
  // This prevents the "undefined reading slice" error.
  const displayId = (booking.id || "").slice(-6).toUpperCase();
  const displayPaymentId = (booking.paymentId || "").slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg bg-[#1c1917] border border-white/10 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <CheckCircle className="text-black" size={40} strokeWidth={3} />
        </div>

        <h1 className="text-3xl font-header text-white uppercase mb-2">
          Mission Confirmed!
        </h1>
        <p className="text-gray-400 mb-8">
          Your expedition has been successfully secured.
        </p>

        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
            <span className="text-gray-500">Booking Ref</span>
            <span className="text-white font-mono font-bold tracking-wider">
              #{displayId || "PENDING"}
            </span>
          </div>

          {/* Only show Payment Ref if it exists (Online Payment) */}
          {booking.paymentId && (
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
              <span className="text-gray-500">Transaction ID</span>
              <span className="text-white font-mono">
                ...{displayPaymentId}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status</span>
            <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Confirmed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold transition-colors"
          >
            <FileText size={18} /> View Pass
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/20"
          >
            <Home size={18} /> Home
          </Link>
        </div>

        <p className="text-xs text-gray-600 mt-8">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
};

export default Success;
