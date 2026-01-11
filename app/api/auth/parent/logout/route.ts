import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = await cookies()

    // Remove parent session cookies
    cookieStore.delete('parent_session')
    cookieStore.delete('guardianSession')

    return NextResponse.json({ success: true })
}
