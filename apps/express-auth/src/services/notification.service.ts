const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL;

if (!NOTIFICATIONS_SERVICE_URL) {
    throw new Error("NOTIFICATIONS_SERVICE_URL is not defined in environment variables");
}

/**
 * Send verification email via notifications service
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    try {
        const response = await fetch(`${NOTIFICATIONS_SERVICE_URL}/api/email/verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, token }),
        });

        const data = await response.json();

        // Check contract response format: { success, data, message }
        if (!response.ok || !data.success) {
            throw new Error(data.message || `Notifications service responded with status: ${response.status}`);
        }

        // eslint-disable-next-line no-console
        console.log('✅ Verification email sent successfully via notifications service');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to send verification email:', error);
        // Don't throw - we don't want email failures to block user registration
        // In production, you might want to queue this for retry
    }
};
