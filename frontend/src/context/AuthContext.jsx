import { createContext, useState } from "react"
import { loginRequest } from "../services/authService"

export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))

  const login = async (credentials) => {
    const data = await loginRequest(credentials)

    setUser(data.user)
    setToken(data.token)

    localStorage.setItem("token", data.token)

    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}