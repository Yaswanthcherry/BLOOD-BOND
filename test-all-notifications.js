// Complete test of all notification channels
require('dotenv').config();
const notificationService = require('./services/notificationService');
const fcmService = require('./services/fcmService');

console.log('🧪 Testing All Blood Bond Notification Channels\n');
console.log('═══════════════════════════════════════════════\n');

async function testAllNotifications() {
    // Test 1: Email
    console.log('📧 TEST 1: Email Notification');
    console.log('─────────────────────────────────────');
    
    const emailResult = await notificationService.sendEmail(
        process.env.GMAIL_USER,
        '✅ Blood Bond - Email Test',
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
            <h2 style="color: #dc2626;">🩸 Blood Bond Email Test</h2>
            <p>Your email notifications are working perfectly!</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Tested at: ${new Date().toLocaleString()}
            </p>
        </div>
        `
    );
    
    if (emailResult.success) {
        console.log('✅ Email sent successfully!');
        console.log(`   Check inbox: ${process.env.GMAIL_USER}`);
    } else {
        console.log('❌ Email failed:', emailResult.error);
    }
    
    console.log('\n');
    
    // Test 2: SMS
    console.log('📱 TEST 2: SMS Notification');
    console.log('─────────────────────────────────────');
    
    // Use a different number for testing (not the same as Twilio number)
    const testPhoneNumber = '+919866879952'; // Your Indian number
    
    const smsResult = await notificationService.sendSMSAlert(
        testPhoneNumber,
        '🩸 Blood Bond Test: Your SMS notifications are working! This is a test message.'
    );
    
    if (smsResult.success) {
        console.log('✅ SMS sent successfully!');
        console.log(`   Check phone: ${testPhoneNumber}`);
    } else {
        console.log('❌ SMS failed:', smsResult.error || smsResult.message);
    }
    
    console.log('\n');
    
    // Test 3: Push Notification
    console.log('🔔 TEST 3: Push Notification');
    console.log('─────────────────────────────────────');
    
    if (process.env.FIREBASE_SERVER_KEY) {
        console.log('✅ Firebase Server Key configured');
        console.log('   Push notifications are ready!');
        console.log('   Note: Need a valid FCM token to send test push');
        console.log('   Register a donor in the app to get a token');
    } else {
        console.log('❌ Firebase Server Key not configured');
        console.log('   Add FIREBASE_SERVER_KEY to .env file');
    }
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📊 NOTIFICATION SYSTEM STATUS');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('Email (Gmail SMTP):');
    console.log(`  Status: ${emailResult.success ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`  Provider: Gmail (${process.env.GMAIL_USER})`);
    
    console.log('\nSMS (Twilio):');
    console.log(`  Status: ${smsResult.success ? '✅ WORKING' : '⚠️  CHECK CONFIG'}`);
    console.log(`  Provider: Twilio (${process.env.TWILIO_PHONE_NUMBER})`);
    
    console.log('\nPush Notifications (Firebase FCM):');
    console.log(`  Status: ${process.env.FIREBASE_SERVER_KEY ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);
    console.log(`  Project: bloodbond-beeee`);
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('🎯 NEXT STEPS');
    console.log('═══════════════════════════════════════════════\n');
    
    if (emailResult.success && smsResult.success && process.env.FIREBASE_SERVER_KEY) {
        console.log('🎉 ALL NOTIFICATION CHANNELS ARE READY!\n');
        console.log('Your Blood Bond app has:');
        console.log('  ✅ Email notifications');
        console.log('  ✅ SMS alerts');
        console.log('  ✅ Push notifications\n');
        console.log('To test push notifications:');
        console.log('  1. Go to http://localhost:3000/dashboard.html');
        console.log('  2. Register as a donor');
        console.log('  3. Enable notifications when prompted');
        console.log('  4. Make an emergency request matching your blood type');
        console.log('  5. You\'ll receive all three notification types!\n');
    } else {
        console.log('⚠️  Some notification channels need attention:\n');
        
        if (!emailResult.success) {
            console.log('  📧 Email: Check Gmail credentials in .env');
        }
        if (!smsResult.success) {
            console.log('  📱 SMS: Verify Twilio credentials and phone numbers');
        }
        if (!process.env.FIREBASE_SERVER_KEY) {
            console.log('  🔔 Push: Add FIREBASE_SERVER_KEY to .env');
        }
        console.log('');
    }
    
    console.log('═══════════════════════════════════════════════\n');
}

testAllNotifications().catch(console.error);
