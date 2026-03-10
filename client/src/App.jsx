import { BrowserRouter,Routes,Route } from "react-router-dom"
import Signin from "./pages/signin"
import Signup from "./pages/signup"
import Otp from "./pages/otp"
import Home from "./pages/home"
import RatePage from "./pages/rate"
import FindOffice from "./pages/findoff"
import RateEmployees from "./pages/rateEmployees"
import RateEmployeesAccess from "./pages/rateEmployeesAccess"
import Header from "./components/Header.jsx"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLogin from "./pages/adminLogin"
import AdminDashboard from "./pages/adminDashboard"
import AdminProtectedRoute from "./components/AdminProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<Otp />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/rate"
          element={
            <ProtectedRoute>
              <RatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-office"
          element={
            <ProtectedRoute>
              <FindOffice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate-employees/access"
          element={
            <ProtectedRoute>
              <RateEmployeesAccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate-employees"
          element={
            <ProtectedRoute>
              <RateEmployees />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
   
  )
}
