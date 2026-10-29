import { Container, Alert } from 'react-bootstrap'
import Catalogo from '../components/Catalogo.jsx'
import { listarOfertas } from '../data/productos.js'

// Vista que muestra todos los productos que están en oferta
function Ofertas({ alAgregar }) {
  const ofertas = listarOfertas()

  return (
    <Container className="py-4">
      <h1 className="text-center mb-2">Ofertas</h1>
      <p className="text-center text-secondary mb-4">
        {ofertas.length > 0 ? `${ofertas.length} productos con precio especial` : 'Por ahora no hay productos en oferta.'}
      </p>
      {ofertas.length > 0 ? (
        <Catalogo productos={ofertas} alAgregar={alAgregar} />
      ) : (
        <Alert variant="info" className="text-center">Vuelve pronto: publicaremos nuevas ofertas.</Alert>
      )}
    </Container>
  )
}

export default Ofertas
