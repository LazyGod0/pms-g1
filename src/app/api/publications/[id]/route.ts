import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/configs/firebase-config';
import { Publication } from '@/types/submission';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Publication ID is required' },
                { status: 400 }
            );
        }

        console.log('API: Fetching publication with ID:', id);

        try {
            const docRef = doc(db, 'publications', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return NextResponse.json(
                    { success: false, error: 'Publication not found' },
                    { status: 404 }
                );
            }

            const data = docSnap.data();
            const publication: Publication = {
                id: docSnap.id,
                title: data.title || 'Untitled',
                authors: data.authors || [],
                year: data.year || new Date().getFullYear(),
                type: data.type || 'Journal',
                level: data.level || 'National',
                status: data.status || 'Published',
                abstract: data.abstract,
                keywords: data.keywords,
                doi: data.doi,
                journal: data.journal,
                conference: data.conference,
                volume: data.volume,
                issue: data.issue,
                pages: data.pages,
                attachments: data.attachments || [],
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                publishedDate: data.publishedDate?.toDate(),
                submissionDate: data.submissionDate?.toDate(),
                acceptanceDate: data.acceptanceDate?.toDate(),
                createdBy: data.createdBy || '',
                isPublic: data.isPublic !== false,
            };

            console.log('API: Successfully retrieved publication:', publication.title);

            return NextResponse.json({
                success: true,
                data: publication
            });

        } catch (firestoreError) {
            console.error('API: Firestore error:', firestoreError);
            return NextResponse.json(
                { success: false, error: 'Database connection error' },
                { status: 200 } // Return 200 to prevent client errors
            );
        }

    } catch (error) {
        console.error('API: Error fetching publication:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch publication',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 200 } // Return 200 instead of 500 to prevent client errors
        );
    }
}
