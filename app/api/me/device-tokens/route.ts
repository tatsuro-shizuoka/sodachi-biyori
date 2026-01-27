import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGuardianSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getGuardianSession();

        if (!session || !session.id) {
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
                guardianId: session.id as string,
                platform,
                deviceName,
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                guardianId: session.id as string,
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
