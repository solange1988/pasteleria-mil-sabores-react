import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import CamposRegion from '../components/CamposRegion.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { registrarUsuario } from '../data/usuarios.js'
import { descuentoDe } from '../utils/descuentos.js'
import {
  validarNombreCompleto,
  validarCorreoPermitido,
  validarConfirmacion,
  validarContrasena,
  validarFechaNacimiento,
  validarCodigoPromocional,
} from '../utils/validaciones.js'

const INICIAL = {
  nombre: '', correo: '', confirmarCorreo: '', contrasena: '', confirmarContrasena: '',
  fechaNacimiento: '', codigo: '', telefono: '', region: '', comuna: '',
}

// El segundo parámetro "todos" permite comparar con otro campo del formulario
const VALIDADORES = {
  nombre: validarNombreCompleto,
  correo: validarCorreoPermitido,
  confirmarCorreo: (valor, todos) => validarConfirmacion(valor, todos.correo, 'correo'),
  contrasena: validarContrasena,
  confirmarContrasena: (valor, todos) => validarConfirmacion(valor, todos.contrasena, 'contraseña'),
  fechaNacimiento: validarFechaNacimiento,
  codigo: validarCodigoPromocional,
}

function Registro() {
  const form = useFormulario(INICIAL, VALIDADORES)
  // resultado: null | { ok: true, descuento } | { ok: false, mensaje }
  const [resultado, setResultado] = useState(null)

  function enviar(evento) {
    evento.preventDefault()
    if (!form.validarTodo()) {
      setResultado(null)
      return
    }
    const { confirmarCorreo, confirmarContrasena, ...datos } = form.valores // eslint-disable-line no-unused-vars
    const respuesta = registrarUsuario(datos)
    if (!respuesta.ok) {
      setResultado(respuesta)
      return
    }
    setResultado({ ok: true, descuento: descuentoDe(respuesta.usuario) })
    form.reiniciar()
  }

  return (
    <Container className="py-5" style={{ maxWidth: 640 }}>
      <Card className="shadow-sm border-0 p-4">
        <h1 className="text-center fs-2">Crear cuenta</h1>
        {resultado?.ok && (
          <Alert variant="success">
            ¡Registro exitoso! Ya puedes iniciar sesión.
            {resultado.descuento.porcentaje > 0 && ` Tienes ${resultado.descuento.porcentaje}% de descuento: ${resultado.descuento.motivo}.`}
          </Alert>
        )}
        {resultado && !resultado.ok && <Alert variant="danger">{resultado.mensaje}</Alert>}
        <Form noValidate onSubmit={enviar}>
          <CampoTexto etiqueta="Nombre completo" name="nombre" form={form} autoComplete="name" />
          <CampoTexto etiqueta="Correo electrónico" name="correo" type="email" form={form} autoComplete="email" />
          <CampoTexto etiqueta="Confirmar correo" name="confirmarCorreo" type="email" form={form} />
          <CampoTexto etiqueta="Contraseña" name="contrasena" type="password" form={form} autoComplete="new-password" />
          <CampoTexto etiqueta="Confirmar contraseña" name="confirmarContrasena" type="password" form={form} autoComplete="new-password" />
          <CampoTexto etiqueta="Fecha de nacimiento (opcional)" name="fechaNacimiento" type="date" form={form} autoComplete="bday" />
          <CampoTexto etiqueta="Código promocional (opcional)" name="codigo" form={form} placeholder="Ej: FELICES50" />
          <CampoTexto etiqueta="Teléfono (opcional)" name="telefono" type="tel" form={form} autoComplete="tel" />
          <CamposRegion form={form} />
          <Button type="submit" variant="chocolate" className="w-100">Registrar</Button>
        </Form>
      </Card>
    </Container>
  )
}

export default Registro
