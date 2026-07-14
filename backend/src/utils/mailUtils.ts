import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(email: string, resetToken: string): Promise<void> {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL === "production"
        ? "https://www.timplan.app/"
        : "http://localhost:3000"
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await resend.emails.send({
        from: "no-replay@timplan.com",
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    });
}