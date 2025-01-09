"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use TLS, `false` ensures STARTTLS
            auth: {
                user: config_1.default.sender_email, // Your email address
                pass: config_1.default.sender_pass, // Your app-specific password
            },
        });
        const mailOptions = {
            from: `"Support Team" <${config_1.default.sender_email}>`, // Sender's name and email
            to, // Recipient's email
            subject, // Email subject
            text: html.replace(/<[^>]+>/g, ''), // Generate plain text version by stripping HTML tags
            html, // HTML email body
        };
        // Send the email
        const info = yield transporter.sendMail(mailOptions);
        // Log the success message
        console.log(`Email sent: ${info.messageId}`);
        return info.messageId;
    }
    catch (error) {
        // @ts-ignore
        console.error(`Error sending email: ${error.message}`);
        throw new Error('Failed to send email. Please try again later.');
    }
});
exports.sendEmail = sendEmail;
