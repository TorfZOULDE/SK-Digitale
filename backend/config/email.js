const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendReplyEmail = async (toEmail, toName, subject, message) => {
    const mailOptions = {
        from: `"Torf Zoulde - Portfolio" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Re: ${subject || 'Votre message'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ff6b35, #e65100); padding: 25px; border-radius: 10px 10px 0 0;">
                    <h2 style="color: #fff; margin: 0;">Torf Zoulde</h2>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Réponse à votre message</p>
                </div>
                <div style="padding: 25px; background: #f9fafb; border-radius: 0 0 10px 10px;">
                    <p>Bonjour ${toName},</p>
                    <p style="white-space: pre-wrap;">${message}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 0.85rem;">
                        Cet email a été envoyé depuis le portfolio de Torf Zoulde.
                    </p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendReplyEmail };
