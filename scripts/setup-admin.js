// Admin User Setup Script
// Run this to create the admin user in Firebase

const adminEmail = "markjaycalatay2@gmail.com";
const adminPassword = "mark-jay1129";

console.log("=========================================");
console.log("Admin User Setup Instructions");
console.log("=========================================");
console.log("");
console.log("Firebase Authentication does not allow client-side user creation.");
console.log("You must create this user manually in Firebase Console:");
console.log("");
console.log("1. Go to https://console.firebase.google.com");
console.log("2. Select your 'QR code Attendance' project");
console.log("3. Click 'Authentication' in left sidebar");
console.log("4. Click 'Users' tab");
console.log("5. Click 'Add user'");
console.log("");
console.log("6. Enter these credentials:");
console.log(`   Email:    ${adminEmail}`);
console.log(`   Password: ${adminPassword}`);
console.log("");
console.log("7. Click 'Add user'");
console.log("");
console.log("8. Then set the admin role in Firestore:");
console.log("   - Go to 'Firestore Database'");
console.log("   - Create 'users' collection");
console.log("   - Add document with ID matching the user's UID");
console.log("   - Add fields:");
console.log("       email: 'markjaycalatay2@gmail.com'");
console.log("       role: 'admin'");
console.log("       fullName: 'Mark Jay Calatay'");
console.log("");
console.log("=========================================");

// Alternative: Using Firebase REST API (requires API key)
// This is a browser-based approach
async function createUserViaAPI(apiKey) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      returnSecureToken: true,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create user');
  }
  
  return await response.json();
}

// Export for potential use
module.exports = { adminEmail, adminPassword, createUserViaAPI };
