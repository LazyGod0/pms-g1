
import { NextResponse } from "next/server";
import { db } from "@/configs/firebase-config";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  where 
} from "firebase/firestore";

// GET - ดึงข้อมูลผู้ใช้ทั้งหมด
export const GET = async (req: Request) => {
  try {
    console.log("Fetching users from Firestore...");
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Successfully fetched ${users.length} users`);
    return NextResponse.json(
      { users, total: users.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    // ถ้าไม่มี users collection ให้ return empty array
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      console.log("Users collection not found, returning empty array");
      return NextResponse.json(
        { users: [], total: 0 },
        { status: 200 }
      );
    }
    return NextResponse.json({
      error: "Failed to fetch users",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
};

    // POST - สร้างผู้ใช้ใหม่
export const POST = async (req: Request) => {
  try {
    console.log("Creating new user...");
    const { 
      name, 
      email, 
      role, 
      faculty,
      department, 
      phone
    } = await req.json();

    console.log("User data received:", { name, email, role, faculty, department, phone });    // Validate required fields
    if (!name || !email || !role) {
      console.log("Missing required fields");
      return NextResponse.json({
        error: "Missing required fields",
        message: "Name, email, and role are required"
      }, { status: 400 });
    }

    // ตรวจสอบว่า email ซ้ำหรือไม่
    console.log("Checking for existing email:", email);
    const usersCollection = collection(db, "users");
    
    try {
      const emailQuery = query(usersCollection, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        console.log("Email already exists:", email);
        return NextResponse.json({
          error: "Email already exists",
          message: "A user with this email already exists"
        }, { status: 409 });
      }
    } catch (emailCheckError) {
      // ถ้า collection ไม่มี ให้ผ่านไปได้เลย
      console.log("Collection might not exist yet, proceeding with user creation");
    }

    // สร้างข้อมูลผู้ใช้ใหม่
    const userData = {
      name,
      email,
      role,
      faculty: faculty || "",
      department: department || "",
      phone: phone || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log("Adding user to Firestore...");
    const docRef = await addDoc(usersCollection, userData);
    console.log("User created with ID:", docRef.id);
    
    const newUser = {
      id: docRef.id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: newUser 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    // ให้ข้อมูล error ที่ละเอียดขึ้น
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('NOT_FOUND')) {
        errorMessage = "Firebase project or collection not found. Please check your Firebase configuration.";
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = "Permission denied. Please check your Firebase security rules.";
      }
    }
    
    return NextResponse.json({
      error: "Failed to create user",
      message: errorMessage,
      details: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
};
