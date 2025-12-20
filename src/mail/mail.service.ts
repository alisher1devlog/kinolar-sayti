import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendUserConfirmation(email: string, code: string) {
    const mailOptions = {
      from: `"Kinolar Sayti" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Tasdiqlash kodi - Kinolar.uz`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #E50914;">Xush kelibsiz!</h2>
          <p>Ro'yxatdan o'tganingiz uchun rahmat. Hisobingizni faollashtirish uchun quyidagi kodni kiriting:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">
            ${code}
          </h1>
          <p>Ushbu kod <b>10 daqiqa</b> davomida amal qiladi.</p>
          <p>Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.</p>
        </div>
      `,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email yuborildi: ${email}`);
    } catch (error) {
      console.error('Email yuborishda xatolik:', error);
      throw error;
    }
  }
}
