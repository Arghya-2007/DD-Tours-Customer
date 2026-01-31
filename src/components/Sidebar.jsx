import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Home, Map, BookOpen, Info, User, LogOut, Compass } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const containerRef = useRef(null);

  useGSAP(
    () => {
      // Simpler animation: Fade in quickly, no complex staggering that might hide items
      gsap.from(".nav-item", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all", // CRITICAL: Removes styles after animation so hover works perfectly
      });
    },
    { scope: containerRef },
  );

  const menuItems = [
    { name: "Home", icon: <Home size={22} />, path: "/" },
    { name: "Expeditions", icon: <Map size={22} />, path: "/tours" },
    { name: "Journal", icon: <BookOpen size={22} />, path: "/blogs" },
    { name: "Our Story", icon: <Info size={22} />, path: "/about" },
    { name: "Profile", icon: <User size={22} />, path: "/profile" },
  ];

  return (
    <aside
      ref={containerRef}
      className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[#121212] border-r border-white/10 flex-col z-50"
    >
      {/* Logo - Made Brighter */}
      <div className="p-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3 text-primary mb-1">
          <Compass size={36} strokeWidth={2} />
          <h1 className="text-3xl font-header tracking-wide text-white uppercase">
            DD Tours
          </h1>
        </div>
      </div>

      {/* Navigation - High Contrast */}
      <nav className="flex-1 px-4 py-8 space-y-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-item flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-orange-900/20"
                  : "text-gray-300 hover:text-white hover:bg-white/10" // Much lighter gray
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }
              >
                {item.icon}
              </span>
              <span className="font-sans font-bold tracking-wide text-sm">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - High Contrast */}
      <div className="p-6 border-t border-white/10">
        <button className="nav-item flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-bold text-sm">Disconnect</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
