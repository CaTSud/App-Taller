import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // Also skip virtual VM addresses if possible (usually they are not in the main subnet)
            if (net.family === 'IPv4' && !net.internal) {
                // Return common home network ranges
                if (net.address.startsWith('192.168.') || net.address.startsWith('10.') || net.address.startsWith('172.16.')) {
                    return net.address;
                }
            }
        }
    }
    return '0.0.0.0';
}

const ip = getLocalIP();
const configPath = join(process.cwd(), 'next.config.ts');

try {
    let content = readFileSync(configPath, 'utf8');

    // Replace allowedDevOrigins IP
    const regex = /allowedDevOrigins: \[".*?"\]/;
    const replacement = `allowedDevOrigins: ["${ip}:3000"]`;

    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        writeFileSync(configPath, content);
        console.log(`\x1b[32m[IP UPDATE]\x1b[0m Versión móvil lista en: \x1b[36mhttp://${ip}:3000\x1b[0m`);
    } else {
        console.warn('\x1b[33m[IP UPDATE]\x1b[0m No se encontró allowedDevOrigins en next.config.ts. Por favor, añádelo manualmente.');
    }
} catch (error) {
    console.error('\x1b[31m[IP UPDATE]\x1b[0m Error al actualizar next.config.ts:', error.message);
}
