import { BrowserRouter,Routes,Route } from "react-router-dom"
import Signin from "./pages/signin"
import Signup from "./pages/signup"
import Otp from "./pages/otp"
import Home from "./pages/home"
import RatePage from "./pages/rate"
import Header from "./components/Header.jsx"
import ProtectedRoute from "./components/ProtectedRoute"

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
        <Route
          path="/rate"
          element={
            <ProtectedRoute>
              <RatePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
   
  )
}
