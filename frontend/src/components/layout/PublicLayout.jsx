import { Link } from "react-router-dom"

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <header className="bg-black text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Manchester Clothing</h1>

        <nav className="space-x-6">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/catalog" className="hover:text-gray-300">Catalog</Link>
          <Link to="/login" className="hover:text-gray-300">Login</Link>
        </nav>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 p-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-200 text-center py-4 text-sm">
        © 2026 Manchester Clothing
      </footer>

    </div>
  )
}

export default PublicLayout