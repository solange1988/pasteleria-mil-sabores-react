import { Container } from 'react-bootstrap'

function PiePagina() {
  return (
    <footer className="pie-chocolate text-white text-center py-4 mt-5">
      <Container>
        <p className="mb-1">Pastelería Mil Sabores &copy; 2026 - Equipo [nombre del equipo]</p>
        <p className="mb-0">
          <a href="#/nosotros" className="text-white">Nosotros</a> |{' '}
          <a href="#/contacto" className="text-white">Contacto</a>
        </p>
      </Container>
    </footer>
  )
}

export default PiePagina
