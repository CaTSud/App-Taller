// CONFIGURACION - MODIFICA ESTOS VALORES
var SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
var SUPABASE_KEY = "TU_ANON_KEY_AQUI";
var SHEET_NAME = "Camions";

// Indices de columnas (empezando desde 0)
var COL_MATRICULA = 1;
var COL_ITV = 7;
var COL_TACO = 8;

function syncToSupabase() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var successCount = 0;
    var errorCount = 0;

    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var matricula = row[COL_MATRICULA];

        if (!matricula || matricula.toString().trim() === "") continue;

        var itvDate = formatDateToSpanish(row[COL_ITV]);
        var tacoDate = formatDateToSpanish(row[COL_TACO]);

        if (!itvDate && !tacoDate) continue;

        var result = upsertToSupabase(matricula, itvDate, tacoDate);

        if (result.success) {
            successCount++;
        } else {
            errorCount++;
        }
    }

    SpreadsheetApp.getUi().alert("Sincronizacion completada. Actualizados: " + successCount + ", Errores: " + errorCount);
}

function formatDateToSpanish(cellValue) {
    if (!cellValue) return null;

    if (cellValue instanceof Date) {
        var day = cellValue.getDate();
        var month = cellValue.getMonth() + 1;
        var year = cellValue.getFullYear();
        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;
        return day + "/" + month + "/" + year;
    }

    if (typeof cellValue === "string") {
        return cellValue;
    }

    return null;
}

function upsertToSupabase(plate, itvDate, tacoDate) {
    var url = SUPABASE_URL + "/rest/v1/fleet_legal_status";

    var payload = {
        "plate": plate.toString().trim(),
        "next_itv_date": itvDate,
        "next_tacho_date": tacoDate
    };

    var options = {
        "method": "POST",
        "headers": {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
        var code = response.getResponseCode();
        if (code >= 200 && code < 300) {
            return { "success": true };
        } else {
            return { "success": false, "error": response.getContentText() };
        }
    } catch (e) {
        return { "success": false, "error": e.toString() };
    }
}

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("App Taller")
        .addItem("Sincronizar con Supabase", "syncToSupabase")
        .addItem("Activar sync automatica", "setupAutoSync")
        .addItem("Desactivar sync automatica", "removeAutoSync")
        .addToUi();
}

function setupAutoSync() {
    removeAutoSync();
    ScriptApp.newTrigger("syncToSupabase")
        .timeBased()
        .everyHours(1)
        .create();
    SpreadsheetApp.getUi().alert("Sincronizacion automatica activada (cada hora)");
}

function removeAutoSync() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === "syncToSupabase") {
            ScriptApp.deleteTrigger(triggers[i]);
        }
    }
}
