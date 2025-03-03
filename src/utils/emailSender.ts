require("dotenv").config();
const nodemailer = require("nodemailer");
// Định nghĩa kiểu cho tham số hàm sendEmail
interface EmailOptions {
    toEmail: string;
    subject: string;
    html: string;
}

// Hàm gửi email
export const sendEmail = async ({ toEmail, subject, html }: EmailOptions): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const msg = {
        from: "Beautiful House Admin <your-email@gmail.com>",
        to: toEmail,
        subject: subject,
        text: html,
    };

    try {
        const result = await transporter.sendMail(msg);
        console.log("Email sent successfully:", result.response);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error sending email:", error.message);
        } else if ((error as any).response) {
            console.error("Error details:", (error as any).response.body);
        } else {
            console.error("Unknown error occurred while sending email.");
        }
    }
};