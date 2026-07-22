import { Resend } from "resend";

// TODO: fix later because of Resend API_KEY

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendResetEmail(
  email: string,
  resetToken: string,
): Promise<void> {
  if (!resend) {
    throw new Error(
      "Password reset emails are unavailable because RESEND_API_KEY is not configured",
    );
  }

  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL === "production"
      ? "https://www.timplan.app/"
      : "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    // later: no-reply@timplan.app
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
}
