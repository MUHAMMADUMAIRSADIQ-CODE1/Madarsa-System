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

function getRegistrationPendingEmail(userName, role) {
  return {
    subject: 'Registration Received - Jamia Tul Uloom Muhammadiya',
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
          .status-box { background: #fff8e1; border: 1px solid #ffb300; padding: 15px 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .status-box .status-label { font-weight: 700; color: #e65100; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .status-box .status-value { font-size: 18px; font-weight: 700; color: #e65100; margin-top: 4px; }
          .btn { display: inline-block; padding: 12px 30px; background: #1a6b3c; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Received</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Thank you for registering with <strong>Jamia Tul Uloom Muhammadiya</strong> as a <strong>${role}</strong>.</p>
            <p>We have received your registration request and it is currently being reviewed.</p>
            <div class="status-box">
              <p class="status-label">Current Status</p>
              <p class="status-value">⏳ Pending Approval</p>
            </div>
            <p>Your account is waiting for administrator approval. You will receive another email once your account has been approved or if further information is required.</p>
            <p>If you have any questions, please feel free to contact our support team.</p>
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

function getBlockedEmail(userName, reason) {
  return {
    subject: 'Account Blocked - Jamia Tul Uloom Muhammadiya',
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
          .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reason-box p { margin: 0; color: #856404; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Blocked</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>We regret to inform you that your account has been <strong>blocked</strong>.</p>
            ${reason ? `<div class="reason-box"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
            <p>You are unable to access your account at this time. If you believe this is a mistake, please contact our support team for assistance.</p>
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

function getActivatedEmail(userName) {
  return {
    subject: 'Account Activated - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 30px; background: #28a745; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Activated ✓</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your account has been <strong>activated</strong>. You can now access your account and continue using our platform.</p>
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

function getProfileCompletionEmail(userName) {
  return {
    subject: 'Profile Completed - Jamia Tul Uloom Muhammadiya',
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
            <h1>Profile Completed ✓</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Congratulations! Your profile has been successfully completed.</p>
            <p>You now have full access to your dashboard and all platform features.</p>
            <p>Welcome aboard! We are excited to have you as part of our community.</p>
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

function getProfileSubmittedEmail(userName) {
  return {
    subject: 'Profile Submitted for Verification - Jamia Tul Uloom Muhammadiya',
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
          .status-box { background: #fff8e1; border: 1px solid #ffb300; padding: 15px 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .status-box .status-label { font-weight: 700; color: #e65100; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .status-box .status-value { font-size: 18px; font-weight: 700; color: #e65100; margin-top: 4px; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Profile Submitted</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your profile has been submitted successfully and is now pending verification.</p>
            <div class="status-box">
              <p class="status-label">Current Status</p>
              <p class="status-value">⏳ Profile Under Review</p>
            </div>
            <p>An administrator will review your profile, documents, and information. You will receive another email once your profile has been verified.</p>
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

function getProfileVerifiedEmail(userName) {
  return {
    subject: 'Profile Verified - Dashboard Access Enabled - Jamia Tul Uloom Muhammadiya',
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
          .success-box { background: #e8f5e9; border: 1px solid #4caf50; padding: 15px 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .success-box .status-value { font-size: 18px; font-weight: 700; color: #2e7d32; }
          .btn { display: inline-block; padding: 12px 30px; background: #1a6b3c; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Profile Verified ✓</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Congratulations! Your profile has been verified and approved.</p>
            <div class="success-box">
              <p class="status-value">✅ Dashboard Access Enabled</p>
            </div>
            <p>You now have full access to your dashboard and all platform features.</p>
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

function getProfileRejectedEmail(userName, reason) {
  return {
    subject: 'Profile Verification Required Changes - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ff9800, #f57c00); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .reason-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reason-box p { margin: 0; color: #e65100; }
          .btn { display: inline-block; padding: 12px 30px; background: #ff9800; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Profile Verification</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your profile requires some changes before it can be verified.</p>
            <div class="reason-box">
              <p><strong>Reason:</strong> ${reason || 'Please update your profile information and documents.'}</p>
            </div>
            <p>Please log in, update your profile with the required changes, and submit again for verification.</p>
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

function getUnblockedEmail(userName) {
  return {
    subject: 'Account Unblocked - Jamia Tul Uloom Muhammadiya',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px 40px; }
          .content h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
          .content p { color: #555; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 30px; background: #28a745; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px 40px; background: #f9f9f9; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Unblocked ✓</h1>
          </div>
          <div class="content">
            <h2>Assalamu Alaikum ${userName},</h2>
            <p>Your account has been <strong>unblocked</strong>. You can now log in and continue using our platform.</p>
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
  getRegistrationPendingEmail,
  getWelcomeEmail,
  getApprovalEmail,
  getRejectionEmail,
  getBlockedEmail,
  getActivatedEmail,
  getProfileCompletionEmail,
  getProfileSubmittedEmail,
  getProfileVerifiedEmail,
  getProfileRejectedEmail,
  getUnblockedEmail,
  getPasswordResetEmail,
  getPasswordChangedEmail,
  getEmailChangedEmail,
};
