import { BrowserRouter, Routes, Route } from 'react-router-dom'
//pages
import Navbar from "./components/Navbar"
import Footer from './components/Footer';
import Home from "./pages/home";
import User from './pages/User';
import History from './pages/History';


export default function App() {


  return (
    <BrowserRouter >
      <main className='min-h-full flex flex-col w-screen overflow-x-hidden' >
        <Navbar />
        <Routes className=''>
          <Route index element={<Home />} />
          <Route path="user" element={<User />} />
          <Route path="history" element={<History />} />
        </Routes>
        {/* <Footer /> */}
      </main>
    </BrowserRouter>

  );
}