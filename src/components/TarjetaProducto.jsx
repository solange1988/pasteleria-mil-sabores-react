import { Card, Button, Badge } from 'react-bootstrap'
import formatearPrecio, { porcentajeOferta } from '../utils/formato.js'
import { precioVigente } from '../utils/carrito.js'

// Props:
// - producto: { id, nombre, categoria, precio, precioOferta, stock, imagen }
// - alAgregar: función que se llama con el producto al presionar "Añadir al carrito"
function TarjetaProducto({ producto, alAgregar }) {
  const { id, nombre, categoria, precio, stock, imagen } = producto
  const agotado = stock === 0
  const oferta = porcentajeOferta(precio, producto.precioOferta)

  return (
    <Card className="h-100 shadow-sm border-0 position-relative">
      {oferta > 0 && (
        <Badge bg="danger" className="position-absolute top-0 end-0 m-2 fs-6">-{oferta}%</Badge>
      )}
      <a href={`#/producto/${id}`}>
        <Card.Img variant="top" src={imagen} alt={nombre} className="img-producto" />
      </a>
      <Card.Body className="d-flex flex-column text-center">
        <Badge bg="secondary" className="align-self-center mb-2">{categoria}</Badge>
        <Card.Title as="h3" className="fs-6 fw-bold">
          <a href={`#/producto/${id}`} className="text-reset text-decoration-none">{nombre}</a>
        </Card.Title>
        <Card.Text className="fs-5 mb-1">
          {oferta > 0 && <del className="text-secondary fs-6 me-2">{formatearPrecio(precio)}</del>}
          {formatearPrecio(precioVigente(producto))}
        </Card.Text>
        <Card.Text className={agotado ? 'text-danger small' : 'text-success small'}>
          {agotado ? 'Sin stock' : `Quedan ${stock} unidades`}
        </Card.Text>
        <Button
          variant="chocolate"
          className="mt-auto"
          disabled={agotado}
          onClick={() => alAgregar(producto)}
        >
          Añadir al carrito
        </Button>
      </Card.Body>
    </Card>
  )
}

export default TarjetaProducto
