import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/configs/firebase-config';
import { Publication, PublicationSearchFilters } from '@/types/submission';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse search parameters
        const filters: PublicationSearchFilters = {
            keyword: searchParams.get('keyword') || undefined,
            author: searchParams.get('author') || undefined,
            yearFrom: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : undefined,
            yearTo: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : undefined,
            type: searchParams.get('type') || 'All',
            level: searchParams.get('level') || 'All',
            status: searchParams.get('status') || 'All',
            isPublic: searchParams.get('isPublic') === 'false' ? false : true,
        };

        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '12');

        console.log('API: Fetching publications with filters:', filters);

        // Start with a basic query - check if collection exists first
        let publications: Publication[] = [];
        let totalCount = 0;

        try {
            // Simple query first to check if collection exists
            const basicQuery = query(
                collection(db, 'publications'),
                orderBy('createdAt', 'desc')
            );

            const basicSnapshot = await getDocs(basicQuery);
            console.log('API: Found', basicSnapshot.size, 'total documents');

            // Convert documents to publications
            basicSnapshot.forEach((doc) => {
                try {
                    const data = doc.data();
                    const publication: Publication = {
                        id: doc.id,
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
                        isPublic: data.isPublic !== false, // Default to true if not specified
                    };
                    publications.push(publication);
                } catch (docError) {
                    console.warn('API: Error processing document', doc.id, ':', docError);
                }
            });

            // Apply filters
            if (filters.isPublic !== undefined) {
                publications = publications.filter(p => p.isPublic === filters.isPublic);
            }

            if (filters.type && filters.type !== 'All') {
                publications = publications.filter(p => p.type === filters.type);
            }

            if (filters.level && filters.level !== 'All') {
                publications = publications.filter(p => p.level === filters.level);
            }

            if (filters.status && filters.status !== 'All') {
                publications = publications.filter(p => p.status === filters.status);
            }

            if (filters.yearFrom) {
                publications = publications.filter(p => p.year >= filters.yearFrom!);
            }

            if (filters.yearTo) {
                publications = publications.filter(p => p.year <= filters.yearTo!);
            }

            // Apply client-side filters for text search
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                publications = publications.filter(pub =>
                    pub.title.toLowerCase().includes(keyword) ||
                    pub.abstract?.toLowerCase().includes(keyword) ||
                    pub.keywords?.some(k => k.toLowerCase().includes(keyword)) ||
                    pub.authors.some(author =>
                        (typeof author === 'string' ? author : author.name).toLowerCase().includes(keyword)
                    )
                );
            }

            if (filters.author) {
                const authorName = filters.author.toLowerCase();
                publications = publications.filter(pub =>
                    pub.authors.some(author =>
                        (typeof author === 'string' ? author : author.name).toLowerCase().includes(authorName)
                    )
                );
            }

            totalCount = publications.length;

            // Apply pagination
            const start = (page - 1) * pageSize;
            publications = publications.slice(start, start + pageSize);

            console.log('API: Returning', publications.length, 'publications out of', totalCount, 'total');

        } catch (firestoreError) {
            console.warn('API: Firestore query error:', firestoreError);
            // If Firestore fails, return empty results
            publications = [];
            totalCount = 0;
        }

        return NextResponse.json({
            success: true,
            data: {
                publications,
                pagination: {
                    page,
                    pageSize,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                    hasNext: page * pageSize < totalCount,
                    hasPrev: page > 1,
                },
                filters: filters
            }
        });

    } catch (error) {
        console.error('API: Error fetching publications:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch publications',
                message: error instanceof Error ? error.message : 'Unknown error',
                publications: [],
                pagination: {
                    page: 1,
                    pageSize: 12,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                }
            },
            { status: 200 } // Return 200 instead of 500 to prevent client errors
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // This would be used for creating new publications
        // Implementation depends on authentication and authorization
        return NextResponse.json({
            success: false,
            error: 'POST method not implemented yet'
        }, { status: 501 });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create publication'
            },
            { status: 500 }
        );
    }
}
