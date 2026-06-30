import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Download,
  Mail,
  Shield,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  User,
  Phone,
  LayoutGrid,
  Image as ImageIcon,
  History,
  Lock,
  ChevronDown,
  ChevronUp,
  Ban,
  Activity,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  CreditCard,
  PackageSearch,
  Plus,
  Minus,
  Crop,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchPlans } from "@/src/store/slices/planSlice";
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserSubscription,
  deleteUser,
  activateUser,
  suspendUser,
  updateUserPhotoResizePermission,
  type User as ApiUser,
} from "@/src/store/slices/usersSlice";
import { showSuccess, showError } from "@/src/lib/toast";

// Enhanced Mock Data
const initialUsers = [
  {
    id: 1,
    name: "Alex Rivers",
    email: "alex@fabphotopic.com",
    phone: "+1 (555) 012-3456",
    role: "Super Admin",
    status: "Active",
    joined: "2026-01-12",
    avatar: "AR",
    groups: ["Global Admins", "Platform Architects"],
    uploads: 142,
    lastLogin: "20m ago",
    bio: "Lead System Architect for FabPhotopic Platform.",
    subscriptionPlan: "Enterprise",
    subscriptionStatus: "Active",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    email: "sarah.j@gmail.com",
    phone: "+1 (555) 987-6543",
    role: "Editor",
    status: "Active",
    joined: "2026-02-05",
    avatar: "SJ",
    groups: ["Content Team"],
    uploads: 842,
    lastLogin: "2h ago",
    bio: "Photography enthusiast and senior editor.",
    subscriptionPlan: "Pro",
    subscriptionStatus: "Active",
  },
  {
    id: 3,
    name: "Marcus Chen",
    email: "m.chen@outlook.com",
    phone: "+1 (555) 456-7890",
    role: "Contributor",
    status: "Pending Verification",
    joined: "2026-03-18",
    avatar: "MC",
    groups: ["Nature Photo Group"],
    uploads: 12,
    lastLogin: "Never",
    bio: "Emerging landscape photographer.",
    subscriptionPlan: "Basic",
    subscriptionStatus: "Active",
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    email: "elena.r@yahoo.com",
    phone: "+1 (555) 234-5678",
    role: "Viewer",
    status: "Suspended",
    joined: "2026-04-01",
    avatar: "ER",
    groups: [],
    uploads: 0,
    lastLogin: "1d ago",
    bio: "Art director exploring visual trends.",
    subscriptionPlan: "Basic",
    subscriptionStatus: "Disabled",
  },
  {
    id: 5,
    name: "Jordan Smith",
    email: "jordan@fablead.com",
    phone: "+1 (555) 345-6789",
    role: "Contributor",
    status: "Active",
    joined: "2026-04-22",
    avatar: "JS",
    groups: ["Street Photography"],
    uploads: 156,
    lastLogin: "5h ago",
    bio: "Documentary photographer.",
    subscriptionPlan: "Pro",
    subscriptionStatus: "Active",
  },
  {
    id: 6,
    name: "Mia Watson",
    email: "mia.w@icloud.com",
    phone: "+1 (555) 567-8901",
    role: "Editor",
    status: "Active",
    joined: "2026-04-25",
    avatar: "MW",
    groups: ["Travel Logs"],
    uploads: 243,
    lastLogin: "30m ago",
    bio: "Travel blogger and content curator.",
    subscriptionPlan: "Enterprise",
    subscriptionStatus: "Active",
  },
];

const COUNTRY_CALLING_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "United States (+1)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+1-CA", label: "Canada (+1)" },
  { code: "+61", label: "Australia (+61)" },
] as const;

export function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading, error, pagination, totalUsers } = useAppSelector(
    (state) => state.users,
  );
  const {
    plans: apiPlans,
    isLoading: plansLoading,
    error: plansError,
  } = useAppSelector((state) => state.plans);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Pagination state — driven by API
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const normalizeStatus = (status: ApiUser["status"]) => {
    if (typeof status === "number") {
      if (status === 1) return "active";
      if (status === 0) return "pending";
      if (status === 2) return "inactive";
      return String(status);
    }
    return (status || "").toLowerCase();
  };

  // Derived from API pagination response
  const totalPages = pagination?.total_pages ?? 1;
  const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalUsers);

  // Debounce search term to prevent excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users whenever page, pageSize, search, or filters change
  React.useEffect(() => {
    const params: Record<string, any> = { page: currentPage, limit: pageSize };
    if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();
    if (statusFilter !== "All Status") params.status = statusFilter;
    if (roleFilter !== "All Roles") params.role = roleFilter;
    if (sortConfig) {
      params.sort_by = sortConfig.key;
      params.sort_order = sortConfig.direction;
    }
    dispatch(fetchUsers(params));
  }, [
    dispatch,
    currentPage,
    pageSize,
    debouncedSearchTerm,
    statusFilter,
    roleFilter,
    sortConfig,
  ]);

  // Fetch plans once on mount
  React.useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const availablePlans = useMemo(() => {
    return (apiPlans || []).map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      role: plan.role,
      description: plan.description,
      price: `${plan.currency}${plan.price.toLocaleString()}`,
      rawPrice: plan.price,
      currency: plan.currency,
      period: "/year",
      max_photos: plan.max_photos,
      max_events: plan.max_events,
      max_storage_bytes: plan.max_storage_bytes,
      has_face_recognition: plan.has_face_recognition,
      has_custom_watermark: plan.has_custom_watermark,
      has_digital_album: plan.has_digital_album,
      is_active: plan.is_active,
    }));
  }, [apiPlans]);

  const handleUpdateStatus = async (userId: number, newStatus: string) => {
    try {
      if (newStatus === "active") {
        await dispatch(activateUser(userId)).unwrap();
        showSuccess("User activated successfully!");
      } else if (newStatus === "pending") {
        await dispatch(
          updateUserStatus({ userId, status: "pending" }),
        ).unwrap();
        showSuccess("User status set to pending!");
      } else {
        // Open suspend modal instead of calling API directly
        const user = (users || []).find((u) => u.id === userId);
        if (user) {
          setUserToSuspend(user);
          setIsSuspendModalOpen(true);
        }
      }
    } catch (error: any) {
      showError(error?.message || "Failed to update user status");
    }
  };

  const handleUpdateSubscription = async (userId: number, planId: number) => {
    try {
      // Step 1: Assign the subscription plan
      await dispatch(updateUserSubscription({ userId, planId })).unwrap();

      // Step 2: If user is not active, activate them automatically
      const user = (users || []).find((u) => u.id === userId);
      const currentStatus = user?.status?.toString()?.toLowerCase();
      if (currentStatus !== "active" && currentStatus !== "1") {
        await dispatch(activateUser(userId)).unwrap();
        showSuccess("Plan assigned & user activated successfully!");
      } else {
        showSuccess("Subscription updated successfully!");
      }

      // Step 3: Refetch users so updated plan + status are reflected in UI
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== "All Status") params.status = statusFilter;
      if (roleFilter !== "All Roles") params.role = roleFilter;
      if (sortConfig) {
        params.sort_by = sortConfig.key;
        params.sort_order = sortConfig.direction;
      }
      dispatch(fetchUsers(params));
    } catch (error: any) {
      showError(error?.message || "Failed to update subscription");
    }
  };

  // Panel & Modal States
  const [selectedUserForDetails, setSelectedUserForDetails] =
    useState<ApiUser | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    name: "",
    email: "",
    phone: "",
    phone_country_code: "+91",
    phone_number: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (user: any) => {
    const newErrors: Record<string, string> = {};
    // Only validate name for edit form — email and phone are disabled
    const nameValue = (user.first_name || user.name || "").trim();
    if (!nameValue) newErrors.name = "First name is required";
    else if (nameValue.length < 2)
      newErrors.name = "Name must be at least 2 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddForm = (user: any) => {
    const newErrors: Record<string, string> = {};
    const nameValue = (user.first_name || "").trim();
    if (!nameValue) newErrors.name = "First name is required";
    if (!(user.last_name || "").trim())
      newErrors.last_name = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email?.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(user.email))
      newErrors.email = "Invalid email format";

    const rawPhone = (user.phone_number || "").trim();
    if (!rawPhone) {
      newErrors.phone = "Phone is required";
    } else if (/[a-zA-Z]/.test(rawPhone)) {
      newErrors.phone = "Phone number cannot contain letters";
    } else {
      const digitsOnly = rawPhone.replace(/\D/g, "");
      if (digitsOnly.length < 7) newErrors.phone = "Phone number is too short";
      else if (digitsOnly.length > 15)
        newErrors.phone = "Phone number is too long";
    }

    if (!user.password?.trim()) newErrors.password = "Password is required";
    else if (user.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return newErrors;
  };
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPlanAssignmentModalOpen, setIsPlanAssignmentModalOpen] =
    useState(false);
  const [userForPlanAssignment, setUserForPlanAssignment] =
    useState<ApiUser | null>(null);

  const handleOpenPlanAssignment = (user: ApiUser) => {
    setUserForPlanAssignment(user);
    setIsPlanAssignmentModalOpen(true);
    dispatch(fetchPlans());
  };

  // Pagination
  // (currentPage and pageSize are declared above near the useEffect)

  // Client-side sort only — API handles filtering/search/pagination
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...(users || [])];

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, sortConfig]);

  const toggleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddUser = async () => {
    try {
      const validationErrors = validateAddForm(newUser);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        showError(firstError);
        return;
      }
      await dispatch(
        createUser({
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          role: newUser.role,
          groups: [],
          send_invite: false,
        }),
      ).unwrap();
      showSuccess("User created successfully!");

      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== "All Status") params.status = statusFilter;
      if (roleFilter !== "All Roles") params.role = roleFilter;
      if (sortConfig) {
        params.sort_by = sortConfig.key;
        params.sort_order = sortConfig.direction;
      }
      dispatch(fetchUsers(params));

      setNewUser({
        first_name: "",
        last_name: "",
        name: "",
        email: "",
        phone: "",
        phone_country_code: "+91",
        phone_number: "",
        password: "",
        role: "user",
      });
      setIsAddPanelOpen(false);
    } catch (error: any) {
      showError(error?.message || "Failed to create user");
    }
  };

  const handleDeleteUser = (userId: number) => {
    dispatch(deleteUser(userId));
    setIsDeleteModalOpen(false);
  };

  const handleSuspendUser = (userId: number) => {
    const user = (users || []).find((u) => u.id === userId);
    if (user) {
      setUserToSuspend(user);
      setIsSuspendModalOpen(true);
    }
  };

  const handleActivateUser = (userId: number) => {
    dispatch(activateUser(userId));
  };

  const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<ApiUser | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ApiUser | null>(null);

  // Accordion state for mobile view
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  const toggleUserExpand = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight uppercase">
            Users{" "}
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
            Manage your platform members and their permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddPanelOpen(true)}
            className="flex-1 md:flex-none btn-primary py-3.5 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 px-8 group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm">
              Add User
            </span>
          </button>
        </div>
      </div>

      <div className="premium-card overflow-hidden relative">
        {/* Table Controls */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#fcfcfc]">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search identities by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-white border border-gray-200 rounded-[16px] text-xs md:text-sm font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                className={cn(
                  "p-2.5 border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-all shrink-0",
                  (statusFilter !== "All Status" ||
                    roleFilter !== "All Roles" ||
                    dateFilter !== "All Time") &&
                    "bg-primary/5 border-primary/20 text-primary",
                )}
              >
                <Filter className="w-4 h-4" />
              </button>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-[12px] text-[10px] md:text-xs font-black uppercase tracking-widest text-navy focus:outline-none outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Card List - visible only on small screens */}
        <div className="block sm:hidden divide-y divide-gray-100 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {/* Accordion Header - Always Visible */}
                  <div
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleUserExpand(user.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shadow-sm shrink-0 overflow-hidden">
                          {user.avatar && user.avatar.startsWith("http") ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement!.innerHTML = user.name
                                  ? user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "NA";
                              }}
                            />
                          ) : user.name ? (
                            user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          ) : (
                            "NA"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-navy truncate">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold truncate mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      {/* Expand/Collapse Icon */}
                      <button
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-all shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserExpand(user.id);
                        }}
                      >
                        {expandedUserId === user.id ? (
                          <Minus className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Content - Expandable */}
                  <AnimatePresence>
                    {expandedUserId === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 flex-1">
                              <Activity className="w-4 h-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
                                <p
                                  className={cn(
                                    "text-xs font-black uppercase tracking-wide truncate",
                                    user.status === 1 ||
                                      user.status?.toString()?.toLowerCase() === "active"
                                      ? "text-success"
                                      : user.status === 0 ||
                                          user.status?.toString()?.toLowerCase() === "pending"
                                        ? "text-amber-500"
                                        : "text-danger",
                                  )}
                                >
                                  {user.status === 1 ||
                                  user.status?.toString()?.toLowerCase() === "active"
                                    ? "Active"
                                    : user.status === 0 ||
                                        user.status?.toString()?.toLowerCase() === "pending"
                                      ? "Pending"
                                      : user.status}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Subscription Plan */}
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 flex-1">
                              <CreditCard className="w-4 h-4 text-info shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Plan</p>
                                <p className="text-xs font-black text-navy truncate">
                                  {user.plan?.name || "Free Plan"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Phone */}
                          {user.phone && (
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 flex-1">
                                <Phone className="w-4 h-4 text-success shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                                  <p className="text-xs font-bold text-navy truncate">{user.phone}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Joined Date */}
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 flex-1">
                              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Joined</p>
                                <p className="text-xs font-bold text-navy truncate">
                                  {new Date(user.created_at || user.joined).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPlanAssignment(user);
                              }}
                              className="py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Assign Plan
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForDetails(user);
                              }}
                              className="py-2.5 bg-info text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-info/90 flex items-center justify-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToEdit(user);
                                setIsEditPanelOpen(true);
                              }}
                              className="py-2.5 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-success/90 flex items-center justify-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(user);
                                setIsDeleteModalOpen(true);
                              }}
                              className="py-2.5 bg-danger text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-danger/90 flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-navy uppercase tracking-tight">
                  No identities found
                </h3>
                <p className="text-sm text-gray-400 max-w-xs text-center font-medium">
                  No matches for "
                  <span className="font-bold text-gray-600">{searchTerm}</span>
                  ".
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All Status");
                    setRoleFilter("All Roles");
                    setDateFilter("All Time");
                  }}
                  className="text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all pt-2"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Users Table (stacks into labeled cards on mobile) */}
        <div className="hidden sm:block overflow-x-auto no-scrollbar min-h-[400px]">
          <table className="w-full text-left border-collapse mobile-stack-table">
            <thead>
              <tr className="bg-gray-50/50">
                <th
                  className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Identity{" "}
                    {sortConfig?.key === "name" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>

                <th
                  className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors hidden lg:table-cell"
                  onClick={() => toggleSort("subscriptionPlan")}
                >
                  <div className="flex items-center gap-2">
                    Subscription{" "}
                    {sortConfig?.key === "subscriptionPlan" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell"></th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Update Status
                </th>
                <th className="px-6 md:px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr className="h-64">
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Loading Users...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "group hover:bg-gray-50 transition-colors cursor-pointer",
                        )}
                      >
                        <td
                          data-label="Identity"
                          className="px-4 py-5"
                          onClick={() => setSelectedUserForDetails(user)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shadow-sm transition-transform group-hover:scale-105 shrink-0 overflow-hidden">
                              {user.avatar ? (
                                <img
                                  src={
                                    user.avatar.startsWith("http")
                                      ? user.avatar
                                      : `${import.meta.env.VITE_API_BASE_URL || "https://stag.fablead-studio.com/services/api"}/${user.avatar}`
                                  }
                                  alt={user.name || user.email}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const initials = user.first_name
                                      ? `${user.first_name[0]}${user.last_name?.[0] || ""}`.toUpperCase()
                                      : user.email?.charAt(0).toUpperCase() ||
                                        "NA";
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.innerHTML =
                                      initials;
                                  }}
                                />
                              ) : user.first_name ? (
                                `${user.first_name[0]}${user.last_name?.[0] || ""}`.toUpperCase()
                              ) : (
                                user.email?.charAt(0).toUpperCase() || "NA"
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-navy group-hover:text-primary transition-colors truncate">
                                {user.name || user.first_name
                                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                                    user.name
                                  : user.email?.split("@")[0] || "—"}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
                                {user.email ? (
                                  <>
                                    <Mail className="w-3 h-3 shrink-0" />
                                    {user.email}
                                  </>
                                ) : user.phone ? (
                                  <>
                                    <Phone className="w-3 h-3 shrink-0" />
                                    {user.phone}
                                  </>
                                ) : (
                                  <span className="text-gray-300">
                                    No contact info
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          data-label="Subscription"
                          className="px-4 py-5 hidden lg:table-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-3 h-3 text-primary shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-navy">
                                {user.plan?.name || "Free Plan"}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-widest pl-4.5",
                                user.plan?.is_active
                                  ? "text-success"
                                  : "text-danger",
                              )}
                            >
                              {user.plan?.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td
                          data-label=""
                          data-no-label="true"
                          className="px-4 py-5 hidden lg:table-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Plan Assignment moved to Actions */}
                        </td>
                        <td
                          data-label="Status"
                          className="px-4 py-5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={
                              normalizeStatus(user.status) === "blocked" ||
                              normalizeStatus(user.status) === "suspended"
                                ? "blocked"
                                : normalizeStatus(user.status) === "pending"
                                  ? "pending"
                                  : "active"
                            }
                            onChange={(e) =>
                              handleUpdateStatus(user.id, e.target.value)
                            }
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer border-none outline-none hover:bg-gray-100 transition-colors",
                              normalizeStatus(user.status) === "active"
                                ? "bg-success/5 text-success"
                                : normalizeStatus(user.status) === "pending"
                                  ? "bg-amber-50 text-amber-500"
                                  : "bg-danger/5 text-danger",
                            )}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        </td>
                        <td
                          data-actions="true"
                          className="px-6 md:px-8 py-5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button
                              onClick={() => setSelectedUserForDetails(user)}
                              className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-navy transition-all shadow-sm border border-transparent hover:border-gray-100"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenPlanAssignment(user)}
                              className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-gray-100"
                              title="Assign Plan"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setUserToEdit(user);
                                setIsEditPanelOpen(true);
                              }}
                              className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-gray-100"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-danger transition-all shadow-sm border border-transparent hover:border-gray-100"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-64"
                    >
                      <td colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                            <Search className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="text-xl font-black text-navy uppercase tracking-tight">
                            No identities found
                          </h3>
                          <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
                            Our systems returned zero matches for "
                            <span className="font-bold text-gray-600">
                              {searchTerm}
                            </span>
                            ".
                          </p>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("All Status");
                              setRoleFilter("All Roles");
                              setDateFilter("All Time");
                            }}
                            className="text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all pt-4"
                          >
                            Reset Internal Search
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(() => {
          // Build page numbers with ellipsis logic using API totalPages
          const getPageNumbers = () => {
            if (totalPages <= 7) {
              return Array.from({ length: totalPages }, (_, i) => i + 1);
            }
            const pages: (number | "...")[] = [];
            if (currentPage <= 4) {
              pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
              pages.push(
                1,
                "...",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
              );
            } else {
              pages.push(
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages,
              );
            }
            return pages;
          };

          return (
            <div className="p-4 md:p-6 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: count + page size */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6">
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">
                  Showing{" "}
                  <span className="font-black text-navy">
                    {startItem}–{endItem}
                  </span>{" "}
                  of <span className="font-black text-navy">{totalUsers}</span>{" "}
                  users
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Rows
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-navy focus:outline-none focus:border-primary transition-all outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Right: page buttons */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed outline-none"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-9 h-9 flex items-center justify-center text-xs text-gray-300 font-black select-none"
                        >
                          ···
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          disabled={isLoading}
                          className={cn(
                            "w-9 h-9 md:w-10 md:h-10 rounded-xl text-xs font-black tracking-widest transition-all outline-none",
                            currentPage === page
                              ? "bg-navy text-white shadow-xl shadow-navy/20"
                              : "hover:bg-gray-100 text-gray-400 hover:text-navy disabled:opacity-50",
                          )}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed outline-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Plan Assignment Modal */}
      <AnimatePresence>
        {isPlanAssignmentModalOpen && userForPlanAssignment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanAssignmentModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 md:p-10 border-b border-gray-100 bg-navy text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-info/10 blur-[60px] -ml-16 -mb-16 rounded-full" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">
                        Subscription Engine
                      </h3>
                    </div>
                    <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] pl-0.5">
                      Provisioning Tier for {userForPlanAssignment.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPlanAssignmentModalOpen(false)}
                    className="p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Available Ecosystem Tiers
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Select a new plan to update user permissions
                    </p>
                  </div>
                  <div className="px-4 py-1.5 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Role: {userForPlanAssignment.role || "user"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {plansLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-inner" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Analyzing Protocols...
                      </p>
                    </div>
                  ) : plansError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-danger/5 rounded-[32px] border border-danger/10">
                      <div className="w-16 h-16 bg-danger/10 text-danger rounded-[24px] flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-navy mb-2">
                        Protocol Interrupted
                      </p>
                      <p className="text-xs font-medium text-gray-500 mb-6 max-w-[240px] mx-auto leading-relaxed">
                        {plansError}
                      </p>
                      <button
                        onClick={() => dispatch(fetchPlans())}
                        className="px-6 py-2.5 bg-danger text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-danger/20 transition-all active:scale-95"
                      >
                        Retry Protocol
                      </button>
                    </div>
                  ) : availablePlans.filter(
                      (p) =>
                        p.role?.toLowerCase() ===
                        (userForPlanAssignment.role || "user").toLowerCase(),
                    ).length === 0 ? (
                    <div className="py-20 text-center bg-gray-50/50 rounded-[32px] border border-gray-100 border-dashed">
                      <div className="w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <PackageSearch className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                        No Assets Available
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        No tiers found for role:{" "}
                        <span className="text-navy font-bold uppercase">
                          {userForPlanAssignment.role}
                        </span>
                      </p>
                    </div>
                  ) : (
                    availablePlans
                      .filter(
                        (p) =>
                          p.role?.toLowerCase() ===
                          (userForPlanAssignment.role || "user").toLowerCase(),
                      )
                      .map((plan) => {
                        // Check if this is the current plan by ID or by name matching
                        const isCurrentPlan =
                          userForPlanAssignment.plan_id === plan.id ||
                          userForPlanAssignment.plan?.id === plan.id ||
                          userForPlanAssignment.plan?.slug?.toLowerCase() ===
                            plan.slug?.toLowerCase() ||
                          userForPlanAssignment.subscriptionPlan?.toLowerCase() ===
                            plan.name?.toLowerCase();

                        return (
                          <div key={plan.id} className="relative group">
                            <button
                              onClick={() => {
                                handleUpdateSubscription(
                                  userForPlanAssignment.id,
                                  plan.id,
                                );
                                setIsPlanAssignmentModalOpen(false);
                              }}
                              className={cn(
                                "flex flex-col p-6 rounded-[24px] border-2 transition-all text-left w-full relative overflow-hidden",
                                isCurrentPlan
                                  ? "bg-gradient-to-br from-primary/5 to-primary/[0.02] border-primary shadow-2xl shadow-primary/10 scale-105 ring-2 ring-primary/20 outline outline-2 outline-offset-2 outline-primary/30"
                                  : "bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50/50 hover:shadow-lg hover:shadow-gray-200/50",
                              )}
                            >
                              {isCurrentPlan && (
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 blur-[50px] -mr-20 -mt-20 pointer-events-none animate-pulse" />
                              )}

                              {/* Header row */}
                              <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-500",
                                      isCurrentPlan
                                        ? "bg-primary text-white shadow-lg shadow-primary/40 rotate-12 scale-110"
                                        : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary group-hover:rotate-6",
                                    )}
                                  >
                                    <Zap className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-base font-black text-navy leading-tight">
                                      {plan.name}
                                    </h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                      {plan.slug}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-baseline gap-1 justify-end">
                                    <span className="text-xl font-black text-navy">
                                      {plan.rawPrice === 0
                                        ? "Free"
                                        : plan.price}
                                    </span>
                                  </div>
                                  {plan.rawPrice > 0 && (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                      {plan.period}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              {plan.description && (
                                <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                                  {plan.description}
                                </p>
                              )}

                              {/* Features row */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 relative z-10">
                                <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  <span className="text-[10px] font-black text-navy uppercase tracking-widest">
                                    {plan.max_photos === 0
                                      ? "∞"
                                      : plan.max_photos}{" "}
                                    Photos
                                  </span>
                                </div>
                                <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-info/40" />
                                  <span className="text-[10px] font-black text-navy uppercase tracking-widest">
                                    {plan.max_events === 0
                                      ? "∞"
                                      : plan.max_events}{" "}
                                    Events
                                  </span>
                                </div>
                                <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-success/40" />
                                  <span className="text-[10px] font-black text-navy uppercase tracking-widest">
                                    {(
                                      plan.max_storage_bytes /
                                      (1024 * 1024 * 1024)
                                    ).toFixed(0)}{" "}
                                    GB
                                  </span>
                                </div>

                                {plan.has_face_recognition && (
                                  <div className="px-3 py-2 bg-success/5 rounded-xl border border-success/10 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                    <span className="text-[10px] font-black text-success uppercase tracking-widest">
                                      Face ID
                                    </span>
                                  </div>
                                )}
                                {plan.has_custom_watermark && (
                                  <div className="px-3 py-2 bg-info/5 rounded-xl border border-info/10 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-info" />
                                    <span className="text-[10px] font-black text-info uppercase tracking-widest">
                                      Watermark
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => setIsPlanAssignmentModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-navy hover:bg-white hover:border-navy/20 transition-all active:scale-95 shadow-sm"
                >
                  Discard Changes
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[10px] font-bold text-gray-400 italic">
                    Assigning a new tier will take effect immediately
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Details Slide-over Panel */}
      <AnimatePresence>
        {selectedUserForDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForDetails(null)}
              className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full md:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                    Executive Identity
                  </h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
                    Profile Intelligence & Governance
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUserForDetails(null)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                {/* Portrait & Core Identity */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-8">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-[24px] md:rounded-[32px] bg-primary/10 flex items-center justify-center text-3xl md:text-4xl font-black text-primary border-4 border-white shadow-2xl shadow-primary/20 shrink-0 overflow-hidden">
                    {selectedUserForDetails.avatar &&
                    selectedUserForDetails.avatar.startsWith("http") ? (
                      <img
                        src={selectedUserForDetails.avatar}
                        alt={selectedUserForDetails.name ?? "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            selectedUserForDetails.name
                              ? selectedUserForDetails.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "NA";
                        }}
                      />
                    ) : selectedUserForDetails.name ? (
                      selectedUserForDetails.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    ) : (
                      "NA"
                    )}
                  </div>
                  <div className="space-y-2 md:space-y-3 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <h4 className="text-2xl md:text-3xl font-black text-navy tracking-tight truncate">
                        {selectedUserForDetails.name}
                      </h4>
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-full border border-navy/5">
                        {selectedUserForDetails.role}
                      </span>
                      <span
                        className={cn(
                          "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                          selectedUserForDetails.status === 1 ||
                            selectedUserForDetails.status === "Active"
                            ? "bg-success/5 text-success border-success/10"
                            : selectedUserForDetails.status === 2 ||
                                selectedUserForDetails.status === "Inactive"
                              ? "bg-gray-100 text-gray-400 border-gray-200"
                              : "bg-warning/5 text-warning border-warning/10",
                        )}
                      >
                        {selectedUserForDetails.status === 0 ||
                        selectedUserForDetails.status === "Pending"
                          ? "Pending"
                          : selectedUserForDetails.status === 1 ||
                              selectedUserForDetails.status === "Active"
                            ? "Active"
                            : selectedUserForDetails.status === 2 ||
                                selectedUserForDetails.status === "Inactive"
                              ? "Inactive"
                              : selectedUserForDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  <div className="p-5 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">
                      Total Uploads
                    </p>
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <span className="text-xl md:text-2xl font-black text-navy">
                        {selectedUserForDetails.uploads}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-success/20 transition-all flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">
                      Active Subscription
                    </p>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-success" />
                      <span className="text-xl md:text-2xl font-black text-navy">
                        {selectedUserForDetails.plan_details?.name ||
                          selectedUserForDetails.plan?.name ||
                          "Free Tier"}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {selectedUserForDetails.plan_details ? (
                        <>
                          Expires:{" "}
                          {selectedUserForDetails.plan_expires_at
                            ? new Date(
                                selectedUserForDetails.plan_expires_at,
                              ).toLocaleDateString()
                            : "Never"}
                        </>
                      ) : (
                        <>Standard Access Protocol</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-4 flex items-center justify-center sm:justify-start gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Professional Overview
                  </h5>
                  <div className="grid grid-cols-1 gap-5 md:gap-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-success/5 flex items-center justify-center transition-colors">
                        <Phone className="w-4 h-4 text-gray-400 group-hover:text-success" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Phone
                        </p>
                        <p className="text-sm font-bold text-navy truncate">
                          {selectedUserForDetails.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary/5 flex items-center justify-center transition-colors">
                        <Shield className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Role
                        </p>
                        <div className="inline-flex items-center px-2.5 py-1 mt-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {selectedUserForDetails.role || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-info/5 flex items-center justify-center transition-colors">
                        <History className="w-4 h-4 text-gray-400 group-hover:text-info" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Joined Date
                        </p>
                        <p className="text-sm font-bold text-navy truncate">
                          {selectedUserForDetails.created_at
                            ? new Date(
                                selectedUserForDetails.created_at,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Intelligence (Plan Details) */}
                {(selectedUserForDetails.plan_details ||
                  selectedUserForDetails.plan) && (
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-4 flex items-center justify-center sm:justify-start gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Subscription Intelligence
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Max Photos
                        </p>
                        <p className="text-sm font-black text-navy">
                          {(
                            selectedUserForDetails.plan_details ||
                            selectedUserForDetails.plan
                          )?.max_photos === 0
                            ? "Unlimited"
                            : (
                                selectedUserForDetails.plan_details ||
                                selectedUserForDetails.plan
                              )?.max_photos}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Max Events
                        </p>
                        <p className="text-sm font-black text-navy">
                          {(
                            selectedUserForDetails.plan_details ||
                            selectedUserForDetails.plan
                          )?.max_events === 0
                            ? "Unlimited"
                            : (
                                selectedUserForDetails.plan_details ||
                                selectedUserForDetails.plan
                              )?.max_events}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Storage Capacity
                        </p>
                        <p className="text-sm font-black text-navy">
                          {((
                            selectedUserForDetails.plan_details ||
                            selectedUserForDetails.plan
                          )?.max_storage_bytes || 0) /
                            (1024 * 1024 * 1024)}{" "}
                          GB
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Features
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(
                            selectedUserForDetails.plan_details ||
                            selectedUserForDetails.plan
                          )?.has_face_recognition && (
                            <span className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-black uppercase rounded">
                              Face ID
                            </span>
                          )}
                          {(
                            selectedUserForDetails.plan_details ||
                            selectedUserForDetails.plan
                          )?.has_custom_watermark && (
                            <span className="px-1.5 py-0.5 bg-info/10 text-info text-[8px] font-black uppercase rounded">
                              Watermark
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Actions */}
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setIsEditPanelOpen(true);
                    setUserToEdit(selectedUserForDetails);
                    setSelectedUserForDetails(null);
                  }}
                  className="flex-1 py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Identity
                </button>
                <button
                  onClick={() => {
                    setUserToDelete(selectedUserForDetails);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-4 border border-gray-200 rounded-2xl text-gray-400 hover:text-danger hover:border-danger/20 hover:bg-white transition-all shadow-sm active:scale-95 outline-none"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-10 text-center"
            >
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-navy tracking-tight mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                You are about to delete{" "}
                <span className="font-bold text-navy">{userToDelete.name}</span>
                . This operation is irreversible and all associated data will be
                removed.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => handleDeleteUser(userToDelete.id)}
                  className="w-full py-4 bg-danger text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-danger/20 transition-all"
                >
                  Permanently Delete
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:text-navy transition-all"
                >
                  Cancel Operation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suspend User Modal */}
      <AnimatePresence>
        {isSuspendModalOpen && userToSuspend && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSuspendModalOpen(false);
                setSuspendReason("");
              }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-10"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Ban className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-navy tracking-tight text-center mb-1">
                Suspend User
              </h3>
              <p className="text-gray-400 font-medium text-center text-sm mb-6">
                Suspending{" "}
                <span className="font-bold text-navy">
                  {userToSuspend.name || userToSuspend.email}
                </span>
              </p>

              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-navy focus:outline-none focus:border-warning/40 focus:ring-4 focus:ring-warning/5 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={!suspendReason.trim() || isSuspending}
                  onClick={async () => {
                    if (!suspendReason.trim()) return;
                    setIsSuspending(true);
                    try {
                      await dispatch(
                        suspendUser({
                          userId: userToSuspend.id,
                          reason: suspendReason.trim(),
                        }),
                      ).unwrap();
                      showSuccess("User suspended successfully!");
                      setIsSuspendModalOpen(false);
                      setSuspendReason("");
                      setUserToSuspend(null);
                    } catch (error: any) {
                      showError(error?.message || "Failed to suspend user");
                    } finally {
                      setIsSuspending(false);
                    }
                  }}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSuspending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Suspending...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Suspend User
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsSuspendModalOpen(false);
                    setSuspendReason("");
                  }}
                  disabled={isSuspending}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:text-navy transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Slide-over Panel */}
      <AnimatePresence>
        {isAddPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPanelOpen(false)}
              className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full md:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                    Onboard Member
                  </h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
                    Initialize identity secure access
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          First Name *
                        </label>
                        <div className="relative">
                          <User
                            className={cn(
                              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                              errors.name ? "text-danger" : "text-gray-400",
                            )}
                          />
                          <input
                            type="text"
                            placeholder="First name"
                            value={newUser.first_name}
                            onChange={(e) => {
                              const first = e.target.value;
                              setNewUser({
                                ...newUser,
                                first_name: first,
                                name: `${first} ${newUser.last_name}`.trim(),
                              });
                              if (errors.name)
                                setErrors({ ...errors, name: "" });
                            }}
                            className={cn(
                              "w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-50 border rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all font-bold text-navy shadow-sm outline-none",
                              errors.name
                                ? "border-danger/50 focus:border-danger focus:ring-danger/5"
                                : "border-gray-200 focus:border-primary/40 focus:ring-primary/5",
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Last Name *
                        </label>
                        <div className="relative">
                          <User
                            className={cn(
                              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                              errors.last_name
                                ? "text-danger"
                                : "text-gray-400",
                            )}
                          />
                          <input
                            type="text"
                            placeholder="Last name"
                            value={newUser.last_name}
                            onChange={(e) => {
                              const last = e.target.value;
                              setNewUser({
                                ...newUser,
                                last_name: last,
                                name: `${newUser.first_name} ${last}`.trim(),
                              });
                              if (errors.last_name)
                                setErrors({ ...errors, last_name: "" });
                            }}
                            className={cn(
                              "w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-50 border rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all font-bold text-navy shadow-sm outline-none",
                              errors.last_name
                                ? "border-danger/50 focus:border-danger focus:ring-danger/5"
                                : "border-gray-200 focus:border-primary/40 focus:ring-primary/5",
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    {errors.name && (
                      <p className="text-[9px] md:text-[10px] text-danger font-bold ml-1">
                        {errors.name}
                      </p>
                    )}
                    {errors.last_name && (
                      <p className="text-[9px] md:text-[10px] text-danger font-bold ml-1">
                        {errors.last_name}
                      </p>
                    )}
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Enterprise Email *
                      </label>
                      <div className="relative">
                        <Mail
                          className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                            errors.email ? "text-danger" : "text-gray-400",
                          )}
                        />
                        <input
                          type="email"
                          placeholder="j.doe@enterprise.com"
                          value={newUser.email}
                          onChange={(e) => {
                            setNewUser({ ...newUser, email: e.target.value });
                            if (errors.email)
                              setErrors({ ...errors, email: "" });
                          }}
                          className={cn(
                            "w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-50 border rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all font-bold text-navy shadow-sm outline-none",
                            errors.email
                              ? "border-danger/50 focus:border-danger focus:ring-danger/5"
                              : "border-gray-200 focus:border-primary/40 focus:ring-primary/5",
                          )}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[9px] md:text-[10px] text-danger font-bold ml-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Institutional Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={newUser.role}
                          onChange={(e) =>
                            setNewUser({ ...newUser, role: e.target.value })
                          }
                          className="w-full pl-11 pr-10 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-navy appearance-none cursor-pointer shadow-sm outline-none"
                        >
                          <option value="user">User</option>
                          <option value="photographer">Photographer</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <Phone
                          className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                            errors.phone ? "text-danger" : "text-gray-400",
                          )}
                        />
                        <div className="flex gap-2 pl-11">
                          <select
                            value={newUser.phone_country_code}
                            onChange={(e) => {
                              const phoneCountryCode = e.target.value;
                              const normalizedCode =
                                phoneCountryCode === "+1-CA"
                                  ? "+1"
                                  : phoneCountryCode;
                              setNewUser({
                                ...newUser,
                                phone_country_code: phoneCountryCode,
                                phone: `${normalizedCode}${newUser.phone_number ? " " : ""}${newUser.phone_number}`,
                              });
                              if (errors.phone)
                                setErrors({ ...errors, phone: "" });
                            }}
                            className={cn(
                              "w-[140px] pl-3 pr-8 py-3 md:py-3.5 bg-gray-50 border rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all font-bold text-navy appearance-none shadow-sm outline-none",
                              errors.phone
                                ? "border-danger/50 focus:border-danger focus:ring-danger/5"
                                : "border-gray-200 focus:border-primary/40 focus:ring-primary/5",
                            )}
                          >
                            {COUNTRY_CALLING_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Phone number"
                            value={newUser.phone_number}
                            onChange={(e) => {
                              const phoneNumber = e.target.value;
                              const normalizedCode =
                                newUser.phone_country_code === "+1-CA"
                                  ? "+1"
                                  : newUser.phone_country_code;
                              setNewUser({
                                ...newUser,
                                phone_number: phoneNumber,
                                phone: `${normalizedCode}${phoneNumber ? " " : ""}${phoneNumber}`,
                              });
                              if (errors.phone)
                                setErrors({ ...errors, phone: "" });
                            }}
                            className={cn(
                              "w-full pl-4 pr-4 py-3 md:py-3.5 bg-gray-50 border rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all font-bold text-navy shadow-sm outline-none",
                              errors.phone
                                ? "border-danger/50 focus:border-danger focus:ring-danger/5"
                                : "border-gray-200 focus:border-primary/40 focus:ring-primary/5",
                            )}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="text-[9px] md:text-[10px] text-danger font-bold ml-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 focus:border-primary/40 focus:ring-primary/5 transition-all font-bold text-navy shadow-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Actions */}
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setIsAddPanelOpen(false);
                    setErrors({});
                  }}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-navy hover:bg-gray-100 transition-all outline-none"
                >
                  Discard
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={isLoading}
                  className={cn(
                    "flex-[2] py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group",
                    isLoading &&
                      "opacity-60 cursor-not-allowed hover:shadow-none active:scale-100",
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Confirm Onboarding</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit User Slide-over Panel */}
      <AnimatePresence>
        {isEditPanelOpen && userToEdit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditPanelOpen(false)}
              className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full md:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                    Update Identity
                  </h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
                    Modify secure access credentials
                  </p>
                </div>
                <button
                  onClick={() => setIsEditPanelOpen(false)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Panel Form */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          First Name *
                        </label>
                        <div className="relative">
                          <User
                            className={cn(
                              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                              errors.name ? "text-danger" : "text-gray-400",
                            )}
                          />
                          <input
                            type="text"
                            placeholder="First name"
                            value={userToEdit.first_name || ""}
                            onChange={(e) => {
                              const first = e.target.value;
                              const last = userToEdit.last_name || "";
                              setUserToEdit({
                                ...userToEdit,
                                first_name: first,
                                name: `${first} ${last}`.trim(),
                              });
                              if (errors.name)
                                setErrors({ ...errors, name: "" });
                            }}
                            className={cn(
                              "w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-50 border rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all font-bold text-navy shadow-sm outline-none",
                              errors.name
                                ? "border-danger/50 focus:border-danger focus:ring-danger/5"
                                : "border-gray-200 focus:border-primary/40 focus:ring-primary/5",
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Last Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Last name"
                            value={userToEdit.last_name || ""}
                            onChange={(e) => {
                              const last = e.target.value;
                              const first = userToEdit.first_name || "";
                              setUserToEdit({
                                ...userToEdit,
                                last_name: last,
                                name: `${first} ${last}`.trim(),
                              });
                            }}
                            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 focus:border-primary/40 focus:ring-primary/5 transition-all font-bold text-navy shadow-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    {errors.name && (
                      <p className="text-[9px] md:text-[10px] text-danger font-bold ml-1">
                        {errors.name}
                      </p>
                    )}
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Enterprise Email *
                      </label>
                      <div className="relative opacity-50">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={userToEdit.email}
                          disabled
                          readOnly
                          className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-xs md:text-sm font-bold text-navy shadow-sm cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 ml-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Contact Phone *
                      </label>
                      <div className="relative opacity-50">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={userToEdit.phone ?? ""}
                          disabled
                          readOnly
                          className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-xs md:text-sm font-bold text-navy shadow-sm cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 ml-1">
                        Phone cannot be changed
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#f2f8f7] rounded-2xl border border-teal-100/50 mt-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#e3f0ee] flex items-center justify-center shrink-0">
                          <Crop className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy">
                            Upload in Higher Resolution
                          </p>
                          <p className="text-[10px] font-bold text-[#b54c4c] flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            1 High resolution Upload = 2.5 Photos
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={userToEdit.can_manage_photo_resize || false}
                          onChange={(e) =>
                            setUserToEdit({
                              ...userToEdit,
                              can_manage_photo_resize: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Actions */}
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setIsEditPanelOpen(false);
                    setErrors({});
                  }}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-navy hover:bg-gray-100 transition-all outline-none"
                >
                  Discard Changes
                </button>
                <button
                  onClick={async () => {
                    if (validateForm(userToEdit)) {
                      try {
                        await dispatch(
                          updateUser({
                            userId: userToEdit.id,
                            userData: {
                              firstName: userToEdit.first_name || "",
                              lastName: userToEdit.last_name || "",
                              name: userToEdit.name || undefined,
                              role: userToEdit.role,
                            },
                          }),
                        ).unwrap();
                        
                        // Update photo resize permission
                        await dispatch(
                          updateUserPhotoResizePermission({
                            userId: userToEdit.id,
                            canManagePhotoResize: userToEdit.can_manage_photo_resize || false
                          })
                        ).unwrap();

                        showSuccess("User updated successfully!");
                        setIsEditPanelOpen(false);
                        setErrors({});
                      } catch (error: any) {
                        const errorMessage =
                          error?.message ||
                          error?.toString() ||
                          "Failed to update user";
                        showError(errorMessage);
                      }
                    }
                  }}
                  className="flex-[2] py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group"
                >
                  <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Update Identity</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
