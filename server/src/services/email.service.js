const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // In development/test, use Ethereal if no SMTP configured
  if (!env.email.user || !env.email.pass) {
    logger.warn('No email credentials configured. Emails will be logged but not sent.');
    // Create a fake transporter for development
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true,
    });
    // Don't fail if no local SMTP
    transporter.verify = async () => true;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
  });

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `"${env.email.fromName}" <${env.email.from}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${subject} (id: ${info.messageId})`);

    if (env.nodeEnv === 'development') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error.message);
    // Don't throw - email failure shouldn't break the flow
    return { success: false, error: error.message };
  }
}

function getWelcomeEmail(userName, role) {
  return {
    subject: 'Welcome to Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a6b3c, #2d8a4e); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 30px; background: #1a6b3c; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Jamia Tul Uloom Muhammadiya</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
            <p>You can now log in to your account and start exploring our platform.</p>
            <p>Best regards,<br/>Jamia Tul Uloom Muhammadiya Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getApprovalEmail(userName, role, loginUrl) {
  return {
    subject: 'Account Approved - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a6b3c, #2d8a4e); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 30px; background: #1a6b3c; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Approved ✓</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Congratulations! Your account has been approved as a <strong>${role}</strong>.</p>
            <p>You can now log in to access your dashboard and start using our platform.</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Use your registered email to log in</li>
              <li>Access your personalized dashboard</li>
              <li>Explore courses and start learning</li>
            </ul>
            <a href="${loginUrl}" class="btn">Log In Now</a>
            <p>Best regards,<br/>Jamia Tul Uloom Muhammadiya Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getRejectionEmail(userName, reason) {
  return {
    subject: 'Account Rejected - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #dc3545, #c82333); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .reason-box { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reason-box p { margin: 0; color: #333; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Rejected</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>We regret to inform you that your account registration has been rejected.</p>
            <div class="reason-box">
              <p><strong>Reason:</strong> ${reason || 'Your application did not meet our requirements at this time.'}</p>
            </div>
            <p>If you believe this is a mistake or would like more information, please contact our support team.</p>
            <p>Best regards,<br/>Jamia Tul Uloom Muhammadiya Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getPasswordResetEmail(userName, resetUrl) {
  return {
    subject: 'Password Reset - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ffc107, #e0a800); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 30px; background: #ffc107; color: #1a1a2e !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 20px 0; font-size: 13px; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>You have requested to reset your password. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="btn">Reset Password</a>
            <div class="warning">
              <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
              <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <p>Best regards,<br/>Jamia Tul Uloom Muhammadiya Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getPasswordChangedEmail(userName) {
  return {
    subject: 'Password Changed - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #17a2b8, #138496); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your password has been successfully changed.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br/>Jamia Tul Uloom Muhammadiya Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getEmailChangedEmail(userName, newEmail) {
  return {
    subject: 'Email Changed - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #17a2b8, #138496); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Address Changed</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your email address has been successfully changed to <strong>${newEmail}</strong>.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br/>Jamia Tul Uloom Muhammadiya Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

module.exports = {
  sendEmail,
  getWelcomeEmail,
  getApprovalEmail,
  getRejectionEmail,
  getPasswordResetEmail,
  getPasswordChangedEmail,
  getEmailChangedEmail,
};
