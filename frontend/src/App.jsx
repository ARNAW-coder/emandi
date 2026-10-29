import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import ScheduleDetail from "./pages/ScheduleDetail";
import QueuePage from "./pages/QueuePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProcurementPage from "./pages/ProcurementPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQueuePage from "./pages/AdminQueuePage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import OfficerDashboard from "./pages/OfficerDashboard";

// replace the admin/officer placeholder routes with:


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
<Route path="/farmer/dashboard" element={<ProtectedRoute allowedRoles={["FARMER"]}><FarmerDashboard /></ProtectedRoute>} />
<Route path="/farmer/schedule/:id" element={<ProtectedRoute allowedRoles={["FARMER"]}><ScheduleDetail /></ProtectedRoute>} />
<Route path="/farmer/queue/:id" element={<ProtectedRoute allowedRoles={["FARMER"]}><QueuePage /></ProtectedRoute>} />
<Route path="/farmer/notifications" element={<ProtectedRoute allowedRoles={["FARMER"]}><NotificationsPage /></ProtectedRoute>} />
<Route path="/farmer/procurement" element={<ProtectedRoute allowedRoles={["FARMER"]}><ProcurementPage /></ProtectedRoute>} />
<Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["MANDI_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/queue/:id" element={<ProtectedRoute allowedRoles={["MANDI_ADMIN"]}><AdminQueuePage /></ProtectedRoute>} />
<Route path="/admin/payments" element={<ProtectedRoute allowedRoles={["MANDI_ADMIN"]}><AdminPaymentsPage /></ProtectedRoute>} />
<Route path="/officer/dashboard" element={<ProtectedRoute allowedRoles={["GOVT_OFFICER"]}><OfficerDashboard /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;