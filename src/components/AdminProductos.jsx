import { useState } from 'react'
import { Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap'
import CampoTexto from './CampoTexto.jsx'
import Cargando from './Cargando.jsx'
import useFormulario from '../hooks/useFormulario.js'
import useCarga from '../hooks/useCarga.js'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  STOCK_CRITICO,
} from '../data/productos.js'
import formatearPrecio from '../utils/formato.js'
import { validarRequerido, validarNumeroPositivo, validarPrecioOferta } from '../utils/validaciones.js'

const VACIO = { nombre: '', categoria: '', precio: '', precioOferta: '', stock: '', imagen: '/img/logo.png', descripcion: '' }
const VALIDADORES = {
  nombre: validarRequerido,
  categoria: validarRequerido,
  precio: validarNumeroPositivo,
  precioOferta: (valor, todos) => validarPrecioOferta(valor, todos.precio),
  stock: validarNumeroPositivo,
  imagen: validarRequerido,
}

// Productos del panel.
//  - editable = true (Administrador): formulario para crear/editar + botones Editar y Eliminar (CRUD completo)
//  - editable = false (Vendedor): solo la tabla, con enlace al detalle de cada producto
function AdminProductos({ editable = true }) {
  const carga = useCarga(listarProductos, [])
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const form = useFormulario(VACIO, VALIDADORES)

  // POST /api/v1/productos (crear) o PUT /api/v1/productos/{id} (editar)
  async function guardar(evento) {
    evento.preventDefault()
    setError('')
    if (!form.validarTodo()) return
    const datos = {
      ...form.valores,
      precio: Number(form.valores.precio),
      precioOferta: Number(form.valores.precioOferta) || 0,
      stock: Number(form.valores.stock),
    }
    try {
      if (editandoId) await actualizarProducto(editandoId, datos)
      else await crearProducto(datos)
      cancelar()
      carga.recargar()
    } catch (e) {
      setError(e.message)
    }
  }

  function editar(producto) {
    setError('')
    setEditandoId(producto.id)
    form.reiniciar({
      ...VACIO,
      ...producto,
      precio: String(producto.precio),
      precioOferta: producto.precioOferta ? String(producto.precioOferta) : '',
      stock: String(producto.stock),
      descripcion: producto.descripcion ?? '',
    })
  }

  function cancelar() {
    setEditandoId(null)
    form.reiniciar()
  }

  // DELETE /api/v1/productos/{id}. El backend no deja eliminar un producto que ya se vendió.
  async function eliminar(id) {
    setError('')
    try {
      await eliminarProducto(id)
      if (id === editandoId) cancelar()
      carga.recargar()
    } catch (e) {
      setError(e.message)
    }
  }

  const tabla = (
    <Cargando carga={carga}>
      {(productos) => (
        <Table responsive hover className="align-middle bg-white">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className={p.stock <= STOCK_CRITICO ? 'table-warning' : ''}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>
                  {p.precioOferta > 0 ? (
                    <><del className="text-secondary me-1">{formatearPrecio(p.precio)}</del>{formatearPrecio(p.precioOferta)}</>
                  ) : (
                    formatearPrecio(p.precio)
                  )}
                </td>
                <td>{p.stock}</td>
                <td className="text-nowrap">
                  {editable ? (
                    <>
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => editar(p)}>Editar</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => eliminar(p.id)}>Eliminar</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline-primary" href={`#/producto/${p.id}`}>Ver detalle</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Cargando>
  )

  if (!editable) return tabla

  return (
    <Row className="g-4">
      <Col lg={4}>
        <Card className="shadow-sm border-0 p-3">
          <h2 className="fs-4">{editandoId ? `Editar producto #${editandoId}` : 'Nuevo producto'}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form noValidate onSubmit={guardar}>
            <CampoTexto etiqueta="Nombre" name="nombre" form={form} />
            <CampoTexto etiqueta="Categoría" name="categoria" form={form} />
            <CampoTexto etiqueta="Precio" name="precio" type="number" min="0" form={form} />
            <CampoTexto etiqueta="Precio de oferta (opcional)" name="precioOferta" type="number" min="0" form={form} />
            <CampoTexto etiqueta="Stock" name="stock" type="number" min="0" form={form} />
            <CampoTexto etiqueta="Imagen (ruta)" name="imagen" form={form} />
            <CampoTexto etiqueta="Descripción" name="descripcion" as="textarea" rows={3} form={form} />
            <div className="d-flex gap-2">
              <Button type="submit" variant="chocolate">{editandoId ? 'Guardar cambios' : 'Crear producto'}</Button>
              {editandoId && <Button variant="secondary" onClick={cancelar}>Cancelar</Button>}
            </div>
          </Form>
        </Card>
      </Col>
      <Col lg={8}>{tabla}</Col>
    </Row>
  )
}

export default AdminProductos
