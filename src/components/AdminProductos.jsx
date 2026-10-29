import { useState } from 'react'
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap'
import CampoTexto from './CampoTexto.jsx'
import useFormulario from '../hooks/useFormulario.js'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  reiniciarProductos,
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

// CRUD de productos: formulario (crear/editar) + tabla (listar/eliminar)
function AdminProductos({ alCambiar }) {
  const [productos, setProductos] = useState(listarProductos)
  const [editandoId, setEditandoId] = useState(null)
  const form = useFormulario(VACIO, VALIDADORES)

  // alCambiar es opcional: avisa al padre (Admin) para que actualice otras pestañas
  const refrescar = () => {
    setProductos(listarProductos())
    alCambiar?.()
  }

  function guardar(evento) {
    evento.preventDefault()
    if (!form.validarTodo()) return
    const datos = {
      ...form.valores,
      precio: Number(form.valores.precio),
      precioOferta: Number(form.valores.precioOferta) || 0,
      stock: Number(form.valores.stock),
    }
    if (editandoId) actualizarProducto(editandoId, datos)
    else crearProducto(datos)
    cancelar()
    refrescar()
  }

  function editar(producto) {
    setEditandoId(producto.id)
    form.reiniciar({
      ...VACIO,
      ...producto,
      precio: String(producto.precio),
      precioOferta: producto.precioOferta ? String(producto.precioOferta) : '',
      stock: String(producto.stock),
    })
  }

  function cancelar() {
    setEditandoId(null)
    form.reiniciar()
  }

  function eliminar(id) {
    eliminarProducto(id)
    if (id === editandoId) cancelar()
    refrescar()
  }

  return (
    <Row className="g-4">
      <Col lg={4}>
        <Card className="shadow-sm border-0 p-3">
          <h2 className="fs-4">{editandoId ? `Editar producto #${editandoId}` : 'Nuevo producto'}</h2>
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

      <Col lg={8}>
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
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => editar(p)}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => eliminar(p.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="outline-secondary" size="sm" onClick={() => { reiniciarProductos(); cancelar(); refrescar() }}>
          Restaurar productos originales
        </Button>
      </Col>
    </Row>
  )
}

export default AdminProductos
