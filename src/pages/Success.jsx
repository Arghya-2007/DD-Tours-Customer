import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CheckCircle, ArrowRight, Compass, FileText, Home } from "lucide-react";

const Success = () => {
  const container = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: Extract data passed from the booking page
  const bookingData = location.state?.booking || {
    id: "TEMP-ID-001",
    trip: "Expedition",
  };

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // 1. Initial Circle Pop
      tl.fromTo(
        ".success-icon",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)" },
      )
        // 2. Text Slide Up
        .fromTo(
          ".success-text",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power2.out" },
          "-=0.4",
        )
        // 3. Action Buttons
        .fromTo(
          ".success-btn",
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2",
        );
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 text-gray-200 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Animated Icon */}
        <div className="success-icon mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
            <CheckCircle
              size={100}
              className="text-green-500 relative"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4 mb-12">
          <h1 className="success-text text-5xl font-header text-white uppercase tracking-tight">
            Mission <span className="text-primary">Secured</span>
          </h1>
          <p className="success-text text-gray-400 text-lg max-w-sm mx-auto">
            Your coordinates have been logged. The wild is waiting for your
            arrival.
          </p>
          <div className="success-text inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-widest text-primary">
            Expedition ID: #{bookingData.id.slice(-8)}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="success-btn flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
          >
            <FileText size={20} /> View Mission Log
          </button>
          <Link
            to="/"
            className="success-btn flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 px-6 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            <Home size={20} /> Back to Base
          </Link>
        </div>

        {/* Extra Instruction */}
        <p className="success-text mt-12 text-gray-600 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
          <Compass size={14} className="animate-spin-slow" /> A confirmation
          dispatch has been sent to your email.
        </p>
      </div>
    </div>
  );
};

export default Success;
