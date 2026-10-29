import { useState } from 'react'

// Hook reutilizable para todos los formularios (login, registro, contacto, checkout, admin).
// - valores: lo que el usuario escribe (estado)
// - errores: mensaje de error por campo (estado)
// - validadores: { campo: (valor, todosLosValores) => { valido, mensaje } }
export default function useFormulario(valoresIniciales, validadores) {
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})

  function validarCampo(campo, todos) {
    const resultado = validadores[campo]?.(todos[campo], todos)
    return resultado && !resultado.valido ? resultado.mensaje : ''
  }

  // onChange: actualiza el estado con lo que se escribe.
  // Si el campo ya tenía error, se vuelve a validar al escribir, así el mensaje
  // desaparece apenas se corrige (y no al hacer clic en "Enviar", que movería el botón).
  function cambiar(evento) {
    const { name, value } = evento.target
    const nuevos = { ...valores, [name]: value }
    setValores(nuevos)
    if (errores[name]) setErrores((anteriores) => ({ ...anteriores, [name]: validarCampo(name, nuevos) }))
  }

  // onBlur: valida el campo al salir de él (como el "blur" de la versión HTML)
  function alSalir(evento) {
    const { name } = evento.target
    setErrores((anteriores) => ({ ...anteriores, [name]: validarCampo(name, valores) }))
  }

  // Al enviar: valida todo y devuelve true si no hay errores
  function validarTodo() {
    const nuevos = {}
    for (const campo in validadores) {
      const mensaje = validarCampo(campo, valores)
      if (mensaje) nuevos[campo] = mensaje
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function reiniciar(nuevosValores = valoresIniciales) {
    setValores(nuevosValores)
    setErrores({})
  }

  return { valores, errores, cambiar, alSalir, validarTodo, reiniciar, setValores }
}
