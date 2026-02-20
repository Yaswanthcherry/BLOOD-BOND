// Firebase Cloud Messaging Service for sending push notifications
// Note: This uses the REST API approach (no admin SDK needed)

const https = require('https');

const FCM_SERVER_KEY = process.env.FIREBASE_SERVER_KEY; // You'll need to add this to .env
const FCM_API_URL = 'https://fcm.googleapis.com/fcm/send';

/**
 * Send push notification to a specific device token
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
    if (!FCM_SERVER_KEY) {
        console.log('⚠️  Firebase Server Key not configured. Push notification would be sent:');
        console.log('   Title:', title);
        console.log('   Body:', body);
        console.log('   Token:', fcmToken);
        return { success: false, message: 'FCM Server Key not configured' };
    }

    const payload = {
        to: fcmToken,
        notification: {
            title: title,
            body: body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            click_action: '/',
            tag: 'blood-bond-notification'
        },
        data: data,
        priority: 'high'
    };

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);

        const options = {
            hostname: 'fcm.googleapis.com',
            port: 443,
            path: '/fcm/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${FCM_SERVER_KEY}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success === 1) {
                        console.log('✅ Push notification sent successfully');
                        resolve({ success: true, response });
                    } else {
                        console.log('❌ Push notification failed:', response);
                        resolve({ success: false, error: response });
                    }
                } catch (error) {
                    console.error('Error parsing FCM response:', error);
                    resolve({ success: false, error: error.message });
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error sending push notification:', error);
            resolve({ success: false, error: error.message });
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Send push notifications to multiple devices
 */
async function sendPushNotificationToMultiple(fcmTokens, title, body, data = {}) {
    const results = [];
    
    for (const token of fcmTokens) {
        if (token) {
            const result = await sendPushNotification(token, title, body, data);
            results.push({ token, ...result });
        }
    }
    
    return results;
}

/**
 * Send emergency alert push notification
 */
async function sendEmergencyPushAlert(donors, patientInfo) {
    const title = '🚨 URGENT: Blood Donation Request';
    const body = `${patientInfo.bloodType} blood needed for ${patientInfo.patientName}. You are a compatible donor nearby.`;
    
    const data = {
        type: 'emergency_request',
        patientName: patientInfo.patientName,
        bloodType: patientInfo.bloodType,
        emergencyContact: patientInfo.emergencyContact
    };
    
    const fcmTokens = donors
        .map(donor => donor.fcm_token)
        .filter(token => token); // Only tokens that exist
    
    if (fcmTokens.length === 0) {
        console.log('⚠️  No FCM tokens found for donors');
        return { success: false, message: 'No FCM tokens available' };
    }
    
    console.log(`📲 Sending push notifications to ${fcmTokens.length} donor(s)...`);
    const results = await sendPushNotificationToMultiple(fcmTokens, title, body, data);
    
    return results;
}

module.exports = {
    sendPushNotification,
    sendPushNotificationToMultiple,
    sendEmergencyPushAlert
};
