// Live test of notification services
require('dotenv').config();
const notificationService = require('./services/notificationService');

console.log('🧪 Testing Blood Bond Notifications (Live Test)\n');

async function testNotifications() {
    console.log('📧 Testing Email Service...');
    
    // Test email
    const emailResult = await notificationService.sendEmail(
        process.env.GMAIL_USER,
        '✅ Blood Bond Test Email',
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
            <h2 style="color: #dc2626;">Blood Bond Email Test</h2>
            <p>This is a test email from your Blood Bond application.</p>
            <p>If you received this, your email notifications are working perfectly! ✅</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Sent at: ${new Date().toLocaleString()}
            </p>
        </div>
        `
    );
    
    console.log('Email Result:', emailResult);
    
    console.log('\n📱 Testing SMS Service...');
    
    // Test SMS (to your own number)
    const smsResult = await notificationService.sendSMSAlert(
        process.env.TWILIO_PHONE_NUMBER,
        '🩸 Blood Bond Test: Your SMS notifications are working! This is a test message from your Blood Bond app.'
    );
    
    console.log('SMS Result:', smsResult);
    
    console.log('\n─────────────────────────────────────');
    console.log('📊 Test Complete!');
    console.log('─────────────────────────────────────');
    
    if (emailResult.success) {
        console.log('✅ Email: Check your inbox at', process.env.GMAIL_USER);
    } else {
        console.log('❌ Email: Failed -', emailResult.message || emailResult.error);
    }
    
    if (smsResult.success) {
        console.log('✅ SMS: Check your phone at', process.env.TWILIO_PHONE_NUMBER);
    } else {
        console.log('❌ SMS: Failed -', smsResult.message || smsResult.error);
    }
    
    console.log('\n💡 If successful, you should receive:');
    console.log('   - An email in your Gmail inbox');
    console.log('   - An SMS on your Twilio phone number');
}

testNotifications().catch(console.error);
