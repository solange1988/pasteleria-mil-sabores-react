import { Link } from 'react-router-dom'
import { Container, Alert, Button, Spinner } from 'react-bootstrap'
import { puede } from '../auth/permisos.js'
import { useSesion } from '../context/SesionContext.jsx'

// Protege una página del frontend:
//  - mientras se verifica la sesión guardada, muestra un spinner (evita "parpadeos" al recargar)
//  - sin sesión: pide iniciar sesión
//  - con sesión pero sin el permiso: avisa que no tiene acceso
//  - con permiso: muestra la página (children)
// El usuario y el estado de verificación se leen del contexto de sesión.
// Props: permiso (opcional: si no se indica, basta con tener sesión), mensajeSinSesion, children
function RutaProtegida({ permiso, mensajeSinSesion, children }) {
  const { usuario, verificando } = useSesion()
  if (verificando) {
    return (
      <Container className="py-5 text-center" role="status">
        <Spinner animation="border" size="sm" className="me-2" />Verificando sesión...
      </Container>
    )
  }
  if (!usuario) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">{mensajeSinSesion ?? 'Debes iniciar sesión para ver esta página.'}</Alert>
        <Button as={Link} to="/login" variant="chocolate">Iniciar sesión</Button>
      </Container>
    )
  }
  if (permiso && !puede(usuario, permiso)) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">No tienes permisos para ver esta página.</Alert>
        <Button as={Link} to="/" variant="chocolate">Volver al inicio</Button>
      </Container>
    )
  }
  return children
}

export default RutaProtegida
