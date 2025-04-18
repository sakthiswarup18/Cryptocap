import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, coinId, currentPrice, threshold, direction } = req.body;
    
    // Configure the transporter (example using Gmail)
    // Make sure to set the environment variables EMAIL_USER and EMAIL_PASS in your .env file.
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Market Alert for ${coinId}`,
      text: `Alert: ${coinId} price is now ${currentPrice} USD, which is ${direction} your threshold of ${threshold} USD.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error sending email: ", error);
      res.status(500).json({ error: "Error sending email." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
