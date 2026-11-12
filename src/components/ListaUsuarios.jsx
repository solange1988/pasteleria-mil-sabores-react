import { Table, Alert, Button, Form } from 'react-bootstrap'
import { ROLES } from '../data/usuarios.js'

// Tabla de usuarios para el panel de admin.
// - idActual: el administrador con sesión iniciada (no puede eliminarse ni cambiarse el rol a sí mismo)
// - alCambiarRol(usuario, rol) y alEliminar(usuario): funciones que entrega el padre
function ListaUsuarios({ usuarios, idActual, alCambiarRol, alEliminar }) {
  if (usuarios.length === 0) {
    return <Alert variant="info">No hay usuarios registrados.</Alert>
  }

  return (
    <Table responsive hover className="align-middle bg-white">
      <thead>
        <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td>{u.nombre}</td>
            <td>{u.correo}</td>
            <td>
              <Form.Select
                size="sm"
                aria-label={`Rol de ${u.correo}`}
                value={u.rol}
                disabled={u.id === idActual}
                onChange={(e) => alCambiarRol(u, e.target.value)}
              >
                {ROLES.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
              </Form.Select>
            </td>
            <td>
              <Button
                size="sm"
                variant="outline-danger"
                aria-label={`Eliminar a ${u.correo}`}
                disabled={u.id === idActual}
                onClick={() => alEliminar(u)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default ListaUsuarios
