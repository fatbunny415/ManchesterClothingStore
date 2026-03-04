import { Routes, Route } from "react-router-dom"
import PublicLayout from "../components/layout/PublicLayout"

import Home from "../pages/public/Home"
import Catalog from "../pages/public/Catalog"
import Login from "../pages/public/Login"

function AppRouter() {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      <Route
        path="/catalog"
        element={
          <PublicLayout>
            <Catalog />
          </PublicLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

    </Routes>
  )
}

export default AppRouter