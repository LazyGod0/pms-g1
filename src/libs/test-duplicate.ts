// Test utility for duplicate publication checking
import { checkDuplicatePublication } from './firestore-utils';

export async function testDuplicateCheck(
  uid: string,
  title: string,
  year: string
): Promise<void> {
  console.log('🧪 Testing duplicate check...');
  console.log('Input parameters:', { uid, title, year });

  try {
    const result = await checkDuplicatePublication(uid, title, year);
    console.log('✅ Test completed. Result:', result);
    return;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Helper function to normalize strings for comparison
export function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Enhanced duplicate check with normalized comparison
export async function checkDuplicatePublicationNormalized(
  uid: string,
  title: string,
  year: string
): Promise<boolean> {
  const normalizedTitle = normalizeString(title);
  const normalizedYear = year.trim();

  console.log('🔍 Normalized check:', {
    original: { title, year },
    normalized: { title: normalizedTitle, year: normalizedYear }
  });

  return await checkDuplicatePublication(uid, normalizedTitle, normalizedYear);
}
