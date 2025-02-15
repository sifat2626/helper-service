import { contactEmail } from '../../utils/contactEmail';

const contactUs = async (contactData: {
  name: string;
  serviceName: string;
  duration: number;
  phoneNumber: string;
  message: string;
}): Promise<void> => {
  const { name, serviceName, duration,  phoneNumber, message } = contactData;

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

  await contactEmail(subject, html);
};

export const ContactServices = {
  contactUs,
};
