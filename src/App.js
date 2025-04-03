import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig'; // Ajusta la ruta

// Componentes Principales
import Login from './components/Login';
import MainLayout from './components/MainLayout';

// Componentes de Página
import Dashboard from './pages/Dashboard';
import GestionInsumos from './pages/GestionInsumos';
import GestionRecetas from './pages/GestionRecetas';
import Configuracion from './pages/Configuracion';

import './App.css';

// Componente para Rutas Protegidas
function ProtectedRoute({ user, children }) {
  if (!user) {
    // Si no hay usuario, redirige a /login
    return <Navigate to="/login" replace />;
  }
  // Si hay usuario, renderiza el componente hijo (MainLayout)
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      console.log("Estado de Auth cambiado, usuario:", currentUser ? currentUser.email : 'Ninguno');
    });
    return () => unsubscribe();
  }, []); // El array vacío [] asegura que useEffect se ejecute solo una vez al montar

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  return (
    <Router> {/* Envuelve todo en el Router */}
      <Routes> {/* Define las rutas */}
        {/* Ruta de Login: Solo accesible si NO estás logueado */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />

        {/* Rutas Protegidas (/*): Todo lo demás requiere estar logueado */}
        <Route
          path="/*" // Cualquier otra ruta
          element={
            <ProtectedRoute user={user}>
              <MainLayout /> {/* MainLayout contiene el Outlet para rutas anidadas */}
            </ProtectedRoute>
          }
        >
          {/* Rutas Anidadas dentro de MainLayout */}
          <Route index element={<Dashboard />} /> {/* Raíz del layout */}
          <Route path="insumos" element={<GestionInsumos />} />
          <Route path="recetas" element={<GestionRecetas />} />
          <Route path="configuracion" element={<Configuracion />} />
          {/* <Route path="*" element={<div>404 - No Encontrado Dentro de la App</div>} /> */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;