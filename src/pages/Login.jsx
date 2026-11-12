import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { iniciarSesion } from '../data/usuarios.js'
import { validarCorreoPermitido, validarContrasena } from '../utils/validaciones.js'

const VALIDADORES = {
  correo: validarCorreoPermitido,
  contrasena: validarContrasena,
}

// POST /api/v1/auth/login. Si las credenciales son correctas, el backend responde
// { token, tokenRenovacion, usuario } y se lo entregamos a App con alIniciarSesion.
// Prop aviso: mensaje opcional (por ejemplo, "Tu sesión expiró").
function Login({ alIniciarSesion, aviso }) {
  const form = useFormulario({ correo: '', contrasena: '' }, VALIDADORES)
  const [errorCredenciales, setErrorCredenciales] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErrorCredenciales('')
    if (!form.validarTodo()) return

    setEnviando(true)
    try {
      const respuesta = await iniciarSesion(form.valores.correo, form.valores.contrasena)
      form.reiniciar()
      alIniciarSesion(respuesta)
    } catch (error) {
      setErrorCredenciales(error.estado === 401 ? 'Correo o contraseña incorrectos.' : error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm border-0 p-4">
        <img src="/img/logo.png" alt="" width="80" className="mx-auto mb-2" />
        <h1 className="text-center fs-2">Iniciar sesión</h1>
        {aviso && <Alert variant="warning">{aviso}</Alert>}
        {errorCredenciales && <Alert variant="danger">{errorCredenciales}</Alert>}
        <Form noValidate onSubmit={enviar}>
          <CampoTexto etiqueta="Correo" name="correo" type="email" form={form} maxLength={100} autoComplete="email" />
          <CampoTexto etiqueta="Contraseña" name="contrasena" type="password" form={form} autoComplete="current-password" />
          <Button type="submit" variant="chocolate" className="w-100" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          ¿No tienes cuenta? <a href="#/registro">Regístrate aquí</a>
        </p>
      </Card>
    </Container>
  )
}

export default Login
