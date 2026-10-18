# 🚗 Only Cars

Aplicación web de un concesionario de vehículos: **catálogo público** para clientes y **panel de administración** para gestionar el inventario.

> **Demo:** https://concesionario-only-cars.onrender.com/

Es un **monolito**: un único servidor Express expone la API (`/api/...`) y, a la vez, sirve el frontend estático.

---

## 🧰 Herramientas utilizadas

| Herramienta | En el proyecto sirve para... |
|---|---|
| **Node.js** | Entorno de ejecución del backend. |
| **Express 5** | Framework HTTP: define las rutas, los middlewares y sirve los archivos estáticos. |
| **MongoDB Atlas** | Base de datos en la nube: vehículos, marcas, usuarios e imágenes. |
| **Mongoose 9** | Modela los datos con esquemas, valida los campos y ejecuta las consultas. |
| **jsonwebtoken** | Genera un JWT al iniciar sesión; el token viaja en una cookie. |
| **bcrypt** | Hashea las contraseñas antes de guardarlas y las compara al entrar. |
| **cookie-parser** | Lee la cookie `accessToken` en cada petición. |
| **Multer** | Recibe los archivos del formulario (imágenes) **en memoria**. |
| **cors** | Permite el acceso a la API desde otros orígenes. |
| **dotenv** | Carga las variables de entorno desde `.env`. |
| **HTML / CSS / JS vanilla** | Todo el frontend, sin frameworks ni build. |
| **Render** | Hosting del servidor Express. |

---

## ⚙️ Cómo funciona

### Arquitectura general

```
Navegador (HTML/CSS/JS vanilla)
        │  fetch("/api/...")
        ▼
Express  (server.js)
   ├─ middlewares generales: json · cookies · estáticos (lista blanca)
   ├─ /api/auth       → controllers/auth.js
   ├─ /api/vehiculos  → controllers/vehiculos.js
   ├─ /api/marcas     → controllers/marcas.js
   └─ /api/imagenes   → controllers/imagenes.js
        │  Mongoose
        ▼
   MongoDB Atlas  (Usuarios · Vehiculos · Marcas · Imagenes)
```

`server.js` monta un único proceso que resuelve dos cosas a la vez: la **API** y los **archivos estáticos** del sitio. Los estáticos se sirven por **lista blanca** (`/img`, `/uploads`, `/admin`, `/contenedorPrincipal` y los archivos de la portada): el resto del proyecto —código fuente, `package.json`, `.env`— **no** se expone.

### Flujo de una petición

1. El navegador pide una **página** (HTML) o hace un `fetch` a la **API**.
2. Express aplica los middlewares generales en orden: parseo de JSON → lectura de cookies → archivos estáticos.
3. Si la ruta empieza por `/api/...`, entra al router correspondiente y después al controlador.
4. El controlador aplica su lógica (validaciones, reglas de negocio) y habla con MongoDB mediante Mongoose.
5. Devuelve **JSON** —o, en el caso de las imágenes, el **binario** con su `Content-Type`.

### Autenticación y sesión

**Registro** (`POST /api/auth/register`): se valida el email, la contraseña se **hashea con bcrypt** y se guarda el usuario con rol `cliente`. El hash nunca sale del modelo: `toJSON` elimina `passwordHash` de cualquier respuesta.

**Login** (`POST /api/auth/login`):

```
Navegador                     Express                        MongoDB
   │  email + contraseña ───────►│  findOne({ email })  ───────►│
   │                             │  ◄── usuario                 │
   │                             │  bcrypt.compare()            │
   │                             │  jwt.sign({id,email,role})   │
   │  ◄── 200 + Set-Cookie: accessToken (httpOnly)             │
```

El token (JWT, válido **7 días**) viaja en una cookie `accessToken` con `httpOnly`, `sameSite: strict` y `secure` cuando `NODE_ENV=production`. Al ser `httpOnly`, es **inaccesible desde JavaScript**, lo que lo protege de ataques XSS.

**Petición protegida:** el middleware `userExtractor` lee la cookie, verifica el JWT con `ACCESS_TOKEN_SECRET`, carga el usuario desde la base de datos y lo deja en `req.user`. Si no hay cookie → **401**; si el token es inválido o venció → **403**.

**Autorización:** `requireAdmin` comprueba que `req.user.role === "admin"` antes de permitir cualquier escritura (crear, editar o eliminar). El resto de usuarios solo puede leer.

**Logout** (`POST /api/auth/logout`): el servidor borra la cookie y el frontend limpia lo que tenía guardado.

> El frontend guarda el nombre y el rol en `localStorage` **solo** para pintar la interfaz. La confianza real está en la cookie verificada en el servidor.

### Gestión del inventario

Los vehículos se exponen con un CRUD completo. **Todas las escrituras** pasan por la cadena `userExtractor → requireAdmin`. Mongoose valida cada campo (año, precio ≥ 0, transmisión y estatus dentro de sus valores permitidos, etc.) y los errores de validación se devuelven como JSON legible en lugar de reventar el servidor. El schema define además `toJSON` para transformar `_id` en `id` y ocultar `__v`, de forma que el frontend recibe objetos limpios.

El listado permite **filtros por query** (`?marca=...`, `?status=...`), así que el catálogo y el panel reutilizan el mismo endpoint.

### Imágenes: de la subida a la pantalla

Las fotos subidas desde el panel **se guardan como binario en MongoDB**:

```
Formulario (multipart/form-data)
   │
   ▼
Multer (memoryStorage)  →  req.files[i].buffer   (nunca toca el disco)
   │
   ▼
subirImagenes()  →  nuevo documento en la colección "Imagenes" (Buffer + contentType)
   │
   ▼
vehiculo.images[]  →  "/api/imagenes/<id>"
```

Después, el navegador pide esa URL y el controlador devuelve el binario con su `Content-Type` y la cabecera `Cache-Control: immutable` (una imagen no cambia una vez subida, así que puede cachearse indefinidamente).

En el resto del ciclo:

- **Subida:** si falla el guardado, `subirImagenes` borra las imágenes que ya había creado, para no dejar huérfanas.
- **Edición:** el formulario envía `keepExistingImages` con las que el admin conservó; las nuevas se añaden y **las descartadas se borran**.
- **Eliminación:** al borrar un vehículo se borran también todas sus imágenes.

Todo el borrado pasa por `utils/imagenes.js`, que distingue entre rutas locales antiguas (`/uploads/...`) y las almacenadas en la base de datos, para no dejar cabos sueltos.

> **Por qué en la base de datos y no en disco:** el disco de los hosts gratuitos (Render) es **efímero** y se borra en cada despliegue. Guardar el binario en la base de datos garantiza que las imágenes **persistan**.

### Frontend

Cada página es un HTML con su propio script; `sesion.js` es el único **compartido** en todas ellas y se encarga del navbar: mostrar u ocultar login/registro, pintar el perfil desplegable y cerrar sesión. Toda la comunicación con el backend es con `fetch` a rutas de la **misma aplicación**, por lo que no hay problemas de CORS ni URLs absolutas entre dominios.

---

## 📁 Estructura del proyecto

```
concesionario/
├── server.js                  # Express: middlewares, estáticos, routers y conexión a MongoDB
├── sesion.js                  # Navbar compartido: perfil, login/logout (todas las páginas)
│
├── controllers/               # Rutas de la API
│   ├── auth.js                #   Registro, login, logout, perfil
│   ├── vehiculos.js           #   CRUD de vehículos
│   ├── marcas.js              #   Listado de marcas
│   └── imagenes.js            #   Sirve las imágenes guardadas en la base de datos
│
├── models/                    # Esquemas de Mongoose
│   ├── User.js                #   Usuarios
│   ├── Vehiculo.js            #   Vehículos
│   ├── Marca.js               #   Marcas
│   └── Imagen.js              #   Binario de cada imagen
│
├── middlewares/
│   ├── auth.js                #   userExtractor (JWT) y requireAdmin
│   └── upload.js              #   Multer: memoria, 5 MB, solo imágenes
│
├── utils/
│   ├── almacenamiento.js      #   Sube imágenes a MongoDB y devuelve sus URLs
│   └── imagenes.js            #   Borra imágenes (locales y de la base de datos)
│
├── scripts/
│   └── limpiar-huerfanos.js   #   Elimina archivos huérfanos en public/uploads
│
├── admin/                     # Panel de administración (admin.html · admin.css · admin.js)
│
├── contenedorPrincipal/       # Zona de usuario
│   ├── auth.css               #   Estilos de login/registro
│   ├── login/ · registro/     #   Acceso y alta de usuarios
│   └── vehiculos/             #   listado.html (catálogo) · vehiculo.html (ficha)
│
├── public/
│   ├── img/                   # Logos e iconos
│   └── uploads/               # Imágenes locales antiguas
│
├── index.html · index.css · index.js   # Landing pública
└── package.json
```

---

## 🔌 API

Las rutas **Admin** requieren sesión con rol de administrador (cookie `accessToken`).

### Autenticación — `/api/auth`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/register` | Público | Crea un usuario con rol `cliente`. |
| `POST` | `/login` | Público | Inicia sesión y guarda el token en una cookie. |
| `POST` | `/logout` | Público | Elimina la cookie de sesión. |
| `GET` | `/me` | Usuario | Datos del usuario autenticado. |

### Vehículos — `/api/vehiculos`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | Público | Listado, con filtros por query. |
| `GET` | `/:id` | Público | Detalle de un vehículo. |
| `GET` | `/marca/:marca` | Público | Vehículos de una marca. |
| `POST` | `/` | **Admin** | Crea un vehículo (`multipart/form-data`, campo `imagenes`). |
| `PUT` | `/:id` | **Admin** | Actualiza un vehículo (`multipart/form-data`). |
| `DELETE` | `/:id` | **Admin** | Elimina un vehículo y sus imágenes. |

### Marcas — `/api/marcas` · Imágenes — `/api/imagenes`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/marcas` | Público | Lista todas las marcas. |
| `GET` | `/api/imagenes/:id` | Público | Devuelve el binario de una imagen. |

---

## 🗃️ Modelos de datos

| Modelo | Campos |
|---|---|
| **User** | `name` · `email` (único) · `passwordHash` · `role` (`admin` \| `cliente`) · `active` · timestamps |
| **Vehiculo** | `marca_id` (ref → Marca) · `marca` · `modelo` · `anio` · `motor` · `transmision` (`manual` \| `automatica`) · `kilometraje` · `owners` · `precio` · `status` (`disponible` \| `vendido` \| `reservado`) · `description` · `images[]` · timestamps |
| **Marca** | `name` · `status` · timestamps |
| **Imagen** | `data` (Buffer) · `contentType` · `size` · timestamps |

---

## 🔐 Roles

| Rol | Alcance |
|---|---|
| Invitado | Catálogo, fichas, marcas y registro. |
| `cliente` | Lo anterior + sesión y perfil. |
| `admin` | Todo + panel y CRUD de vehículos. |

---

## 🧹 Script de mantenimiento

`scripts/limpiar-huerfanos.js` recorre `public/uploads` y detecta los archivos que ningún vehículo referencia (imágenes locales antiguas). Sin argumentos solo los lista; con `--aplicar` los elimina.

---

## 👤 Autor

Proyecto creado y desarrollado por **Fabio Espinoza**.

- GitHub: [@Fabioe05](https://github.com/Fabioe05)
- Repositorio: [Concesionario-Only-Cars](https://github.com/Fabioe05/Concesionario-Only-Cars)
