import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Compass, ArrowLeft, ShieldCheck, Mountain } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Login = () => {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const container = useRef();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  // --- ANIMATIONS (FIXED) ---
  useGSAP(
    () => {
      const tl = gsap.timeline();

      // 1. Background Fade In (Explicitly to 0.4 opacity)
      tl.fromTo(
        ".login-bg",
        { opacity: 0, scale: 1.1 },
        { opacity: 0.4, scale: 1, duration: 2, ease: "power2.out" },
      )

        // 2. Main Card Entrance
        .fromTo(
          ".login-card",
          { y: 50, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
          "-=1.2",
        )

        // 3. Content Stagger (Button & Text)
        // FIX: used fromTo to ensure opacity always ends at 1
        .fromTo(
          ".anim-item",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.4",
        );

      // 4. Scanner Line
      gsap.to(".scanner-line", {
        top: "100%",
        duration: 3,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0c0a09]"
    >
      {/* --- BACKGROUND ASSETS --- */}
      <div
        className="login-bg absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/80 to-transparent" />

      {/* --- LOGIN TERMINAL --- */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back to Home */}
        <Link
          to="/"
          className="anim-item absolute -top-16 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Abort
        </Link>

        <div className="login-card bg-[#1c1917]/90 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          {/* Scanner Line */}
          <div className="scanner-line absolute left-0 top-0 w-full h-[1px] bg-primary/20 shadow-[0_0_10px_rgba(234,88,12,0.5)] z-0 pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="anim-item w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Compass
                size={32}
                className="text-primary animate-[spin_10s_linear_infinite]"
                strokeWidth={1.5}
              />
            </div>
            <h1 className="anim-item text-3xl font-header text-white uppercase tracking-wide mb-2">
              Basecamp Access
            </h1>
            <p className="anim-item text-gray-400 text-sm leading-relaxed">
              Identify yourself to access classified expedition data.
            </p>
          </div>

          {/* Action Area */}
          <div className="space-y-6 relative z-10">
            <button
              onClick={loginWithGoogle}
              className="anim-item group/btn w-full flex items-center justify-center gap-4 bg-white text-black p-4 rounded-xl font-bold hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />

              {/* Reliable Google Icon CDN */}
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                className="w-6 h-6 relative z-10"
                alt="Google"
              />
              <span className="tracking-wide relative z-10">
                Continue with Google
              </span>
            </button>

            <div className="anim-item relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative bg-[#1c1917] px-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
                Secure Connection
              </span>
            </div>

            <div className="anim-item flex justify-center gap-4 text-gray-500">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
                <ShieldCheck size={12} /> Encrypted
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
                <Mountain size={12} /> DD Verified
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="anim-item text-center text-gray-600 text-xs mt-8">
          By accessing this terminal, you agree to our <br />
          <span className="text-gray-400 hover:text-primary cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="text-gray-400 hover:text-primary cursor-pointer transition-colors">
            Privacy Protocols
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;
