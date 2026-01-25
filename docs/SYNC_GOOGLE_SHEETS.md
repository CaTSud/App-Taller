# 🔄 Sincronización Google Sheets → Supabase

Este documento explica cómo configurar la sincronización automática de fechas de ITV y Tacógrafo desde Google Sheets hacia la base de datos de Supabase.

---

## 📋 Resumen

| Origen | Destino |
|--------|---------|
| Google Sheets (Hoja "Camions") | Supabase (`fleet_legal_status`) |
| Columna `MATRÍCULA` | Campo `plate` |
| Columna `ITV` | Campo `next_itv_date` |
| Columna `REVISIÓ TACO` | Campo `next_tacho_date` |

**Formato de fechas**: `DD/MM/YYYY` (ejemplo: `04/08/2026`)

---

## 🛠️ Paso 1: Preparar Supabase

Primero, necesitas cambiar el tipo de las columnas de fecha de `DATE` a `TEXT` para que acepten el formato español. Ejecuta este SQL en tu Supabase:

```sql
-- Cambiar columnas de DATE a TEXT para formato español
ALTER TABLE fleet_legal_status 
  ALTER COLUMN next_itv_date TYPE TEXT,
  ALTER COLUMN next_tacho_date TYPE TEXT;
```

---

## 🔑 Paso 2: Obtener credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Haz clic en **Settings** → **API**
3. Copia estos dos valores:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📝 Paso 3: Instalar el Script en Google Sheets

### 3.1 Abrir el Editor de Scripts
1. Abre tu hoja de Google Sheets
2. Ve a **Extensiones** → **Apps Script**
3. Borra todo el código que haya y pega el siguiente:

```javascript
// =============================================
// CONFIGURACIÓN - MODIFICA ESTOS VALORES
// =============================================
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU_ANON_KEY_AQUI';
const SHEET_NAME = 'Camions';

// Índices de columnas (empezando desde 0)
const COL_MATRICULA = 1;    // Columna B = MATRÍCULA
const COL_ITV = 7;          // Columna H = ITV
const COL_TACO = 8;         // Columna I = REVISIÓ TACO

// =============================================
// FUNCIONES PRINCIPALES
// =============================================

/**
 * Sincroniza todas las fechas de ITV y Tacógrafo con Supabase
 * Ejecutar manualmente o programar con un trigger
 */
function syncToSupabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Saltar la fila de cabecera (fila 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const matricula = row[COL_MATRICULA];
    
    // Saltar filas vacías
    if (!matricula || matricula.toString().trim() === '') continue;
    
    const itvDate = formatDateToSpanish(row[COL_ITV]);
    const tacoDate = formatDateToSpanish(row[COL_TACO]);
    
    // Solo sincronizar si hay al menos una fecha
    if (!itvDate && !tacoDate) continue;
    
    const result = upsertToSupabase(matricula, itvDate, tacoDate);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push(`${matricula}: ${result.error}`);
    }
  }
  
  // Mostrar resumen
  const message = `✅ Sincronización completada\n\n` +
                  `Actualizados: ${successCount}\n` +
                  `Errores: ${errorCount}` +
                  (errors.length > 0 ? `\n\nDetalles:\n${errors.join('\n')}` : '');
  
  SpreadsheetApp.getUi().alert(message);
  Logger.log(message);
}

/**
 * Convierte una fecha de Sheets al formato D/M/YYYY
 */
function formatDateToSpanish(cellValue) {
  if (!cellValue) return null;
  
  // Si ya es un string con formato correcto, devolverlo
  if (typeof cellValue === 'string' && cellValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return cellValue;
  }
  
  // Si es un objeto Date, formatearlo
  if (cellValue instanceof Date) {
    const day = cellValue.getDate();
    const month = cellValue.getMonth() + 1;
    const year = cellValue.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // Intentar parsear como fecha
  try {
    const date = new Date(cellValue);
    if (!isNaN(date.getTime())) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // No es una fecha válida
  }
  
  return null;
}

/**
 * Inserta o actualiza un registro en Supabase
 */
function upsertToSupabase(plate, itvDate, tacoDate) {
  const url = `${SUPABASE_URL}/rest/v1/fleet_legal_status`;
  
  const payload = {
    plate: plate.toString().trim(),
    next_itv_date: itvDate,
    next_tacho_date: tacoDate,
    updated_at: new Date().toISOString()
  };
  
  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    
    if (code >= 200 && code < 300) {
      return { success: true };
    } else {
      return { success: false, error: response.getContentText() };
    }
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// =============================================
// MENÚ PERSONALIZADO
// =============================================

/**
 * Añade un menú personalizado a la hoja de cálculo
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚛 App Taller')
    .addItem('📤 Sincronizar con Supabase', 'syncToSupabase')
    .addItem('⏰ Configurar sincronización automática', 'setupAutoSync')
    .addItem('❌ Desactivar sincronización automática', 'removeAutoSync')
    .addToUi();
}

/**
 * Configura un trigger para sincronizar automáticamente cada hora
 */
function setupAutoSync() {
  // Eliminar triggers existentes primero
  removeAutoSync();
  
  // Crear nuevo trigger cada hora
  ScriptApp.newTrigger('syncToSupabase')
    .timeBased()
    .everyHours(1)
    .create();
  
  SpreadsheetApp.getUi().alert(
    '⏰ Sincronización automática activada\n\n' +
    'Los datos se sincronizarán con Supabase cada hora automáticamente.\n\n' +
    'También puedes sincronizar manualmente desde el menú "App Taller".'
  );
}

/**
 * Elimina todos los triggers de sincronización
 */
function removeAutoSync() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncToSupabase') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  SpreadsheetApp.getUi().alert('❌ Sincronización automática desactivada');
}
```

### 3.2 Configurar las credenciales
En las primeras líneas del script, reemplaza:
```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU_ANON_KEY_AQUI';
```

Con tus valores reales de Supabase.

### 3.3 Guardar y autorizar
1. Haz clic en **Guardar** (💾)
2. Haz clic en **Ejecutar** → selecciona `onOpen`
3. Google te pedirá autorización. Haz clic en **Revisar permisos** → **Avanzado** → **Ir a (nombre del proyecto)** → **Permitir**

---

## ▶️ Paso 4: Usar la sincronización

### Sincronización Manual
1. Recarga la hoja de Google Sheets
2. Verás un nuevo menú: **🚛 App Taller**
3. Haz clic en **📤 Sincronizar con Supabase**
4. Espera el mensaje de confirmación

### Sincronización Automática
1. Ve al menú **🚛 App Taller**
2. Haz clic en **⏰ Configurar sincronización automática**
3. Los datos se sincronizarán cada hora automáticamente

---

## ✅ Verificación

Para comprobar que funciona:

1. Cambia una fecha de ITV en Sheets (por ejemplo, cámbiala a `1/1/2030`)
2. Ejecuta la sincronización manual
3. Ve a Supabase → Table Editor → `fleet_legal_status`
4. Busca la matrícula modificada y verifica que la fecha ha cambiado

---

## 🔧 Solución de Problemas

### Error: "Could not find function onOpen"
Ejecuta la función `onOpen` manualmente desde el editor de scripts.

### Error: "401 Unauthorized"
Verifica que has copiado correctamente la `anon key` de Supabase (no la `service_role key`).

### Las fechas no se actualizan
Verifica que los índices de columna son correctos (COL_MATRICULA, COL_ITV, COL_TACO). Cuenta desde 0.

### Error: "Column next_itv_date type mismatch"
Ejecuta el SQL del Paso 1 para cambiar el tipo de columna a TEXT.

---

## 📊 Mapeo de Columnas

```
Hoja "Camions":
┌───┬───────────┬───────────┬─────┬─────┬──────────────┬─────────────┬────────────┬──────────────┬...
│ A │     B     │     C     │  D  │  E  │      F       │      G      │     H      │      I       │
├───┼───────────┼───────────┼─────┼─────┼──────────────┼─────────────┼────────────┼──────────────┤
│Id │ MATRÍCULA │CARGA UTIL │ PMA │ ... │ Matriculació │     ITV     │ REVISIÓ    │ FITXA        │
│   │           │           │     │     │              │             │    TACO    │   TECNICA    │
└───┴───────────┴───────────┴─────┴─────┴──────────────┴─────────────┴────────────┴──────────────┘
     ↓ COL_MATRICULA = 1                                ↓ COL_ITV = 7  ↓ COL_TACO = 8
```

---

*Documento creado el 25 de enero de 2026 - App Taller v4.0*
