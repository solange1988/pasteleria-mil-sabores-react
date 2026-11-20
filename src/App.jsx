// Rutas de la aplicación con React Router.
//  - main.jsx envuelve la aplicación en <BrowserRouter>, así las direcciones son limpias (/productos).
//  - Los contextos de sesión y carrito envuelven todas las rutas: cualquier página los puede leer.
//  - <Plantilla> dibuja lo que se repite (encabezado y pie) y <Outlet> la página de la ruta actual.
//  - /perfil y /admin están protegidas con <RutaProtegida> (requieren sesión y, el panel, un permiso).
import { Routes, Route, Outlet, Link, useLocation } from 'react-router-dom'
import { Alert, Container } from 'react-bootstrap'
import { SesionProvider, useSesion } from './context/SesionContext.jsx'
import { CarritoProvider, useCarrito } from './context/CarritoContext.jsx'
import Encabezado from './components/Encabezado.jsx'
import PiePagina from './components/PiePagina.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import DetalleProducto from './pages/DetalleProducto.jsx'
import Categorias from './pages/Categorias.jsx'
import Ofertas from './pages/Ofertas.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Perfil from './pages/Perfil.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Blogs from './pages/Blogs.jsx'
import BlogDetalle from './pages/BlogDetalle.jsx'
import Contacto from './pages/Contacto.jsx'
import Admin from './pages/Admin.jsx'

// Estructura común de todas las páginas
function Plantilla() {
  const { usuario, aviso, cerrar } = useSesion()
  const { cantidad } = useCarrito()
  const { pathname } = useLocation()
  return (
    <>
      <Encabezado cantidadCarrito={cantidad} usuario={usuario} alCerrarSesion={cerrar} />
      {aviso && pathname !== '/login' && ( // en /login el aviso lo muestra el formulario
        <Container className="pt-3"><Alert variant="warning" className="mb-0">{aviso}</Alert></Container>
      )}
      <main><Outlet /></main>
      <PiePagina />
    </>
  )
}

function NoEncontrada() {
  return <p className="text-center py-5">Página no encontrada. <Link to="/">Volver al inicio</Link></p>
}

function App() {
  return (
    <SesionProvider>
      <CarritoProvider>
        <Routes>
          <Route element={<Plantilla />}>
            <Route index element={<Inicio />} />
            <Route path="productos" element={<Productos />} />
            <Route path="producto/:id" element={<DetalleProducto />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="categorias/:slug" element={<Categorias />} />
            <Route path="ofertas" element={<Ofertas />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="registro" element={<Registro />} />
            <Route path="login" element={<Login />} />
            <Route path="nosotros" element={<Nosotros />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blog/:id" element={<BlogDetalle />} />
            <Route path="contacto" element={<Contacto />} />
            <Route
              path="perfil"
              element={
                <RutaProtegida mensajeSinSesion="Debes iniciar sesión para ver tu perfil.">
                  <Perfil />
                </RutaProtegida>
              }
            />
            <Route
              path="admin"
              element={
                <RutaProtegida
                  permiso="panel"
                  mensajeSinSesion="Debes iniciar sesión como administrador o vendedor para entrar a este panel."
                >
                  <Admin />
                </RutaProtegida>
              }
            />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </CarritoProvider>
    </SesionProvider>
  )
}

export default App
