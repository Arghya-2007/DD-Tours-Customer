import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Compass,
  Calendar,
  AlertTriangle,
  Hash,
  CheckCircle2,
  Car,
  Star, // 🆕 Added Star Icon
} from "lucide-react";

// --- Helper: Robust Image Extractor ---
const getTourImage = (tour) => {
  if (Array.isArray(tour.images) && tour.images.length > 0)
    return tour.images[0]?.url;
  if (Array.isArray(tour.img) && tour.img.length > 0)
    return tour.img[0]?.url || tour.img[0];
  if (tour.image) return tour.image.url || tour.image;
  if (tour.imageUrl) return tour.imageUrl;
  return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
};

// --- Helper: Calculate Days Left ---
const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff < 0) return "Closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Ends Today";
  return `${days} Days Left`;
};

const AllTrips = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const container = useRef();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        // Add timestamp to prevent caching
        const response = await api.get(`/trips?_t=${Date.now()}`);
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
    // Search within tags too
    const tags = tour.placesCovered?.join(" ").toLowerCase() || "";
    return (
      title.includes(term) || location.includes(term) || tags.includes(term)
    );
  });

  // --- GSAP ANIMATIONS ---
  useGSAP(
    () => {
      const headerTl = gsap.timeline();
      headerTl.fromTo(
        ".header-reveal",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.2 },
      );

      gsap.to(".floating-compass", {
        y: -10,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
      });

      if (!loading && filteredTours.length > 0) {
        gsap.fromTo(
          ".trip-card",
          { y: 60, opacity: 0, rotateX: -15, transformOrigin: "top center" },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: { amount: 0.6, grid: "auto", from: "start" },
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
      className="min-h-screen bg-[#0c0a09] p-6 md:p-12 overflow-hidden font-sans"
    >
      {/* --- HEADER --- */}
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

          <div className="header-reveal w-full md:w-96 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#1c1917] border border-white/10 rounded-full px-4 py-3 focus-within:border-primary/50 transition-all duration-300">
              <Search
                className="text-gray-500 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search coordinates..."
                className="bg-transparent border-none outline-none text-white ml-3 w-full placeholder-gray-600 font-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#1c1917] h-[500px] rounded-3xl animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {filteredTours.map((tour) => {
              // Calculate Status Logic
              const daysLeft = getDaysLeft(tour.bookingDeadline);
              const isCompleted = tour.status === "completed";
              const isOngoing = tour.status === "ongoing";
              const isClosed = daysLeft === "Closed";

              return (
                <Link
                  to={`/tours/${tour._id || tour.id}`}
                  key={tour._id || tour.id}
                  className={`trip-card group block bg-[#1c1917] rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col h-full
                        ${isCompleted ? "border-white/5 opacity-70 grayscale" : "border-white/5 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(234,88,12,0.15)]"}
                        `}
                >
                  {/* --- IMAGE SECTION --- */}
                  <div className="relative h-64 overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gray-900 animate-pulse" />
                    <img
                      src={getTourImage(tour)}
                      alt={tour.title}
                      className="relative w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent opacity-90" />

                    {/* Top Left: Duration */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-2 rounded-full">
                        <Clock size={12} className="text-primary" />
                        {tour.duration}
                      </span>
                    </div>

                    {/* Top Right: STATUS / URGENCY BADGE */}
                    <div className="absolute top-4 right-4">
                      {isCompleted ? (
                        <span className="bg-slate-700/80 backdrop-blur-md border border-slate-500 text-slate-300 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-full">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : isOngoing ? (
                        <span className="bg-blue-600/80 backdrop-blur-md border border-blue-400 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-full animate-pulse">
                          <Car size={12} /> Ongoing
                        </span>
                      ) : daysLeft && daysLeft !== "Closed" ? (
                        <span className="bg-red-500/60 backdrop-blur-md border border-red-500/80 text-red-200 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-full animate-pulse">
                          <AlertTriangle size={12} /> {daysLeft}
                        </span>
                      ) : tour.bookingEndsIn ? (
                        <span className="bg-orange-500/60 backdrop-blur-md border border-orange-500/80 text-orange-200 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-full">
                          <AlertTriangle size={12} /> {tour.bookingEndsIn}
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Left: DATE BADGE */}
                    <div className="absolute bottom-4 left-4">
                      {tour.fixedDate ? (
                        <span className="bg-emerald-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-2 rounded-full">
                          <Calendar size={12} />
                          {new Date(tour.fixedDate).toLocaleDateString(
                            undefined,
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                      ) : tour.expectedMonth ? (
                        <span className="bg-purple-900/80 backdrop-blur-md border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-2 rounded-full">
                          <Calendar size={12} />
                          {tour.expectedMonth}
                        </span>
                      ) : (
                        <span className="bg-blue-900/80 backdrop-blur-md border border-blue-500/30 text-blue-300 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-2 rounded-full">
                          <Compass size={12} />
                          Flexible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* --- CONTENT SECTION --- */}
                  <div className="p-7 flex flex-col flex-1 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1 max-w-[70%]">
                        <h3 className="text-2xl font-header text-white uppercase group-hover:text-primary transition-colors duration-300 line-clamp-1">
                          {tour.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <MapPin size={14} className="text-primary" />
                          <span className="line-clamp-1 tracking-wide">
                            {tour.location || "Classified Location"}
                          </span>
                        </div>
                      </div>

                      {/* ⭐ RATING BADGE ⭐ */}
                      {tour.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg shrink-0 ml-2">
                          <Star
                            size={12}
                            className="fill-yellow-500 text-yellow-500"
                          />
                          <span className="text-xs font-bold text-yellow-500">
                            {tour.averageRating}
                          </span>
                          <span className="text-[10px] text-yellow-500/60">
                            ({tour.totalRatings})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* TAGS (Places Covered) */}
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[1.5rem]">
                      {tour.placesCovered?.slice(0, 3).map((place, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-gray-400 uppercase bg-white/5 border border-white/5 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Hash size={8} className="text-gray-600" /> {place}
                        </span>
                      ))}
                      {(tour.placesCovered?.length || 0) > 3 && (
                        <span className="text-[10px] font-bold text-primary px-1 py-1">
                          +{tour.placesCovered.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent mb-6 mt-auto" />

                    {/* Footer: Price & CTA */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">
                          Investment
                        </p>
                        <p className="text-2xl md:text-3xl font-header text-white">
                          ₹{Number(tour.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div
                          className={`relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all duration-500 transform group-hover:rotate-[-45deg] ${isCompleted ? "" : "group-hover:bg-primary group-hover:border-primary"}`}
                        >
                          <ArrowRight size={22} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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
              No expeditions found. Adjust your search parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTrips;
