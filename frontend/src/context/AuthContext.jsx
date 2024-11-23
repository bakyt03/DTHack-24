import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload }
        case 'LOGOUT':
            return { user: null }
        default:
            return state;
    }
}


export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    })

    console.log("AuthContext state: ", state);

    useEffect(() => {



        const fetchAdmin = async () => {
            const res = await fetch(`${process.env.REACT_APP_PATH}/api/admin/` + user.ID, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const json = await res.json()

            if (res.ok) {
                if (json[0].rights !== user.rights) {
                    localStorage.removeItem('user')
                    dispatch({ type: 'LOGOUT' })
                }
            }
        }

        const user = JSON.parse(localStorage.getItem('user'))
        dispatch({ type: 'LOGIN', payload: user })
        if (user) {
            fetchAdmin()
        }


    }, [])

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}