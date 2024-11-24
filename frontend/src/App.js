import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
//pages
import Navbar from "./components/Navbar"
import User from './pages/User';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Document from './pages/Document';
import { useAuthContext } from './hooks/useAuthContext';


export default function App() {
  const { user } = useAuthContext()

  return (
    <BrowserRouter >
      <main className='min-h-full flex flex-col w-screen overflow-x-hidden' >
        <Navbar />
        <Routes className=''>
          <Route index element={user ? <Document /> : <Navigate to={"/login"} />} />
          <Route path="user" element={user ? <User /> : <Navigate to={"/login"} />} />
          <Route path="history" element={user ? <History /> : <Navigate to={"/login"} />} />
          <Route path="login" element={!user ? <Login /> : <Navigate to={"/"} />} />
          <Route path="signup" element={!user ? <Signup /> : <Navigate to={"/"} />} />
        </Routes>
      </main>
    </BrowserRouter>

  );
}