import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap'

// Props:
// - cantidadCarrito: número de unidades en el carrito
// - usuario: { nombre, correo, rol } del usuario con sesión iniciada (o null)
// - alCerrarSesion: función que se llama al cerrar sesión
function Encabezado({ cantidadCarrito, usuario, alCerrarSesion }) {
  return (
    <Navbar expand="lg" className="barra-rosa shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand href="#/" className="d-flex align-items-center gap-2 fw-bold">
          <img src="/img/logo.png" alt="Logo Pastelería Mil Sabores" width="50" />
          Pastelería Mil Sabores
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link href="#/">Home</Nav.Link>
            <Nav.Link href="#/productos">Productos</Nav.Link>
            <Nav.Link href="#/categorias">Categorías</Nav.Link>
            <Nav.Link href="#/ofertas">Ofertas</Nav.Link>
            <Nav.Link href="#/nosotros">Nosotros</Nav.Link>
            <Nav.Link href="#/blogs">Blogs</Nav.Link>
            <Nav.Link href="#/contacto">Contacto</Nav.Link>
            {/* El enlace al panel solo se muestra a quien es administrador */}
            {usuario?.rol === 'Administrador' && <Nav.Link href="#/admin">Admin</Nav.Link>}
          </Nav>
          <div className="d-flex flex-wrap align-items-center gap-2 py-2 py-lg-0">
            {usuario ? (
              <>
                <a href="#/perfil" className="small text-reset">Hola, {usuario.nombre}</a>
                <Button variant="outline-dark" size="sm" onClick={alCerrarSesion}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button href="#/login" variant="outline-dark" size="sm">Iniciar sesión</Button>
                <Button href="#/registro" variant="dark" size="sm">Registrarse</Button>
              </>
            )}
            <Button href="#/carrito" variant="chocolate" size="sm">
              🛒 Carrito <Badge bg="light" text="dark">{cantidadCarrito}</Badge>
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Encabezado
