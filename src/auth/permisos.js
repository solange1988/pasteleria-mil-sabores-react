// Qué puede hacer cada rol en el frontend (mismos roles que el backend).
//  - Administrador: acceso total al panel.
//  - Vendedor: solo VER productos y órdenes (lista y detalle). Lo demás no aparece en su vista.
//  - Cliente: solo la tienda.
// OJO: esto solo decide qué se MUESTRA. La seguridad real está en el backend: aunque alguien
// modificara este archivo en su navegador, la API respondería 403 sin el rol correcto.
export const PERMISOS = {
  Administrador: ['panel', 'productos', 'productos.editar', 'stock', 'ordenes', 'ordenes.editar', 'usuarios', 'reportes'],
  Vendedor: ['panel', 'productos', 'ordenes'],
  Cliente: [],
}

export function puede(usuario, permiso) {
  return Boolean(usuario) && (PERMISOS[usuario.rol] ?? []).includes(permiso)
}

// A dónde llevar a cada usuario después de iniciar sesión
export function paginaInicial(usuario) {
  return puede(usuario, 'panel') ? '#/admin' : '#/'
}
