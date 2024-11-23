import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSignup } from "../hooks/useSignup"

const Signup = () => {



    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [repeat, setRepeat] = useState("")
    const [code, setCode] = useState("")

    const [match, setMatch] = useState(true);
    const [nameCon, setNameCon] = useState(true);
    const [passCon, setPassCon] = useState(true)
    const [emailCon, setEmailCon] = useState(true)

    const { signup, error, isLoading } = useSignup()

    const register = async (e) => {
        e.preventDefault()
        if (!checkPasswordMatch) {
            alert("Heslá sa nezhodujú")
            return
        }
        if (password.length < 6) {
            alert("Heslá je kratšie ako 6 znakov")
            return
        }

        await signup(email, password, name, code)
    }

    const checkPasswordMatch = () => {
        setMatch(password !== repeat)
        return password !== repeat;
    }

    useEffect(() => {
        setMatch(password !== repeat)
    }, [password, repeat])

    useEffect(() => {

        setNameCon(!name.includes(" ") && name.length > 0)
    }, [name])

    useEffect(() => {
        setPassCon(password.length < 6 && password.length > 0)
    }, [password])

    useEffect(() => {
        setEmailCon(!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) && email.length > 0);
    }, [email])




    return (
        <div className=" mt-16  w-screen flex items-center justify-center flex-col ">
            <form className="w-[90vw] md:w-[35vw] bg-white  border border-borders p-8 child:my-2 mt-16 flex flex-col justify-end" onSubmit={register}>
                <h1 className="font-semibold text-xl">Admin Registrácia</h1>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Meno a Priezvisko" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Heslo" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <input required type="password" value={repeat} onChange={e => setRepeat(e.target.value)} placeholder="Zopakuj heslo" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <input required type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Registračný kód - Získaš u svojho vedúceho" className="border border-borders text-dark-text placeholder:text-borders px-3 py-2 w-full" />
                <button disabled={isLoading} className="btn ml-auto">Registrovať</button>
                {nameCon && <p className="error">Zadaj meno aj priezvisko</p>}
                {emailCon && <p className="error">Neplatný e-mail</p>}
                {match && <p className="error">Heslá sa nezhodujú!</p>}
                {passCon && <p className="error">Heslo musí mať aspoň 6 znakov!</p>}
                {error && <div className="error">{error}</div>}
            </form>
            <p className=" mb-52">Už máš účet? <Link to={'/login'} className="text-accent underline">Prihlás sa!</Link></p>
        </div>
    );
}

export default Signup;