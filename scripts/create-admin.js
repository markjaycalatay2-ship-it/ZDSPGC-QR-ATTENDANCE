// Create Admin User Script
// Run: node scripts/create-admin.js

const adminEmail = "markjaycalatay2@gmail.com";
const adminPassword = "mark-jay1129";
const adminName = "Mark Jay Calatay";

// Get Firebase API key from environment
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: NEXT_PUBLIC_FIREBASE_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("=========================================");
console.log("Creating Admin User");
console.log("=========================================");
console.log("");
console.log(`Email: ${adminEmail}`);
console.log(`Name: ${adminName}`);
console.log("");

async function createAdminUser() {
  try {
    // Step 1: Create user in Firebase Authentication
    console.log("Step 1: Creating user in Firebase Authentication...");
    
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          returnSecureToken: true,
        }),
      }
    );

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      if (authData.error?.message?.includes('EMAIL_EXISTS')) {
        console.log("⚠️  User already exists in Authentication.");
        console.log("   You can sign in with existing credentials.");
      } else {
        throw new Error(authData.error?.message || 'Failed to create user');
      }
    } else {
      console.log("✅ User created successfully in Firebase Authentication");
      console.log(`   UID: ${authData.localId}`);
    }

    // Step 2: Get ID token for Firestore operations
    console.log("");
    console.log("Step 2: Authenticating for Firestore access...");
    
    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInResponse.json();
    
    if (!signInResponse.ok) {
      throw new Error(signInData.error?.message || 'Failed to sign in');
    }

    const idToken = signInData.idToken;
    const uid = signInData.localId;
    console.log(`✅ Signed in successfully (UID: ${uid})`);

    // Step 3: Create Firestore document
    console.log("");
    console.log("Step 3: Creating user document in Firestore...");
    
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    const firestoreResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=email&updateMask.fieldPaths=role&updateMask.fieldPaths=fullName`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            email: { stringValue: adminEmail },
            role: { stringValue: "admin" },
            fullName: { stringValue: adminName },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        }),
      }
    );

    if (!firestoreResponse.ok) {
      const firestoreError = await firestoreResponse.text();
      console.log("⚠️  Firestore document creation failed:");
      console.log("   This usually means Firestore is not enabled or rules don't allow writes.");
      console.log("   Error:", firestoreError);
      console.log("");
      console.log("   Please create the document manually:");
      console.log(`   - Collection: users`);
      console.log(`   - Document ID: ${uid}`);
      console.log(`   - Fields: email, role: "admin", fullName`);
    } else {
      console.log("✅ Firestore document created successfully");
    }

    console.log("");
    console.log("=========================================");
    console.log("✅ Admin Setup Complete!");
    console.log("=========================================");
    console.log("");
    console.log("You can now log in at:");
    console.log("http://localhost:3000/login/admin");
    console.log("");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdminUser();
