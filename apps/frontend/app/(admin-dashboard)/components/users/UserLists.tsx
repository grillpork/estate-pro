"use client";
import { adminUsersService } from "@/services/admin/users";
import { useEffect, useState } from "react";
import {
  Trash2,
  Pencil,
  Search,
  ChevronDown,
  LoaderCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UsersLoading from "./UsersLoading";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
};

const roleItem = [
  { id: 1, name: "superadmin" },
  { id: 2, name: "admin" },
  { id: 3, name: "user" },
];

const filterRoleOptions = [
  { id: 0, name: "all", label: "ทั้งหมด" },
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
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const router = useRouter();

  // Debounce search term - รอ 500ms หลังหยุดพิมพ์
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data เมื่อ debouncedSearch เปลี่ยน
  useEffect(() => {
    const fetchUsers = async () => {
      const data = debouncedSearch
        ? await adminUsersService.searchUsers(debouncedSearch) // ค้นหา
        : await adminUsersService.getAllUsers(
            currentPage,
            itemsPerPage,
            filterRole,
          ); // ดึงทั้งหมด

      // Handle response
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
        setTotalUsers(data.length);
      } else {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
      }
    };
    fetchUsers();
  }, [currentPage, debouncedSearch, itemsPerPage, filterRole]);

  const filterUsers = users.filter((user: User) => {
    if (filterRole === "all") {
      return true;
    }
    return user.role === filterRole;
  });

  const handleDeleteUser = async (id: string) => {
    await adminUsersService.deleteUser(id);
    setUsers(users.filter((user: User) => user.id !== id));
    return;
  };

  const handleUpdateRole = async (id: string, role: string) => {
    await adminUsersService.updateUser(id, { role });
    setUsers(
      users.map((user: User) => (user.id === id ? { ...user, role } : user)),
    );
    return;
  };

  const handleUpdateUserImage = async (id: string, data: User) => {
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (!fileInput?.files?.[0]) {
      alert("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    const file = fileInput.files[0];
    await adminUsersService.updateUserImage(id, file);
    setUsers(users.map((user: User) => (user.id === id ? data : user)));
    return;
  };

  return (
    <div className="flex flex-col p-2 gap-2 h-full">
      {/* Search Bar */}
      <div className="flex gap-2 relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />

        <input
          type="text"
          id="search"
          placeholder="ค้นหาชื่อหรืออีเมล..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 transition-colors pl-10"
        />

        <div className="relative">
          <button
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="p-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white flex items-center gap-2 hover:bg-neutral-600 transition-colors"
          >
            {filterRoleOptions.find((r) => r.name === filterRole)?.label ||
              "ทั้งหมด"}
            <ChevronDown
              size={16}
              className={`transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {filterDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-neutral-700 border border-neutral-600 rounded-xl shadow-lg z-50 overflow-hidden">
              {filterRoleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setFilterRole(role.name);
                    setFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left text-sm p-1 transition-colors ${
                    filterRole === role.name
                      ? " text-white"
                      : "text-neutral-300"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-md hover:bg-neutral-600 ${
                      filterRole === role.name ? "bg-blue-600" : ""
                    }`}
                  >
                    {role.label}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 rounded-xl border border-neutral-700">
        <table className="w-full text-left table-fixed">
          <thead className="bg-neutral-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-neutral-300 text-center font-medium w-24">
                รูปภาพ
              </th>
              <th className="px-4 py-3 text-neutral-300 text-center font-medium w-32">
                ชื่อ
              </th>
              <th className="px-4 py-3 text-neutral-300 text-center font-medium w-48">
                อีเมล
              </th>
              <th className="px-4 py-3 text-neutral-300 text-center font-medium w-32">
                บทบาท
              </th>
              <th className="px-4 py-3 text-neutral-300 text-center font-medium w-32">
                วันที่สร้าง
              </th>
              <th className="px-4 py-3 text-neutral-300 font-medium text-center w-20">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {filterUsers.map((user: User) => (
              <tr
                key={user.id}
                className="hover:bg-neutral-700/50 transition-colors cursor-pointer"
              >
                {/* Image */}
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12">
                      <img
                        className="w-12 h-12 rounded-xl object-cover"
                        src={
                          user.image ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmn4pWrDE1f07NiO_-ALAPW18mUchf6vj9oA&s"
                        }
                        alt={user.name}
                      />
                      <input
                        type="file"
                        id={`image-${user.id}`}
                        className="hidden"
                        onChange={() => handleUpdateUserImage(user.id, user)}
                      />
                      <button
                        className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                        onClick={() =>
                          document.getElementById(`image-${user.id}`)?.click()
                        }
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  </div>
                </td>

                {/* Name */}
                <td
                  onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  className="px-4 py-3 text-start"
                >
                  <p
                    className="text-white font-medium truncate"
                    title={user.name || "-"}
                  >
                    {user.name || "-"}
                  </p>
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-start">
                  <p className="text-neutral-300 truncate" title={user.email}>
                    {user.email}
                  </p>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === user.id ? null : user.id,
                          )
                        }
                        className="px-2 py-2 rounded-md bg-neutral-700 text-white text-xs w-28 font-medium flex items-center justify-between gap-1 capitalize cursor-pointer "
                      >
                        <p className="text-center w-full">{user.role}</p>
                        <ChevronDown size={12} />
                      </button>

                      {openDropdown === user.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full mt-1 w-32 bg-neutral-800 border text-white border-neutral-700 rounded-lg shadow-lg z-50"
                        >
                          {roleItem.map((role) => (
                            <motion.button
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.2,
                                delay: role.id * 0.1,
                              }}
                              key={role.id}
                              onClick={() =>
                                handleUpdateRole(user.id, role.name)
                              }
                              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-700"
                            >
                              {role.name}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Created At */}
                <td className="px-4 py-3 text-center">
                  <p className="text-neutral-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      onClick={() => handleDeleteUser(user.id)}
                      title="ลบ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {users.length === 0 && (
          <div>
            {users.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <UsersLoading />
              </div>
            ) : (
              <p className="text-white text-center">ไม่พบผู้ใช้</p>
            )}
          </div>
        )}
      </div>
      {/* Pagination */}
      <div className="flex text-white items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            className="p-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 hover:text-white transition-colors"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            className="p-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 hover:text-white transition-colors"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight />
          </button>
        </div>
        <p className="text-sm">
          แสดง {users.length} จาก {totalUsers} รายการ
        </p>
      </div>
    </div>
  );
};

export default UserLists;
