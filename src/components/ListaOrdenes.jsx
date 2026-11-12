import { useState } from 'react'
import { Table, Alert, Badge, Form, Button, Modal } from 'react-bootstrap'
import formatearPrecio, { formatearFecha } from '../utils/formato.js'
import { ESTADOS, RECHAZADA } from '../data/ordenes.js'

// Tabla de órdenes de compra (boletas).
//  - alCambiarEstado (opcional): si viene, el estado se puede cambiar (Administrador)
//  - conDetalle (opcional): agrega el botón "Detalle" con las líneas de la boleta (Administrador y Vendedor)
// Sin esas props es de solo lectura (historial de compras en el perfil).
function ListaOrdenes({ ordenes, alCambiarEstado, conDetalle = false }) {
  const [detalle, setDetalle] = useState(null)

  if (ordenes.length === 0) {
    return <Alert variant="info">No hay órdenes registradas.</Alert>
  }

  return (
    <>
      <Table responsive hover className="align-middle bg-white">
        <thead>
          <tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th>{conDetalle && <th>Detalle</th>}</tr>
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
                  <Badge bg={o.estado === RECHAZADA ? 'danger' : 'success'}>{o.estado}</Badge>
                )}
              </td>
              {conDetalle && (
                <td>
                  <Button size="sm" variant="outline-primary" onClick={() => setDetalle(o)} aria-label={`Ver detalle de la orden ${o.numero}`}>
                    Ver
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={Boolean(detalle)} onHide={() => setDetalle(null)} size="lg">
        {detalle && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Boleta #{detalle.numero}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-1"><strong>Fecha:</strong> {formatearFecha(detalle.fecha)}</p>
              <p className="mb-1"><strong>Cliente:</strong> {detalle.cliente} ({detalle.correo})</p>
              <p className="mb-1"><strong>Dirección:</strong> {detalle.direccion}</p>
              <p><strong>Estado:</strong> {detalle.estado}</p>
              <Table size="sm" bordered>
                <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detalle.lineas.map((l) => (
                    <tr key={l.id}>
                      <td>{l.nombre}</td>
                      <td>{formatearPrecio(l.precio)}</td>
                      <td>{l.cantidad}</td>
                      <td>{formatearPrecio(l.precio * l.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-end">
                <div>Subtotal: {formatearPrecio(detalle.subtotal)}</div>
                {detalle.descuento > 0 && (
                  <div className="text-success">{detalle.motivo}: -{formatearPrecio(detalle.descuento)}</div>
                )}
                <strong className="fs-5">Total: {formatearPrecio(detalle.total)}</strong>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </>
  )
}

export default ListaOrdenes
