const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('Nodemailer configured with:', {
  host: 'smtp.gmail.com',
  user: process.env.EMAIL_USERNAME,
  hasPassword: !!process.env.EMAIL_PASSWORD
});


let lastEmailError = "No errors yet. Email system initialized.";

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://hasthaveedi-market-akhila.onrender.com' 
      : 'http://localhost:3000');
    
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;


    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your Email - HasthaVeedhi',
      text: `Welcome to HasthaVeedhi!\n\nPlease click here to verify your email: ${verificationUrl}\n\nThis link expires in 24 hours.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4a90e2;">Welcome to HasthaVeedhi!</h2>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p><strong>This link expires in 24 hours.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #777;">HasthaVeedhi Market Platform</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    lastEmailError = `Success! Last email sent to ${email} at ${new Date().toISOString()}`;
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    lastEmailError = `Failed at ${new Date().toISOString()}: ` + error.message;
    throw new Error('Failed to send verification email: ' + error.message);
  }
};

const getLastEmailError = () => lastEmailError;

module.exports = {
  transporter,
  sendVerificationEmail,
  getLastEmailError
};
