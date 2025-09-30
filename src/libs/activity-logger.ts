import { addDoc, collection, serverTimestamp, getFirestore } from "firebase/firestore";

const db = getFirestore();

export interface ActivityLogData {
    // ข้อมูลผู้ทำ (Who)
    userId: string;
    userEmail: string;
    userName: string;
    userRole: "admin" | "lecturer" | "staff" | "student" | "editor" | "viewer" | string; // รองรับ role อื่นๆ ในอนาคต

    // การกระทำ (What)
    action: "login" | "logout" | "create" | "edit" | "delete" | "view" | "export" | "import" | "approve" | "reject" | "submit" | "download" | "upload" | string;
    actionText: string;
    category: "auth" | "user_management" | "content" | "system" | "report" | "file" | string; // หมวดหมู่การกระทำ

    // เป้าหมาย (Where/What target)
    targetType?: "user" | "submission" | "file" | "report" | "system_setting" | string; // ประเภทเป้าหมาย
    targetId?: string;
    targetName?: string;

    // รายละเอียด (How)
    method?: "web" | "api" | "mobile" | "import" | string; // วิธีการเข้าถึง
    ipAddress?: string;
    userAgent?: string;
    location?: string; // สถานที่ (ถ้ามี geolocation)

    // ข้อมูลเพิ่มเติม
    details?: string;
    metadata?: Record<string, any>; // ข้อมูลเพิ่มเติมแบบ flexible
    severity?: "low" | "medium" | "high" | "critical"; // ระดับความสำคัญ

    // ข้อมูลการเปลี่ยนแปลง (สำหรับ edit actions)
    changes?: {
        field: string;
        oldValue?: any;
        newValue?: any;
    }[];

    // Session tracking
    sessionId?: string;
    requestId?: string;
}

// Helper function to remove undefined values from object
const removeUndefinedValues = (obj: any): any => {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
                // Recursively clean nested objects
                const cleanedNested = removeUndefinedValues(value);
                if (Object.keys(cleanedNested).length > 0) {
                    cleaned[key] = cleanedNested;
                }
            } else if (Array.isArray(value)) {
                // Clean array elements
                const cleanedArray = value.filter(item => item !== undefined && item !== null);
                if (cleanedArray.length > 0) {
                    cleaned[key] = cleanedArray;
                }
            } else {
                cleaned[key] = value;
            }
        }
    }

    return cleaned;
};

// Function to log user activity - enhanced version with undefined value handling
export const logUserActivity = async (activityData: ActivityLogData) => {
    try {
        // Only log if we're on the client side
        if (typeof window === 'undefined') {
            console.log("Activity logging skipped on server side");
            return;
        }

        // Validate required fields
        if (!activityData.userId || !activityData.action || !activityData.actionText) {
            console.error("Missing required fields for activity logging:", {
                userId: activityData.userId,
                action: activityData.action,
                actionText: activityData.actionText
            });
            return;
        }

        // Generate session ID if not provided
        const sessionId = activityData.sessionId || generateSessionId();

        // Build the activity data with defaults and auto-detection
        const enhancedData = {
            // Required fields with defaults
            userId: activityData.userId,
            userEmail: activityData.userEmail || "unknown@system.com",
            userName: activityData.userName || "Unknown User",
            userRole: activityData.userRole || "user",
            action: activityData.action,
            actionText: activityData.actionText,

            // Optional fields with defaults
            category: activityData.category || getCategoryByAction(activityData.action),
            method: activityData.method || "web",
            severity: activityData.severity || getSeverityByAction(activityData.action),

            // Technical details with fallbacks
            ipAddress: activityData.ipAddress || getClientIP(),
            userAgent: activityData.userAgent || getUserAgent(),
            sessionId,

            // Timestamps
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp(),

            // Optional fields (only include if they have values)
            ...(activityData.targetType && { targetType: activityData.targetType }),
            ...(activityData.targetId && { targetId: activityData.targetId }),
            ...(activityData.targetName && { targetName: activityData.targetName }),
            ...(activityData.location && { location: activityData.location }),
            ...(activityData.details && { details: activityData.details }),
            ...(activityData.requestId && { requestId: activityData.requestId }),

            // Complex optional fields
            ...(activityData.changes && activityData.changes.length > 0 && {
                changes: activityData.changes.filter(change =>
                    change.field && (change.oldValue !== undefined || change.newValue !== undefined)
                )
            }),
            ...(activityData.metadata && Object.keys(activityData.metadata).length > 0 && {
                metadata: removeUndefinedValues(activityData.metadata)
            })
        };

        // Remove any remaining undefined values
        const cleanedData = removeUndefinedValues(enhancedData);

        // Use the existing 'activities' collection
        await addDoc(collection(db, "activities"), cleanedData);

        console.log("Enhanced activity logged:", {
            user: cleanedData.userName,
            role: cleanedData.userRole,
            action: cleanedData.action,
            target: cleanedData.targetName || cleanedData.targetId || "system",
            severity: cleanedData.severity
        });
    } catch (error) {
        console.error("Error logging activity:", error);
        // Don't throw error to avoid breaking the main flow
    }
};

// Helper function to generate session ID
const generateSessionId = (): string => {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to determine severity by action
const getSeverityByAction = (action: string): ActivityLogData["severity"] => {
    const severityMap: Record<string, ActivityLogData["severity"]> = {
        "login": "low",
        "logout": "low",
        "view": "low",
        "create": "medium",
        "edit": "medium",
        "delete": "high",
        "approve": "high",
        "reject": "high",
        "export": "medium",
        "import": "high",
        "upload": "medium",
        "download": "low",
    };
    return severityMap[action] || "low";
};

// Helper function to determine category by action
const getCategoryByAction = (action: string): string => {
    const categoryMap: Record<string, string> = {
        "login": "auth",
        "logout": "auth",
        "create": "content",
        "edit": "content",
        "delete": "content",
        "view": "content",
        "approve": "content",
        "reject": "content",
        "export": "report",
        "import": "system",
        "upload": "file",
        "download": "file",
    };
    return categoryMap[action] || "system";
};

// Function to get client IP (placeholder for development)
export const getClientIP = () => {
    // This is a placeholder - in production, you'd get this from server headers
    // For now, return a placeholder value instead of undefined
    return "127.0.0.1"; // localhost placeholder
};

// Function to get user agent
export const getUserAgent = () => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined' && window.navigator) {
        return window.navigator.userAgent || "Unknown Browser";
    }
    // Return placeholder for server-side or when navigator is unavailable
    return "Server/Unknown";
};

// Function to get approximate location (if geolocation is available)
export const getApproximateLocation = async (): Promise<string> => {
    try {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve(`${latitude.toFixed(2)},${longitude.toFixed(2)}`);
                    },
                    () => resolve("Unknown"),
                    { timeout: 5000 }
                );
            });
        }
    } catch (error) {
        console.error("Error getting location:", error);
    }
    return "Unknown";
};
