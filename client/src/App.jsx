import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all page components
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FindDonorPage from './pages/FindDonorPage';
import MyRequestsPage from './pages/MyRequestsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import ConversationsPage from './pages/ConversationsPage';
import ChatPage from './pages/ChatPage';

// This single component will protect our routes.
// It checks if a user is logged in. If not, it redirects to /login.
// It can also optionally check for an admin role.
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // If the route needs a token and there isn't one, redirect to login.
    if (!token) {
        return <Navigate to="/login" />;
    }

    // If the route is for admins only and the user is not an admin, redirect to dashboard.
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    // If all checks pass, render the component.
    return children;
};


function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes - Anyone can access these */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- SIMPLIFIED PRIVATE ROUTES --- */}
          {/* We wrap each private component in our new ProtectedRoute component. */}
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/find-donor" element={<ProtectedRoute><FindDonorPage /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
          <Route path="/chat/:requestId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

          {/* --- ADMIN ONLY ROUTE --- */}
          {/* Here, we pass the 'adminOnly' prop to our protector. */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />

          {/* Fallback Route: Redirect any unknown path to the main dashboard or login page. */}
          <Route path="*" element={<Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;