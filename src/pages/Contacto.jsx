import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { validarNombre, validarCorreo, validarMensaje } from '../utils/validaciones.js'

const VALIDADORES = { nombre: validarNombre, correo: validarCorreo, mensaje: validarMensaje }

function Contacto() {
  const form = useFormulario({ nombre: '', correo: '', asunto: 'cotizacion', mensaje: '' }, VALIDADORES)
  const [enviado, setEnviado] = useState(false)

  function enviar(evento) {
    evento.preventDefault()
    const valido = form.validarTodo()
    setEnviado(valido)
    if (valido) form.reiniciar()
  }

  return (
    <Container className="py-5" style={{ maxWidth: 640 }}>
      <Card className="shadow-sm border-0 p-4">
        <h1 className="text-center fs-2">Contáctanos</h1>
        <p className="text-center">¿Tienes dudas sobre un pedido o quieres cotizar una torta especial? Escríbenos.</p>
        {enviado && <Alert variant="success">¡Gracias por tu mensaje! Te responderemos pronto.</Alert>}
        <Form noValidate onSubmit={enviar}>
          <CampoTexto etiqueta="Nombre completo" name="nombre" form={form} autoComplete="name" />
          <CampoTexto etiqueta="Correo electrónico" name="correo" type="email" form={form} autoComplete="email" />
          <Form.Group className="mb-3" controlId="asunto">
            <Form.Label className="fw-bold">Asunto</Form.Label>
            <Form.Select name="asunto" value={form.valores.asunto} onChange={form.cambiar}>
              <option value="cotizacion">Cotización de torta</option>
              <option value="pedido">Estado de mi pedido</option>
              <option value="reclamo">Reclamo o sugerencia</option>
            </Form.Select>
          </Form.Group>
          <CampoTexto etiqueta="Mensaje" name="mensaje" as="textarea" rows={5} form={form} />
          <Button type="submit" variant="chocolate" className="w-100">Enviar mensaje</Button>
        </Form>
      </Card>
    </Container>
  )
}

export default Contacto
