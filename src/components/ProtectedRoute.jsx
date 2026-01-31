import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. If we are still checking local storage, Do Nothing (Wait)
  if (loading) {
    return <div></div>; // Or return a Spinner component
  }

  // 2. If finished loading and NO user, then kick them out
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Otherwise, let them in!
  return children;
};

export default ProtectedRoute;
