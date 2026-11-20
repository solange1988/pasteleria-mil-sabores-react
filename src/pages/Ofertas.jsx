import { Container, Alert } from 'react-bootstrap'
import Catalogo from '../components/Catalogo.jsx'
import Cargando from '../components/Cargando.jsx'
import useCarga from '../hooks/useCarga.js'
import { listarOfertas } from '../data/productos.js'
import { useCarrito } from '../context/CarritoContext.jsx'

// Vista que muestra todos los productos que están en oferta
// GET /api/v1/productos/ofertas
function Ofertas() {
  const { agregar } = useCarrito()
  const carga = useCarga(listarOfertas, [])

  return (
    <Container className="py-4">
      <h1 className="text-center mb-2">Ofertas</h1>
      <Cargando carga={carga}>{(ofertas) => <ListaOfertas ofertas={ofertas} alAgregar={agregar} />}</Cargando>
    </Container>
  )
}

function ListaOfertas({ ofertas, alAgregar }) {
  return (
    <>
      <p className="text-center text-secondary mb-4">
        {ofertas.length > 0 ? `${ofertas.length} productos con precio especial` : 'Por ahora no hay productos en oferta.'}
      </p>
      {ofertas.length > 0 ? (
        <Catalogo productos={ofertas} alAgregar={alAgregar} />
      ) : (
        <Alert variant="info" className="text-center">Vuelve pronto: publicaremos nuevas ofertas.</Alert>
      )}
    </>
  )
}

export default Ofertas
