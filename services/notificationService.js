const twilio = require('twilio');
const nodemailer = require('nodemailer');
const fcmService = require('./fcmService');

// Twilio Configuration
let twilioClient = null;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Only initialize Twilio if credentials are valid
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio SMS initialized');
    } catch (error) {
        console.log('⚠️  Twilio initialization failed:', error.message);
    }
} else {
    console.log('⚠️  Twilio not configured (Account SID must start with AC)');
}

// Nodemailer Configuration (Gmail SMTP)
let emailTransporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
        emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
        console.log('✅ Gmail SMTP initialized');
    } catch (error) {
        console.log('⚠️  Gmail initialization failed:', error.message);
    }
} else {
    console.log('⚠️  Gmail not configured');
}

// Send SMS to donor
async function sendSMSAlert(phoneNumber, message) {
    if (!twilioClient || !TWILIO_PHONE) {
        console.log('Twilio not configured. SMS would be sent to:', phoneNumber);
        console.log('Message:', message);
        return { success: false, message: 'Twilio not configured' };
    }

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: TWILIO_PHONE,
            to: phoneNumber
        });
        console.log('SMS sent successfully:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error: error.message };
    }
}

// Send email notification
async function sendEmail(to, subject, htmlContent) {
    if (!emailTransporter) {
        console.log('Email not configured. Email would be sent to:', to);
        console.log('Subject:', subject);
        return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
        from: `Blood Bond <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await emailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

// Notify nearby donors about emergency request
async function notifyNearbyDonors(donors, patientInfo) {
    const results = { sms: [], email: [], push: [] };

    // Send push notifications first (fastest)
    console.log('📲 Sending push notifications...');
    const pushResults = await fcmService.sendEmergencyPushAlert(donors, patientInfo);
    results.push = pushResults;

    for (const donor of donors) {
        // SMS Alert
        const smsMessage = `🚨 BLOOD BOND EMERGENCY ALERT 🚨\n\nUrgent: ${patientInfo.bloodType} blood needed for ${patientInfo.patientName}.\n\nYou are a compatible donor nearby. Please contact: ${patientInfo.emergencyContact}\n\nEvery second counts. Thank you for saving lives!`;
        
        const smsResult = await sendSMSAlert(donor.phone, smsMessage);
        results.sms.push({ donor: donor.name, ...smsResult });

        // Email Alert
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🩸 Blood Bond Emergency Alert</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #dc2626;">Urgent Blood Request</h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Dear ${donor.name},
                    </p>
                    <p style="font-size: 16px; line-height: 1.6;">
                        An emergency blood request has been made in your area. Your blood type <strong>${donor.blood_type}</strong> is compatible with the patient's needs.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <h3 style="margin-top: 0; color: #dc2626;">Patient Information</h3>
                        <p><strong>Patient Name:</strong> ${patientInfo.patientName}</p>
                        <p><strong>Required Blood Type:</strong> ${patientInfo.bloodType}</p>
                        <p><strong>Emergency Contact:</strong> ${patientInfo.emergencyContact}</p>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6;">
                        If you are available to donate, please contact the emergency number immediately.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                        Thank you for being a registered donor. Your willingness to help saves lives.
                    </p>
                </div>
                <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p>Blood Bond - Emergency Blood Donor Network</p>
                    <p>⚠️ For life-threatening emergencies, call 911 immediately</p>
                </div>
            </div>
        `;

        const emailResult = await sendEmail(
            donor.email,
            '🚨 URGENT: Blood Donation Request in Your Area',
            emailHtml
        );
        results.email.push({ donor: donor.name, ...emailResult });
    }

    return results;
}

// Send donor registration confirmation
async function sendRegistrationConfirmation(donor) {
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">🩸 Welcome to Blood Bond</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <h2 style="color: #dc2626;">Registration Successful!</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                    Dear ${donor.name},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                    Thank you for registering as a blood donor with Blood Bond. You are now part of our life-saving network!
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #dc2626;">Your Donor Profile</h3>
                    <p><strong>Name:</strong> ${donor.name}</p>
                    <p><strong>Blood Type:</strong> ${donor.bloodType}</p>
                    <p><strong>Phone:</strong> ${donor.phone}</p>
                    <p><strong>Email:</strong> ${donor.email}</p>
                </div>
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 14px;">
                        <strong>What's Next?</strong><br>
                        You will receive SMS and email alerts when there's an emergency blood request in your area that matches your blood type.
                    </p>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    You can manage your profile and donation history anytime through the donor dashboard.
                </p>
            </div>
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
                <p>Blood Bond - Emergency Blood Donor Network</p>
                <p>Together, we save lives.</p>
            </div>
        </div>
    `;

    const emailResult = await sendEmail(
        donor.email,
        '✅ Welcome to Blood Bond - Registration Confirmed',
        emailHtml
    );

    // Optional: Send SMS confirmation too
    const smsMessage = `Welcome to Blood Bond! You're now registered as a ${donor.bloodType} donor. You'll receive alerts for emergency requests. Thank you for saving lives!`;
    const smsResult = await sendSMSAlert(donor.phone, smsMessage);

    return { email: emailResult, sms: smsResult };
}

// Send match notification to requester
async function sendMatchNotification(requesterEmail, matchedDonors, patientInfo) {
    const donorsList = matchedDonors.map(d => 
        `<li><strong>${d.name}</strong> (${d.blood_type}) - ${d.phone}</li>`
    ).join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">✅ Donors Found!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <h2 style="color: #059669;">We Found Compatible Donors</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                    Good news! We've found ${matchedDonors.length} compatible donor(s) for <strong>${patientInfo.patientName}</strong> (${patientInfo.bloodType}).
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #059669;">Matched Donors</h3>
                    <ul style="line-height: 1.8;">
                        ${donorsList}
                    </ul>
                </div>
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-size: 14px;">
                        <strong>Next Steps:</strong><br>
                        All matched donors have been notified via SMS and email. They will contact you directly if available to donate.
                    </p>
                </div>
            </div>
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
                <p>Blood Bond - Emergency Blood Donor Network</p>
            </div>
        </div>
    `;

    return await sendEmail(
        requesterEmail,
        '✅ Blood Bond: Compatible Donors Found',
        emailHtml
    );
}

module.exports = {
    sendSMSAlert,
    sendEmail,
    notifyNearbyDonors,
    sendRegistrationConfirmation,
    sendMatchNotification
};
