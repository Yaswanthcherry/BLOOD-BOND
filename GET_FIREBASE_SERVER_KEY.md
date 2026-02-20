# How to Get Firebase Server Key

Your Firebase Cloud Messaging is almost ready! You just need to add the Server Key to enable backend push notifications.

## Steps to Get Firebase Server Key:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **bloodbond-beeee**

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

3. **Go to Cloud Messaging Tab**
   - Click on the "Cloud Messaging" tab
   - Scroll down to find "Cloud Messaging API (Legacy)"

4. **Copy Server Key**
   - Look for "Server key"
   - It will look like: `AAAAxxxxxxx:APA91bFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Copy this entire key

5. **Add to .env File**
   - Open your `.env` file
   - Find the line: `FIREBASE_SERVER_KEY=your_firebase_server_key_here`
   - Replace with: `FIREBASE_SERVER_KEY=AAAAxxxxxxx:APA91bF...` (your actual key)

6. **Restart Server**
   ```bash
   # Stop the current server (Ctrl+C)
   npm start
   ```

## Important Notes:

- If you don't see "Cloud Messaging API (Legacy)", you may need to enable it
- The Server Key is different from the VAPID key (you already have the VAPID key)
- Keep this key secret - never commit it to public repositories

## Alternative: Enable Cloud Messaging API

If the legacy API is not available:

1. Go to: https://console.cloud.google.com/
2. Select your project: bloodbond-beeee
3. Enable "Firebase Cloud Messaging API"
4. Then return to Firebase Console to get the Server Key

---

Once you add the Server Key, your push notifications will work automatically when:
- A donor registers (they'll be asked to enable notifications)
- An emergency request is made (all matched donors get push notifications)
