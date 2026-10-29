import { Table, Button } from 'react-bootstrap'
import formatearPrecio from '../utils/formato.js'

// Tabla del carrito. Si no recibe alCambiarCantidad / alQuitar, se muestra solo de lectura
// (así la reutilizamos en el carrito, en el checkout y en la compra exitosa).
function TablaCarrito({ carrito, alCambiarCantidad, alQuitar }) {
  const editable = Boolean(alCambiarCantidad)

  return (
    <Table responsive hover className="align-middle bg-white">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          {editable && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {carrito.map((linea) => (
          <tr key={linea.id}>
            <td><img src={linea.imagen} alt={linea.nombre} className="miniatura" /></td>
            <td>{linea.nombre}</td>
            <td>{formatearPrecio(linea.precio)}</td>
            <td>
              {editable ? (
                <div className="d-flex align-items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    aria-label={`Restar ${linea.nombre}`}
                    onClick={() => alCambiarCantidad(linea.id, linea.cantidad - 1)}
                  >
                    −
                  </Button>
                  <span>{linea.cantidad}</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    aria-label={`Sumar ${linea.nombre}`}
                    onClick={() => alCambiarCantidad(linea.id, linea.cantidad + 1)}
                  >
                    +
                  </Button>
                </div>
              ) : (
                linea.cantidad
              )}
            </td>
            <td>{formatearPrecio(linea.precio * linea.cantidad)}</td>
            {editable && (
              <td>
                <Button size="sm" variant="danger" onClick={() => alQuitar(linea.id)}>
                  Eliminar
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default TablaCarrito
