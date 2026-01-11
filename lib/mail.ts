import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendEmailParams {
    to: string | string[]
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    if (!resend) {
        console.warn('RESEND_API_KEY not configured. Email will not be sent.')
        return { success: false, error: 'Email not configured' }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: '育ち日和 <noreply@resend.dev>', // Use your verified domain in production
            to: Array.isArray(to) ? to : [to],
            subject,
            html
        })

        if (error) {
            console.error('Email send error:', error)
            return { success: false, error: error.message }
        }

        console.log('Email sent successfully:', data?.id)
        return { success: true, id: data?.id }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error: 'Failed to send email' }
    }
}

export function buildNewVideoNotificationEmail(videoTitle: string, className: string, schoolName: string) {
    return {
        subject: `【育ち日和】${className}に新しい動画が公開されました`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 24px 0 8px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .video-card { background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 12px; padding: 24px; color: white; text-align: center; margin: 24px 0; }
        .video-title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
        .video-class { opacity: 0.9; font-size: 14px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 24px; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎬 育ち日和</div>
        </div>
        
        <h1 class="title">新しい動画が公開されました！</h1>
        <p class="subtitle">${schoolName} - ${className}</p>
        
        <div class="video-card">
            <div class="video-title">${videoTitle}</div>
            <div class="video-class">${className}</div>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery" class="button">
                動画を見る
            </a>
        </div>
        
        <p class="footer">
            このメールは育ち日和の通知設定に基づいて送信されています。<br>
            設定画面から通知をオフにすることができます。
        </p>
    </div>
</body>
</html>
        `.trim()
    }
}
