

import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';

export default function Navbar() {

    const { user } = useAuthContext()
    const { logout } = useLogout()


    return (
        <div className="w-screen h-12 text-xl">
            <div className="fixed h-12 w-screen bg-cyan-600 ">
                <div className="flex justify-between max-w-[80vw] mx-auto items-center h-12 text-white">
                    <Link to={'/'}>DigitalPeak</Link>
                    <div className="flex w-[40vw] justify-around items-center">
                        <Link to={'/'}>Home</Link>
                        <Link to={'/user'}>User</Link>
                        <Link to={'/history'}>History</Link>
                        <div className='bg-white text-cyan-600 rounded px-4 py-1'>
                            {user ? <button onClick={logout}>Logout</button> : <Link to={'/login'}>Login</Link>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}