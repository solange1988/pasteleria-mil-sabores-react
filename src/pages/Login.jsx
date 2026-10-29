import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { autenticar } from '../data/usuarios.js'
import { validarCorreoPermitido, validarContrasena } from '../utils/validaciones.js'

const VALIDADORES = {
  correo: validarCorreoPermitido,
  contrasena: validarContrasena,
}

// Prop alIniciarSesion: se llama con el correo cuando el formulario es válido
// Y las credenciales coinciden con un usuario registrado (data/usuarios.js)
function Login({ alIniciarSesion }) {
  const form = useFormulario({ correo: '', contrasena: '' }, VALIDADORES)
  const [errorCredenciales, setErrorCredenciales] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    setErrorCredenciales('')
    if (!form.validarTodo()) return

    const usuario = autenticar(form.valores.correo, form.valores.contrasena)
    if (!usuario) {
      setErrorCredenciales('Correo o contraseña incorrectos.')
      return
    }
    alIniciarSesion(usuario.correo)
    form.reiniciar()
  }

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm border-0 p-4">
        <img src="/img/logo.png" alt="" width="80" className="mx-auto mb-2" />
        <h1 className="text-center fs-2">Iniciar sesión</h1>
        {errorCredenciales && <Alert variant="danger">{errorCredenciales}</Alert>}
        <Form noValidate onSubmit={enviar}>
          <CampoTexto etiqueta="Correo" name="correo" type="email" form={form} maxLength={100} autoComplete="email" />
          <CampoTexto etiqueta="Contraseña" name="contrasena" type="password" form={form} autoComplete="current-password" />
          <Button type="submit" variant="chocolate" className="w-100">Iniciar sesión</Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          ¿No tienes cuenta? <a href="#/registro">Regístrate aquí</a>
        </p>
      </Card>
    </Container>
  )
}

export default Login
