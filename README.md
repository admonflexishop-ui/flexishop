# FlexiShop Clone

Sistema de e-commerce completo con panel de administración, gestión de productos, sucursales y configuración de tienda. Desarrollado con Next.js, Turso/libSQL y TypeScript.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Turso/libSQL (SQLite distribuido)
- **Autenticación**: Sistema propio con sesiones HTTP-only cookies
- **Validación**: Zod
- **Hashing de Passwords**: bcryptjs

## ✨ Funcionalidades

### Para Clientes
- ✅ **Catálogo de Productos**: Visualización de productos con imágenes, precios y descripciones
- ✅ **Carrito de Compras**: Agregar/eliminar productos, ajustar cantidades, calcular totales
- ✅ **Comprar por WhatsApp**: Generar mensaje automático con pedido completo
- ✅ **Sucursales**: Visualización de sucursales con información de contacto, horarios y navegación

### Para Administradores
- ✅ **Panel de Administración**: Acceso protegido con autenticación de roles
- ✅ **Gestión de Productos**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ **Gestión de Sucursales**: CRUD completo con horarios, direcciones y teléfonos
- ✅ **Configuración de Tienda**: Personalizar nombre, color de acento y número de WhatsApp
- ✅ **Subida de Imágenes**: Soporte para imágenes PNG (máximo 500 KB por producto)

## 📋 Prerrequisitos

- Node.js 18+ y npm
- Cuenta en [Turso](https://turso.tech) para la base de datos
- Cuenta en [Vercel](https://vercel.com) (para deployment)

## 🔧 Configuración Local

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd flexishop-clone
```

### 2. Instalar dependencias

```bash
yarn
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de Datos Turso/libSQL
URL_DB=libsql://tu-db-turso.turso.io
TOKEN_DB=tu-token-de-autenticacion-aqui
```

**Obtener credenciales de Turso:**
1. Crea una cuenta en [Turso](https://turso.tech)
2. Crea una base de datos nueva
3. Obtén la URL de conexión y el token desde el dashboard

### 4. Inicializar la base de datos

Ejecuta el script SQL `db.sql` en tu base de datos Turso para crear las tablas necesarias:

```bash
# Opción 1: Usando la CLI de Turso
turso db shell <nombre-de-tu-db> < db.sql

# Opción 2: Usando el dashboard de Turso (ejecuta el contenido de db.sql)
```

### 5. Crear usuario administrador

Ejecuta este SQL en tu base de datos (reemplaza los valores según necesites):

```sql
INSERT INTO users (id, email, name, password, role, is_active, created_at, updated_at)
VALUES (
  'TU-UUID-AQUI',  -- Genera un UUID válido (usa uuidgen o un generador online)
  'admin@tutienda.com',
  'Administrador',
  '$2b$10$TU-HASH-AQUI',  -- Genera el hash con bcrypt para tu contraseña
  'admin',
  1,
  datetime('now'),
  datetime('now')
);
```

**Generar hash de contraseña:**
```bash
# Opción 1: Usando Node.js
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu-password', 10).then(h => console.log(h))"

# Opción 2: Usa un generador online de bcrypt
```

### 6. Ejecutar en desarrollo

```bash
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura de la Base de Datos

El proyecto utiliza las siguientes tablas:

- **`users`**: Usuarios del sistema (admin, editor)
- **`branches`**: Sucursales de la tienda
- **`products`**: Productos disponibles
- **`product_image`**: Imágenes de productos (BLOB)
- **`settings`**: Configuración general de la tienda (una sola fila)

Ver `db.sql` para la estructura completa.

## 🔐 Sistema de Autenticación

- **Rutas Protegidas**: `/admin` requiere rol de administrador
- **Sesiones**: Cookies HTTP-only con duración de 10 años (hasta logout manual)
- **Seguridad**: Passwords hasheados con bcrypt
- **Verificación**: Validación automática de sesión al cargar y periódicamente

### Endpoints de Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

## 🚢 Deployment en Vercel

### Variables de Entorno en Vercel

1. Ve a tu proyecto en el dashboard de Vercel
2. Navega a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

   | Variable | Valor | Ambientes |
   |----------|-------|-----------|
   | `URL_DB` | `libsql://tu-db-turso.turso.io` | Production, Preview, Development |
   | `TOKEN_DB` | Tu token de Turso | Production, Preview, Development |

### Proceso de Deployment

1. **Conecta tu repositorio** a Vercel (GitHub, GitLab, Bitbucket)
2. **Configura las variables de entorno** (ver arriba)
3. **Vercel detectará automáticamente** Next.js y usará la configuración correcta
4. **Despliega** - El build se ejecutará automáticamente

### Post-Deployment

Después del primer despliegue:

1. ✅ Verifica que la aplicación carga correctamente
2. ✅ Accede a `/admin` y verifica el login
3. ✅ Verifica que los productos se cargan
4. ✅ Verifica que las imágenes se muestran
5. ✅ Verifica que las sucursales se muestran

## 📝 Scripts Disponibles

```bash
yarn dev      # Iniciar servidor de desarrollo
yarn build    # Construir para producción
yarn start    # Iniciar servidor de producción
yarn lint     # Ejecutar linter
yarn format   # Formatear código con Prettier
```

## 🛠️ Características Técnicas

### Validación de Datos
- Validación de esquemas con Zod en frontend y backend
- Validación automática de tipos TypeScript
- Sanitización de datos de entrada

### Manejo de Imágenes
- Almacenamiento como BLOB en base de datos
- Validación de tipo (solo PNG)
- Validación de tamaño (máximo 500 KB)
- Conversión automática a formatos compatibles

### Normalización de Fechas
- Conversión automática de formatos SQLite a ISO 8601
- Compatibilidad con diferentes formatos de fecha de base de datos

### Rutas Dinámicas
Las siguientes rutas requieren ejecución en runtime (ya configuradas):
- `/api/auth/me`
- `/api/auth/login`
- `/api/auth/logout`

## 🐛 Troubleshooting

### Error: "Could not connect to database"
- ✅ Verifica que `URL_DB` y `TOKEN_DB` estén configuradas correctamente
- ✅ Asegúrate de que el token tenga permisos de lectura/escritura
- ✅ Verifica que la URL de la base de datos sea correcta

### Error: "Invalid ISO datetime"
- ✅ Este error ya está resuelto con la función `normalizeDateTime`
- ✅ Si persiste, verifica que las fechas en la base de datos tengan el formato correcto

### Error: "Credenciales inválidas"
- ✅ Verifica que el usuario exista en la base de datos
- ✅ Verifica que el password esté hasheado correctamente
- ✅ Verifica que el rol del usuario sea 'admin'

### Build falla con errores de TypeScript
- ✅ Ejecuta `yarn build` localmente para identificar errores
- ✅ Verifica que todos los tipos estén correctos
- ✅ Asegúrate de que todas las dependencias estén instaladas

### Imágenes no se muestran
- ✅ Verifica que las imágenes se hayan subido correctamente
- ✅ Verifica el tamaño de las imágenes (máximo 500 KB)
- ✅ Verifica que el formato sea PNG

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Turso](https://docs.turso.tech)
- [Documentación de libSQL](https://libsql.org/docs)
- [Documentación de Zod](https://zod.dev)

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con ❤️ usando Next.js y Turso**
