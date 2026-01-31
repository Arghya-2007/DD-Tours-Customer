import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  Mountain,
  Users,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// --- HELPER 1: ROBUST & SAFE IMAGE PARSER (FIXED) ---
const parseImages = (tour) => {
  if (!tour) return [];

  let rawImages = [];

  // 1. Check all possible array fields
  if (Array.isArray(tour.images) && tour.images.length > 0)
    rawImages = tour.images;
  else if (Array.isArray(tour.img) && tour.img.length > 0) rawImages = tour.img;
  // 2. Check for strings (and split them if they have commas!)
  else if (typeof tour.image === "string") rawImages = tour.image.split(",");
  else if (typeof tour.imageUrl === "string")
    rawImages = tour.imageUrl.split(",");
  else if (typeof tour.cover === "string") rawImages = tour.cover.split(",");

  // 3. CLEAN UP (THE FIX: Check types before trimming!)
  const cleanImages = rawImages
    .map((img) => {
      // Case A: It's a string -> Trim it
      if (typeof img === "string") return img.trim();

      // Case B: It's an object with a 'url' or 'secure_url' property (Common in Cloudinary/MongoDB)
      if (typeof img === "object" && img !== null) {
        return img.url || img.secure_url || img.link || "";
      }

      // Case C: Unknown/Null -> Return null to filter later
      return null;
    })
    .filter((img) => typeof img === "string" && img.length > 0); // Only keep valid non-empty strings

  // 4. Fallback if absolutely nothing exists
  if (cleanImages.length === 0) {
    return [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
    ];
  }

  return cleanImages;
};

// --- HELPER 2: Find Inclusions ---
const getTourInclusions = (tour) => {
  if (!tour) return [];
  const rawData =
    tour.includedItems || tour.inclusions || tour.features || tour.included;
  if (!rawData) return [];
  if (Array.isArray(rawData)) return rawData;
  if (typeof rawData === "string") {
    return rawData
      .split(",")
      .map((item) => item.trim())
      .filter((i) => i);
  }
  return [];
};

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const container = useRef();

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const response = await api.get(`/trips/${id}`);
        const data = response.data.trip || response.data;
        setTour(data);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTourDetails();
  }, [id]);

  // --- 1. MEMOIZE IMAGES (Prevents flicker & calculation errors) ---
  const images = useMemo(() => parseImages(tour), [tour]);

  // --- 2. SLIDER INTERVAL ---
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  // --- 3. GSAP ANIMATIONS ---
  useGSAP(() => {
    if (!loading && tour) {
      gsap.fromTo(
        ".content-block",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
          clearProps: "all",
        },
      );
    }
  }, [loading, tour]);

  if (loading)
    return (
      <div className="h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-400 tracking-widest uppercase text-xs">
            Loading Mission Data...
          </p>
        </div>
      </div>
    );

  if (!tour) return null;

  const inclusionsList = getTourInclusions(tour);

  return (
    <div ref={container} className="min-h-screen bg-[#0c0a09] text-gray-100">
      {/* --- HERO SLIDER SECTION --- */}
      <div className="hero-container relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-black">
        {/* SLIDER IMAGES */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={img}
              alt={`${tour.title} ${index + 1}`}
              className="w-full h-full object-cover scale-105"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-black/20 to-black/30" />
          </div>
        ))}

        {/* HERO CONTENT OVERLAY */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <div className="p-2 bg-white/10 rounded-full group-hover:bg-primary transition-colors">
                <ArrowLeft size={18} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">
                Abort & Return
              </span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
              <div className="content-block">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Mountain size={20} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Expedition File #{id ? id.slice(-4) : "0000"}
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-header text-white uppercase leading-none mb-4 drop-shadow-2xl">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-200">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                    <MapPin size={16} className="text-primary" />{" "}
                    {tour.location}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                    <Clock size={16} className="text-primary" /> {tour.duration}
                  </span>
                </div>
              </div>

              {/* SLIDER INDICATORS */}
              {images.length > 1 && (
                <div className="flex gap-2 mb-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        idx === currentImgIndex
                          ? "w-8 bg-primary"
                          : "w-2 bg-white/30 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="content-block space-y-4">
              <h3 className="text-2xl font-header text-white uppercase flex items-center gap-3">
                <Shield size={24} className="text-primary" /> Mission Brief
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line border-l-2 border-primary/30 pl-6">
                {tour.description || "Classified mission data unavailable."}
              </p>
            </div>

            {/* Inclusions */}
            <div className="content-block">
              <h3 className="text-2xl font-header text-white uppercase mb-6 flex items-center gap-3">
                <CheckCircle size={24} className="text-primary" /> Gear &
                Provisions
              </h3>

              {inclusionsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inclusionsList.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-[#1c1917] p-4 rounded-xl border border-white/10 hover:border-primary/40 transition-colors group"
                    >
                      <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-white" />
                      </div>
                      <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/20 flex items-center gap-4 text-yellow-500">
                  <AlertCircle size={24} />
                  <span>Provision manifest unavailable. Contact Basecamp.</span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="content-block bg-[#1c1917] p-8 rounded-3xl border border-white/10">
              <div className="flex items-start gap-4">
                <Users className="text-gray-400 mt-1" size={24} />
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">
                    Small Team Protocol
                  </h4>
                  <p className="text-gray-400 text-sm">
                    We strictly limit this expedition to 15 - 25 members to minimize
                    environmental impact and maximize agility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="content-block sticky top-24 bg-[#1c1917] p-8 rounded-3xl border border-white/10 shadow-2xl">
              <div className="mb-8 text-center border-b border-white/5 pb-8">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                  Total Expedition Cost
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-header text-white">
                    ₹{tour.price?.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/ person</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Start Date</span>
                  <span className="text-white font-bold">Flexible</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Difficulty</span>
                  <span className="text-white font-bold">Moderate</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Max Team</span>
                  <span className="text-white font-bold">15 - 25 Explorers</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/booking/${id}`)}
                className="w-full block bg-primary hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(234,88,12,0.4)]"
              >
                Join Expedition
              </button>

              <p className="text-center text-xs text-gray-600 mt-4">
                *Slots are filling fast for this season.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
