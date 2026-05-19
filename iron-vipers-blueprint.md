# Iron Vipers — Blueprint de Arquitectura del Proyecto

## 1. Contexto general

**Nombre del proyecto:** Iron Vipers  
**Dominio:** Gestión de taller mecánico especializado en motocicletas  
**Tipo de sistema:** Gestor operativo y administrativo para taller de motos  
**Objetivo principal:** Centralizar clientes, motocicletas, órdenes de servicio, fotos, piezas, pagos, ingresos y preparar el sistema para futuras integraciones como facturación electrónica e inteligencia artificial.

Iron Vipers debe construirse como un sistema modular, escalable y mantenible. El proyecto debe priorizar primero el flujo real del taller antes de agregar funcionalidades avanzadas.

La entidad central del sistema será la **orden de servicio**. Todo el sistema debe girar alrededor del ciclo de vida de una moto dentro del taller.

---

## 2. Principio arquitectónico

La arquitectura recomendada es un **monolito modular escalable**.

No se recomienda iniciar con microservicios porque el dominio del negocio todavía está en fase de descubrimiento. Un monolito modular permite avanzar rápido, mantener orden interno y escalar más adelante sin reescribir todo el sistema.

### Arquitectura general

```txt
Frontend React
   ↓
API FastAPI
   ↓
PostgreSQL
   ↓
Storage de fotos
```

### Objetivo de esta arquitectura

- Construir rápido.
- Mantener el código ordenado.
- Separar responsabilidades por módulos.
- Permitir crecimiento futuro.
- Preparar integración con facturación.
- Preparar integración con inteligencia artificial.
- Facilitar deploy gratuito o de bajo costo.

---

## 3. Stack tecnológico recomendado

### Backend

```txt
Python
FastAPI
SQLAlchemy 2.0
Pydantic v2
Alembic
PostgreSQL
JWT
Argon2
```

### Frontend

```txt
React
Vite
TypeScript
Tailwind CSS
TanStack Query
React Hook Form
Zod
```

### Base de datos

```txt
PostgreSQL
```

### Storage de fotos

```txt
Supabase Storage
```

### Deploy gratuito sugerido

```txt
Frontend:
- Vercel o Netlify

Backend:
- Render Free Web Service

Base de datos:
- Supabase Free Postgres

Fotos:
- Supabase Storage
```

### Justificación del stack

FastAPI permite construir APIs REST de forma rápida, clara y documentada mediante Swagger. PostgreSQL es ideal para un sistema relacional con clientes, motos, órdenes, piezas y pagos. React con Vite permite construir una interfaz moderna y ligera. Supabase Storage simplifica la gestión de imágenes sin tener que montar infraestructura propia.

---

## 4. Módulos principales del sistema

El sistema debe organizarse por módulos de dominio, no por tipo de archivo global.

### Módulos iniciales

```txt
auth
users
clients
motorcycles
service_orders
parts
photos
payments
expenses
dashboard
```

### Módulos futuros

```txt
invoices
notifications
customer_portal
ai_assistant
reports
branches
```

---

## 5. Roles del sistema

### Roles iniciales

```txt
ADMIN
MECHANIC
```

### Roles futuros

```txt
RECEPTIONIST
CLIENT
OWNER
```

### Permisos esperados

#### ADMIN

- Gestiona usuarios.
- Gestiona clientes.
- Gestiona motocicletas.
- Gestiona órdenes de servicio.
- Gestiona piezas.
- Gestiona pagos.
- Ve dashboard.
- Ve ingresos.
- Ve reportes.

#### MECHANIC

- Consulta órdenes asignadas.
- Actualiza diagnóstico.
- Actualiza estado de reparación.
- Sube fotos.
- Registra trabajo realizado.
- Consulta piezas disponibles.

#### RECEPTIONIST

- Registra clientes.
- Registra motos.
- Crea órdenes de servicio.
- Registra pagos.
- Consulta estado de órdenes.

#### CLIENT

- Consulta estado de su moto.
- Ve fotos autorizadas.
- Autoriza presupuestos.
- Consulta historial.

---

## 6. Flujo operativo del taller

El flujo principal del sistema debe modelar la operación real del taller.

```txt
Cliente llega al taller
   ↓
Se registra cliente
   ↓
Se registra motocicleta
   ↓
Se toman fotos de recepción
   ↓
Se crea orden de servicio
   ↓
Mecánico diagnostica
   ↓
Se agregan piezas y mano de obra
   ↓
Se calcula presupuesto
   ↓
Cliente autoriza
   ↓
Se realiza reparación
   ↓
Se registra pago
   ↓
Se entrega moto
   ↓
Se cierra la orden
```

---

## 7. Estados de una orden de servicio

La orden de servicio debe tener estados claros y controlados mediante enum.

```txt
RECIBIDA
EN_DIAGNOSTICO
ESPERANDO_AUTORIZACION
AUTORIZADA
EN_REPARACION
ESPERANDO_PIEZAS
LISTA_PARA_ENTREGA
ENTREGADA
CANCELADA
```

### Reglas de estado recomendadas

- Una orden inicia como `RECIBIDA`.
- Una orden puede pasar a `EN_DIAGNOSTICO`.
- Después del diagnóstico puede pasar a `ESPERANDO_AUTORIZACION`.
- Si el cliente aprueba, pasa a `AUTORIZADA`.
- Si inicia el trabajo, pasa a `EN_REPARACION`.
- Si faltan piezas, pasa a `ESPERANDO_PIEZAS`.
- Cuando termina el trabajo, pasa a `LISTA_PARA_ENTREGA`.
- Cuando el cliente recoge la moto, pasa a `ENTREGADA`.
- Si el cliente cancela o el taller rechaza el trabajo, pasa a `CANCELADA`.

---

## 8. Modelo conceptual del sistema

```txt
Client
  tiene muchas Motorcycles

Motorcycle
  pertenece a un Client
  tiene muchas ServiceOrders

ServiceOrder
  pertenece a una Motorcycle
  pertenece a un Client
  puede tener un Mechanic asignado
  tiene muchas Photos
  tiene muchas Parts usadas
  tiene muchos Payments

Part
  puede estar en muchas ServiceOrders

Payment
  pertenece a una ServiceOrder

Expense
  pertenece al taller

Dashboard
  calcula información usando Orders, Payments, Parts y Expenses
```

---

## 9. Entidades principales de base de datos

## 9.1 users

```txt
id
full_name
email
phone
password_hash
role
is_active
created_at
updated_at
```

### Reglas

- `email` debe ser único.
- `password_hash` nunca debe enviarse al frontend.
- `role` debe ser enum.
- `is_active` permite desactivar usuarios sin eliminarlos.

---

## 9.2 clients

```txt
id
full_name
phone
email
address
notes
created_at
updated_at
```

### Reglas

- Un cliente puede tener muchas motos.
- `phone` debe ser fácil de buscar.
- `email` puede ser opcional.
- `notes` permite registrar información administrativa.

---

## 9.3 motorcycles

```txt
id
client_id
brand
model
year
plate
vin
color
km
notes
created_at
updated_at
```

### Reglas

- Una moto pertenece a un cliente.
- `plate` puede ser opcional.
- `vin` puede ser opcional pero debe prepararse para ser único si se usa.
- `km` representa el kilometraje al momento del registro o última actualización.

---

## 9.4 service_orders

```txt
id
motorcycle_id
client_id
assigned_mechanic_id
status
entry_date
estimated_delivery_date
problem_description
diagnosis
work_performed
labor_cost
parts_cost
total_cost
paid_amount
balance_due
created_at
updated_at
closed_at
```

### Reglas

- Es la entidad central del sistema.
- Siempre debe estar asociada a una moto.
- Siempre debe estar asociada a un cliente.
- Puede tener o no mecánico asignado al inicio.
- `status` debe estar controlado por enum.
- `total_cost` puede calcularse a partir de mano de obra y piezas.
- `balance_due` puede calcularse a partir del total menos pagos.
- `closed_at` solo se llena cuando la orden termina.

---

## 9.5 motorcycle_photos

```txt
id
motorcycle_id
service_order_id
photo_url
photo_type
description
uploaded_by_id
created_at
```

### Tipos de foto

```txt
RECEPCION
DAÑO
DIAGNOSTICO
AVANCE
ENTREGA
```

### Reglas

- Una foto puede pertenecer a una moto y a una orden de servicio.
- `photo_url` apunta al storage externo.
- `uploaded_by_id` permite auditar quién subió la imagen.

---

## 9.6 parts

```txt
id
name
sku
brand
description
stock_quantity
unit_cost
sale_price
minimum_stock
created_at
updated_at
```

### Reglas

- `sku` debe ser único si se usa.
- `stock_quantity` no debe ser negativo.
- `minimum_stock` sirve para alertas de inventario bajo.
- `unit_cost` representa el costo para el taller.
- `sale_price` representa el precio al cliente.

---

## 9.7 service_order_parts

```txt
id
service_order_id
part_id
quantity
unit_price
total_price
created_at
```

### Reglas

- Tabla intermedia entre órdenes y piezas.
- Al agregar una pieza a una orden, debe disminuir el stock.
- `total_price` = `quantity` * `unit_price`.
- Debe conservar el precio usado en ese momento, aunque después cambie el precio de la pieza.

---

## 9.8 payments

```txt
id
service_order_id
amount
payment_method
payment_date
notes
created_at
```

### Métodos de pago

```txt
EFECTIVO
TRANSFERENCIA
TARJETA
MIXTO
```

### Reglas

- Un pago pertenece a una orden.
- Una orden puede tener varios pagos.
- La suma de pagos actualiza `paid_amount`.
- El saldo pendiente se calcula contra `total_cost`.

---

## 9.9 expenses

```txt
id
concept
amount
category
expense_date
notes
created_at
```

### Categorías

```txt
RENTA
LUZ
AGUA
HERRAMIENTA
PIEZAS
NOMINA
OTRO
```

### Reglas

- Sirve para reportes de rentabilidad.
- No debe mezclarse con pagos de clientes.
- Representa dinero que sale del taller.

---

## 10. Estructura de carpetas recomendada

```txt
iron-vipers/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── models.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── service.py
│   │   │   │   └── repository.py
│   │   │   │
│   │   │   ├── clients/
│   │   │   │   ├── models.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── service.py
│   │   │   │   └── repository.py
│   │   │   │
│   │   │   ├── motorcycles/
│   │   │   ├── service_orders/
│   │   │   ├── parts/
│   │   │   ├── payments/
│   │   │   ├── photos/
│   │   │   ├── expenses/
│   │   │   └── dashboard/
│   │   │
│   │   ├── shared/
│   │   │   ├── enums.py
│   │   │   ├── exceptions.py
│   │   │   └── dependencies.py
│   │   │
│   │   └── tests/
│   │
│   ├── alembic/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── clients/
│   │   │   ├── motorcycles/
│   │   │   ├── service-orders/
│   │   │   ├── parts/
│   │   │   ├── payments/
│   │   │   └── dashboard/
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── README.md
└── docs/
    ├── architecture.md
    ├── database.md
    ├── api.md
    └── roadmap.md
```

---

## 11. Patrón interno de cada módulo backend

Cada módulo debe seguir esta estructura:

```txt
models.py       → Tablas SQLAlchemy
schemas.py      → Validaciones Pydantic
router.py       → Endpoints HTTP
service.py      → Lógica de negocio
repository.py   → Consultas a base de datos
```

### Ejemplo

```txt
service_orders/
├── models.py
├── schemas.py
├── router.py
├── service.py
└── repository.py
```

### Reglas de responsabilidad

- `router.py` no debe contener lógica de negocio pesada.
- `service.py` contiene reglas de negocio.
- `repository.py` contiene consultas a la base de datos.
- `schemas.py` define entradas y salidas de la API.
- `models.py` define las tablas.

---

## 12. Endpoints iniciales de la API

## 12.1 Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

## 12.2 Users

```txt
GET    /users
POST   /users
GET    /users/{user_id}
PUT    /users/{user_id}
PATCH  /users/{user_id}/activate
PATCH  /users/{user_id}/deactivate
```

---

## 12.3 Clients

```txt
GET    /clients
POST   /clients
GET    /clients/{client_id}
PUT    /clients/{client_id}
DELETE /clients/{client_id}
```

---

## 12.4 Motorcycles

```txt
GET    /motorcycles
POST   /motorcycles
GET    /motorcycles/{motorcycle_id}
PUT    /motorcycles/{motorcycle_id}
DELETE /motorcycles/{motorcycle_id}
GET    /clients/{client_id}/motorcycles
```

---

## 12.5 Service Orders

```txt
GET    /service-orders
POST   /service-orders
GET    /service-orders/{order_id}
PUT    /service-orders/{order_id}
PATCH  /service-orders/{order_id}/status
POST   /service-orders/{order_id}/assign-mechanic
```

---

## 12.6 Photos

```txt
POST   /service-orders/{order_id}/photos
GET    /service-orders/{order_id}/photos
DELETE /photos/{photo_id}
```

---

## 12.7 Parts

```txt
GET    /parts
POST   /parts
GET    /parts/{part_id}
PUT    /parts/{part_id}
DELETE /parts/{part_id}
POST   /service-orders/{order_id}/parts
```

---

## 12.8 Payments

```txt
POST   /service-orders/{order_id}/payments
GET    /service-orders/{order_id}/payments
GET    /payments
```

---

## 12.9 Expenses

```txt
GET    /expenses
POST   /expenses
GET    /expenses/{expense_id}
PUT    /expenses/{expense_id}
DELETE /expenses/{expense_id}
```

---

## 12.10 Dashboard

```txt
GET /dashboard/summary
GET /dashboard/income
GET /dashboard/orders-status
GET /dashboard/low-stock
```

---

## 13. Dashboard inicial

El dashboard del MVP debe mostrar información útil para el taller.

```txt
Órdenes activas
Órdenes terminadas
Ingresos del día
Ingresos del mes
Motos en reparación
Piezas con bajo stock
Pagos pendientes
Órdenes esperando autorización
```

### Reglas

- No construir gráficas complejas al inicio.
- Primero mostrar números operativos.
- Después agregar filtros por fecha.
- Después agregar reportes exportables.

---

## 14. Roadmap por fases

## Fase 1 — MVP operativo

Objetivo: que el taller pueda usar el sistema en operación real.

```txt
- Login
- Roles básicos
- Clientes
- Motos
- Órdenes de servicio
- Estados de orden
- Fotos de recepción
- Piezas usadas
- Pagos
- Dashboard básico
```

---

## Fase 2 — Gestión administrativa

```txt
- Inventario completo
- Alertas de bajo stock
- Historial de moto
- Historial de cliente
- Gastos del taller
- Reporte de utilidad
- Filtros avanzados
- Exportación CSV/PDF
```

---

## Fase 3 — Facturación

```txt
- Datos fiscales del cliente
- RFC
- Razón social
- Uso de CFDI
- Régimen fiscal
- Generación de prefactura
- Integración con PAC externo
- Descarga PDF/XML
```

### Nota

La facturación electrónica real en México debe tratarse como módulo independiente. No debe implementarse en el MVP. Primero se deben preparar los modelos y luego integrar un proveedor autorizado.

---

## Fase 4 — Portal cliente

```txt
- Cliente consulta estado de su moto
- Cliente ve fotos del avance
- Cliente aprueba presupuesto
- Cliente recibe notificaciones
```

---

## Fase 5 — Inteligencia artificial

```txt
- Resumen automático de diagnóstico
- Sugerencia de posibles fallas
- Clasificación de fotos de daño
- Estimación de costo según historial
- Chat interno para consultar órdenes
- Búsqueda inteligente de historial de motos
```

### Regla para IA

La inteligencia artificial debe integrarse cuando el sistema ya tenga datos reales. Sin historial de órdenes, diagnósticos y reparaciones, la IA tendría poco valor operativo.

---

## 15. Reglas técnicas del backend

### Seguridad

- Usar JWT para autenticación.
- Usar Argon2 para hash de contraseñas.
- Nunca devolver `password_hash` en respuestas.
- Proteger endpoints sensibles por rol.
- Usar variables de entorno para secretos.
- No hardcodear credenciales.

### Base de datos

- Usar SQLAlchemy 2.0.
- Usar migraciones con Alembic.
- No crear tablas manualmente en producción.
- Usar relaciones claras entre entidades.
- Usar enums para estados y roles.
- Usar timestamps en entidades principales.

### API

- Usar prefijo `/api/v1`.
- Mantener nombres REST claros.
- Validar entradas con Pydantic.
- Devolver errores HTTP correctos.
- Documentar usando Swagger automático.

### Archivos

- No guardar imágenes pesadas dentro de PostgreSQL.
- Guardar imágenes en storage externo.
- Guardar en DB solo URL, tipo, descripción y metadata.

---

## 16. Variables de entorno esperadas

Archivo `.env.example`:

```env
APP_NAME=Iron Vipers API
APP_ENV=development
DEBUG=true

DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/iron_vipers_db

JWT_SECRET_KEY=change_me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=motorcycle-photos

CORS_ORIGINS=http://localhost:5173
```

---

## 17. Docker Compose recomendado para desarrollo

```yaml
services:
  api:
    build: ./backend
    container_name: ironvipers_api
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - db
    volumes:
      - ./backend:/app

  db:
    image: postgres:16
    container_name: ironvipers_db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: iron_vipers_db
      POSTGRES_USER: ironvipers
      POSTGRES_PASSWORD: ironvipers_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: ironvipers_pgadmin
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@ironvipers.com
      PGADMIN_DEFAULT_PASSWORD: admin
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 18. Prioridad exacta de construcción

El agente debe construir el proyecto en este orden:

```txt
1. Crear estructura base del proyecto
2. Configurar backend FastAPI
3. Configurar PostgreSQL
4. Configurar SQLAlchemy
5. Configurar Alembic
6. Crear módulo auth
7. Crear módulo users
8. Crear módulo clients
9. Crear módulo motorcycles
10. Crear módulo service_orders
11. Crear estados de orden
12. Crear módulo photos
13. Crear módulo parts
14. Crear módulo payments
15. Crear módulo dashboard
16. Crear frontend base
17. Conectar frontend con API
18. Implementar deploy
19. Agregar reportes
20. Preparar facturación
21. Preparar IA
```

---

## 19. Reglas para el agente de desarrollo

El agente debe seguir estas reglas:

```txt
- No crear todo en main.py.
- No mezclar lógica de negocio con rutas.
- No construir dashboard antes del CRUD principal.
- No implementar IA antes de tener datos reales.
- No implementar facturación en el MVP.
- No guardar imágenes en base de datos.
- No usar SQLite si el deploy final usará PostgreSQL.
- No hardcodear credenciales.
- No eliminar registros críticos si pueden desactivarse.
- No crear microservicios al inicio.
```

---

## 20. Definition of Done del MVP

El MVP se considera terminado cuando:

```txt
- Un usuario admin puede iniciar sesión.
- El admin puede crear clientes.
- El admin puede registrar motos.
- El admin puede crear órdenes de servicio.
- Una orden puede cambiar de estado.
- Se pueden subir fotos asociadas a una orden.
- Se pueden registrar piezas usadas.
- Se pueden registrar pagos.
- El dashboard muestra métricas básicas.
- El backend está documentado en Swagger.
- El frontend consume la API.
- El proyecto puede correr localmente con Docker.
```

---

## 21. Resumen ejecutivo

Iron Vipers debe construirse como un gestor de taller mecánico especializado en motocicletas, usando una arquitectura de monolito modular con FastAPI, PostgreSQL y React.

El sistema debe iniciar con el flujo operativo básico: clientes, motos, órdenes, fotos, piezas y pagos. Después puede crecer hacia administración avanzada, facturación, portal de cliente e inteligencia artificial.

La prioridad no es construir muchas funciones, sino construir un núcleo limpio, escalable y entendible.

La entidad más importante del sistema es:

```txt
service_orders
```

Todo el diseño debe proteger y enriquecer el ciclo de vida de una orden de servicio.
