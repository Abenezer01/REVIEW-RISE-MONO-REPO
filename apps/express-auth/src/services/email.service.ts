/**
 * Email Service
 * 
 * This is a mock email service for development.
 * In production, replace this with a real email provider (nodemailer, SendGrid, AWS SES, etc.)
 */

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Mock email sender - logs to console instead of sending real emails
 * Replace this function with real email sending logic when ready
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
    console.log('\n📧 ===== EMAIL SENT =====');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:');
    console.log(options.html);
    console.log('========================\n');

    // Simulate async email sending
    return Promise.resolve();
};

/**
 * Send verification email with token
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .token { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <div class="token">${verificationUrl}</div>
                    
                    <p>This verification link will expire in 24 hours.</p>
                    
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendEmail({
        to: email,
        subject: 'Verify Your Email Address',
        html
    });
};

/**
 * TODO: When ready to use a real email provider, replace the sendEmail function above.
 * 
 * Example with nodemailer:
 * 
 * import nodemailer from 'nodemailer';
 * 
 * const transporter = nodemailer.createTransport({
 *     host: process.env.SMTP_HOST,
 *     port: parseInt(process.env.SMTP_PORT || '587'),
 *     secure: false,
 *     auth: {
 *         user: process.env.SMTP_USER,
 *         pass: process.env.SMTP_PASS,
 *     },
 * });
 * 
 * const sendEmail = async (options: EmailOptions): Promise<void> => {
 *     await transporter.sendMail({
 *         from: process.env.EMAIL_FROM,
 *         to: options.to,
 *         subject: options.subject,
 *         html: options.html,
 *     });
 * };
 */
