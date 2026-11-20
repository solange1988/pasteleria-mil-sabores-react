import { Link, NavLink } from 'react-router-dom'
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap'
import { puede } from '../auth/permisos.js'

// Props:
// - cantidadCarrito: número de unidades en el carrito
// - usuario: { nombre, correo, rol } del usuario con sesión iniciada (o null)
// - alCerrarSesion: función que se llama al cerrar sesión
function Encabezado({ cantidadCarrito, usuario, alCerrarSesion }) {
  return (
    <Navbar expand="lg" className="barra-rosa shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold">
          <img src="/img/logo.png" alt="Logo Pastelería Mil Sabores" width="50" />
          Pastelería Mil Sabores
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
            <Nav.Link as={NavLink} to="/categorias">Categorías</Nav.Link>
            <Nav.Link as={NavLink} to="/ofertas">Ofertas</Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros">Nosotros</Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">Blogs</Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>
            {/* El enlace al panel solo aparece para los roles que pueden entrar (Administrador y Vendedor) */}
            {puede(usuario, 'panel') && (
              <Nav.Link as={NavLink} to="/admin">{usuario.rol === 'Vendedor' ? 'Panel vendedor' : 'Admin'}</Nav.Link>
            )}
          </Nav>
          <div className="d-flex flex-wrap align-items-center gap-2 py-2 py-lg-0">
            {usuario ? (
              <>
                <Link to="/perfil" className="small text-reset">Hola, {usuario.nombre}</Link>
                <Badge bg="secondary">{usuario.rol}</Badge>
                <Button variant="outline-dark" size="sm" onClick={alCerrarSesion}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-dark" size="sm">Iniciar sesión</Button>
                <Button as={Link} to="/registro" variant="dark" size="sm">Registrarse</Button>
              </>
            )}
            <Button as={Link} to="/carrito" variant="chocolate" size="sm">
              🛒 Carrito <Badge bg="light" text="dark">{cantidadCarrito}</Badge>
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Encabezado
