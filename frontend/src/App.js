import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
//pages
import Navbar from "./components/Navbar"
import Footer from './components/Footer';
import Home from './pages/home';
import User from './pages/User';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthContext } from './hooks/useAuthContext';


export default function App() {
  const { user } = useAuthContext()

  return (
    <BrowserRouter >
      <main className='min-h-full flex flex-col w-screen overflow-x-hidden' >
        <Navbar />
        <Routes className=''>
          <Route index element={<Home />} />
          <Route path="user" element={<User />} />
          <Route path="history" element={<History />} />
          <Route path="login" element={!user ? <Login /> : <Navigate to={"/admin"} />} />
          <Route path="signup" element={!user ? <Signup /> : <Navigate to={"/admin"} />} />
        </Routes>
        {/* <Footer /> */}
      </main>
    </BrowserRouter>

  );
}