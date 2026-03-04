import { Link } from "react-router-dom"

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="bg-black text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Manchester Clothing</h1>

        <nav className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/catalog">Catalog</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4">
        © 2026 Manchester Clothing
      </footer>

    </div>
  )
}

export default PublicLayout