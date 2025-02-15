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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactServices = void 0;
const contactEmail_1 = require("../../utils/contactEmail");
const contactUs = (contactData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, serviceName, duration, phoneNumber, message } = contactData;
    // Prepare the subject and email body
    const subject = `New Contact Us Message from ${name}`;
    const html = `
    <h1>New Contact Us Submission</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Service Name:</strong> ${serviceName}</p>
    <p><strong>Duration:</strong> ${duration} days</p>
    <p><strong>Phone Number:</strong> ${phoneNumber}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;
    yield (0, contactEmail_1.contactEmail)(subject, html);
});
exports.ContactServices = {
    contactUs,
};
