export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  simulated: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmailNotification(options: SendEmailOptions): Promise<SendEmailResult> {
  const provider = process.env.EMAIL_PROVIDER || 'mock';

  if (provider === 'mock') {
    // Development simulated logger
    console.log('\n======================================================');
    console.log('[EMAIL NOTIFICATION DISPATCHED — SIMULATED / DEV MODE]');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html}`);
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}`,
    };
  }

  // Future provider integration hook (Resend, SMTP, etc.)
  // When owner configures RESEND_API_KEY or SMTP credentials, wire provider here.
  return {
    success: false,
    simulated: false,
    error: `Configured email provider "${provider}" requires external API credentials that are not yet set.`,
  };
}
