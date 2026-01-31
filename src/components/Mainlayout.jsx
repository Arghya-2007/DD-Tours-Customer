import Sidebar from "./Sidebar";
import MobileNav from "./MobileSideNav";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area 
          FIX: Removed 'w-full'. 
          Now it will automatically fill only the remaining space.
      */}
      <main className="flex-1 ml-0 md:ml-64 relative overflow-x-hidden pb-20 md:pb-0">
        {children}

        {/* Footer is inside main so it aligns correctly */}
        <Footer />
      </main>

      {/* Mobile Nav - Mobile Only */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;
