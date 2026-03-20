# 📊 Esquema de Base de Datos - App Taller

Este documento describe todas las tablas de Supabase utilizadas por la aplicación **App Taller**, incluyendo sus columnas, tipos de datos y propósito.

---

## 📋 Resumen de Tablas

| Tabla | Propósito | Propiedad |
|-------|-----------|-----------|
| `daily_vehicle_km` | Kilometraje actual de los vehículos | **App Ruta** (Solo lectura) |
| `fleet_legal_status` | Estado legal y fechas de caducidad | **App Taller** |
| `maintenance_logs` | Registro de intervenciones de taller | **App Taller** |
| `intervention_types` | Catálogo de tipos de intervención | **App Taller** |
| `user_fcm_tokens` | Tokens de Firebase para notificaciones push | **App Taller** |
| `notification_logs` | Registro de alertas enviadas para evitar duplicados | **App Taller** |

---

## 1️⃣ `daily_vehicle_km` (Solo Lectura)

> ⚠️ **IMPORTANTE**: Esta tabla pertenece a **App Ruta**. App Taller solo tiene permisos de LECTURA. No modificar su estructura.

### Propósito
Almacena el kilometraje actual de cada vehículo de la flota. Se actualiza automáticamente desde la aplicación de rutas.

### Columnas

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `UUID` | NO | Identificador único (Primary Key) |
| `plate` | `TEXT` | NO | Matrícula del vehículo (ej: "1234ABC") |
| `current_km` | `INTEGER` | NO | Kilometraje actual del vehículo |
| `last_update` | `TIMESTAMPTZ` | NO | Fecha/hora de la última actualización |

### Ejemplo de Datos
```
| id                                   | plate    | current_km | last_update          |
|--------------------------------------|----------|------------|----------------------|
| a1b2c3d4-e5f6-7890-abcd-ef1234567890 | 1234ABC  | 245000     | 2026-01-25T10:30:00Z |
| b2c3d4e5-f6a7-8901-bcde-f12345678901 | 5678DEF  | 180500     | 2026-01-25T09:15:00Z |
```

---

## 2️⃣ `fleet_legal_status`

### Propósito
Almacena las fechas de caducidad de documentos legales y el próximo cambio de aceite. Es la fuente de datos para los **semáforos del Dashboard**.

### Columnas

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `plate` | `TEXT` | NO | Matrícula del vehículo (**Primary Key**) |
| `next_itv_date` | `DATE` | SÍ | Próxima fecha de ITV |
| `next_tacho_date` | `DATE` | SÍ | Próxima revisión del tacógrafo |
| `next_atp_date` | `DATE` | SÍ | Próxima revisión ATP/Frigo |
| `next_oil_change_km` | `INTEGER` | SÍ | Kilómetros para el próximo cambio de aceite |
| `updated_at` | `TIMESTAMPTZ` | NO | Última actualización del registro |

### Relación con otras tablas
- Se vincula con `daily_vehicle_km` a través del campo `plate`.

### Lógica de Semáforos
- **Verde**: Más de 30 días hasta la fecha (o más de 10.000 km para aceite)
- **Amarillo**: Entre 15 y 30 días (o entre 5.000 y 10.000 km)
- **Rojo**: Menos de 15 días o caducado (o menos de 5.000 km)

### SQL para crear la columna de aceite (si no existe)
```sql
ALTER TABLE fleet_legal_status ADD COLUMN next_oil_change_km INTEGER;
```

### Ejemplo de Datos
```
| plate   | next_itv_date | next_tacho_date | next_atp_date | next_oil_change_km |
|---------|---------------|-----------------|---------------|--------------------|
| 1234ABC | 2026-06-15    | 2026-03-20      | 2026-12-01    | 285000             |
| 5678DEF | 2026-02-28    | 2026-04-10      | NULL          | 220500             |
```

---

## 3️⃣ `maintenance_logs`

### Propósito
Registro histórico de todas las intervenciones de mantenimiento realizadas en el taller. Es el "libro de vida" del vehículo.

### Columnas

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `UUID` | NO | Identificador único (**Primary Key**) |
| `plate` | `TEXT` | NO | Matrícula del vehículo |
| `user_id` | `UUID` | NO | ID del usuario que registró la intervención |
| `created_at` | `TIMESTAMPTZ` | NO | Fecha/hora del registro |
| `km_at_service` | `INTEGER` | NO | Kilometraje en el momento de la intervención |
| `category` | `ENUM` | NO | `maintenance_category`: `MECANICA`, `NEUMATICOS`, `LEGAL`, `FRIGO`, `ACCIDENTE` |
| `intervention_type_id` | `INTEGER` | SÍ | ID del tipo de intervención (FK a `intervention_types`) |
| `description` | `TEXT` | NO | Notas o descripción de la intervención |
| `attachment_url` | `TEXT` | SÍ | URL de la foto adjunta (albarán, factura) |
| `tire_position` | `TEXT` | SÍ | Posiciones de neumáticos afectados (ej: "front_left,front_right") |

### Valores válidos para `category`
```
MECANICA    - Averías mecánicas, aceite, filtros
NEUMATICOS  - Cambio de ruedas, rotación, pinchazos
LEGAL       - ITV, tacógrafo
FRIGO       - Equipo de frío, ATP
ACCIDENTE   - Siniestros
```

### Valores válidos para `tire_position`
```
front_left       - Delantera izquierda
front_right      - Delantera derecha
rear_left_inner  - Trasera izquierda interior
rear_left_outer  - Trasera izquierda exterior
rear_right_inner - Trasera derecha interior
rear_right_outer - Trasera derecha exterior
```

### Ejemplo de Datos
```
| id   | plate   | km_at_service | category   | description         | tire_position              |
|------|---------|---------------|------------|---------------------|----------------------------|
| ...  | 1234ABC | 245000        | MECANICA   | Aceite y filtros    | NULL                       |
| ...  | 1234ABC | 244500        | NEUMATICOS | Cambio eje trasero  | rear_left_outer,rear_right_outer |
| ...  | 5678DEF | 180000        | LEGAL      | ITV favorable       | NULL                       |
```

---

## 4️⃣ `intervention_types`

### Propósito
Catálogo dinámico de tipos de intervención. Los usuarios pueden crear nuevos tipos escribiendo en el campo de texto, y el sistema los guarda automáticamente para futuras sugerencias.

### Columnas

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `INTEGER` | NO | Identificador único (**Primary Key**, autoincremental) |
| `category` | `TEXT` | NO | Categoría a la que pertenece |
| `name` | `TEXT` | NO | Nombre del tipo de intervención |
| `is_default` | `BOOLEAN` | NO | `true` si es un tipo predefinido, `false` si lo creó el usuario |

### Tipos predefinidos sugeridos
```sql
INSERT INTO intervention_types (category, name, is_default) VALUES
-- MECANICA
('MECANICA', 'Aceite y Filtros', true),
('MECANICA', 'Frenos', true),
('MECANICA', 'Embrague', true),
('MECANICA', 'Batería', true),
('MECANICA', 'Escape', true),
-- NEUMATICOS
('NEUMATICOS', 'Cambio de rueda', true),
('NEUMATICOS', 'Rotación', true),
('NEUMATICOS', 'Reparación pinchazo', true),
-- LEGAL
('LEGAL', 'ITV', true),
('LEGAL', 'Tacógrafo', true),
('LEGAL', 'CAP', true),
-- FRIGO
('FRIGO', 'Revisión ATP', true),
('FRIGO', 'Carga de gas', true),
('FRIGO', 'Compresor', true);
```

### Ejemplo de Datos
```
| id | category   | name              | is_default |
|----|------------|-------------------|------------|
| 1  | MECANICA   | Aceite y Filtros  | true       |
| 2  | MECANICA   | Frenos            | true       |
| 3  | NEUMATICOS | Cambio            | true       |
| 4  | MECANICA   | Correa alternador | false      | <- Creado por usuario

---

## 5️⃣ `user_fcm_tokens`

### Propósito
Almacena los tokens de Firebase Cloud Messaging (FCM) de los usuarios para permitir el envío de notificaciones push a sus dispositivos.

### Columnas

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `UUID` | NO | Identificador único (**PK**) |
| `user_id` | `UUID` | NO | ID del usuario (FK a `auth.users`) |
| `token` | `TEXT` | NO | Token de FCM único |
| `device_type` | `VARCHAR` | SÍ | Tipo de dispositivo: `android`, `ios`, `web` |
| `last_seen` | `TIMESTAMPTZ`| NO | Última vez que se usó este token |
| `created_at` | `TIMESTAMPTZ`| NO | Fecha de registro |

---

## 6️⃣ `notification_logs`

### Propósito
Registro de las notificaciones enviadas a los conductores/taller. Se utiliza principalmente para evitar el envío de alertas duplicadas para el mismo evento de caducidad.

### Columnas

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `UUID` | NO | Identificador único (**PK**) |
| `plate` | `TEXT` | NO | Matrícula del vehículo (FK a `fleet_legal_status`) |
| `alert_type` | `VARCHAR` | NO | Tipo de alerta: `ITV`, `TACHO`, `ATP`, `OIL` |
| `expiry_date` | `DATE` | NO | Fecha de caducidad que disparó esta alerta |
| `sent_at` | `TIMESTAMPTZ`| NO | Fecha/hora del envío |

---```

---

## 🔗 Diagrama de Relaciones

```
┌─────────────────────────┐
│   daily_vehicle_km      │  (App Ruta - Solo Lectura)
│   ─────────────────     │
│   plate (PK)            │
│   current_km            │
│   last_update           │
└───────────┬─────────────┘
            │
            │ plate
            ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│   fleet_legal_status    │       │   notification_logs     │
│   ─────────────────     │       │   ─────────────────     │
│   plate (PK, FK)        │◄──────┤   plate (FK)            │
│   next_itv_date         │       │   alert_type            │
│   next_tacho_date       │       │   expiry_date           │
│   next_atp_date         │       └─────────────────────────┘
│   next_oil_change_km    │
└───────────┬─────────────┘
            │
            │ plate
            ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│   maintenance_logs      │       │   intervention_types    │
│   ─────────────────     │       │   ─────────────────     │
│   id (PK)               │◄──────│   id (PK)               │
│   plate (FK)            │       │   category              │
│   intervention_type_id  │───────│   name                  │
│   category (ENUM)       │       │   is_default            │
│   km_at_service         │       └─────────────────────────┘
│   description           │
└─────────────────────────┘

┌─────────────────────────┐
│   user_fcm_tokens       │
│   ─────────────────     │
│   user_id (FK)          │
│   token                 │
└─────────────────────────┘
```

---

## 🛠️ Scripts SQL de Creación

### fleet_legal_status
```sql
CREATE TABLE fleet_legal_status (
    plate TEXT PRIMARY KEY,
    next_itv_date DATE,
    next_tacho_date DATE,
    next_atp_date DATE,
    next_oil_change_km INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### maintenance_logs
```sql
-- Requiere ENUM maintenance_category
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    km_at_service INTEGER NOT NULL,
    category maintenance_category NOT NULL,
    intervention_type_id INTEGER REFERENCES intervention_types(id),
    description TEXT NOT NULL DEFAULT '',
    attachment_url TEXT,
    tire_position TEXT
);
```

### intervention_types
```sql
CREATE TABLE intervention_types (
    id SERIAL PRIMARY KEY,
    category maintenance_category NOT NULL,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, name)
);
```

### user_fcm_tokens
```sql
CREATE TABLE user_fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type VARCHAR(50),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);
```

### notification_logs
```sql
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate TEXT REFERENCES fleet_legal_status(plate),
    alert_type VARCHAR(50),
    expiry_date DATE,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📝 Notas Importantes

1. **Permisos RLS**: Asegúrate de configurar Row Level Security en Supabase para que los usuarios solo puedan ver/editar sus propios registros.

2. **Índices recomendados**:
   ```sql
   CREATE INDEX idx_maintenance_logs_plate ON maintenance_logs(plate);
   CREATE INDEX idx_maintenance_logs_created_at ON maintenance_logs(created_at DESC);
   ```

3. **Lógica de Aceite**: Cuando se registra una intervención en `MECANICA` que contiene la palabra "aceite", el sistema automáticamente calcula `next_oil_change_km = km_at_service + 40000`.

---

*Documento actualizado el 20 de marzo de 2026 - App Taller v4.0*
