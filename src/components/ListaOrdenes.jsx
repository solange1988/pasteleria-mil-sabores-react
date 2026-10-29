import { Table, Alert, Badge, Form } from 'react-bootstrap'
import formatearPrecio, { formatearFecha } from '../utils/formato.js'
import { ESTADOS } from '../data/ordenes.js'

// Tabla de órdenes de compra. Se usa en el panel de admin (con alCambiarEstado, para poder
// cambiar el estado) y en el perfil del cliente (solo lectura, como historial de compras).
function ListaOrdenes({ ordenes, alCambiarEstado }) {
  if (ordenes.length === 0) {
    return <Alert variant="info">No hay órdenes registradas.</Alert>
  }

  return (
    <Table responsive hover className="align-middle bg-white">
      <thead>
        <tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th></tr>
      </thead>
      <tbody>
        {ordenes.map((o) => (
          <tr key={o.numero}>
            <td>#{o.numero}</td>
            <td>{formatearFecha(o.fecha)}</td>
            <td>{o.cliente}</td>
            <td>
              {formatearPrecio(o.total)}
              {o.descuento > 0 && <small className="text-success d-block">Incluye {formatearPrecio(o.descuento)} de descuento</small>}
              {o.regalo && <small className="text-primary d-block">🎁 {o.regalo}</small>}
            </td>
            <td>
              {alCambiarEstado ? (
                <Form.Select
                  size="sm"
                  aria-label={`Estado de la orden ${o.numero}`}
                  value={o.estado}
                  onChange={(e) => alCambiarEstado(o.numero, e.target.value)}
                >
                  {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </Form.Select>
              ) : (
                <Badge bg={o.estado === 'Pago rechazado' ? 'danger' : 'success'}>{o.estado}</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default ListaOrdenes
