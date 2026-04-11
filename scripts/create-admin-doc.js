// Create Firestore Admin Document
// Uses Firebase REST API to create the user document

require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// The UID you provided
const ADMIN_UID = "NDz1UceLMbV7jTBmwIf7GHwXeeb2";
const ADMIN_EMAIL = "markjaycalatay2@gmail.com";
const ADMIN_NAME = "Mark Jay Calatay";

if (!PROJECT_ID || !API_KEY) {
  console.error("❌ Error: Firebase config not found in .env.local");
  process.exit(1);
}

console.log("=========================================");
console.log("Creating Admin Document in Firestore");
console.log("=========================================");
console.log("");
console.log(`UID: ${ADMIN_UID}`);
console.log(`Email: ${ADMIN_EMAIL}`);
console.log("");

async function createAdminDocument() {
  try {
    // First, sign in to get an ID token
    console.log("Step 1: Authenticating...");
    
    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: "mark-jay1129",
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInResponse.json();
    
    if (!signInResponse.ok) {
      console.error("❌ Authentication failed:", signInData.error?.message);
      console.log("");
      console.log("The password 'mark-jay1129' doesn't work.");
      console.log("Please use the HTML file (scripts/verify-login.html) to:");
      console.log("1. Create a new admin with a working password");
      console.log("OR");
      console.log("2. Reset the password in Firebase Console");
      return;
    }

    const idToken = signInData.idToken;
    console.log("✅ Authenticated successfully");
    console.log("");

    // Step 2: Create Firestore document
    console.log("Step 2: Creating Firestore document...");
    
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${ADMIN_UID}`;
    
    const firestoreResponse = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        fields: {
          email: { stringValue: ADMIN_EMAIL },
          fullName: { stringValue: ADMIN_NAME },
          role: { stringValue: "admin" },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    if (!firestoreResponse.ok) {
      const errorText = await firestoreResponse.text();
      console.error("❌ Firestore error:", errorText);
      console.log("");
      console.log("You may need to enable Firestore or update security rules.");
      console.log("Go to: https://console.firebase.google.com → Firestore Database");
      return;
    }

    console.log("✅ Admin document created successfully!");
    console.log("");
    console.log("=========================================");
    console.log("✅ Setup Complete!");
    console.log("=========================================");
    console.log("");
    console.log("You can now login at:");
    console.log("http://localhost:3000/login/admin");
    console.log("");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: mark-jay1129`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createAdminDocument();
