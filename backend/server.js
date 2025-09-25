const dotenv =require('dotenv');
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use("/api/email", require("./routes/emailRoutes"));
const router = express.Router(); 
//app.use(cors());

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://localhost:5174',
    'https://sports-q58g-pmkjhsoe3-judes-projects-1048faf2.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));
dotenv.config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");

const productRoutes = require("./routes/productRoutes");

const cartRoutes = require("./routes/cartRoutes");

//const router = require("./routes/productRoutes");

const checkoutRoutes = require("./routes/CheckoutRoutes");

const orderRoutes = require("./routes/orderRoutes");

const uploadRoutes = require("./routes/uploadRoutes");

const subscribeRoute = require("./routes/subscribeRoute");

const adminRoutes = require("./routes/adminRoutes");

const productAdminRoutes = require("./routes/productAdminRoutes");

const adminOrderRoutes = require("./routes/adminOrderRoutes");

const supplierRoutes = require('./routes/supplierRoutes');

const emailRoutes = require('./routes/emailRoutes'); // New email routes

const feedbackRoutes = require("./routes/feedbackRoutes");

const nodemailer = require('nodemailer');


const PORT = process.env.PORT || 9000;

//connect to MongoDB

connectDB();

app.get("/", (req, res) => {
    res.send("WELCOME TO JS API!");
});

//API Routes
app.use("/api/users",userRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/checkout",checkoutRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/upload",uploadRoutes);
app.use("/api",subscribeRoute);

//
app.use('/api/suppliers', supplierRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use('/api/email', emailRoutes);


// Add debug middleware to see all incoming requests


//admin 
app.use("/api/admin/users",adminRoutes);
app.use("/api/admin/products",productAdminRoutes);
app.use("/api/admin/orders",adminOrderRoutes);
//




// Low stock report endpoint (you can also move this to emailRoutes)
// In your server file, make sure this endpoint is defined BEFORE your app.listen() call
app.post('/api/send-low-stock-report', async (req, res) => {
  let pdfPath; // Declare here so it's accessible in catch block
  
  try {
    const { email, threshold, products } = req.body;
    
    console.log('Received request to send email to:', email);
    
    // Validate input
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured on server'
      });
    }
    
    // Create PDF
    const doc = new PDFDocument();
    pdfPath = path.join(__dirname, 'temp', `low-stock-report-${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Add content to PDF
    doc.fontSize(20).text('Low Stock Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.text(`Threshold: ${threshold} items or less`);
    doc.text(`Total low stock items: ${products.length}`);
    doc.moveDown();
    
    // Add table headers
    const startX = 50;
    doc.text('Product Name', startX, doc.y);
    doc.text('SKU', startX + 200, doc.y);
    doc.text('Stock', startX + 300, doc.y);
    doc.text('Category', startX + 350, doc.y);
    doc.moveDown();
    
    // Add a line under headers
    doc.moveTo(startX, doc.y)
       .lineTo(startX + 400, doc.y)
       .stroke();
    doc.moveDown();
    
    // Add products to PDF
    products.forEach((product) => {
      if (doc.y > 700) { // Add new page if needed
        doc.addPage();
        // Add headers again on new page
        doc.text('Product Name', startX, doc.y);
        doc.text('SKU', startX + 200, doc.y);
        doc.text('Stock', startX + 300, doc.y);
        doc.text('Category', startX + 350, doc.y);
        doc.moveDown();
        doc.moveTo(startX, doc.y)
           .lineTo(startX + 400, doc.y)
           .stroke();
        doc.moveDown();
      }
      
      const y = doc.y;
      doc.text(product.name, startX, y);
      doc.text(product.sku || 'N/A', startX + 200, y);
      doc.text(String(product.countInStock || 0), startX + 300, y);
      doc.text(product.category || 'N/A', startX + 350, y);
      
      doc.moveDown();
    });
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF to be generated
    await new Promise((resolve) => {
      doc.on('end', resolve);
    });
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
    
    // Read PDF file
    const pdfAttachment = {
      filename: `low-stock-report-${new Date().toISOString().split('T')[0]}.pdf`,
      content: fs.createReadStream(pdfPath)
    };
    
    // Send email with attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Low Stock Report - ${new Date().toLocaleDateString()}`,
      html: `
        <h1>Low Stock Report</h1>
        <p>Threshold: ${threshold} items or less</p>
        <p>Total low stock items: ${products.length}</p>
        <p>Please see the attached PDF for details.</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `,
      attachments: [pdfAttachment]
    });
    
    // Clean up temporary file
    fs.unlinkSync(pdfPath);
    
    res.json({ success: true, message: 'Report sent successfully with PDF attachment' });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Clean up temporary file if it exists
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send report',
      error: error.message 
    });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Make sure this endpoint is defined BEFORE app.listen()
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`📧 Email service available at /api/email`);
    
    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('⚠️  Email credentials not found in environment variables');
    } else {
      console.log('✅ Email credentials found');
    }
});



