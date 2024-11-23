

import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';

export default function Navbar() {

    const { user } = useAuthContext()
    const { logout } = useLogout()


    return (
        <div className="w-screen h-12 text-xl">
            <div className="fixed h-12 w-screen bg-secondary ">
                <div className="flex justify-between max-w-[80vw] mx-auto items-center h-12 text-white">
                    <Link className='w-1/4' to={'/'}>DigitalPeak</Link>
                    <div className="flex w-[40vw] justify-around items-center">
                        <Link to={'/doc'}>Documents</Link>
                        <Link to={'/user'}>User</Link>
                        <Link to={'/history'}>History</Link>

                    </div>
                    <div className='text-end w-1/4'>
                        {user && <div>Hello <span className='underline cursor-pointer' onClick={logout} title="Click to Logout">{user.username}</span>!</div>}
                        {!user && <Link to={'/login'} className='bg-white text-primary rounded-md px-6 py-1 ml-4 '>
                            Login
                        </Link>}
                    </div>
                </div>

            </div>
        </div>
    )
}