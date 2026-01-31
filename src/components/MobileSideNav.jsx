import { Link, useLocation } from "react-router-dom";
import { Home, Map, BookOpen, User } from "lucide-react";

const MobileNav = () => {
  const location = useLocation();

  const items = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "Tours", icon: <Map size={20} />, path: "/tours" },
    { name: "Blog", icon: <BookOpen size={20} />, path: "/blogs" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#1c1917]/95 backdrop-blur-lg border-t border-white/10 z-50 px-6 py-4 pb-6">
      <div className="flex justify-between items-center">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-primary" : "text-gray-500"}`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
