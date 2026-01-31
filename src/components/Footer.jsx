import { Link } from "react-router-dom";
import {
  Compass,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0c0a09] border-t border-white/10 pt-20 pb-10 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 text-primary mb-6">
              <Compass size={32} strokeWidth={2} />
              <h2 className="text-2xl font-header tracking-wide text-white uppercase">
                DD Tours
              </h2>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              We curate expeditions for those who seek the unknown. Leave the
              map behind and follow your instinct.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">
              Expeditions
            </h3>
            <ul className="space-y-4 text-gray-400">
              {[
                "Alpine Climbing",
                "Desert Treks",
                "Ocean Navigation",
                "Jungle Survival",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/tours"
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">
              Company
            </h3>
            <ul className="space-y-4 text-gray-400">
              {["Our Story", "Guides", "Journal", "Safety Standards"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/about"
                      className="hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">
              Join The Basecamp
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Get exclusive expedition drops and guide tips.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 DD Tours & Travels. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
