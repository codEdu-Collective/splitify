import { v } from 'convex/values';
import { action } from './_generated/server';
import { Resend } from 'resend';

export const sendEmail = action({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
        text: v.optional(v.string()),
        apiKey: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = new Resend(args.apiKey);

        try {
            const result = await resend.emails.send({
                from: 'Split Smart <onboarding@resend.dev>',
                to: args.to,
                subject: args.subject,
                html: args.html,
                text: args.text,
            });

            return { success: true, data: result.data, error: result.error };
        } catch (error) {
            console.error('Failed to send email:', error);
            return {
                success: false,
                error:
                    typeof error === 'object' && error !== null && 'message' in error
                        ? (error as { message: string }).message
                        : String(error),
            };
        }
    },
});
