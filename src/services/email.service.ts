import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../loggers/logger";
import { AppError } from "../utils/app-error";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  isConfigured(): boolean {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
        ...(env.SMTP_PORT === 587
          ? { requireTLS: true, tls: { minVersion: "TLSv1.2" } }
          : {}),
      });
    }
    return this.transporter;
  }

  private logDevFallback(options: SendEmailOptions, reason: string): void {
    logger.warn("Email delivery failed — dev console fallback", {
      category: "emails",
      reason,
      to: options.to,
      subject: options.subject,
      preview: options.text,
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    if (!this.isConfigured()) {
      logger.info("Email (no SMTP — console fallback)", {
        category: "emails",
        to: options.to,
        subject: options.subject,
        preview: options.text,
      });
      return;
    }

    try {
      await this.getTransporter().sendMail({
        from: env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info("Email sent", { category: "emails", to: options.to, subject: options.subject });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "SMTP error";

      if (env.NODE_ENV === "development") {
        this.logDevFallback(options, reason);
        return;
      }

      logger.error("Email delivery failed", { category: "emails", error, to: options.to });
      throw new AppError(
        "Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard.",
        503,
        "EMAIL_DELIVERY_FAILED",
      );
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, firstName: string): Promise<void> {
    const subject = "Réinitialisation de votre mot de passe — LocaPro";
    const text = [
      `Bonjour ${firstName},`,
      "",
      "Vous avez demandé la réinitialisation de votre mot de passe LocaPro.",
      `Cliquez sur ce lien pour choisir un nouveau mot de passe (valide ${env.PASSWORD_RESET_EXPIRY_MINUTES} min) :`,
      resetUrl,
      "",
      "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    ].join("\n");

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#212529;max-width:520px">
        <h2 style="color:#3b5bdb;margin:0 0 12px">Réinitialisation du mot de passe</h2>
        <p>Bonjour <strong>${firstName}</strong>,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe LocaPro.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#3b5bdb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="font-size:13px;color:#6c757d">Ce lien expire dans ${env.PASSWORD_RESET_EXPIRY_MINUTES} minutes.</p>
        <p style="font-size:13px;color:#6c757d">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      </div>
    `;

    await this.send({ to, subject, text, html });
  }
}

export const emailService = new EmailService();
