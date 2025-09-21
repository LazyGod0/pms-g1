import { NextResponse } from "next/server";
import { db } from "@/configs/firebase-config";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

// GET - ดึงข้อมูลผู้ใช้ตาม ID
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    const userData = {
      id: userSnapshot.id,
      ...userSnapshot.data()
    };

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({
      error: "Failed to fetch user",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
};

// PUT - อัปเดตข้อมูลผู้ใช้
export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const { 
      name, 
      email, 
      role, 
      faculty, 
      department, 
      phone, 
      status 
    } = await req.json();

    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    // ตรวจสอบว่า email ซ้ำกับผู้ใช้อื่นหรือไม่ (ถ้ามีการเปลี่ยน email)
    if (email && email !== userSnapshot.data()?.email) {
      const usersCollection = collection(db, "users");
      const emailQuery = query(
        usersCollection, 
        where("email", "==", email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        return NextResponse.json({
          error: "Email already exists",
          message: "A user with this email already exists"
        }, { status: 409 });
      }
    }

    // อัปเดตข้อมูล
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(faculty !== undefined && { faculty }),
      ...(department !== undefined && { department }),
      ...(phone !== undefined && { phone }),
      ...(status && { status }),
      updatedAt: serverTimestamp()
    };

    await updateDoc(userDoc, updateData);

    // ดึงข้อมูลที่อัปเดตแล้ว
    const updatedSnapshot = await getDoc(userDoc);
    const updatedUser = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };

    return NextResponse.json(
      { 
        message: "User updated successfully", 
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({
      error: "Failed to update user",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
};

// DELETE - ลบผู้ใช้
export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    // ลบผู้ใช้
    await deleteDoc(userDoc);

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({
      error: "Failed to delete user",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
};