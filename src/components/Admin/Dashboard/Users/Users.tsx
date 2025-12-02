import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi, type GetUsersParams } from "@/api";
import Loader from "@/components/Common/Loader";
import axios from "axios";

export default function Users() {
    const [role, setRole] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [emailConfirmed, setEmailConfirmed] = useState<boolean | undefined>(undefined);
    const [rewardSystem, setRewardSystem] = useState<string>("");
    const [searchPhrase, setSearchPhrase] = useState<string>("");
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(15);

    // Build query params
    const params: GetUsersParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
    };

    if (role) params.Role = role;
    if (status) params.Status = status;
    if (emailConfirmed !== undefined) params.EmailConfirmed = emailConfirmed;
    if (searchPhrase) params.SearchPhrase = searchPhrase;

    // Fetch users
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["users", params],
        queryFn: () => usersApi.getAll(params),
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Show (Page Size) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Show
                            </label>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1); // Reset to first page when changing page size
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value={15}>15</option>
                                <option value={30}>30</option>
                                <option value={60}>60</option>
                                <option value={90}>90</option>
                            </select>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setPageNumber(1); // Reset to first page when changing role
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Author">Author</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPageNumber(1); // Reset to first page when changing status
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Email Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Status
                            </label>
                            <select
                                value={emailConfirmed === undefined ? "" : emailConfirmed.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEmailConfirmed(value === "" ? undefined : value === "true");
                                    setPageNumber(1); // Reset to first page when changing email status
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All</option>
                                <option value="true">Confirmed</option>
                                <option value="false">Not Confirmed</option>
                            </select>
                        </div>

                        {/* Reward System */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Reward System
                            </label>
                            <select
                                value={rewardSystem}
                                onChange={(e) => {
                                    setRewardSystem(e.target.value);
                                    setPageNumber(1); // Reset to first page when changing reward system
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All</option>
                                <option value="Enabled">Enabled</option>
                                <option value="Disabled">Disabled</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchPhrase}
                                onChange={(e) => setSearchPhrase(e.target.value)}
                                placeholder="Search users..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && <Loader />}

                {/* Error State */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        <p className="font-semibold">
                            {axios.isAxiosError(error) && error.response?.status === 403
                                ? "Access Denied"
                                : "Error loading users"}
                        </p>
                        <p className="text-sm">
                            {axios.isAxiosError(error) && error.response?.status === 403
                                ? "You don't have permission to view users. Please contact your administrator."
                                : error instanceof Error ? error.message : "An error occurred"}
                        </p>
                    </div>
                )}

                {/* Users Table */}
                {!isLoading && !isError && data && (
                    <>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                User
                                            </th>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                Email
                                            </th>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                Role
                                            </th>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                Status
                                            </th>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                Email Confirmed
                                            </th>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                Created At
                                            </th>
                                            <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {data.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            data.items.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            {user.avatarImageUrl ? (
                                                                <img
                                                                    src={user.avatarImageUrl}
                                                                    alt={user.userName}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                    onError={(e) => {
                                                                        // Replace broken image with fallback avatar
                                                                        e.currentTarget.style.display = 'none';
                                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold"
                                                                style={{ display: user.avatarImageUrl ? 'none' : 'flex' }}
                                                            >
                                                                {user.userName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-800">
                                                                {user.userName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-slate-600">{user.email}</td>
                                                    <td className="p-4">
                                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded ${user.isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {user.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded ${user.emailConfirmed
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                        >
                                                            {user.emailConfirmed ? "Confirmed" : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-slate-600">
                                                        {formatDate(user.createdAt)}
                                                    </td>
                                                    <td className="p-4">
                                                        <Link
                                                            to={`/admin/edit-user/${user.id}/${user.userName}`}
                                                            className="text-sm text-primary hover:text-emerald-700 font-medium"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {data.itemsFrom} to {data.itemsTo} of {data.totalCount} users
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                                    disabled={pageNumber === 1}
                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-600">
                                    Page {data.pageNumber} of {data.totalPages}
                                </span>
                                <button
                                    onClick={() =>
                                        setPageNumber((prev) => Math.min(data.totalPages, prev + 1))
                                    }
                                    disabled={pageNumber === data.totalPages}
                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
