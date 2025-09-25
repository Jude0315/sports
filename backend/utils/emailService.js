const dotenv =require('dotenv');
const nodemailer = require('nodemailer');

// FIXED: Changed createTransporter to createTransport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// ... rest of the code remains the same ...

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    return { 
      success: true, 
      message: 'Email configuration is correct' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Email configuration error',
      error: error.message 
    };
  }
};

// Complete email template function
const generateWelcomeEmail = (supplier) => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return {
    from: process.env.EMAIL_USER,
    to: supplier.email,
    subject: `Welcome to Our Supplier Network - ${supplier.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #4aa8ff, #1e73e8);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
            background: #f8f9fa;
          }
          .welcome-box {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }
          .details {
            background: #e3f2fd;
            padding: 25px;
            border-radius: 8px;
            border-left: 5px solid #4aa8ff;
            margin: 20px 0;
          }
          .details h3 {
            margin-top: 0;
            color: #1e73e8;
          }
          .highlight {
            color: #4aa8ff;
            font-weight: bold;
          }
          .next-steps {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .next-steps ul {
            padding-left: 20px;
          }
          .next-steps li {
            margin: 10px 0;
          }
          .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 30px;
            font-size: 14px;
          }
          .success-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 8px 0;
            vertical-align: top;
          }
          td:first-child {
            font-weight: bold;
            width: 40%;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚙️ Welcome to Our Supplier Network!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sports Equipment Supply System</p>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2 style="color: #1e73e8; margin-top: 0;">Hello ${supplier.name}! 👋</h2>
              <p style="font-size: 16px; margin-bottom: 0;">We're thrilled to welcome you as our new supplier partner. Your registration has been successfully completed and you're now part of our sports equipment supply network.</p>
              <div style="text-align: center; margin: 20px 0;">
                <span class="success-badge">✅ Registration Successful</span>
              </div>
            </div>
            
            <div class="details">
              <h3>📋 Your Registration Details</h3>
              <table>
                <tr><td>Supplier Name:</td><td>${supplier.name}</td></tr>
                <tr><td>Email Address:</td><td>${supplier.email}</td></tr>
                <tr><td>Product Category:</td><td><span class="highlight">${supplier.product}</span></td></tr>
                <tr><td>Quantity Capacity:</td><td><span class="highlight">${supplier.quantity} units</span></td></tr>
                <tr><td>Registration Date:</td><td>${currentDate}</td></tr>
              </table>
            </div>
            
            <div class="next-steps">
              <h3 style="color: #1e73e8; margin-top: 0;">🚀 What Happens Next?</h3>
              <ul>
                <li><strong>Order Processing:</strong> You'll receive notifications about new orders for ${supplier.product}</li>
                <li><strong>Quality Standards:</strong> Our team will share detailed quality requirements and guidelines</li>
                <li><strong>Communication:</strong> Expect regular updates about inventory needs and market demands</li>
                <li><strong>Payment Terms:</strong> Our accounts team will contact you regarding payment procedures</li>
                <li><strong>Support:</strong> You now have access to our supplier support portal</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; margin-bottom: 15px;"><strong>Questions or need assistance?</strong></p>
              <p style="color: #666; margin: 5px 0;">📞 Contact our Supplier Relations Team</p>
              <p style="color: #666; margin: 5px 0;">📧 Email: suppliers@sportsequipment.com</p>
              <p style="color: #666; margin: 5px 0;">🕒 Business Hours: Monday - Friday, 9:00 AM - 6:00 PM</p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> Please save this email for your records. Your supplier ID will be provided in a separate communication.</p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Sports Equipment - Supplier Management System</strong></p>
            <p style="margin: 0; opacity: 0.8;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7;">© ${new Date().getFullYear()} Sports Equipment Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send welcome email
const sendWelcomeEmail = async (supplier) => {
  try {
    const mailOptions = generateWelcomeEmail(supplier);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${supplier.email}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
};

// Test email sending
const sendTestEmail = async (email, name = 'Test Supplier', product = 'Jerseys', quantity = 100) => {
  const testSupplier = { email, name, product, quantity };
  return await sendWelcomeEmail(testSupplier);
};

// ==================== NEW FEEDBACK FUNCTIONS ====================

// Send thank you email for feedback
const sendThankYouEmail = async (feedback) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: feedback.email,
      subject: 'Thank You for Your Feedback - JS SPORTS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You for Your Feedback!</h2>
          <p>Dear ${feedback.name},</p>
          <p>We've received your feedback and truly appreciate you taking the time to share your thoughts with us.</p>
          <p><strong>Your Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</p>
          <p><strong>Your Message:</strong> ${feedback.message}</p>
          <p>Our team will review your feedback and get back to you if needed.</p>
          <br>
          <p>Best regards,<br>JS SPORTS Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Thank you email sent to ${feedback.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending thank you email:', error);
    return { success: false, error: error.message };
  }
};

// Send response email to user
const sendFeedbackResponse = async (feedback, responseMessage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: feedback.email,
      subject: 'Response to Your Feedback - JS SPORTS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Response to Your Feedback</h2>
          <p>Dear ${feedback.name},</p>
          <p>Thank you for your recent feedback. Here's our response:</p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p><strong>Our Response:</strong></p>
            <p>${responseMessage}</p>
          </div>
          <p><strong>Your Original Feedback:</strong></p>
          <p>${feedback.message}</p>
          <br>
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>JS SPORTS Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Feedback response email sent to ${feedback.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending response email:', error);
    return { success: false, error: error.message };
  }
};

// ==================== NEW REFUND EMAIL FUNCTION ====================

// Send refund confirmation email
const sendRefundEmail = async (emailData) => {
  try {
    const { to, subject, text, html } = emailData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: subject || 'Refund Confirmation - JS SPORTS',
      text: text || '',
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e73e8;">Refund Confirmation</h2>
          <p>Dear Valued Customer,</p>
          <p>${text || 'Your refund has been successfully processed.'}</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Refund Status:</strong> Completed</p>
          </div>
          <p>If you have any questions about your refund, please contact our support team.</p>
          <br>
          <p>Best regards,<br>JS SPORTS Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Refund email sent to ${to}`);
    return { success: true, message: 'Refund email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending refund email:', error);
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  transporter,
  testEmailConfig,
  sendWelcomeEmail,
  sendTestEmail,
  generateWelcomeEmail,
  // Add the new feedback functions
  sendThankYouEmail,
  sendFeedbackResponse,
  // Add the new refund email function
  sendRefundEmail
};
