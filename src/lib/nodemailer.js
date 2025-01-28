import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOrderConfirmation(orderData) {
  const { customerEmail, customerName, totalPrice, items } = orderData;

  // Update item list to remove size and color, and image
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center; padding: 20px;">Order Confirmation</h1>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #666;">Hello ${customerName},</h2>
        <p>Thank you for your order! We've received your purchase and are working on it.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; font-weight: bold;">$${totalPrice.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <p style="margin-bottom: 10px;">For any questions about your order, please contact our customer service:</p>
        <p style="color: #666;">Email: support@pilgrimdian.com</p>
        <p style="color: #666;">Phone: (555) 123-4567</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Pilgrimdian Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Order Confirmation - Pilgrimdian Store',
      html: emailTemplate,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentConfirmation(orderData) {
  const { customerEmail, customerName, totalPrice, paypalOrderId } = orderData;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center; padding: 20px;">Payment Confirmation</h1>
      
      <div style="background-color: #f0fff4; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #48bb78;">
        <h2 style="color: #2f855a;">Payment Successful!</h2>
        <p>Dear ${customerName},</p>
        <p>Your payment of $${totalPrice.toFixed(2)} has been successfully processed.</p>
        <p>Order ID: ${paypalOrderId}</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <p>What's next?</p>
        <ul style="color: #4a5568; line-height: 1.5;">
          <li>We will start processing your order</li>
          <li>You will receive a shipping confirmation email soon</li>
          <li>Track your order status in your account</li>
        </ul>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Pilgrimdian Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Payment Confirmed - Pilgrimdian Store',
      html: emailTemplate,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return { success: false, error: error.message };
  }
}

export async function sendShippingUpdate(orderData) {
  const { customerEmail, customerName, id } = orderData;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center; padding: 20px;">Your Order is on the Way!</h1>
      
      <div style="background-color: #ebf8ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #4299e1;">
        <h2 style="color: #2b6cb0;">Great News!</h2>
        <p style="margin: 15px 0;">Dear ${customerName},</p>
        <p>Your order (Order ID: ${id}) has been shipped and is on its way to you!</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <h3 style="color: #333;">What's Next?</h3>
        <ul style="color: #4a5568; line-height: 1.5;">
          <li>Your order is now in transit</li>
          <li>You'll receive updates about your delivery</li>
          <li>Please ensure someone is available to receive your package</li>
        </ul>
      </div>

      <div style="margin-top: 20px; padding: 20px; border-top: 1px solid #edf2f7;">
        <p style="color: #718096; font-size: 14px;">
          Questions about your order? Contact our support team at support@pilgrimdian.com
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Pilgrimdian Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Your Order is on the Way! - Pilgrimdian Store',
      html: emailTemplate,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending shipping update:', error);
    return { success: false, error: error.message };
  }
}