import { Row, Col, Card, ListGroup } from 'react-bootstrap'
import formatearPrecio from '../utils/formato.js'
import { resumenVentas, productosMasVendidos } from '../utils/reportes.js'

// Reportes del panel de admin, calculados a partir de las órdenes
function PanelReportes({ ordenes }) {
  const resumen = resumenVentas(ordenes)
  const masVendidos = productosMasVendidos(ordenes)

  const tarjetas = [
    ['Órdenes pagadas', resumen.cantidadOrdenes],
    ['Pagos rechazados', resumen.rechazadas],
    ['Ventas totales', formatearPrecio(resumen.totalVentas)],
    ['Ticket promedio', formatearPrecio(resumen.ticketPromedio)],
  ]

  return (
    <>
      <Row xs={1} sm={2} lg={4} className="g-3 mb-4">
        {tarjetas.map(([titulo, valor]) => (
          <Col key={titulo}>
            <Card className="text-center shadow-sm border-0 p-3">
              <small className="text-secondary">{titulo}</small>
              <strong className="fs-4">{valor}</strong>
            </Card>
          </Col>
        ))}
      </Row>
      <h2 className="fs-5">Productos más vendidos</h2>
      {masVendidos.length === 0 ? (
        <p className="text-secondary">Todavía no hay ventas para analizar.</p>
      ) : (
        <ListGroup>
          {masVendidos.map((p) => (
            <ListGroup.Item key={p.nombre} className="d-flex justify-content-between">
              <span>{p.nombre}</span>
              <strong>{p.unidades} u.</strong>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  )
}

export default PanelReportes
