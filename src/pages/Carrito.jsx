import { Link } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'
import TablaCarrito from '../components/TablaCarrito.jsx'
import { calcularTotales } from '../utils/descuentos.js'
import formatearPrecio from '../utils/formato.js'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useSesion } from '../context/SesionContext.jsx'

// El carrito y sus acciones vienen del contexto. Si hay sesión iniciada se aplican los descuentos del usuario.
function Carrito() {
  const { carrito, cambiarCantidad, quitar, vaciar } = useCarrito()
  const { usuario } = useSesion()
  if (carrito.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h1>Mi Carrito de Compras</h1>
        <p>Tu carrito está vacío por el momento.</p>
        <Button as={Link} to="/productos" variant="chocolate">Ver productos</Button>
      </Container>
    )
  }

  const totales = calcularTotales(carrito, usuario)

  return (
    <Container className="py-4">
      <h1 className="mb-4">Mi Carrito de Compras</h1>
      <TablaCarrito carrito={carrito} alCambiarCantidad={cambiarCantidad} alQuitar={quitar} />
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-3">
        <div className="text-end">
          {totales.descuento > 0 && (
            <>
              <div>Subtotal: {formatearPrecio(totales.subtotal)}</div>
              <div className="text-success">{totales.motivo}: -{formatearPrecio(totales.descuento)}</div>
            </>
          )}
          <span className="fs-4 fw-bold">Total: {formatearPrecio(totales.total)}</span>
        </div>
        <Button variant="secondary" onClick={vaciar}>Vaciar carrito</Button>
        <Button as={Link} to="/checkout" variant="success">Comprar ahora</Button>
      </div>
    </Container>
  )
}

export default Carrito
