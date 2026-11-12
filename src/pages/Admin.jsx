import { useState } from 'react'
import { Container, Tabs, Tab, Table, Badge, Alert } from 'react-bootstrap'
import AdminProductos from '../components/AdminProductos.jsx'
import ListaOrdenes from '../components/ListaOrdenes.jsx'
import ListaUsuarios from '../components/ListaUsuarios.jsx'
import FormUsuario from '../components/FormUsuario.jsx'
import PanelReportes from '../components/PanelReportes.jsx'
import Cargando from '../components/Cargando.jsx'
import useCarga from '../hooks/useCarga.js'
import { listarProductosCriticos } from '../data/productos.js'
import { listarOrdenes, cambiarEstadoOrden } from '../data/ordenes.js'
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../data/usuarios.js'
import { puede } from '../auth/permisos.js'

// Panel interno. App ya verificó que el usuario tiene el permiso "panel" (Administrador o Vendedor).
// Cada pestaña aparece solo si el rol tiene el permiso correspondiente (auth/permisos.js):
//  - Administrador: Productos (CRUD), Stock crítico, Órdenes (cambiar estado), Usuarios y Reportes
//  - Vendedor: Productos y Órdenes, solo lectura (lista y detalle)
// Cada pestaña carga sus datos del backend al abrirse (mountOnEnter).
function Admin({ usuario }) {
  const esVendedor = usuario.rol === 'Vendedor'

  const pestanas = [
    puede(usuario, 'productos') && (
      <Tab key="productos" eventKey="productos" title="Productos">
        <AdminProductos editable={puede(usuario, 'productos.editar')} />
      </Tab>
    ),
    puede(usuario, 'stock') && (
      <Tab key="criticos" eventKey="criticos" title="Stock crítico"><StockCritico /></Tab>
    ),
    puede(usuario, 'ordenes') && (
      <Tab key="ordenes" eventKey="ordenes" title="Órdenes">
        <PanelOrdenes editable={puede(usuario, 'ordenes.editar')} />
      </Tab>
    ),
    puede(usuario, 'usuarios') && (
      <Tab key="usuarios" eventKey="usuarios" title="Usuarios"><PanelUsuarios usuarioActual={usuario} /></Tab>
    ),
    puede(usuario, 'reportes') && (
      <Tab key="reportes" eventKey="reportes" title="Reportes"><Reportes /></Tab>
    ),
  ].filter(Boolean)

  return (
    <Container className="py-4">
      <h1 className="mb-1">{esVendedor ? 'Panel de vendedor' : 'Panel de administración'}</h1>
      <p className="text-secondary">
        ¡Hola, {usuario.nombre}! <Badge bg="secondary">{usuario.rol}</Badge>
        {esVendedor && ' · Puedes consultar productos y órdenes.'}
      </p>
      {/* mountOnEnter + unmountOnExit: solo se dibuja (y se carga) la pestaña que está abierta */}
      <Tabs defaultActiveKey="productos" className="mb-3" mountOnEnter unmountOnExit>
        {pestanas}
      </Tabs>
    </Container>
  )
}

function StockCritico() {
  const carga = useCarga(listarProductosCriticos, [])
  return (
    <Cargando carga={carga}>
      {(criticos) =>
        criticos.length === 0 ? (
          <Alert variant="success">No hay productos con stock crítico.</Alert>
        ) : (
          <Table responsive hover className="align-middle bg-white">
            <thead><tr><th>ID</th><th>Producto</th><th>Categoría</th><th>Stock</th></tr></thead>
            <tbody>
              {criticos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>
                    <Badge bg={p.stock === 0 ? 'danger' : 'warning'} text={p.stock === 0 ? undefined : 'dark'}>
                      {p.stock === 0 ? 'Sin stock' : p.stock}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      }
    </Cargando>
  )
}

function PanelOrdenes({ editable }) {
  const carga = useCarga(listarOrdenes, [])
  const [error, setError] = useState('')
  // PATCH /api/v1/boletas/{numero}/estado
  async function cambiarEstado(numero, estado) {
    setError('')
    try {
      await cambiarEstadoOrden(numero, estado)
      carga.recargar()
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <>
    {error && <Alert variant="danger">{error}</Alert>}
    <Cargando carga={carga}>
      {(ordenes) => (
        <ListaOrdenes ordenes={[...ordenes].reverse()} alCambiarEstado={editable ? cambiarEstado : undefined} conDetalle />
      )}
    </Cargando>
    </>
  )
}

function PanelUsuarios({ usuarioActual }) {
  const carga = useCarga(listarUsuarios, [])
  const [error, setError] = useState('')
  // Ejecuta una acción contra la API, recarga la lista y muestra el error si el backend la rechaza
  const ejecutar = (accion) => async (...args) => {
    setError('')
    try {
      await accion(...args)
      carga.recargar()
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <FormUsuario alCrear={async (datos) => { await crearUsuario(datos); carga.recargar() }} />
      <Cargando carga={carga}>
        {(usuarios) => (
          <ListaUsuarios
            usuarios={usuarios}
            idActual={usuarioActual.id}
            alCambiarRol={ejecutar((u, rol) => actualizarUsuario(u, { rol }))}
            alEliminar={ejecutar((u) => eliminarUsuario(u.id))}
          />
        )}
      </Cargando>
    </>
  )
}

function Reportes() {
  const carga = useCarga(listarOrdenes, [])
  return <Cargando carga={carga}>{(ordenes) => <PanelReportes ordenes={ordenes} />}</Cargando>
}

export default Admin
