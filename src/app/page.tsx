"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Grid,
    List,
    TrendingUp,
    BookOpen,
    Users,
    Award,
} from "lucide-react";

/* -------------------------------------------------
   Mock Data + Types
------------------------------------------------- */
type Publication = {
    id: string;
    title: string;
    authors: string[];
    year: number;
    type: "Journal" | "Conference";
    level: "National" | "International";
};

type SearchFiltersType = {
    keyword?: string;
};

const mockPublications: Publication[] = [
    {
        id: "1",
        title: "Deep Learning for Natural Language Processing",
        authors: ["Alice", "Bob"],
        year: 2023,
        type: "Journal",
        level: "International",
    },
    {
        id: "2",
        title: "Quantum Computing Trends",
        authors: ["Carol"],
        year: 2022,
        type: "Conference",
        level: "National",
    },
    {
        id: "3",
        title: "Blockchain in Education",
        authors: ["Dave", "Eve"],
        year: 2024,
        type: "Journal",
        level: "International",
    },
];

function searchPublications(filters: SearchFiltersType): Publication[] {
    const keyword = filters.keyword?.toLowerCase();
    return mockPublications.filter(
        (p) =>
            !keyword ||
            p.title.toLowerCase().includes(keyword) ||
            p.authors.some((a) => a.toLowerCase().includes(keyword))
    );
}

/* -------------------------------------------------
   Simple UI Components
------------------------------------------------- */
const Button: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline"; size?: "sm" }
> = ({ variant = "default", size, className, ...props }) => {
    const base = "rounded-md font-medium transition";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    };
    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2",
    };
    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size || "md"]} ${className || ""}`}
            {...props}
        />
    );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
                                                                               children,
                                                                               className,
                                                                           }) => <div className={`rounded-lg border shadow-sm bg-white ${className}`}>{children}</div>;

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="border-b p-4">{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
                                                                                      children,
                                                                                      className,
                                                                                  }) => <div className={`p-4 ${className || ""}`}>{children}</div>;

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="font-semibold text-lg">{children}</h3>
);

/* Pagination */
const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
            <Button
                key={i}
                size="sm"
                variant={i + 1 === currentPage ? "default" : "outline"}
                onClick={() => onPageChange(i + 1)}
            >
                {i + 1}
            </Button>
        ))}
    </div>
);

/* SearchFilters */
const SearchFilters: React.FC<{
    filters: SearchFiltersType;
    onFiltersChange: (filters: SearchFiltersType) => void;
    onSearch: () => void;
    showAdvanced: boolean;
    onToggleAdvanced: () => void;
}> = ({ filters, onFiltersChange, onSearch, showAdvanced, onToggleAdvanced }) => {
    return (
        <Card>
            <CardContent className="flex flex-col md:flex-row items-center gap-2">
                <input
                    type="text"
                    value={filters.keyword || ""}
                    onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
                    placeholder="Search publications..."
                    className="flex-1 border rounded-md px-3 py-2"
                />
                <Button onClick={onSearch}>Search</Button>
                <Button variant="outline" onClick={onToggleAdvanced}>
                    {showAdvanced ? "Hide Advanced" : "Show Advanced"}
                </Button>
            </CardContent>
        </Card>
    );
};

/* Publication Card */
const PublicationCard: React.FC<{ publication: Publication; onView: (id: string) => void }> = ({
                                                                                                   publication,
                                                                                                   onView,
                                                                                               }) => (
    <Card>
        <CardContent>
            <h4 className="font-semibold">{publication.title}</h4>
            <p className="text-sm text-gray-600">{publication.authors.join(", ")}</p>
            <p className="text-xs text-gray-500">
                {publication.year} • {publication.type} • {publication.level}
            </p>
            <Button size="sm" className="mt-2" onClick={() => onView(publication.id)}>
                View
            </Button>
        </CardContent>
    </Card>
);

/* Publication Table */
const PublicationTable: React.FC<{ publications: Publication[]; onView: (id: string) => void }> = ({
                                                                                                       publications,
                                                                                                       onView,
                                                                                                   }) => (
    <table className="w-full border text-sm">
        <thead className="bg-gray-100">
        <tr>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Authors</th>
            <th className="border px-2 py-1">Year</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Level</th>
            <th className="border px-2 py-1">Action</th>
        </tr>
        </thead>
        <tbody>
        {publications.map((p) => (
            <tr key={p.id}>
                <td className="border px-2 py-1">{p.title}</td>
                <td className="border px-2 py-1">{p.authors.join(", ")}</td>
                <td className="border px-2 py-1">{p.year}</td>
                <td className="border px-2 py-1">{p.type}</td>
                <td className="border px-2 py-1">{p.level}</td>
                <td className="border px-2 py-1">
                    <Button size="sm" onClick={() => onView(p.id)}>
                        View
                    </Button>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
);

/* -------------------------------------------------
   Main Page Component
------------------------------------------------- */
export default function PublicHomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialKeyword = useMemo(
        () => searchParams.get("q") ?? undefined,
        [searchParams]
    );

    const [filters, setFilters] = useState<SearchFiltersType>({ keyword: initialKeyword });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchResults, setSearchResults] = useState<Publication[]>(mockPublications);
    const itemsPerPage = 12;

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (filters.keyword && filters.keyword.trim().length > 0) {
            params.set("q", filters.keyword.trim());
        } else {
            params.delete("q");
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [filters.keyword, router, searchParams]);

    useEffect(() => {
        const results = searchPublications(filters);
        setSearchResults(results);
        setCurrentPage(1);
    }, [filters]);

    const handleSearch = () => {
        const results = searchPublications(filters);
        setSearchResults(results);
        setCurrentPage(1);
    };

    const handleNavigate = (path: string) => router.push(path);

    const paginatedResults = searchResults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(searchResults.length / itemsPerPage);

    const stats = {
        total: mockPublications.length,
        journals: mockPublications.filter((p) => p.type === "Journal").length,
        conferences: mockPublications.filter((p) => p.type === "Conference").length,
        international: mockPublications.filter((p) => p.level === "International").length,
    };

    return (
        <div className="space-y-8 p-4">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Publication Management System</h1>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    Discover and explore academic publications from our university. Search
                    through journals, conference papers, and research outputs.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm text-gray-500">Publications</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.international}</div>
                            <div className="text-sm text-gray-500">International</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.journals}</div>
                            <div className="text-sm text-gray-500">Journals</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.conferences}</div>
                            <div className="text-sm text-gray-500">Conferences</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Search Filters */}
            <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={handleSearch}
                showAdvanced={showAdvancedFilters}
                onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
            />

            {/* Results Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        {searchResults.length} Publications Found
                    </h2>
                    {Object.keys(filters).length > 0 && (
                        <p className="text-gray-500">
                            Showing results for your search criteria
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("cards")}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results */}
            {paginatedResults.length > 0 ? (
                <>
                    {viewMode === "cards" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedResults.map((publication) => (
                                <PublicationCard
                                    key={publication.id}
                                    publication={publication}
                                    onView={(id) => handleNavigate(`/publication/${id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <PublicationTable
                            publications={paginatedResults}
                            onView={(id) => handleNavigate(`/publication/${id}`)}
                        />
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Publications Found</h3>
                        <p className="text-gray-500 mb-4">
                            Try adjusting your search criteria or browse all publications.
                        </p>
                        <Button onClick={() => setFilters({})}>Clear Filters</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
