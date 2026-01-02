# FlexiShop Clone (CODRAVA)

Clon funcional de FlexiShop (UI 1:1 objetivo), con persistencia (Firestore), login (Firebase Auth), imágenes (Firebase Storage), y modo Admin.

## Stack
- Next.js (App Router) + React + TypeScript + Tailwind
- Firebase: Firestore + Auth + Storage

## Requisitos cubiertos
- Productos en cards con imagen/nombre/precio/stock/descripcion + Agregar al carrito
- Carrito: cantidades, total, vaciar, comprar por WhatsApp (mensaje con lista + cantidades + total)
- Sucursales: listado + bloque de mapa (placeholder)
- Personalizar: nombre de tienda + color de acento, vista previa en tiempo real
- Admin (solo dueño): CRUD de productos y sucursales + configuración de tienda
- Seguridad real: reglas Firestore/Storage (escritura solo admin)

## Configurar Firebase
1. Crea un proyecto en Firebase.
2. Habilita:
   - Firestore Database
   - Authentication (Email/Password y/o Google)
   - Storage (opcional)
3. Copia tus credenciales a `.env.local` usando `.env.example`.

## Reglas de seguridad
- Firestore: `firebase/firestore.rules`
- Storage: `firebase/storage.rules`

Publica estas reglas en Firebase Console (o con Firebase CLI).

## Primer Admin (importante)
Las reglas permiten escritura solo a usuarios con `role=admin` en `users/{uid}`.

Pasos:
1. Crea un usuario (Auth) iniciando sesión en `/admin`.
2. En Firestore, colección `users`, abre el documento con ID = `uid`.
3. Cambia el campo `role` a `admin`.

> Alternativa recomendada: hacer un script o Cloud Function de "bootstrap" para asignar el primer admin, pero este repo lo deja manual para simplicidad.

## Ejecutar en local
```bash
npm install
npm run dev
```
Abre http://localhost:3000

## Deploy
- Vercel (recomendado)
  - Configura variables de entorno en Vercel (mismas de `.env.local`)
- Firebase Hosting (opcional)

## Notas
- Carrito se guarda en LocalStorage (persistencia cliente).
- Los datos de la tienda/productos/sucursales se leen desde Firestore (persistencia real multi-dispositivo).

