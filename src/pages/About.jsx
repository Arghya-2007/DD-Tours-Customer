import React, { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheck,
  Phone,
  Compass,
  Mountain,
  Zap,
  Linkedin,
  Twitter,
  Mail,
  Map,
  Truck,
  FileText,
  Coffee,
  Tent,
  Users,
} from "lucide-react";
import SEO from "../components/SEO";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const container = useRef();

  useGSAP(
    () => {
      // 1. Hero Entrance
      gsap.fromTo(
        ".hero-content",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
      );

      // 2. Hero Parallax
      gsap.to(".hero-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-container",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Bento Grid Animation
      gsap.fromTo(
        ".bento-card",
        { scale: 0.9, opacity: 0, y: 50 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 80%",
          },
        },
      );

      // 4. Feature Cards
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 60, rotationX: -15 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 80%",
          },
          clearProps: "all",
        },
      );

      // 5. NEW: Protocol Timeline Animation
      gsap.fromTo(
        ".protocol-step",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.3,
          scrollTrigger: {
            trigger: ".protocol-section",
            start: "top 70%",
          },
        },
      );

      // 6. NEW: Logistics Cards
      gsap.fromTo(
        ".logistics-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".logistics-section",
            start: "top 80%",
          },
        },
      );

      // 7. Founders Section Stagger
      gsap.fromTo(
        ".founder-profile",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.3,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".founders-section",
            start: "top 70%",
          },
        },
      );

      // 8. CTA Box
      gsap.fromTo(
        ".cta-box",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".cta-box",
            start: "top 85%",
          },
        },
      );
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="bg-[#0c0a09] min-h-screen text-gray-200 overflow-hidden font-sans"
    >
      <SEO
        title="About Us"
        description="Learn about DD Tours and Travels - Our process, our logistics, and our commitment to adventure."
        url="https://ddtours.in/about"
      />

      {/* --- 1. HERO SECTION --- */}
      <div className="hero-container relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="hero-bg absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop')",
            filter: "brightness(0.4)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/20 via-[#0c0a09]/60 to-[#0c0a09]" />
        </div>

        <div className="hero-content relative z-10 text-center max-w-5xl px-6">
          <h4 className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4">
            The Command Center
          </h4>
          <h1 className="text-6xl md:text-8xl font-header text-white uppercase leading-none mb-8">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
              Architects
            </span>{" "}
            <br /> of Adventure
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Crafting legends and engineering expeditions since 2024.
          </p>
        </div>
      </div>

      {/* --- 2. BENTO GRID SECTION --- */}
      <div className="max-w-7xl mx-auto py-24 px-6 bento-grid">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
          <div className="bento-card md:col-span-8 bg-[#1c1917] p-10 rounded-[2rem] border border-white/5 flex flex-col justify-center">
            <h2 className="text-4xl font-header text-white uppercase mb-6">
              Our Genesis
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Founded by rugged explorers who found the industry too "safe," DD
              Tours was born in the heart of the Himalayas. We realized that
              true growth happens when you leave the paved roads behind.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              We serve a community of over 2,500 operatives who seek more than
              just a selfie—they seek a story worth telling.
            </p>
          </div>

          <div className="bento-card md:col-span-4 bg-primary p-10 rounded-[2rem] flex flex-col justify-between text-white shadow-2xl">
            <div className="space-y-8">
              <div>
                <h3 className="text-5xl font-header">2.5K+</h3>
                <p className="uppercase tracking-widest text-xs font-bold opacity-80">
                  Explorers Registered
                </p>
              </div>
              <div>
                <h3 className="text-5xl font-header">50+</h3>
                <p className="uppercase tracking-widest text-xs font-bold opacity-80">
                  Uncharted Regions
                </p>
              </div>
              <div>
                <h3 className="text-5xl font-header">100%</h3>
                <p className="uppercase tracking-widest text-xs font-bold opacity-80">
                  Mission Success
                </p>
              </div>
            </div>
            <Zap size={48} className="opacity-20 self-end" />
          </div>
        </div>
      </div>

      {/* --- 3. THE PROTOCOL (HOW WE WORK) --- */}
      <div className="bg-[#141210] py-24 protocol-section overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-header text-white uppercase">
              The Protocol
            </h2>
            <p className="text-gray-500 mt-4 tracking-widest">
              HOW WE EXECUTE A MISSION
            </p>
          </div>

          <div className="relative border-l-2 border-primary/20 ml-6 md:ml-1/2 space-y-16">
            {/* Step 1 */}
            <div className="protocol-step relative pl-12 md:pl-0 md:grid md:grid-cols-2 gap-12 items-center">
              <div className="md:text-right md:pr-12">
                <h3 className="text-2xl font-header text-white mb-2">
                  01. Recon & Initiation
                </h3>
                <p className="text-gray-400">
                  You select your target coordinates (Tour). We confirm
                  availability and slots. A dedicated mission manager contacts
                  you via WhatsApp for initial briefing.
                </p>
              </div>
              <div className="absolute left-[-9px] top-0 md:left-1/2 md:-ml-[9px] w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(234,88,12,0.8)]" />
              <div className="hidden md:block pl-12">
                <FileText size={48} className="text-white/20" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="protocol-step relative pl-12 md:pl-0 md:grid md:grid-cols-2 gap-12 items-center">
              <div className="hidden md:block md:text-right md:pr-12">
                <Map size={48} className="text-white/20 ml-auto" />
              </div>
              <div className="absolute left-[-9px] top-0 md:left-1/2 md:-ml-[9px] w-4 h-4 bg-[#1c1917] border-2 border-primary rounded-full" />
              <div className="md:pl-12">
                <h3 className="text-2xl font-header text-white mb-2">
                  02. Gear Check & Briefing
                </h3>
                <p className="text-gray-400">
                  48 hours before deployment, you receive the final dossier:
                  Weather reports, packing checklist, and pickup coordinates.
                  Permits are processed by our ground team.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="protocol-step relative pl-12 md:pl-0 md:grid md:grid-cols-2 gap-12 items-center">
              <div className="md:text-right md:pr-12">
                <h3 className="text-2xl font-header text-white mb-2">
                  03. Deployment
                </h3>
                <p className="text-gray-400">
                  We deploy Union Cabs (Bolero/Innova) for terrain mastery. Our
                  convoys move in formation. Safety checks happen every 4 hours.
                </p>
              </div>
              <div className="absolute left-[-9px] top-0 md:left-1/2 md:-ml-[9px] w-4 h-4 bg-[#1c1917] border-2 border-primary rounded-full" />
              <div className="hidden md:block pl-12">
                <Truck size={48} className="text-white/20" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="protocol-step relative pl-12 md:pl-0 md:grid md:grid-cols-2 gap-12 items-center">
              <div className="hidden md:block md:text-right md:pr-12">
                <Users size={48} className="text-white/20 ml-auto" />
              </div>
              <div className="absolute left-[-9px] top-0 md:left-1/2 md:-ml-[9px] w-4 h-4 bg-primary rounded-full" />
              <div className="md:pl-12">
                <h3 className="text-2xl font-header text-white mb-2">
                  04. The Experience
                </h3>
                <p className="text-gray-400">
                  No scripted tourist traps. We explore hidden valleys, eat at
                  local homes, and stay in curated properties that blend luxury
                  with the wild.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. OPERATIONAL LOGISTICS --- */}
      <div className="py-24 px-6 logistics-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-header text-white uppercase">
              Operational Logistics
            </h2>
            <p className="text-gray-500 mt-2">OUR HARDWARE & PROVISIONS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="logistics-card bg-[#1c1917] p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
              <Truck size={40} className="text-primary mb-6" />
              <h3 className="text-2xl font-header text-white mb-3">
                The Fleet
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                We strictly use <strong>Union Registered Vehicles</strong>{" "}
                (Innova, Bolero, Tempo Traveller). Drivers are
                mountain-certified veterans with 10+ years of high-altitude
                experience. No private cars, no risks.
              </p>
            </div>

            {/* Card 2 */}
            <div className="logistics-card bg-[#1c1917] p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
              <Tent size={40} className="text-primary mb-6" />
              <h3 className="text-2xl font-header text-white mb-3">
                Basecamps
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                From <strong>Swiss Tents</strong> in Ladakh to{" "}
                <strong>Heritage Houseboats</strong> in Kashmir. We pre-book
                premium properties that offer hot water, electric blankets, and
                hygiene in remote zones.
              </p>
            </div>

            {/* Card 3 */}
            <div className="logistics-card bg-[#1c1917] p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
              <Coffee size={40} className="text-primary mb-6" />
              <h3 className="text-2xl font-header text-white mb-3">Rations</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                We prioritize <strong>Fresh, Hot, Hygienic</strong> meals (MAP
                Plan). While we encourage local cuisine tasting, we ensure
                standard comfort food (Dal, Rice, Roti, Sabzi) is always
                available.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 5. CORE VALUES --- */}
      <div className="bg-[#141210] py-24 features-grid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={ShieldCheck}
              title="Ironclad Safety"
              desc="Every route is scouted, every gear is tested, and every guide is veteran-certified. We manage the risk so you can feel the rush."
            />
            <FeatureCard
              icon={Mountain}
              title="Elite Access"
              desc="We hold permits to regions others can't name. From private ridge camps to hidden valley entries, you get the exclusive pass."
            />
            <FeatureCard
              icon={Phone}
              title="Ghost Support"
              desc="Our 24/7 command center tracks your coordinates during every expedition. We are the ghost in the machine watching your back."
            />
          </div>
        </div>
      </div>

      {/* --- 6. FOUNDERS & CO-FOUNDERS SECTION --- */}
      <div className="max-w-7xl mx-auto py-32 px-6 founders-section">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-header text-white uppercase">
            Leadership Command
          </h2>
          <p className="text-gray-500 mt-4 tracking-widest">
            THE MINDS BEHIND THE MISSION
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Founder */}
          <FounderCard
            name="D.D. Chatterjee"
            role="Lead Architect & Founder"
            img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
            bio="A veteran of 15 Himalayan expeditions, D.D. started this journey to bring tactical precision to leisure travel."
          />
          {/* Co-Founder */}
          <FounderCard
            name="Sarah Jenkins"
            role="Operations Chief & Co-Founder"
            img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
            bio="With a background in global logistics, Sarah ensures that every basecamp is a sanctuary and every route is seamless."
          />
        </div>
      </div>

      {/* --- 7. CTA SECTION --- */}
      <div className="py-32 px-6 text-center">
        <div className="cta-box bg-gradient-to-br from-primary to-orange-700 p-16 md:p-24 rounded-[4rem] max-w-5xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
          <h2 className="text-5xl md:text-7xl font-header text-white uppercase mb-8 leading-tight">
            Stop Watching. <br /> Start Exploring.
          </h2>
          <Link
            to="/tours"
            className="group inline-flex items-center gap-4 bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform"
          >
            Initiate First Mission{" "}
            <Compass
              size={24}
              className="group-hover:rotate-45 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="feature-card bg-[#1c1917] p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/50 transition-all duration-500">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-header text-white uppercase mb-4 tracking-wider">
      {title}
    </h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const FounderCard = ({ name, role, img, bio }) => (
  <div className="founder-profile group bg-[#1c1917] p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row gap-8 items-center hover:border-primary/30 transition-all">
    <div className="relative w-48 h-48 shrink-0">
      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
      <img
        src={img}
        alt={name}
        className="relative w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
      />
    </div>
    <div className="text-center md:text-left space-y-4">
      <div>
        <h3 className="text-3xl font-header text-white uppercase tracking-tight">
          {name}
        </h3>
        <p className="text-primary text-sm font-bold uppercase tracking-widest">
          {role}
        </p>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{bio}</p>
      <div className="flex justify-center md:justify-start gap-4 text-gray-500">
        <Linkedin size={18} className="hover:text-white cursor-pointer" />
        <Twitter size={18} className="hover:text-white cursor-pointer" />
        <Mail size={18} className="hover:text-white cursor-pointer" />
      </div>
    </div>
  </div>
);

export default About;
