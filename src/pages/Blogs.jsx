import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO"; // SEO Component
import { Link } from "react-router-dom"; // For linking to Single Blog Page
import api from "../services/api"; // Your Axios instance
import {
  BookOpen,
  Clock,
  User,
  ArrowRight,
  Compass,
  Share2,
  Youtube, // 🆕 Icon
  Facebook, // 🆕 Icon
  Loader2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Blogs = () => {
  const container = useRef();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        setBlogs(res.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // --- GSAP ANIMATIONS ---
  useGSAP(
    () => {
      const tl = gsap.timeline();

      // 1. Header Entrance
      tl.fromTo(
        ".blog-header",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out" },
      );

      // 2. Blog Cards Cascade (Only run if we have blogs)
      if (blogs.length > 0) {
        gsap.fromTo(
          ".blog-card",
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".blog-grid",
              start: "top 85%",
            },
          },
        );
      }
    },
    { scope: container, dependencies: [loading, blogs.length] },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#0c0a09] text-gray-200 p-6 md:p-12 overflow-hidden"
    >
      <SEO
        title="Field Journal - Intelligence & Insights"
        description="Dispatches from the front lines of adventure. Expert gear reviews, survival protocols, and mission reports."
        url="https://ddtours.in/blogs"
      />
      {/* --- HEADER --- */}
      <div className="blog-header max-w-7xl mx-auto mb-16 border-b border-white/10 pb-10">
        <div className="flex items-center gap-2 text-primary mb-4">
          <BookOpen size={24} />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">
            The Field Journal
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-header text-white uppercase leading-none">
          Intelligence <br />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
            & Insights
          </span>
        </h1>
        <p className="text-gray-500 mt-6 max-w-xl text-lg">
          Dispatches from the front lines of adventure. Expert gear reviews,
          survival protocols, and mission reports.
        </p>
      </div>

      {/* --- BLOG GRID --- */}
      <div className="max-w-7xl mx-auto blog-grid">
        {loading ? (
          // LOADING SKELETON
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="blog-card group flex flex-col md:flex-row bg-[#1c1917] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-500"
              >
                {/* Image Side */}
                <div className="relative md:w-2/5 h-64 md:h-auto overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {blog.category}
                    </span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="md:w-3/5 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1 font-mono uppercase tracking-tighter">
                        <Clock size={12} className="text-primary" />{" "}
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1 font-mono uppercase tracking-tighter">
                        <User size={12} className="text-primary" />{" "}
                        {blog.author}
                      </span>
                      <span className="text-gray-600">| {blog.readTime}</span>
                    </div>

                    <h2 className="text-2xl font-header text-white uppercase mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all"
                    >
                      Read Report{" "}
                      <ArrowRight size={16} className="text-primary" />
                    </Link>

                    {/* 🆕 VIDEO LINKS SECTION */}
                    <div className="flex gap-3">
                      {blog.youtubeUrl && (
                        <a
                          href={blog.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                          title="Watch on YouTube"
                        >
                          <Youtube size={14} />
                        </a>
                      )}
                      {blog.facebookUrl && (
                        <a
                          href={blog.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
                          title="Watch on Facebook"
                        >
                          <Facebook size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // EMPTY STATE
          <div className="mt-20 p-12 bg-white/5 border border-dashed border-white/10 rounded-[3rem] text-center">
            <Compass
              className="mx-auto text-gray-700 mb-4 animate-spin-slow"
              size={48}
            />
            <h3 className="text-xl font-header text-gray-400 uppercase">
              Incoming Dispatches
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Our operatives are currently in the field. New reports arriving
              soon.
            </p>
          </div>
        )}
      </div>

      {/* --- FOOTER CTA --- */}
      <div className="max-w-7xl mx-auto mt-24 text-center">
        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.5em] mb-4">
          End of Transmission
        </p>
        <div className="w-16 h-[1px] bg-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default Blogs;
