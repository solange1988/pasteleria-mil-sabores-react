import { useState } from 'react'
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import CamposRegion from '../components/CamposRegion.jsx'
import TablaCarrito from '../components/TablaCarrito.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { obtenerProducto, actualizarProducto } from '../data/productos.js'
import { crearOrden } from '../data/ordenes.js'
import { calcularTotales } from '../utils/descuentos.js'
import formatearPrecio from '../utils/formato.js'
import { validarNombre, validarCorreo, validarRequerido } from '../utils/validaciones.js'

const VALIDADORES = {
  nombre: validarNombre,
  apellidos: validarNombre,
  correo: validarCorreo,
  calle: validarRequerido,
  region: validarRequerido,
  comuna: validarRequerido,
}

// Simulación del pago: falla si algún producto no tiene stock suficiente
function productosSinStock(carrito) {
  return carrito.filter((linea) => (obtenerProducto(linea.id)?.stock ?? 0) < linea.cantidad)
}

// Resumen de montos: subtotal, descuento (si corresponde) y total
function ResumenTotales({ totales, etiquetaTotal }) {
  return (
    <div className="text-end mb-3">
      {totales.descuento > 0 && (
        <>
          <div>Subtotal: {formatearPrecio(totales.subtotal)}</div>
          <div className="text-success">{totales.motivo}: -{formatearPrecio(totales.descuento)}</div>
        </>
      )}
      <p className="fs-4 fw-bold mb-0">{etiquetaTotal}: {formatearPrecio(totales.total)}</p>
    </div>
  )
}

// Props: carrito, usuario (objeto con sesión iniciada o null) y alConfirmar (vacía el carrito)
function Checkout({ carrito, usuario, alConfirmar }) {
  // Si el usuario inició sesión, sus datos se completan automáticamente
  const [primerNombre = '', ...resto] = (usuario?.nombre ?? '').split(' ')
  const form = useFormulario(
    {
      nombre: primerNombre, apellidos: resto.join(' '), correo: usuario?.correo ?? '',
      calle: '', departamento: '', region: usuario?.region ?? '', comuna: usuario?.comuna ?? '', indicaciones: '',
    },
    VALIDADORES,
  )
  // resultado: null (llenando el formulario) | { exito, orden, lineas, faltantes }
  const [resultado, setResultado] = useState(null)
  const totales = calcularTotales(carrito, usuario)

  function pagar(evento) {
    evento.preventDefault()
    if (!form.validarTodo()) return

    const { valores } = form
    const datosOrden = {
      correo: valores.correo.trim(),
      cliente: `${valores.nombre} ${valores.apellidos}`.trim(),
      direccion: `${valores.calle} ${valores.departamento}, ${valores.comuna}, ${valores.region}`,
      lineas: carrito,
      totales,
    }

    const faltantes = productosSinStock(carrito)
    if (faltantes.length > 0) {
      // pago rechazado: se guarda la orden como rechazada y NO se descuenta stock
      const orden = crearOrden({ ...datosOrden, estado: 'Pago rechazado' })
      setResultado({ exito: false, orden, lineas: carrito, faltantes })
      return
    }
    // pago correcto: descuenta stock, guarda la orden y vacía el carrito
    carrito.forEach((linea) => {
      actualizarProducto(linea.id, { stock: obtenerProducto(linea.id).stock - linea.cantidad })
    })
    const orden = crearOrden(datosOrden)
    setResultado({ exito: true, orden, lineas: carrito, faltantes: [] })
    alConfirmar()
  }

  if (resultado) {
    const { orden } = resultado
    return (
      <Container className="py-5" style={{ maxWidth: 820 }}>
        <Card className="shadow-sm border-0 p-4">
          {resultado.exito ? (
            <h1 className="fs-3 text-success">✔ Se ha realizado la compra. Nro #{orden.numero}</h1>
          ) : (
            <>
              <h1 className="fs-3 text-danger">✖ No se pudo realizar el pago. Nro #{orden.numero}</h1>
              <Alert variant="danger">
                Stock insuficiente para: {resultado.faltantes.map((l) => l.nombre).join(', ')}
              </Alert>
              <Button variant="success" className="mb-3" onClick={() => setResultado(null)}>
                Volver a realizar el pago
              </Button>
            </>
          )}
          {orden.regalo && resultado.exito && <Alert variant="info">🎁 ¡Feliz cumpleaños! Incluye: {orden.regalo}.</Alert>}
          <p className="mb-1"><strong>Cliente:</strong> {orden.cliente} ({orden.correo})</p>
          <p><strong>Dirección:</strong> {orden.direccion}</p>
          <TablaCarrito carrito={resultado.lineas} />
          <ResumenTotales totales={orden} etiquetaTotal={resultado.exito ? 'Total pagado' : 'Total a pagar'} />
          {resultado.exito && <Button href="#/productos" variant="chocolate">Seguir comprando</Button>}
        </Card>
      </Container>
    )
  }

  if (carrito.length === 0) {
    return (
      <Container className="py-5 text-center">
        <p>No hay productos para pagar.</p>
        <Button href="#/productos" variant="chocolate">Ver productos</Button>
      </Container>
    )
  }

  return (
    <Container className="py-5" style={{ maxWidth: 820 }}>
      <Card className="shadow-sm border-0 p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h1 className="fs-3 mb-0">Carrito de compra</h1>
          <span className="badge bg-primary fs-6">Total a pagar: {formatearPrecio(totales.total)}</span>
        </div>
        <TablaCarrito carrito={carrito} />
        <ResumenTotales totales={totales} etiquetaTotal="Total" />

        <Form noValidate onSubmit={pagar}>
          <h2 className="fs-4 mt-3">Información del cliente</h2>
          <Row>
            <Col sm={6}><CampoTexto etiqueta="Nombre" name="nombre" form={form} autoComplete="given-name" /></Col>
            <Col sm={6}><CampoTexto etiqueta="Apellidos" name="apellidos" form={form} autoComplete="family-name" /></Col>
          </Row>
          <CampoTexto etiqueta="Correo" name="correo" type="email" form={form} autoComplete="email" />

          <h2 className="fs-4 mt-3">Dirección de entrega</h2>
          <Row>
            <Col sm={8}><CampoTexto etiqueta="Calle" name="calle" form={form} autoComplete="street-address" /></Col>
            <Col sm={4}><CampoTexto etiqueta="Departamento (opcional)" name="departamento" form={form} placeholder="Ej: 603" /></Col>
          </Row>
          <CamposRegion form={form} />
          <CampoTexto
            etiqueta="Indicaciones para la entrega (opcional)"
            name="indicaciones"
            as="textarea"
            rows={3}
            form={form}
            placeholder="Ej: Entre calles, color del edificio, no tiene timbre."
          />
          <div className="text-end">
            <Button type="submit" variant="success" size="lg">Pagar ahora {formatearPrecio(totales.total)}</Button>
          </div>
        </Form>
      </Card>
    </Container>
  )
}

export default Checkout
