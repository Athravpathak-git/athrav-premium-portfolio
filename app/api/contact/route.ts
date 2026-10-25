import { NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validation/schemas';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { createContactMessage } from '@/lib/data-service';
import { sendEmailNotification } from '@/lib/email';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`contact:${ip}`, 5, 900); // 5 submissions per 15 min

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many submissions. Please wait ${rateLimit.resetSeconds} seconds before sending another message.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Check honeypot anti-spam trap
    if (body.honeypot && String(body.honeypot).trim() !== '') {
      // Silently succeed to trick bots without saving
      return NextResponse.json({
        success: true,
        message: 'Your inquiry has been received.',
      });
    }

    const validation = contactFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    const savedMessage = await createContactMessage({
      name,
      email,
      subject,
      message,
      ipAddress: ip,
    });

    // Dispatch simulated/real email notification to portfolio owner
    await sendEmailNotification({
      to: process.env.ADMIN_NOTIFICATION_EMAIL || 'athravpathak07@gmail.com',
      subject: `[Portfolio Contact] ${subject} from ${name}`,
      html: `
        <h2>New Portfolio Contact Message</h2>
        <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f4f4f5; padding: 12px; border-radius: 6px;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      `,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    });

    await logAuditEvent({
      action: 'CONTACT_SUBMISSION',
      entityType: 'ContactMessage',
      entityId: savedMessage.id,
      req,
      metadata: { senderEmail: email, subject },
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been securely submitted. Athrav will review it shortly.',
      id: savedMessage.id,
    });
  } catch (err) {
    console.error('[API Contact Error]:', err);
    return NextResponse.json(
      { error: 'An unexpected transmission error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
