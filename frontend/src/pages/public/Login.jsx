import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

function Login() {

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(form)

      // 🔥 Redirección según rol
      if (data.user.role === "Admin") {
        navigate("/admin/dashboard")
      } else if (data.user.role === "Seller") {
        navigate("/seller/dashboard")
      } else {
        navigate("/client")
      }

    } catch (err) {
        console.log("ERROR COMPLETO:", err)
        console.log("ERROR RESPONSE:", err.response)
        console.log("ERROR DATA:", err.response?.data)
        setError("Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8">

      <h2 className="text-2xl font-bold text-center mb-6">
        Iniciar Sesión
      </h2>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

      </form>


    </div>
  )
}

export default Login