import { Table, Alert, Button, Form } from 'react-bootstrap'
import { ROLES } from '../data/usuarios.js'

// Tabla de usuarios para el panel de admin.
// - correoActual: el administrador con sesión iniciada (no puede eliminarse a sí mismo)
// - alCambiarRol(correo, rol) y alEliminar(correo): funciones que entrega el padre
function ListaUsuarios({ usuarios, correoActual, alCambiarRol, alEliminar }) {
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
          <tr key={u.correo}>
            <td>{u.nombre}</td>
            <td>{u.correo}</td>
            <td>
              <Form.Select
                size="sm"
                aria-label={`Rol de ${u.correo}`}
                value={u.rol}
                disabled={u.correo === correoActual}
                onChange={(e) => alCambiarRol(u.correo, e.target.value)}
              >
                {ROLES.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
              </Form.Select>
            </td>
            <td>
              <Button
                size="sm"
                variant="outline-danger"
                aria-label={`Eliminar a ${u.correo}`}
                disabled={u.correo === correoActual}
                onClick={() => alEliminar(u.correo)}
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
