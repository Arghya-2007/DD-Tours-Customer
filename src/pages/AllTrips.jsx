import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MapPin, Clock, ArrowRight, Search, Compass } from "lucide-react";

const getTourImage = (tour) => {
  if (Array.isArray(tour.images) && tour.images.length > 0)
    return tour.images[0];
  if (Array.isArray(tour.img) && tour.img.length > 0) return tour.img[0];
  if (tour.image) return tour.image;
  if (tour.imageUrl) return tour.imageUrl;
  if (tour.coverImage) return tour.coverImage;
  return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
};

const AllTrips = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const container = useRef();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await api.get("/trips");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.trips || [];
        setTours(data);
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const filteredTours = tours.filter((tour) => {
    const term = searchTerm.toLowerCase();
    const title = tour.title?.toLowerCase() || "";
    const location = tour.location?.toLowerCase() || "";
    return title.includes(term) || location.includes(term);
  });

  // --- TOP NOTCH GSAP ANIMATIONS ---
  useGSAP(
    () => {
      // 1. Initial Header Reveal
      const headerTl = gsap.timeline();
      headerTl.fromTo(
        ".header-reveal",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.2 },
      );

      // 2. Continuous Floating Compass Animation
      gsap.to(".floating-compass", {
        y: -10,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
      });

      // 3. Staggered Card Entrance (Triggers when data is ready)
      if (!loading && filteredTours.length > 0) {
        gsap.fromTo(
          ".trip-card",
          {
            y: 60,
            opacity: 0,
            rotateX: -15, // 3D Tilt effect on entry
            transformOrigin: "top center",
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: {
              amount: 0.6,
              grid: "auto",
              from: "start",
            },
            ease: "back.out(1.2)",
          },
        );
      }
    },
    { scope: container, dependencies: [loading, filteredTours.length] },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#0c0a09] p-6 md:p-12 overflow-hidden"
    >
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
          <div className="header-reveal">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Compass size={20} className="floating-compass" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">
                Expedition Archive
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-header text-white uppercase leading-tight">
              Select Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                Mission
              </span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="header-reveal w-full md:w-96 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#1c1917] border border-white/10 rounded-full px-4 py-3 focus-within:border-primary/50 transition-all duration-300">
              <Search
                className="text-gray-500 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search destination..."
                className="bg-transparent border-none outline-none text-white ml-3 w-full placeholder-gray-600 font-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID SECTION --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[#1c1917] h-[450px] rounded-3xl animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {filteredTours.map((tour) => (
              <Link
                to={`/tours/${tour._id || tour.id}`}
                key={tour._id || tour.id}
                className="trip-card group block bg-[#1c1917] rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(234,88,12,0.2)]"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gray-900 animate-pulse" />
                  <img
                    src={getTourImage(tour)}
                    alt={tour.title}
                    className="relative w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent opacity-90" />

                  <div className="absolute top-4 left-4 overflow-hidden rounded-full">
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 flex items-center gap-2">
                      <Clock size={12} className="text-primary" />
                      {tour.duration || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-7 relative">
                  <div className="space-y-1 mb-6">
                    <h3 className="text-2xl font-header text-white uppercase group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <MapPin size={14} className="text-primary" />
                      <span className="line-clamp-1 tracking-wide">
                        {tour.location || "Unknown Location"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent mb-6" />

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">
                        Investment
                      </p>
                      <p className="text-3xl font-header text-white">
                        ₹{tour.price ? tour.price.toLocaleString() : "TBD"}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:border-primary transition-all duration-500 transform group-hover:rotate-[360deg]">
                        <ArrowRight size={22} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-[2.5rem] bg-white/5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 text-gray-600 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-header text-white mb-2 uppercase tracking-widest">
              Coordinates Lost
            </h3>
            <p className="text-gray-400 font-light italic">
              No expeditions found for this search. Reset your compass and try
              again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTrips;
