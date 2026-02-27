import { BrowserRouter,Routes,Route } from "react-router-dom"
import Signin from "./pages/signin"
import Signup from "./pages/signup"
import Home from "./pages/home"
import home1 from "./pages/home1" 
import Header from "./components/Header.jsx"


export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
   
  )
}
