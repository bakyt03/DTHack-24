import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="w-screen h-screen absolute bg-bg -z-50">
            <div className="flex flex-col items-center justify-center h-full">
                <Link to={'/doc'} className="btn text-5xl text-white">Continue to app</Link>
            </div>
        </div>
    )
}