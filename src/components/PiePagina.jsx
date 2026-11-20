import { Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'

function PiePagina() {
  return (
    <footer className="pie-chocolate text-white text-center py-4 mt-5">
      <Container>
                <p className="mb-1">Pastelería Mil Sabores &copy; 2026 - Solange Valladares · DSY1104</p>
        <p className="mb-0">
          <Link to="/nosotros" className="text-white">Nosotros</Link> |{' '}
          <Link to="/contacto" className="text-white">Contacto</Link>
        </p>
      </Container>
    </footer>
  )
}

export default PiePagina
