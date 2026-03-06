import tls from 'node:tls';
import os from 'node:os';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || 'no-reply@reviewrise.local';
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || '15000');

const hasSmtpConfig = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const encodeB64 = (value: string): string => Buffer.from(value, 'utf8').toString('base64');

const extractAddress = (value: string): string => {
    const match = value.match(/<([^>]+)>/);
    return match?.[1] || value;
};

const escapeSmtpData = (value: string): string =>
    value
        .replace(/\r?\n/g, '\r\n')
        .replace(/^\./gm, '..');

const sendSmtpEmail = async (options: EmailOptions): Promise<void> => {
    const socket = tls.connect({
        host: SMTP_HOST,
        port: SMTP_PORT,
        servername: SMTP_HOST
    });

    socket.setEncoding('utf8');
    socket.setTimeout(SMTP_TIMEOUT_MS);

    let buffer = '';
    let settled = false;
    let waiter: ((line: string) => void) | null = null;

    const cleanup = () => {
        socket.removeAllListeners('data');
        socket.removeAllListeners('error');
        socket.removeAllListeners('timeout');
    };

    const fail = (error: Error) => {
        if (!settled) {
            settled = true;
            cleanup();
            socket.destroy();
            throw error;
        }
    };

    const readResponse = () =>
        new Promise<string>((resolve, reject) => {
            waiter = (line: string) => {
                waiter = null;
                resolve(line);
            };

            const onError = (err: Error) => {
                waiter = null;
                reject(err);
            };

            socket.once('error', onError);
            socket.once('timeout', () => onError(new Error('SMTP timeout')));
        });

    socket.on('data', (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\r\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const match = line.match(/^(\d{3})([ -])/);
            if (match && match[2] === ' ' && waiter) {
                waiter(line);
            }
        }
    });

    const expect = async (allowedCodes: string[]): Promise<string> => {
        const line = await readResponse();
        const code = line.slice(0, 3);

        if (!allowedCodes.includes(code)) {
            throw new Error(`SMTP error ${line}`);
        }

        return line;
    };

    const command = async (value: string, allowedCodes: string[]) => {
        socket.write(`${value}\r\n`);
        await expect(allowedCodes);
    };

    try {
        await new Promise<void>((resolve, reject) => {
            socket.once('secureConnect', () => resolve());
            socket.once('error', reject);
            socket.once('timeout', () => reject(new Error('SMTP connection timeout')));
        });

        await expect(['220']);
        await command(`EHLO ${os.hostname() || 'localhost'}`, ['250']);
        await command('AUTH LOGIN', ['334']);
        await command(encodeB64(SMTP_USER), ['334']);
        await command(encodeB64(SMTP_PASS), ['235']);
        await command(`MAIL FROM:<${extractAddress(EMAIL_FROM)}>`, ['250']);
        await command(`RCPT TO:<${extractAddress(options.to)}>`, ['250', '251']);
        await command('DATA', ['354']);

        const headers = [
            `From: ${EMAIL_FROM}`,
            `To: ${options.to}`,
            `Subject: ${options.subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            '',
            escapeSmtpData(options.html),
            '.',
            ''
        ].join('\r\n');

        socket.write(headers);
        await expect(['250']);
        await command('QUIT', ['221']);
    } catch (error: any) {
        fail(new Error(error?.message || 'SMTP send failed'));
    } finally {
        cleanup();
        socket.end();
    }
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
    if (!hasSmtpConfig) {
        /* eslint-disable no-console */
        console.warn('SMTP is not configured. Configure SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM.');
        console.log('\n📧 ===== EMAIL PREVIEW =====');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('===========================\n');
        /* eslint-enable no-console */
        return;
    }

    await sendSmtpEmail(options);
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #1a202c; 
                    margin: 0; 
                    padding: 0;
                    background-color: #f7fafc;
                }
                .wrapper {
                    padding: 40px 20px;
                    background-color: #f7fafc;
                }
                .container { 
                    max-width: 540px; 
                    margin: 0 auto; 
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .header { 
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                }
                .header p {
                    margin: 8px 0 0;
                    opacity: 0.9;
                    font-size: 16px;
                }
                .content { 
                    padding: 40px 30px; 
                }
                .content p {
                    margin-bottom: 20px;
                    font-size: 16px;
                    color: #4a5568;
                }
                .button-container {
                    text-align: center;
                    margin: 35px 0;
                }
                .button { 
                    display: inline-block; 
                    padding: 14px 32px; 
                    background-color: #4f46e5; 
                    color: #ffffff !important; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: 600;
                    font-size: 16px;
                    transition: background-color 0.2s;
                }
                .divider {
                    height: 1px;
                    background-color: #e2e8f0;
                    margin: 30px 0;
                }
                .footer { 
                    text-align: center; 
                    padding: 0 30px 40px;
                    color: #718096; 
                    font-size: 14px; 
                }
                .url-box { 
                    background: #f8fafc; 
                    padding: 16px; 
                    border: 1px solid #edf2f7;
                    border-radius: 8px; 
                    margin: 20px 0; 
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; 
                    font-size: 13px;
                    word-break: break-all;
                    color: #4a5568;
                }
                .brand {
                    font-weight: 800;
                    color: #4f46e5;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>Review Rise</h1>
                        <p>Verify your email address</p>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>Welcome to <strong>Review Rise</strong>! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
                        
                        <div class="button-container">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        
                        <p>This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #718096;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
                        <div class="url-box">${verificationUrl}</div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} <a href="#" class="brand">Review Rise</a>. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendEmail({
        to: email,
        subject: 'Verify Your Email Address | Review Rise',
        html
    });
};

