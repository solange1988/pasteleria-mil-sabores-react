import { Container, Row, Col, Button, Badge, Alert } from 'react-bootstrap'
import Cargando from '../components/Cargando.jsx'
import useCarga from '../hooks/useCarga.js'
import { obtenerProducto } from '../data/productos.js'
import formatearPrecio, { porcentajeOferta } from '../utils/formato.js'
import { precioVigente } from '../utils/carrito.js'

// GET /api/v1/productos/{id}. Si el backend responde 404, el producto no existe.
function DetalleProducto({ id, alAgregar }) {
  const carga = useCarga(() => obtenerProducto(id), [id])

  if (carga.estado === 404) {
    return (
      <Container className="py-5">
        <Alert variant="warning">El producto no existe.</Alert>
        <a href="#/productos">&larr; Volver a productos</a>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <a href="#/productos">&larr; Volver a productos</a>
      <Cargando carga={carga}>{(producto) => <Ficha producto={producto} alAgregar={alAgregar} />}</Cargando>
    </Container>
  )
}

function Ficha({ producto, alAgregar }) {
  const agotado = producto.stock === 0
  const oferta = porcentajeOferta(producto.precio, producto.precioOferta)

  return (
    <>
      <Row className="g-4 mt-1 align-items-center">
        <Col md={6}>
          <img src={producto.imagen} alt={producto.nombre} className="img-portada" />
        </Col>
        <Col md={6}>
          <Badge bg="secondary" className="mb-2">{producto.categoria}</Badge>
          <h1>{producto.nombre}</h1>
          <p className="lh-lg">{producto.descripcion}</p>
          <p className="fs-3 fw-bold">
            {oferta > 0 && <del className="fs-5 fw-normal text-secondary me-2">{formatearPrecio(producto.precio)}</del>}
            {formatearPrecio(precioVigente(producto))}
            {oferta > 0 && <Badge bg="danger" className="ms-2 fs-6">-{oferta}%</Badge>}
          </p>
          <p className={agotado ? 'text-danger' : 'text-success'}>
            {agotado ? 'Sin stock' : `Stock disponible: ${producto.stock}`}
          </p>
          <Button variant="chocolate" size="lg" disabled={agotado} onClick={() => alAgregar(producto)}>
            Añadir al carrito
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default DetalleProducto
