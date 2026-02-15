"use client";
import { adminUsersService } from "@/services/admin/users";
import { useEffect, useState } from "react";
import {
  Trash2,
  Pencil,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Filter,
  Shield,
  Mail,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import UsersLoading from "./UsersLoading";
import { adminPropertiesService } from "@/services/admin/properties";

type Property = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  image: string;
  createdAt: string;
  verified: string;
  userId: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  image: string;
  createdAt: string;
  verified: string;
  subscribed: string;
};

const roleItem = [
  { id: 1, name: "superadmin" },
  { id: 2, name: "admin" },
  { id: 3, name: "user" },
];

const filterRoleOptions = [
  { id: 0, name: "all", label: "All Roles" },
  { id: 1, name: "superadmin", label: "Super Admin" },
  { id: 2, name: "admin", label: "Admin" },
  { id: 3, name: "user", label: "User" },
];

const UserLists = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await adminPropertiesService.getAllProperties();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = debouncedSearch
          ? await adminUsersService.searchUsers(debouncedSearch)
          : await adminUsersService.getAllUsers(
              currentPage,
              itemsPerPage,
              filterRole,
            );

        if (Array.isArray(data)) {
          setUsers(data);
          setTotalPages(1);
          setTotalUsers(data.length);
        } else {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages);
          setTotalUsers(data.pagination.total);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, debouncedSearch, itemsPerPage, filterRole]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await adminUsersService.deleteUser(id);
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleUpdateRole = async (id: string, role: string) => {
    await adminUsersService.updateUser(id, { role });
    setUsers(users.map((user) => (user.id === id ? { ...user, role } : user)));
    setOpenDropdown(null);
  };

  const handleUpdateUserImage = async (id: string, data: User) => {
    const fileInput = document.getElementById(
      `image-input-${id}`,
    ) as HTMLInputElement;
    if (!fileInput?.files?.[0]) return;

    const file = fileInput.files[0];
    try {
      await adminUsersService.updateUserImage(id, file);
      // Optimistic update for immediate feedback
      const reader = new FileReader();
      reader.onload = (e) => {
        setUsers(
          users.map((u) =>
            u.id === id ? { ...u, image: e.target?.result as string } : u,
          ),
        );
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error("Failed to update image", e);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "admin":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "user":
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header & Controls */}
      <div className=" flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            User Management
          </h1>
          <p className="text-neutral-400 text-sm">
            Manage access, roles, and user profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-[#1A1A1E] text-neutral-300 pl-10 pr-4 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-medium ${
                filterDropdownOpen
                  ? "bg-[#1A1A1E] border-indigo-500/50 text-white"
                  : "bg-[#1A1A1E] border-[#27272A] text-neutral-400 hover:text-white"
              }`}
            >
              <Filter size={16} />
              <span className="hidden md:inline">
                {filterRoleOptions.find((r) => r.name === filterRole)?.label ||
                  "Filter"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  filterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {filterDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden"
                >
                  <div className="p-1">
                    {filterRoleOptions.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setFilterRole(role.name);
                          setFilterDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          filterRole === role.name
                            ? "bg-indigo-600/10 text-indigo-400 font-medium"
                            : "text-neutral-400 hover:bg-[#27272A] hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            filterRole === role.name
                              ? "bg-indigo-500"
                              : "bg-neutral-600"
                          }`}
                        />
                        {role.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl overflow-hidden flex-1 flex flex-col shadow-sm relative">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#27272A] bg-[#151517]">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 w-20 text-center">
                  Avatar
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  User
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 ">
                  Listings
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Role
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Subscribed
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Verified
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <UsersLoading />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-10 w-full h-96 text-center text-neutral-500"
                  >
                    <div className="flex flex-col h-full items-center justify-center gap-2">
                      <UserIcon
                        size={40}
                        strokeWidth={1.5}
                        className="text-neutral-600 mb-2"
                      />
                      <p>No users found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-[#202024] transition-colors"
                  >
                    {/* Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center relative w-10 h-10 mx-auto group/avatar cursor-pointer">
                        <img
                          src={
                            user.image ||
                            "https://ui-avatars.com/api/?name=" +
                              user.name +
                              "&background=random"
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#1A1A1E] shadow-sm group-hover/avatar:opacity-75 transition-opacity"
                        />
                        <input
                          type="file"
                          id={`image-input-${user.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={() => handleUpdateUserImage(user.id, user)}
                        />
                        <button
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                          onClick={() =>
                            document
                              .getElementById(`image-input-${user.id}`)
                              ?.click()
                          }
                        >
                          <Pencil size={14} className="text-white" />
                        </button>
                      </div>
                    </td>

                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors cursor-pointer hover:underline decoration-indigo-500/50 underline-offset-2"
                          onClick={() =>
                            router.push(`/dashboard/users/${user.id}`)
                          }
                        >
                          {user.name || "Unknown User"}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                          <Mail size={12} />
                          <span className="truncate max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Listings */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-200 pl-5">
                          {
                            properties.filter(
                              (property) => property.userId === user.id,
                            ).length
                          }
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === user.id ? null : user.id,
                            )
                          }
                          className={`w-32 flex items-center justify-between cursor-pointer gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all hover:brightness-110 ${getRoleBadgeColor(
                            user.role,
                          )}`}
                        >
                          <Shield size={12} />
                          {user.role}
                          <ChevronDown size={12} className="opacity-50" />
                        </button>

                        <AnimatePresence>
                          {openDropdown === user.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute left-0  top-full mt-2 w-32 bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                              {roleItem.map((role) => (
                                <button
                                  key={role.id}
                                  onClick={() =>
                                    handleUpdateRole(user.id, role.name)
                                  }
                                  className="w-full text-left px-3 py-2 text-xs cursor-pointer text-neutral-400 hover:text-white hover:bg-[#27272A] transition-colors capitalize"
                                >
                                  {role.name}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>

                    {/* Subscribed */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`inline-flex items-center w-2 h-2 rounded-full ${
                            user.verified === "verified"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        <span className="text-xs text-neutral-400 capitalize">
                          {user.subscribed || "Unsubscribed"}
                        </span>
                      </div>
                    </td>

                    {/* Verified */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`inline-flex items-center w-2 h-2 rounded-full ${
                            user.verified === "verified"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        <span className="text-xs text-neutral-400 capitalize">
                          {user.verified || "Unverified"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`inline-flex items-center w-2 h-2 rounded-full ${
                            user.status === "active"
                              ? "bg-green-500"
                              : "bg-neutral-500"
                          }`}
                        ></span>
                        <span className="text-xs text-neutral-400 capitalize">
                          {user.status || "Active"}
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] transition-colors"
                          onClick={() =>
                            router.push(`/chat-db?userId=${user.id}`)
                          }
                          title="Chat"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-[#27272A] bg-[#151517] flex items-center justify-between z-10 relative">
          <p className="text-xs text-neutral-500">
            Showing {users.length} of {totalUsers} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-neutral-500 hover:bg-[#27272A] hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLists;
