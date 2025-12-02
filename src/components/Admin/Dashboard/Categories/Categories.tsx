import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, type GetCategoriesParams } from "@/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Categories() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<string>("");
    const [parentCategory, setParentCategory] = useState<string>("");
    const [searchPhrase, setSearchPhrase] = useState<string>("");

    // Build query params
    const params: GetCategoriesParams = {
        WithSub: true,
        IsActive: true, // Only show active categories by default
    };

    if (language) params.Language = language;
    if (searchPhrase) params.SearchPhrase = searchPhrase;

    // Fetch categories
    const { data: categories, isError, error } = useQuery({
        queryKey: ["categories", params],
        queryFn: () => categoriesApi.getAll(params),
    });

    // Filter by parent category on frontend if needed
    const filteredCategories = categories?.filter(cat => {
        if (!parentCategory) return true;
        return cat.parentCategoryName === parentCategory || cat.name === parentCategory;
    });

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Categories</h2>
                    <button
                        type="button"
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-[#13967B] hover:bg-[#0e7a64] text-white rounded-lg shadow-md transition-all"
                        onClick={() => navigate("/admin/add-category")}
                    >
                        <span>+ Add Category</span>
                    </button>
                </div>

                {/* Filters */}
                <form className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Language */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
                            >
                                <option value="">All</option>
                                <option value="English">English</option>
                                <option value="Arabic">Arabic</option>
                            </select>
                        </div>

                        {/* Parent Category */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Parent Category</label>
                            <select
                                value={parentCategory}
                                onChange={(e) => setParentCategory(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
                            >
                                <option value="">All</option>
                                {categories?.filter(c => c.parentCategoryId === null).map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="col-span-2 flex items-end space-x-2">
                            <input
                                id="search"
                                placeholder="Search"
                                value={searchPhrase}
                                onChange={(e) => setSearchPhrase(e.target.value)}
                                className="grow mt-1 block p-2 border-gray-300 rounded-md focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm"
                                type="text"
                            />
                            <button
                                type="button"
                                className="px-6 py-2 bg-[#13967B] hover:bg-[#0e7a64] text-white rounded-md transition-colors"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-sm text-left text-gray-600 border-collapse table-auto">
                            <thead className="text-xs uppercase text-gray-700 bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Id</th>
                                    <th className="px-6 py-3">Category Name</th>
                                    <th className="px-6 py-3">Language</th>
                                    <th className="px-6 py-3">Parent Category</th>
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Options</th>
                                </tr>
                            </thead>

                            <AnimatePresence mode="wait">
                                {isError ? (
                                    <motion.tbody
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <tr>
                                            <td colSpan={7} className="text-center py-16">
                                                <div className="flex flex-col items-center space-y-4">
                                                    <svg
                                                        className="h-16 w-16 text-red-500"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            Error loading categories
                                                        </h3>
                                                        <p className="text-gray-600 mb-4">
                                                            {error instanceof Error ? error.message : "An error occurred"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </motion.tbody>
                                ) : (
                                    <motion.tbody
                                        key="table"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        {filteredCategories?.map((category, index) => (
                                            <tr
                                                key={category.id}
                                                className="border-b hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{category.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{category.language}</td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {category.parentCategoryName || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{category.order}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            category.isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {category.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        className="px-4 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                                                        onClick={() => navigate(`/admin/edit-category/${category.id}`)}
                                                    >
                                                        Select an option ▼
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </motion.tbody>
                                )}
                            </AnimatePresence>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
