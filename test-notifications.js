// Test script to verify Twilio and Gmail credentials
require('dotenv').config();
const twilio = require('twilio');
const nodemailer = require('nodemailer');

console.log('🔍 Testing Blood Bond Notification Services...\n');

// Check if credentials are configured
console.log('📋 Checking Configuration:');
console.log('─────────────────────────────────────');

// Twilio Check
const hasTwilio = process.env.TWILIO_ACCOUNT_SID && 
                  process.env.TWILIO_AUTH_TOKEN && 
                  process.env.TWILIO_PHONE_NUMBER;

console.log('📱 Twilio SMS:');
console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
console.log(`   Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`   Phone Number: ${process.env.TWILIO_PHONE_NUMBER || '❌ Missing'}`);

// Gmail Check
const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;

console.log('\n✉️  Gmail SMTP:');
console.log(`   Email: ${process.env.GMAIL_USER || '❌ Missing'}`);
console.log(`   App Password: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing'}`);

console.log('\n─────────────────────────────────────\n');

// Test Twilio
async function testTwilio() {
    if (!hasTwilio) {
        console.log('⚠️  Twilio: Skipped (credentials not configured)\n');
        return false;
    }

    console.log('🧪 Testing Twilio Connection...');
    
    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Validate credentials by fetching account info
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        
        console.log('✅ Twilio: Connected successfully!');
        console.log(`   Account Status: ${account.status}`);
        console.log(`   Account Type: ${account.type}`);
        console.log(`   Phone Number: ${process.env.TWILIO_PHONE_NUMBER}`);
        console.log('   ℹ️  SMS will be sent from this number\n');
        return true;
    } catch (error) {
        console.log('❌ Twilio: Connection failed!');
        console.log(`   Error: ${error.message}`);
        console.log('   💡 Check your Account SID and Auth Token\n');
        return false;
    }
}

// Test Gmail
async function testGmail() {
    if (!hasGmail) {
        console.log('⚠️  Gmail: Skipped (credentials not configured)\n');
        return false;
    }

    console.log('🧪 Testing Gmail SMTP Connection...');
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Verify connection
        await transporter.verify();
        
        console.log('✅ Gmail: Connected successfully!');
        console.log(`   Email: ${process.env.GMAIL_USER}`);
        console.log('   ℹ️  Emails will be sent from this address\n');
        return true;
    } catch (error) {
        console.log('❌ Gmail: Connection failed!');
        console.log(`   Error: ${error.message}`);
        
        if (error.message.includes('Invalid login')) {
            console.log('   💡 Common fixes:');
            console.log('      1. Use App Password, not regular Gmail password');
            console.log('      2. Enable 2-Factor Authentication first');
            console.log('      3. Generate App Password at: https://myaccount.google.com/apppasswords');
            console.log('      4. Remove spaces from the 16-character password\n');
        } else {
            console.log('   💡 Check your Gmail credentials\n');
        }
        return false;
    }
}

// Run tests
async function runTests() {
    const twilioOk = await testTwilio();
    const gmailOk = await testGmail();
    
    console.log('─────────────────────────────────────');
    console.log('📊 Test Summary:');
    console.log(`   Twilio SMS: ${twilioOk ? '✅ Ready' : '❌ Not configured'}`);
    console.log(`   Gmail SMTP: ${gmailOk ? '✅ Ready' : '❌ Not configured'}`);
    console.log('─────────────────────────────────────\n');
    
    if (twilioOk || gmailOk) {
        console.log('🎉 At least one notification service is working!');
        console.log('   Your Blood Bond app can now send notifications.\n');
    } else {
        console.log('⚠️  No notification services configured.');
        console.log('   The app will work, but notifications will only be logged to console.');
        console.log('   See NOTIFICATION_SETUP.md for setup instructions.\n');
    }
    
    if (!twilioOk && hasTwilio) {
        console.log('🔧 To fix Twilio:');
        console.log('   1. Verify credentials at https://console.twilio.com/');
        console.log('   2. Check Account SID and Auth Token are correct');
        console.log('   3. Ensure phone number format is +1234567890\n');
    }
    
    if (!gmailOk && hasGmail) {
        console.log('🔧 To fix Gmail:');
        console.log('   1. Enable 2FA: https://myaccount.google.com/security');
        console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
        console.log('   3. Use the 16-character password (no spaces)');
        console.log('   4. Update .env file with correct credentials\n');
    }
}

// Execute tests
runTests().catch(console.error);
