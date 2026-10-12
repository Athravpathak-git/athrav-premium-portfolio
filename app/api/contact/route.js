import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { checkRateLimit } from '@/lib/rate-limiter.js';
import { getClientIp } from '@/lib/session.js';
import { contactSchema } from '@/lib/validation.js';

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const rateLimitKey = `contact:ip:${ip}`;

    // Rate limit: max 5 messages per 60 minutes (3600s)
    const rateLimit = await checkRateLimit(rateLimitKey, 5, 3600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You have submitted several messages recently. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid form input.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, subject, message, honeypot } = parseResult.data;

    // Honeypot anti-spam verification: bots automatically fill hidden inputs
    if (honeypot && honeypot.length > 0) {
      // Silently return success to mislead the spam bot without saving
      return NextResponse.json({
        success: true,
        message: 'Your message has been safely received. Athrav will get back to you soon.',
      });
    }

    // Hash or mask IP for visitor privacy compliance
    const maskedIp = ip.replace(/\.\d+$/, '.xxx');

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: maskedIp,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been safely received. Athrav will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Unable to deliver message at this time. Please try again later.' },
      { status: 500 }
    );
  }
}
