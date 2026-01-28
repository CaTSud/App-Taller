import { updateSession } from '@/lib/supabase/proxy';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA manifest)
         * - robots.txt
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         */
        "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
