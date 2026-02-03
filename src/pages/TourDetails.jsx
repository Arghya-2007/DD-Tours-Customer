import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import gsap from "gsap";
import SEO from "../components/SEO";
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
  Calendar,
  AlertTriangle,
  Hash,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Milestone,
  MessageCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// --- HELPER 1: IMAGE PARSER ---
const parseImages = (tour) => {
  if (!tour) return [];
  let rawImages = [];
  if (Array.isArray(tour.images) && tour.images.length > 0)
    rawImages = tour.images;
  else if (Array.isArray(tour.img) && tour.img.length > 0) rawImages = tour.img;
  else if (typeof tour.image === "string") rawImages = tour.image.split(",");
  else if (typeof tour.imageUrl === "string")
    rawImages = tour.imageUrl.split(",");
  else if (typeof tour.cover === "string") rawImages = tour.cover.split(",");

  const cleanImages = rawImages
    .map((img) => {
      if (typeof img === "string") return img.trim();
      if (typeof img === "object" && img !== null)
        return img.url || img.secure_url || img.link || "";
      return null;
    })
    .filter((img) => typeof img === "string" && img.length > 0);

  if (cleanImages.length === 0)
    return [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070",
    ];
  return cleanImages;
};

// --- HELPER 2: INCLUSIONS ---
const getTourInclusions = (tour) => {
  if (!tour) return [];
  const rawData = tour.includedItems || tour.inclusions || tour.features;
  if (!rawData) return [];
  if (Array.isArray(rawData)) return rawData;
  if (typeof rawData === "string")
    return rawData
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);
  return [];
};

// --- HELPER 3: PLACES ---
const getPlacesCovered = (tour) => {
  if (!tour?.placesCovered) return [];
  if (Array.isArray(tour.placesCovered)) return tour.placesCovered;
  if (typeof tour.placesCovered === "string")
    return tour.placesCovered.split(",").map((p) => p.trim());
  return [];
};

// --- HELPER 4: ITINERARY ---
const getItinerary = (tour) => {
  if (!tour?.itinerary) return [];
  if (Array.isArray(tour.itinerary)) return tour.itinerary;
  if (typeof tour.itinerary === "string") {
    return tour.itinerary
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => ({ description: line }));
  }
  return [];
};

// --- HELPER 5: TIME LEFT ---
const calculateTimeLeft = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  if (diff < 0) return "EXPIRED";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} Days Left`;
  return `${hours} Hours Left`;
};

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const container = useRef();

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const response = await api.get(`/trips/${id}`);
        setTour(response.data.trip || response.data);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTourDetails();
  }, [id]);

  const images = useMemo(() => parseImages(tour), [tour]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentImgIndex((prev) => (prev + 1) % images.length),
      4000,
    );
    return () => clearInterval(interval);
  }, [images]);

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
            Accessing Archives...
          </p>
        </div>
      </div>
    );

  if (!tour) return null;

  const inclusionsList = getTourInclusions(tour);
  const placesList = getPlacesCovered(tour);
  const itineraryList = getItinerary(tour);
  const timeLeft = calculateTimeLeft(tour.bookingDeadline);
  const isBookingClosed =
    timeLeft === "EXPIRED" ||
    tour.status === "completed" ||
    tour.status === "ongoing";

  let dateDisplay = {
    label: "Flexible Schedule",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  };
  if (tour.fixedDate) {
    const d = new Date(tour.fixedDate);
    dateDisplay = {
      label: d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    };
  } else if (tour.expectedMonth) {
    dateDisplay = {
      label: `${tour.expectedMonth} (Expected)`,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    };
  }

  const tripSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: tour.title,
    image: tour.images?.[0]?.url || images[0],
    description: tour.description?.substring(0, 150),
    brand: { "@type": "Brand", name: "DD Tours" },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "INR",
      price: tour.price,
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "24",
    },
  };

  const whatsappLink = `https://wa.me/919679812235?text=${encodeURIComponent(`Hi DD Tours, I have a query about the ${tour.title} trip.`)}`;

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#0c0a09] text-gray-100 font-sans pb-24"
    >
      <SEO
        title={tour.title}
        description={`Book ${tour.title}.`}
        image={tour.images?.[0]?.url || images[0]}
        schema={tripSchema}
      />

      {/* --- HERO SECTION --- */}
      <div className="hero-container relative h-[50vh] md:h-[70vh] w-full overflow-hidden bg-black">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <img
              src={img}
              alt="hero"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-black/20 to-black/30" />
          </div>
        ))}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <div className="p-2 bg-white/10 rounded-full group-hover:bg-primary transition-colors">
                <ArrowLeft size={18} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest hidden md:inline-block">
                Abort & Return
              </span>
            </button>
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 justify-between">
              <div className="content-block">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Mountain size={20} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Expedition File #{id.slice(-4)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-6xl font-header text-white uppercase leading-none mb-4 drop-shadow-2xl">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-200">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                    <MapPin size={16} className="text-primary" />{" "}
                    {tour.location}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                    <Clock size={16} className="text-primary" /> {tour.duration}
                  </span>
                  {tour.status === "completed" && (
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
                      <CheckCircle2 size={16} /> Completed
                    </span>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mb-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-500 ${idx === currentImgIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="content-block bg-[#1c1917] p-6 md:p-8 rounded-3xl border border-white/5">
              <h3 className="text-2xl font-header text-white uppercase flex items-center gap-3 mb-6">
                <Shield size={24} className="text-primary" /> Mission Brief
              </h3>
              <div
                className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isDescExpanded ? "max-h-[2000px]" : "max-h-[250px]"}`}
              >
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {tour.description || "Classified mission data unavailable."}
                </p>
                {!isDescExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#1c1917] to-transparent" />
                )}
              </div>
              {tour.description?.length > 300 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-4 flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
                >
                  {isDescExpanded ? (
                    <>
                      Read Less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Read Full Brief <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Places Covered */}
            {placesList.length > 0 && (
              <div className="content-block">
                <h3 className="text-2xl font-header text-white uppercase mb-6 flex items-center gap-3">
                  <MapPin size={24} className="text-primary" /> Strategic Points
                </h3>
                <div className="flex flex-wrap gap-3">
                  {placesList.map((place, i) => (
                    <span
                      key={i}
                      className="bg-white/5 border border-white/10 hover:border-primary/50 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-default flex items-center gap-2"
                    >
                      <Hash size={14} className="text-gray-500" /> {place}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Timeline */}
            {itineraryList.length > 0 && (
              <div className="content-block">
                <h3 className="text-2xl font-header text-white uppercase mb-8 flex items-center gap-3">
                  <Milestone size={24} className="text-primary" /> Daily
                  Operations
                </h3>
                <div className="relative border-l-2 border-white/10 ml-3 space-y-10">
                  {itineraryList.map((day, i) => (
                    <div key={i} className="relative pl-8 group">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#1c1917] border-2 border-gray-600 group-hover:border-primary transition-colors" />
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                          Day {i + 1}
                        </h4>
                        <p className="text-gray-400 leading-relaxed text-sm">
                          {typeof day === "string" ? day : day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. GEAR & PROVISIONS (FIXED COMPACT GRID) */}
            <div className="content-block">
              <h3 className="text-2xl font-header text-white uppercase mb-6 flex items-center gap-3">
                <CheckCircle size={24} className="text-primary" /> Gear &
                Provisions
              </h3>
              {inclusionsList.length > 0 ? (
                // 🚀 FIXED: grid-cols-2 for Mobile, Compact Padding (p-3)
                <div className="grid grid-cols-2 gap-3">
                  {inclusionsList.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-[#1c1917] p-3 rounded-lg border border-white/10 hover:border-primary/40 transition-colors group"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-primary shrink-0 group-hover:text-white transition-colors"
                      />
                      <span className="text-gray-300 text-xs md:text-sm font-medium group-hover:text-white transition-colors line-clamp-1">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/20 flex items-center gap-4 text-yellow-500">
                  <AlertCircle size={24} />{" "}
                  <span>Provision manifest unavailable.</span>
                </div>
              )}
            </div>

            {/* Squad Protocol */}
            <div className="content-block bg-[#1c1917] p-8 rounded-3xl border border-white/10">
              <div className="flex items-start gap-4">
                <Users className="text-gray-400 mt-1" size={24} />
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">
                    Squad Protocol
                  </h4>
                  <p className="text-gray-400 text-sm">
                    We strictly limit this expedition to small teams to minimize
                    environmental impact and maximize agility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-1">
            <div className="content-block sticky top-24 bg-[#1c1917] p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
              {isBookingClosed ? (
                <div className="mb-6 bg-slate-700/30 border border-slate-600/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1 text-center">
                  <AlertTriangle size={24} className="text-slate-400 mb-1" />
                  <span className="text-slate-200 font-bold uppercase tracking-wider">
                    {tour.status === "completed"
                      ? "Mission Accomplished"
                      : "Booking Closed"}
                  </span>
                  <span className="text-xs text-slate-500">
                    Registration closed.
                  </span>
                </div>
              ) : (
                timeLeft && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                    <Clock size={18} className="text-red-400" />
                    <span className="text-red-200 text-xs font-bold uppercase tracking-wider">
                      Hurry! {timeLeft}
                    </span>
                  </div>
                )
              )}

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
                <div
                  className={`flex justify-between items-center text-sm p-3 rounded-lg ${dateDisplay.bg}`}
                >
                  <span className="text-gray-300 flex items-center gap-2">
                    <Calendar size={14} /> Launch
                  </span>
                  <span className={`font-bold ${dateDisplay.color}`}>
                    {dateDisplay.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 px-3">
                  <span>Difficulty</span>
                  <span className="text-white font-bold">Moderate</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 px-3">
                  <span>Max Team</span>
                  <span className="text-white font-bold">25 Explorers</span>
                </div>
              </div>

              {isBookingClosed ? (
                <button
                  disabled
                  className="w-full block bg-slate-800 text-slate-500 text-center py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Registration Closed
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/booking/${id}`)}
                  className="w-full block bg-primary hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(234,88,12,0.4)]"
                >
                  Join Expedition
                </button>
              )}
              {!isBookingClosed && (
                <p className="text-center text-xs text-gray-600 mt-4">
                  *Slots are filling fast.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 FIXED WHATSAPP BUTTON (Moved UP to clear bottom nav) */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-3 md:p-4 rounded-full shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-all hover:scale-110 group flex items-center gap-2"
        aria-label="Chat on WhatsApp"
      >
        {/* Simple Icon on Mobile, Expandable on Desktop */}
        <MessageCircle size={24} className="md:w-7 md:h-7" fill="white" />
        <span className="hidden md:block max-w-0 overflow-hidden md:group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap font-bold text-sm">
          Chat with us
        </span>
      </a>
    </div>
  );
};

export default TourDetails;
