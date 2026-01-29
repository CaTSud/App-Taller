
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library'
import serviceAccount from './service-account.json' with { type: 'json' }

// Configuration
const PRE_NOTIFICATION_DAYS = 7;

Deno.serve(async (req) => {
    try {
        // 1. Initialize Supabase Client (Service Role for admin access)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Calculate target date (Today + 7 days)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + PRE_NOTIFICATION_DAYS);
        const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`Checking alerts for date: ${targetDateStr}`);

        // 3. Query expiry dates from fleet_legal_status
        // We check ITV, Tacho, and ATP
        const { data: vehicles, error: dbError } = await supabase
            .from('fleet_legal_status')
            .select('plate, next_itv_date, next_tacho_date, next_atp_date');

        if (dbError) throw dbError;

        const alertsToSend = [];

        // 4. Identify vehicles needing alerts
        for (const vehicle of vehicles || []) {
            if (vehicle.next_itv_date === targetDateStr) {
                alertsToSend.push({ plate: vehicle.plate, type: 'ITV', date: vehicle.next_itv_date });
            }
            if (vehicle.next_tacho_date === targetDateStr) {
                alertsToSend.push({ plate: vehicle.plate, type: 'TACHO', date: vehicle.next_tacho_date });
            }
            if (vehicle.next_atp_date === targetDateStr) {
                alertsToSend.push({ plate: vehicle.plate, type: 'ATP', date: vehicle.next_atp_date });
            }
        }

        if (alertsToSend.length === 0) {
            return new Response(JSON.stringify({ message: 'No alerts found for today' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. Filter out already sent alerts
        const finalAlerts = [];
        for (const alert of alertsToSend) {
            const { data: existing } = await supabase
                .from('notification_logs')
                .select('*')
                .eq('plate', alert.plate)
                .eq('alert_type', alert.type)
                .eq('expiry_date', alert.date)
                .single();

            if (!existing) {
                finalAlerts.push(alert);
            }
        }

        console.log(`Found ${finalAlerts.length} new alerts to send.`);

        if (finalAlerts.length === 0) {
            return new Response(JSON.stringify({ message: 'All found alerts were already sent' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 6. Get Access Token for FCM V1 API
        const accessToken = await getAccessToken();

        // 7. Get all user tokens
        const { data: userTokens } = await supabase.from('user_fcm_tokens').select('token');
        if (!userTokens || userTokens.length === 0) {
            console.log('No devices registered to receive notifications.');
            return new Response(JSON.stringify({ message: 'No devices registered' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 8. Send Notifications
        const results = [];
        for (const alert of finalAlerts) {
            const message = {
                notification: {
                    title: `⚠️ Mantenimiento Próximo: ${alert.plate}`,
                    body: `El vencimiento de ${alert.type} es el ${alert.date} (en 7 días).`
                },
                data: {
                    plate: alert.plate,
                    type: alert.type
                }
            };

            // Send to all tokens (fan-out)
            // In production, consider using Topic Messaging 'all_drivers' instead of iterating tokens
            const promises = userTokens.map(t =>
                sendFcmMessage(accessToken, t.token, message)
            );

            await Promise.all(promises);

            // Log success
            await supabase.from('notification_logs').insert({
                plate: alert.plate,
                alert_type: alert.type,
                expiry_date: alert.date
            });

            results.push(alert);
        }

        return new Response(JSON.stringify({ sent: results }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});


// Helper: Get Google Access Token
async function getAccessToken() {
    const client = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const { token } = await client.getAccessToken();
    return token;
}

// Helper: Send FCM Message
interface FcmMessage {
    notification?: {
        title: string;
        body: string;
    };
    data?: Record<string, string>;
}

async function sendFcmMessage(accessToken: string, deviceToken: string, message: FcmMessage) {
    const projectId = serviceAccount.project_id;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const payload = {
        message: {
            token: deviceToken,
            ...message
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    return res.json();
}
