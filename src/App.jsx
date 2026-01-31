import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react"; // 1. Import Lazy & Suspense
import MainLayout from "./components/Mainlayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader"; // Ensure you have a Loader component

// 2. Lazy Load Pages (Massive Performance Boost)
const Home = lazy(() => import("./pages/Home"));
const AllTours = lazy(() => import("./pages/AllTrips")); // Assuming AllTrips.jsx exists
const TourDetails = lazy(() => import("./pages/TourDetails"));
const BookingPage = lazy(() => import("./pages/Booking"));
const Blogs = lazy(() => import("./pages/Blogs"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));

function App() {
  return (
    <Router>
      <MainLayout>
        {/* 3. Suspense shows a loading spinner while the chunk downloads */}
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center bg-[#0c0a09] text-primary">
              <Loader />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<AllTours />} />
            <Route path="/tours/:id" element={<TourDetails />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;
