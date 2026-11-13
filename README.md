# Pastelería Mil Sabores · Frontend (React)

Tienda en línea hecha con **React + Vite + React-Bootstrap**, conectada a un backend **Spring Boot** mediante una API REST consumida con **axios**.
Proyecto de DSY1104 Desarrollo Full Stack II (Evaluaciones Parciales 2 y 3).

- Backend: https://github.com/solange1988/pasteleria-mil-sabores-backend
- Pruebas: **Jasmine + Karma** con **Testing Library** (223 pruebas, cobertura sobre 87 %)

---

## 1. Cómo ejecutarlo

Necesitas **Node.js 20 o más nuevo** y el **backend encendido** en `http://localhost:8080` (ver su README).

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Si el backend está en otra dirección, copia `.env.example` como `.env` y cambia `VITE_API_URL`.

### Usuarios de prueba (los crea el backend)

| Rol | Correo | Contraseña | Qué ve |
|---|---|---|---|
| Administrador | admin@duoc.cl | admin123 | Tienda + panel completo (productos, stock, órdenes, usuarios, reportes) |
| Vendedor | vendedor@duoc.cl | vende123 | Tienda + «Panel vendedor»: productos y órdenes, solo lectura |
| Cliente | cliente@gmail.com | cliente123 | Solo la tienda y su perfil |

## 2. Comandos

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Levanta la página para trabajar |
| `npm test` | Karma abre Chrome y corre las pruebas cada vez que guardas |
| `npm run test:ejecutar` | Corre las pruebas una vez (Chrome sin ventana) |
| `npm run test:cobertura` | Mide la cobertura (abre `cobertura/html/index.html`) |
| `npm run build` | Genera la versión final en `dist/` |

## 3. Integración con el backend

```
Página (pages/*.jsx)
   │  usa
   ▼
data/productos.js · data/usuarios.js · data/ordenes.js     ← una función por endpoint
   │  llaman a
   ▼
api/cliente.js  ── axios ──►  http://localhost:8080/api/v1/...  ──►  Spring Boot ──► MySQL
   │  agrega "Authorization: Bearer <token>", convierte errores, renueva el token
   ▼
auth/sesion.js (localStorage)     auth/permisos.js (qué ve cada rol)
```

| Archivo | Qué hace |
|---|---|
| `src/api/cliente.js` | Única puerta hacia la API: URL base, JSON, token, manejo de errores (400/401/403/404) y renovación automática del token |
| `src/auth/sesion.js` | Guarda `{ token, tokenRenovacion, usuario }` en localStorage para que la sesión siga al recargar |
| `src/auth/permisos.js` | Permisos por rol (Administrador, Vendedor, Cliente) |
| `src/components/RutaProtegida.jsx` | Protege páginas: sin sesión pide login; sin permiso muestra «No tienes permisos» |
| `src/hooks/useCarga.js` + `components/Cargando.jsx` | Cargan datos de la API mostrando «Cargando...» o el error con «Reintentar» |

### Sesión (persistencia y seguridad)

1. **Login**: `POST /api/v1/auth/login` devuelve un token de acceso (30 min) y uno de renovación (7 días). Se guardan en localStorage; la contraseña nunca se guarda.
2. **Cada petición** lleva `Authorization: Bearer <token>`.
3. **Al recargar la página** se lee la sesión guardada y se confirma con `GET /api/v1/usuarios/perfil`. Así se usa el rol real de la base de datos (si alguien edita localStorage a mano, no gana permisos).
4. **Token vencido (401)**: se pide uno nuevo con `POST /api/v1/auth/renovar` y se repite la petición. Si no se puede, se cierra la sesión y se avisa «Tu sesión expiró».
5. **Cerrar sesión** borra todo. Si se cierra en otra pestaña, esta también se entera.

### Restricciones por rol

| Rol | Menú | Panel (`#/admin`) |
|---|---|---|
| Visitante | Tienda | Pide iniciar sesión |
| Cliente | Tienda + Perfil | «No tienes permisos para ver esta página» |
| Vendedor | + «Panel vendedor» | Pestañas **Productos** (solo lectura, «Ver detalle») y **Órdenes** (lista + detalle, sin cambiar estado) |
| Administrador | + «Admin» | Productos (CRUD), Stock crítico, Órdenes (cambiar estado), Usuarios (crear, cambiar rol, eliminar), Reportes |

El frontend solo decide qué se **muestra**; la seguridad real está en el backend, que responde 401/403 si falta el token o el rol.

## 4. Estructura

```
src/
  api/cliente.js        Cliente HTTP (axios + interceptores) hacia el backend
  auth/                 sesion.js y permisos.js
  data/                 productos.js, usuarios.js, ordenes.js (API) · blogs.js y regiones.js (datos fijos)
  hooks/                useFormulario.js, useCarga.js
  components/           Encabezado, Catalogo, TarjetaProducto, TablaCarrito, CampoTexto, CamposRegion,
                        AdminProductos, ListaOrdenes, ListaUsuarios, FormUsuario, PanelReportes,
                        RutaProtegida, Cargando, PiePagina
  pages/                Inicio, Productos, DetalleProducto, Categorias, Ofertas, Carrito, Checkout,
                        Registro, Login, Perfil, Admin, Nosotros, Blogs, BlogDetalle, Contacto
  utils/                carrito, descuentos (vista previa), formato, reportes, validaciones
  test/ y karma/        Pruebas (test/apiFalsa.js simula el backend con un adaptador falso de axios)
```

## 5. Pruebas

`npm run test:ejecutar` corre 223 pruebas. Las que tocan la API usan `src/test/apiFalsa.js`, que reemplaza el adaptador de axios (la pieza que envía la petición por la red) con un espía de Jasmine que responde como el backend. Así se prueba el camino completo (página → data → cliente → axios con sus interceptores) sin levantar Spring Boot:

- Cliente de la API: URL versionada, token en el encabezado, errores, renovación del token y sesión expirada.
- Sesión y permisos: persistencia en localStorage, roles y página inicial de cada rol.
- Páginas: catálogo, detalle (404), checkout (pago aceptado, rechazado por stock y sin conexión), login, registro, perfil.
- Panel: el administrador ve 5 pestañas; el vendedor solo 2 y en modo lectura.

## 6. GitHub

```bash
git add .
git commit -m "Describe aquí qué cambiaste"
git push
```
