import { useState } from "react"
import { Link } from "react-router-dom"
import { useLogin } from "../hooks/useLogin"

const Login = () => {



    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const { login, error, isLoading } = useLogin()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await login(username, password)
    }

    return (
        <div className=" mt-16  w-screen flex items-center justify-center flex-col">
            <form className="w-[90vw] md:w-[35vw] bg-white  border border-borders p-8 child:my-2 mt-16 flex flex-col justify-end" onSubmit={handleSubmit}>
                <h1 className="font-semibold text-xl">Admin Prihlásenie</h1>
                <input required type="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="E-mail" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Heslo" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <button disabled={isLoading} className="btn ml-auto">Prihlásiť</button>

                {error && <div className="error">{error}</div>}
            </form>
            <p className=" mb-52">Ešte nemáš účet? <Link to={'/signup'} className="text-primary underline">Registruj sa!</Link></p>
        </div>
    );
}

export default Login;