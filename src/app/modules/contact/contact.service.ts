import { sendEmail } from '../../utils/sendEmail';
import prisma from '../../utils/prisma';
import { UserRoleEnum } from '@prisma/client';

const contactUs = async (contactData: {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}): Promise<void> => {
  const { name, email, phoneNumber, message } = contactData;

  // Fetch all admins (both ADMIN and SUPERADMIN roles)
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN],
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
      await sendEmail(admin.email, subject, html);
      console.log(`Email sent to admin: ${admin.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${admin.email}:`, error);
    }
  }
};

export const ContactServices = {
  contactUs,
}
