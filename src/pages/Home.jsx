import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ShieldCheck, Tent, Globe, Users } from "lucide-react";
import SEO from "../components/SEO";

// --- 1. IMPORT LARGE IMAGES (Desktop) ---
import heroImg from "../assets/images/hero.avif";
import alpineImg from "../assets/images/alpine.avif";
import jungleImg from "../assets/images/jungle.avif";
import oceanImg from "../assets/images/ocean.avif";
import desertImg from "../assets/images/desert.avif";
import natureImg from "../assets/images/nature.avif";
import groupImg from "../assets/images/group.avif";
import kashmirImg from "../assets/images/kashmir.avif";
import himalayaImg from "../assets/images/himalaya.avif";
import saharaImg from "../assets/images/sahara.avif";
import fallbackImg from "../assets/images/fallback.avif";

// --- 2. IMPORT SMALL IMAGES (Mobile) ---
// ⚠️ Ensure these files exist in your folder!
import heroSmall from "../assets/images/hero-small.avif";
import alpineSmall from "../assets/images/alpine-small.avif";
import jungleSmall from "../assets/images/jungle-small.avif";
import oceanSmall from "../assets/images/ocean-small.avif";
import desertSmall from "../assets/images/desert-small.avif";
import natureSmall from "../assets/images/nature-small.avif";
import groupSmall from "../assets/images/group-small.avif";
import kashmirSmall from "../assets/images/kashmir-small.avif";
import himalayaSmall from "../assets/images/himalaya-small.avif";
import saharaSmall from "../assets/images/sahara-small.avif";

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// --- MAP IMPORTS TO RESPONSIVE OBJECTS ---
const IMAGES = {
  hero: { large: heroImg, small: heroSmall },
  terrain_alpine: { large: alpineImg, small: alpineSmall },
  terrain_jungle: { large: jungleImg, small: jungleSmall },
  terrain_ocean: { large: oceanImg, small: oceanSmall },
  terrain_desert: { large: desertImg, small: desertSmall },
  feat_nature: { large: natureImg, small: natureSmall },
  feat_group: { large: groupImg, small: groupSmall },
  trend_kashmir: { large: kashmirImg, small: kashmirSmall },
  trend_himalaya: { large: himalayaImg, small: himalayaSmall },
  trend_desert: { large: saharaImg, small: saharaSmall },
  fallback: fallbackImg,
};

const Home = () => {
  const container = useRef();
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    {
      id: 0,
      name: "Alpine Peaks",
      img: IMAGES.terrain_alpine,
      desc: "Scale the highest summits.",
    },
    {
      id: 1,
      name: "Deep Jungle",
      img: IMAGES.terrain_jungle,
      desc: "Discover hidden ecosystems.",
    },
    {
      id: 2,
      name: "Ocean Depths",
      img: IMAGES.terrain_ocean,
      desc: "Sail into the unknown.",
    },
    {
      id: 3,
      name: "Desert Sands",
      img: IMAGES.terrain_desert,
      desc: "Endless dunes await.",
    },
  ];

  const handleImageError = (e) => {
    e.target.src = IMAGES.fallback;
  };

  useGSAP(
    () => {
      // 1. Hero Reveal
      const tl = gsap.timeline();
      tl.from(".hero-text", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
      }).from(
        ".hero-btn",
        { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.5",
      );

      // 2. Parallax Background
      gsap.to(".hero-img", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Service Cards Animation (Mobile Check: Disable if screen is small)
      if (window.innerWidth > 768) {
        gsap.utils.toArray(".service-card").forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: { trigger: card, start: "top 85%" },
          });
        });
      }
    },
    { scope: container },
  );

  return (
    <>
      <SEO
        title="Home"
        description="Experience the thrill of India's best adventure tours. Book trekking, camping, and survival expeditions with DD Tours and Travels."
        url="https://ddtours.in"
      />
      <div
        ref={container}
        className="w-full min-h-screen bg-[#0c0a09] text-white relative overflow-hidden"
      >
        {/* --- HERO SECTION --- */}
        <div className="hero-section relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* 🚀 OPTIMIZATION: Using srcSet for Mobile/Desktop Switching */}
            <img
              src={IMAGES.hero.large}
              srcSet={`${IMAGES.hero.small} 600w, ${IMAGES.hero.large} 1920w`}
              sizes="100vw"
              alt="Adventure Expedition"
              className="hero-img w-full h-[120%] object-cover -mt-[5%]"
              fetchPriority="high" // Critical for LCP
              loading="eager" // Load immediately
              width="1920" // Prevent layout shift
              height="1080"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#0c0a09]" />
          </div>

          <div className="relative z-10 text-center max-w-5xl px-6 mt-16">
            {/* ... Hero Text Content (Same as before) ... */}
            <div className="flex justify-center mb-6">
              <div className="hero-text flex items-center gap-2 px-4 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-bold">
                  Now Booking 2026 Season
                </span>
              </div>
            </div>
            <h1 className="hero-text text-6xl md:text-9xl font-header mb-6 uppercase leading-[0.9] drop-shadow-2xl">
              Beyond <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                The Map
              </span>
            </h1>
            <p className="hero-text text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              We don't sell vacations. We craft expeditions for those who refuse
              to stand still.
            </p>
            <div className="hero-btn">
              <Link
                to="/tours"
                className="group relative inline-flex items-center gap-3 bg-primary text-white px-12 py-5 rounded-full font-bold text-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Expeditions <ArrowRight size={20} />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- STATS BAR --- */}
        <div className="w-full border-y border-white/5 bg-[#141210]">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "98%", label: "Success Rate" },
              { num: "50+", label: "Countries" },
              { num: "24/7", label: "Support Team" },
              { num: "12k+", label: "Happy Travelers" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center md:text-left border-r border-white/5 last:border-0"
              >
                <h3 className="text-4xl font-header text-white">{stat.num}</h3>
                <p className="text-muted text-sm uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- WHY WE ARE DIFFERENT --- */}
        <div className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h4 className="text-primary uppercase tracking-widest font-bold mb-3">
              The DD Tours Standard
            </h4>
            <h2 className="text-5xl font-header">Why We Are Different</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Nature */}
            <div className="service-card md:col-span-2 bg-[#1c1917] p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Globe size={32} />
                </div>
                <h3 className="text-3xl font-header mb-4">
                  Planet-First Expeditions
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  We believe in leaving a place better than we found it. 10% of
                  every booking goes directly to local conservation projects.
                </p>
              </div>
              <img
                src={IMAGES.feat_nature.large}
                srcSet={`${IMAGES.feat_nature.small} 400w, ${IMAGES.feat_nature.large} 800w`}
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                onError={handleImageError}
                className="absolute right-0 top-0 w-2/3 h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black)",
                }}
                alt="Nature conservation"
              />
            </div>

            {/* Small Cards (Icons only, lightweight) */}
            <div className="service-card bg-[#1c1917] p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors group">
              <ShieldCheck
                size={40}
                className="text-primary mb-6 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-2xl font-header mb-2">Expert-Led Safety</h3>
              <p className="text-gray-400">
                Every guide is WFR certified. We monitor weather and conditions
                24/7.
              </p>
            </div>
            <div className="service-card bg-[#1c1917] p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors group">
              <Tent
                size={40}
                className="text-primary mb-6 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-2xl font-header mb-2">Luxury Basecamps</h3>
              <p className="text-gray-400">
                Roughing it doesn't mean suffering. Enjoy comfort in the wild.
              </p>
            </div>

            {/* Card 4: Groups */}
            <div className="service-card md:col-span-2 bg-[#1c1917] p-10 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 hover:border-primary/30 transition-colors">
              <div className="flex-1">
                <Users size={40} className="text-primary mb-6" />
                <h3 className="text-3xl font-header mb-4">
                  Small Groups, Big Impact
                </h3>
                <p className="text-gray-400 text-lg">
                  We cap our groups at 15 - 25 explorers to ensure an intimate,
                  immersive experience.
                </p>
              </div>
              <div className="w-full md:w-64 h-40 bg-white/5 rounded-2xl overflow-hidden relative">
                <img
                  src={IMAGES.feat_group.large}
                  srcSet={`${IMAGES.feat_group.small} 300w, ${IMAGES.feat_group.large} 600w`}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  loading="lazy"
                  onError={handleImageError}
                  alt="Small group hiking"
                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- CHOOSE YOUR TERRAIN (Using Large for Full Quality, but lazy loaded) --- */}
        <div className="relative py-32 overflow-hidden">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeCategory === i ? "opacity-40" : "opacity-0"}`}
              style={{
                backgroundImage: `url(${cat.img.large})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(50%)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/80 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <h2 className="text-6xl font-header mb-16 text-center">
              Choose Your Terrain
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(i)}
                  className="cursor-pointer group relative h-[400px] border-r border-white/20 last:border-0 p-6 flex flex-col justify-end overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${cat.img.small})` /* Use small for thumbnail bg */,
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 transition-opacity duration-300 ${activeCategory === i ? "opacity-80" : "opacity-90"}`}
                  />
                  <div
                    className={`absolute inset-0 border-2 border-primary/50 transition-all duration-300 ${activeCategory === i ? "opacity-100" : "opacity-0"}`}
                  />
                  <div className="relative z-10">
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 duration-300">
                      <ArrowRight className="text-primary" />
                    </div>
                    <h3
                      className={`text-3xl font-header mb-2 transition-colors ${activeCategory === i ? "text-primary" : "text-white"}`}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- TRENDING EXPEDITIONS (Optimized Cards) --- */}
        <div className="py-24 px-6 max-w-7xl mx-auto">
          {/* ... Header Text ... */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h4 className="text-primary uppercase tracking-widest font-bold mb-2">
                Curated For You
              </h4>
              <h2 className="text-5xl font-header">Trending Expeditions</h2>
            </div>
            <Link
              to="/tours"
              className="mt-4 md:mt-0 px-6 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all font-bold"
            >
              View All Packages
            </Link>
          </div>

          <div className="cards-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Kashmiri Himlands",
                img: IMAGES.trend_kashmir,
                price: "22,000 INR",
                days: "15 Days",
              },
              {
                title: "Himalayan Trek",
                img: IMAGES.trend_himalaya,
                price: "24,000 INR",
                days: "14 Days",
              },
              {
                title: "Desert Nights",
                img: IMAGES.trend_desert,
                price: "9,000 INR",
                days: "10 Days",
              },
            ].map((trip, idx) => (
              <Link
                to={"/tours"}
                key={idx}
                className="trip-card group block relative h-[500px] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-primary/50 transition-all shadow-2xl"
              >
                {/* 🚀 RESPONSIVE IMAGE CARD */}
                <img
                  src={trip.img.large}
                  srcSet={`${trip.img.small} 400w, ${trip.img.large} 800w`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  alt={trip.title}
                  loading="lazy"
                  onError={handleImageError}
                  width="400"
                  height="500"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-bold">
                  {trip.days}
                </div>
                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-header text-white mb-2">
                    {trip.title}
                  </h3>
                  <div className="flex justify-between items-center mt-4 border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    <span className="text-xl font-bold text-primary">
                      {trip.price}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                      Book Now <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* --- CTA SECTION --- */}
        <div className="pb-24 px-6 text-center">
          <div className="bg-gradient-to-br from-[#1c1917] to-black border border-white/10 rounded-[3rem] p-16 relative overflow-hidden max-w-6xl mx-auto">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#84cc16]/10 rounded-full blur-[100px]" />
            <h2 className="relative z-10 text-5xl md:text-7xl font-header mb-6">
              Your Story Starts Here
            </h2>
            <p className="relative z-10 text-gray-400 mb-10 text-xl max-w-xl mx-auto">
              Life is short. The world is wide. Don't wait for the "right time"
              to start living.
            </p>
            <Link
              to="/login"
              className="relative z-10 bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform inline-block"
            >
              Join The Club
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
