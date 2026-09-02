const nodemailer = require('nodemailer');

// Inisialisasi Transporter Nodemailer (Mendukung SMTP Env atau Ethereal / Local Fallback)
async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }

  // Fallback dev: JSON Transport / Ethereal Logger
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

/**
 * Mengirim email selamat datang dan kredensial akses Super Admin ke mitra pesantren
 */
async function sendTenantWelcomeEmail({
  namaPondok,
  subdomain,
  namaPengelola,
  email,
  adminUsername,
  tempPassword,
  licenseKey,
  packageType,
}) {
  try {
    const transporter = await createTransporter();
    const baseDomain = process.env.BASE_DOMAIN || 'sipesand.we.id';
    const loginUrl = `https://${subdomain}.${baseDomain}/login`;
    const localLoginUrl = `http://localhost:3000?tenant=${subdomain}`;

    const mailOptions = {
      from: '"King Digital Dev - Platform SiPesand" <no-reply@kingdigitalpremium.my.id>',
      to: email,
      subject: `🎉 Selamat Datang di SiPesand! Akses & Kredensial ${namaPondok}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 32px 28px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
            .body-content { padding: 32px 28px; }
            .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
            .credential-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .cred-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
            .cred-label { color: #64748b; font-weight: 600; }
            .cred-val { font-family: 'Courier New', monospace; font-weight: 700; color: #0f172a; }
            .btn-login { display: block; text-align: center; background: #2563eb; color: #ffffff !important; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 24px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .alert-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; font-size: 12px; color: #92400e; border-radius: 4px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SiPesand SaaS Pesantren</h1>
              <p>Platform Terpadu Digital Pesantren Modern • King Digital Dev</p>
            </div>
            <div class="body-content">
              <span class="badge">Aktivasi Sukses • ${packageType || 'LISENSI RESMI'}</span>
              <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px;">Ahlan wa Sahlan, Ustadz/Ustadzah ${namaPengelola}!</h2>
              <p style="font-size: 13px; line-height: 1.6; color: #334155;">
                Pendaftaran kemitraan untuk <strong>${namaPondok}</strong> telah berhasil diproses dan database instans pesantren Anda telah aktif secara otomatis.
              </p>

              <div class="credential-box">
                <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #2563eb; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
                  Informasi Akses Portal Super Admin:
                </div>
                <div class="cred-row">
                  <span class="cred-label">Subdomain Khusus:</span>
                  <span class="cred-val">${subdomain}.${baseDomain}</span>
                </div>
                <div class="cred-row">
                  <span class="cred-label">Username Admin:</span>
                  <span class="cred-val">${adminUsername}</span>
                </div>
                <div class="cred-row">
                  <span class="cred-label">Password Sementara:</span>
                  <span class="cred-val" style="color: #2563eb;">${tempPassword}</span>
                </div>
                <div class="cred-row">
                  <span class="cred-label">License Key:</span>
                  <span class="cred-val">${licenseKey}</span>
                </div>
              </div>

              <a href="${loginUrl}" class="btn-login">Masuk ke Portal Dashboard Pesantren</a>

              <div style="font-size: 11px; color: #64748b; text-align: center;">
                Tautan Lingkungan Dev: <a href="${localLoginUrl}" style="color: #2563eb;">${localLoginUrl}</a>
              </div>

              <div class="alert-warning">
                <strong>PENTING:</strong> Demi keamanan data pesantren Anda, harap segera mengubah password sementara ini setelah berhasil login pertama kali di menu <em>Pengaturan Lembaga & Akun</em>.
              </div>
            </div>
            <div class="footer">
              Email ini dikirim otomatis oleh King Digital Dev (kingdigitalpremium.my.id) • Platform SaaS SiPesand.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Welcome credentials email sent to ${email}. MessageId: ${info.messageId || 'DEV-LOG'}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAILER ERROR] Failed to send tenant welcome email:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendTenantWelcomeEmail,
};
