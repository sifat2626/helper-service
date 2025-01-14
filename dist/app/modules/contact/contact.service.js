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
exports.ContactServices = void 0;
const sendEmail_1 = require("../../utils/sendEmail");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const contactUs = (contactData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber, message } = contactData;
    // Fetch all admins (both ADMIN and SUPERADMIN roles)
    const admins = yield prisma_1.default.user.findMany({
        where: {
            role: {
                in: [client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN],
            },
        },
    });
    // If no admins are found, handle it appropriately
    if (admins.length === 0) {
        console.error('No admins found to send emails.');
        return;
    }
    // Prepare the subject and email body
    const subject = `New Contact Us Message from ${name}`;
    const html = `
    <h1>New Contact Us Submission</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone Number:</strong> ${phoneNumber}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;
    // Send email to all admins
    for (const admin of admins) {
        try {
            yield (0, sendEmail_1.sendEmail)(admin.email, subject, html);
            console.log(`Email sent to admin: ${admin.email}`);
        }
        catch (error) {
            console.error(`Failed to send email to ${admin.email}:`, error);
        }
    }
});
exports.ContactServices = {
    contactUs,
};
