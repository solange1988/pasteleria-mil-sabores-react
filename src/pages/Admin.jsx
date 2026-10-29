import { useState } from 'react'
import { Container, Tabs, Tab, Table, Badge, Alert, Button } from 'react-bootstrap'
import AdminProductos from '../components/AdminProductos.jsx'
import ListaOrdenes from '../components/ListaOrdenes.jsx'
import ListaUsuarios from '../components/ListaUsuarios.jsx'
import PanelReportes from '../components/PanelReportes.jsx'
import { listarProductos, listarProductosCriticos } from '../data/productos.js'
import { listarOrdenes, cambiarEstadoOrden } from '../data/ordenes.js'
import { listarUsuarios, actualizarUsuario, eliminarUsuario } from '../data/usuarios.js'

// Panel de administración. Solo entra quien tiene el rol "Administrador".
// Props: usuario (objeto con sesión iniciada o null)
function Admin({ usuario }) {
  // Truco para volver a leer los datos: cambiar este número hace que React redibuje la página
  const [, setVersion] = useState(0)
  const refrescar = () => setVersion((v) => v + 1)

  if (!usuario) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Debes iniciar sesión como administrador para entrar a este panel.</Alert>
        <Button href="#/login" variant="chocolate">Iniciar sesión</Button>
      </Container>
    )
  }
  if (usuario.rol !== 'Administrador') {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">No tienes permisos para ver el panel de administración.</Alert>
        <Button href="#/" variant="chocolate">Volver al inicio</Button>
      </Container>
    )
  }

  const criticos = listarProductosCriticos()

  return (
    <Container className="py-4">
      <h1 className="mb-1">Panel de administración</h1>
      <p className="text-secondary">
        ¡Hola, {usuario.nombre}! {listarProductos().length} productos
        {criticos.length > 0 && <> · <span className="text-danger">{criticos.length} con stock crítico</span></>}
      </p>

      {/* mountOnEnter + unmountOnExit: solo se dibuja la pestaña que está abierta */}
      <Tabs defaultActiveKey="productos" className="mb-3" mountOnEnter unmountOnExit>
        <Tab eventKey="productos" title="Productos">
          <AdminProductos alCambiar={refrescar} />
        </Tab>

        <Tab eventKey="criticos" title="Stock crítico">
          {criticos.length === 0 ? (
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
                    <td><Badge bg={p.stock === 0 ? 'danger' : 'warning'} text={p.stock === 0 ? undefined : 'dark'}>{p.stock === 0 ? 'Sin stock' : p.stock}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        <Tab eventKey="ordenes" title="Órdenes">
          <ListaOrdenes
            ordenes={[...listarOrdenes()].reverse()}
            alCambiarEstado={(numero, estado) => { cambiarEstadoOrden(numero, estado); refrescar() }}
          />
        </Tab>

        <Tab eventKey="usuarios" title="Usuarios">
          <ListaUsuarios
            usuarios={listarUsuarios()}
            correoActual={usuario.correo}
            alCambiarRol={(correo, rol) => { actualizarUsuario(correo, { rol }); refrescar() }}
            alEliminar={(correo) => { eliminarUsuario(correo); refrescar() }}
          />
        </Tab>

        <Tab eventKey="reportes" title="Reportes">
          <PanelReportes ordenes={listarOrdenes()} />
        </Tab>
      </Tabs>
    </Container>
  )
}

export default Admin
