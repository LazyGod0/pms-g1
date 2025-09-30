import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  };

  initializeApp({
    credential: cert(serviceAccount as any),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const { userData, adminUid } = await request.json();

    // Verify admin privileges (optional: add more validation)
    if (!adminUid) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Create user with Firebase Admin SDK (this won't affect current auth session)
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      emailVerified: false,
    });

    // Add user data to Firestore using Admin SDK
    const userDoc = {
      uid: userRecord.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      faculty: userData.faculty || "วิทยาศาสตร์",
      department: userData.department || "วิทยาการคอมพิวเตอร์",
      phone: userData.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminUid,
      emailVerified: false,
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userDoc);

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData.name,
      },
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Error creating user:', error);

    let errorMessage = 'Failed to create user';

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'อีเมลนี้มีการใช้งานแล้ว';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message
      },
      { status: 400 }
    );
  }
}
