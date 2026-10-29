import { Row, Col, Alert } from 'react-bootstrap'
import TarjetaProducto from './TarjetaProducto.jsx'

// Grilla responsiva: 1 columna en celular, 2 en tablet, 3-4 en escritorio
function Catalogo({ productos, alAgregar }) {
  if (productos.length === 0) {
    return <Alert variant="warning">No se encontraron productos.</Alert>
  }

  return (
    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
      {productos.map((producto) => (
        <Col key={producto.id}>
          <TarjetaProducto producto={producto} alAgregar={alAgregar} />
        </Col>
      ))}
    </Row>
  )
}

export default Catalogo
