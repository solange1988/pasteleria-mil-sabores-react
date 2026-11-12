import { useState } from 'react'
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap'
import CampoTexto from './CampoTexto.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { ROLES } from '../data/usuarios.js'
import { validarNombreCompleto, validarCorreoPermitido, validarContrasena } from '../utils/validaciones.js'

const VACIO = { nombre: '', correo: '', contrasena: '', rol: 'Vendedor' }
const VALIDADORES = { nombre: validarNombreCompleto, correo: validarCorreoPermitido, contrasena: validarContrasena }

// El administrador crea cuentas con cualquier rol (por ejemplo, un Vendedor).
// Prop alCrear(datos): promesa que llama a la API; si falla, se muestra el mensaje del backend.
function FormUsuario({ alCrear }) {
  const form = useFormulario(VACIO, VALIDADORES)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'success' | 'danger', texto }

  async function enviar(evento) {
    evento.preventDefault()
    setMensaje(null)
    if (!form.validarTodo()) return
    try {
      await alCrear(form.valores)
      setMensaje({ tipo: 'success', texto: `Usuario ${form.valores.correo} creado como ${form.valores.rol}.` })
      form.reiniciar()
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message })
    }
  }

  return (
    <Card className="shadow-sm border-0 p-3 mb-3">
      <h2 className="fs-5">Nuevo usuario</h2>
      {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
      <Form noValidate onSubmit={enviar}>
        <Row className="g-2 align-items-start">
          <Col md={3}><CampoTexto etiqueta="Nombre" name="nombre" id="usuario-nombre" form={form} /></Col>
          <Col md={3}><CampoTexto etiqueta="Correo" name="correo" id="usuario-correo" type="email" form={form} /></Col>
          <Col md={2}><CampoTexto etiqueta="Contraseña" name="contrasena" id="usuario-contrasena" type="password" form={form} autoComplete="new-password" /></Col>
          <Col md={2}>
            <Form.Group className="mb-3" controlId="rol-nuevo">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={form.valores.rol} onChange={form.cambiar}>
                {ROLES.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} className="pt-md-4">
            <Button type="submit" variant="chocolate" className="w-100 mt-md-2">Crear</Button>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default FormUsuario
