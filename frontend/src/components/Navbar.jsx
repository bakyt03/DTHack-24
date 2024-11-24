import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

export default function Navbar() {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const location = useLocation();

  return (
    <div className="w-screen h-16 text-xl">
      <div className="fixed h-16 w-screen bg-secondary ">
        <div className="flex justify-between max-w-[80vw] mx-auto items-center h-16 text-white">
          <Link className="w-1/4 text-2xl" to={"/"}>
            DigitalPeak
          </Link>
          <div className="flex w-[40vw] justify-around items-center text-[#b4b4b4]">
            <Link
              to={"/doc"}
              className={`relative hover:text-white ${
                location.pathname === "/doc"
                  ? "after:content-['•'] after:text-[#e63a46] after:absolute after:bottom-[-15px] after:left-1/2 after:transform after:-translate-x-1/2 text-white"
                  : ""
              }`}
            >
              Documents
            </Link>
            <Link
              to={"/user"}
              className={`relative hover:text-white ${
                location.pathname === "/user"
                  ? "after:content-['•'] after:text-[#e63a46] after:absolute after:bottom-[-15px] after:left-1/2 after:transform after:-translate-x-1/2 text-white"
                  : ""
              }`}
            >
              User
            </Link>
            <Link
              to={"/history"}
              className={`relative hover:text-white ${
                location.pathname === "/history"
                  ? "after:content-['•'] after:text-[#e63a46] after:absolute after:bottom-[-15px] after:left-1/2 after:transform after:-translate-x-1/2 text-white"
                  : ""
              }`}
            >
              History
            </Link>
          </div>
          <div className="text-end w-1/4">
            {user && (
              <button
                className="text-white bg-primary rounded-md px-6 py-1"
                onClick={logout}
              >
                Logout
              </button>
            )}
            {!user && (
              <Link
                to={"/login"}
                className="bg-white text-primary rounded-md px-6 py-1 ml-4 "
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
