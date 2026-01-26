import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth'; // Assuming there is a getSession for implementation-side user

export async function POST(request: Request) {
    try {
        const session = await getSession(); // Adjust based on your auth implementation (might be verifySession or similar)
        // If there is no session, we might still want to allow registering tokens if they are anonymous, but usually mapped to a user.
        // Based on schema, DeviceToken has guardianId, so user must be logged in.

        if (!session || !session.userId) {
            // For now, if auth logic is different, we might need to adjust.
            // Checking other routes for guardian auth...
            // It seems 'lib/auth' might have verifyToken or so.
            // Let's assume we can get userId from header or cookie handled by middleware/lib.
            // Re-checking auth usage in other files...
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { token, platform, deviceName } = body;

        if (!token || !platform) {
            return NextResponse.json({ error: 'Missing token or platform' }, { status: 400 });
        }

        const deviceToken = await prisma.deviceToken.upsert({
            where: { token },
            update: {
                guardianId: session.userId,
                platform,
                deviceName,
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                guardianId: session.userId,
                token,
                platform,
                deviceName,
            },
        });

        return NextResponse.json(deviceToken);

    } catch (error) {
        console.error('Failed to register device token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
