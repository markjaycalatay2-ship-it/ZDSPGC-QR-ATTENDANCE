// Reset Admin Password Script
// Run: node scripts/reset-admin-password.js

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const adminEmail = "markjaycalatay2@gmail.com";
const adminPassword = "mark-jay1129";

if (!API_KEY) {
  console.error("❌ Error: NEXT_PUBLIC_FIREBASE_API_KEY not found");
  process.exit(1);
}

async function resetPassword() {
  console.log("=========================================");
  console.log("Resetting Admin Password");
  console.log("=========================================");
  console.log("");
  console.log(`Email: ${adminEmail}`);
  console.log(`New Password: ${adminPassword}`);
  console.log("");

  try {
    // Step 1: Send password reset email
    console.log("Step 1: Sending password reset email...");
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: adminEmail,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send reset email');
    }

    console.log("✅ Password reset email sent!");
    console.log("");
    console.log("Check your email (markjaycalatay2@gmail.com)");
    console.log("and click the reset link to set a new password.");
    console.log("");
    console.log("OR use this reset link format:");
    console.log(`https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/auth/action?mode=resetPassword&oobCode=${data.oobCode || '[CHECK_EMAIL]'}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("");
    console.log("Alternative: Go to Firebase Console → Authentication → Users");
    console.log("Find the user and click 'Reset password'");
  }
}

resetPassword();
