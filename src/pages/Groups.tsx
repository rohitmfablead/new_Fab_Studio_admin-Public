import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MapPin,
  Users2,
  Images,
  MoreVertical,
  ArrowRight,
  Globe,
  Lock,
  Filter,
  Trash2,
  Edit2,
  Activity,
  History,
  Shield,
  Flag,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Archive,
  User,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Calendar,
  Eye,
  Check,
  Ban,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../store/slices/groupsSlice";
import { fetchUsers } from "../store/slices/usersSlice";
import type { Group } from "../store/slices/groupsSlice";
import { showSuccess, showError } from "../lib/toast";

// Helper function to get owner information
const getOwnerInfo = (group: Group) => {
  // First check if owner object exists with firstName/lastName
  if (group.owner && group.owner.firstName) {
    return {
      name: `${group.owner.firstName} ${group.owner.lastName}`,
      email: group.owner.email,
      avatar: group.owner.avatar,
    };
  }

  // Otherwise, find owner from participants array
  const ownerParticipant = group.participants?.find((p) => p.role === "owner");
  if (ownerParticipant) {
    return {
      name: ownerParticipant.name || "Unknown",
      email: ownerParticipant.email || "",
      avatar: undefined,
    };
  }

  // Fallback
  return {
    name: "Unknown",
    email: "",
    avatar: undefined,
  };
};

const getOwnerInitials = (name: string) => {
  const normalizedName = name?.trim() || "Unknown";
  const parts = normalizedName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0];
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
};

// Enhanced Mock Data
const initialGroups = [
  {
    id: 1,
    name: "Summer 2026",
    type: "Public",
    eventType: "Season",
    status: "Active",
    owner: { name: "Alex Rivers", email: "a.rivers@enterprise.com" },
    members: 1240,
    uploads: 12400,
    preview:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60",
    createdAt: "2026-01-15",
    description:
      "Capturing the essence of the 2026 summer solstice and beyond.",
    lastActivity: "2m ago",
    participants: [
      { id: 101, name: "Alex Rivers", role: "Owner", joined: "2026-01-15" },
      {
        id: 102,
        name: "Sarah Jenkins",
        role: "Moderator",
        joined: "2026-01-20",
      },
      {
        id: 103,
        name: "Marcus Chen",
        role: "Contributor",
        joined: "2026-02-01",
      },
    ],
    gallery: [
      {
        id: 201,
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop",
        photographer: "Alex Rivers",
      },
      {
        id: 202,
        url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop",
        photographer: "Sarah Jenkins",
      },
      {
        id: 203,
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop",
        photographer: "Marcus Chen",
      },
    ],
  },
  {
    id: 2,
    name: "Street Photography",
    type: "Public",
    eventType: "Hobby",
    status: "Active",
    owner: { name: "Sarah Jenkins", email: "s.jenkins@enterprise.com" },
    members: 842,
    uploads: 8200,
    preview:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=60",
    createdAt: "2026-02-10",
    description:
      "Urban life through the lens. Candid moments and city architecture.",
    lastActivity: "1h ago",
    participants: [
      { id: 104, name: "Sarah Jenkins", role: "Owner", joined: "2026-02-10" },
      { id: 105, name: "Alex Rivers", role: "Moderator", joined: "2026-02-15" },
    ],
    gallery: [
      {
        id: 204,
        url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop",
        photographer: "Sarah Jenkins",
      },
    ],
  },
  {
    id: 3,
    name: "Wedding Vibes",
    type: "Private",
    eventType: "Event",
    status: "Active",
    owner: { name: "Marcus Chen", email: "m.chen@enterprise.com" },
    members: 42,
    uploads: 1200,
    preview:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60",
    createdAt: "2026-03-20",
    description: "Private collection for the Chen-Smith wedding ceremony.",
    lastActivity: "1d ago",
    participants: [
      { id: 106, name: "Marcus Chen", role: "Owner", joined: "2026-03-20" },
    ],
    gallery: [],
  },
  {
    id: 4,
    name: "Mountain Peaks",
    type: "Public",
    eventType: "Adventure",
    status: "Reported",
    owner: { name: "Elena Rodriguez", email: "e.rodriguez@enterprise.com" },
    members: 560,
    uploads: 4500,
    preview:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60",
    createdAt: "2026-04-05",
    description:
      "Exploring the highest summits. High altitude, high resolution.",
    lastActivity: "5h ago",
    participants: [
      { id: 107, name: "Elena Rodriguez", role: "Owner", joined: "2026-04-05" },
    ],
    gallery: [],
  },
  {
    id: 5,
    name: "Minimal Architecture",
    type: "Public",
    eventType: "Design",
    status: "Active",
    owner: { name: "Jordan Smith", email: "j.smith@enterprise.com" },
    members: 320,
    uploads: 2100,
    preview:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    createdAt: "2026-04-22",
    description:
      "Lines, shapes, and shadows. The beauty of modern architectural design.",
    lastActivity: "3h ago",
    participants: [
      { id: 108, name: "Jordan Smith", role: "Owner", joined: "2026-04-22" },
    ],
    gallery: [],
  },
  {
    id: 6,
    name: "Product Shoots",
    type: "Shared",
    eventType: "Commercial",
    status: "Archived",
    owner: { name: "Mia Watson", email: "m.watson@enterprise.com" },
    members: 15,
    uploads: 450,
    preview:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    createdAt: "2026-04-28",
    description: "Internal project for high-end product photography branding.",
    lastActivity: "1w ago",
    participants: [
      { id: 109, name: "Mia Watson", role: "Owner", joined: "2026-04-28" },
    ],
    gallery: [],
  },
];

export function GroupsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    groups: apiGroups,
    isLoading,
    error,
    pagination,
  } = useAppSelector((state) => state.groups);

  const { users, isLoading: isUsersLoading } = useAppSelector(
    (state) => state.users,
  );

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [eventTypeFilter, setEventTypeFilter] = useState("All Events");
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Default for grid view

  // Fetch groups on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      type: typeFilter !== "All Types" ? typeFilter.toLowerCase() : undefined,
      status:
        statusFilter !== "All Status" ? statusFilter.toLowerCase() : undefined,
    };
    dispatch(fetchGroups(params));
  }, [dispatch, currentPage, pageSize, searchTerm, typeFilter, statusFilter]);

  // Panel & Modal States
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Form states for edit
  const [editForm, setEditForm] = useState({
    name: "",
    type: "public",
    event_type: "Wedding",
    description: "",
  });

  const [addForm, setAddForm] = useState({
    name: "",
    type: "public",
    event_type: "Wedding",
    description: "",
    owner_id: "",
  });

  // Accordion state for mobile view
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  const toggleGroupExpand = (groupId: number) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  useEffect(() => {
    if (!isAddPanelOpen) return;
    if (users && users.length > 0) return;
    dispatch(fetchUsers({ page: 1, limit: 100 }));
  }, [dispatch, isAddPanelOpen, users]);

  const handleEditClick = (group: any) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name || "",
      type: group.type?.toLowerCase() || "public",
      event_type: group.eventType || group.event_type || "Wedding",
      description: group.description || "",
    });
    setIsEditPanelOpen(true);
    setActiveDropdown(null);
  };

  const handleCreateGroup = async () => {
    if (!addForm.name.trim()) {
      showError("Please enter a collective name.");
      return;
    }
    if (!addForm.owner_id) {
      showError("Please select an owner.");
      return;
    }

    try {
      await dispatch(
        createGroup({
          name: addForm.name.trim(),
          type: addForm.type,
          event_type: addForm.event_type,
          description: addForm.description?.trim() || "",
          owner_id: Number(addForm.owner_id),
        }),
      ).unwrap();

      showSuccess("Collective initialized successfully!");

      await dispatch(
        fetchGroups({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          type:
            typeFilter !== "All Types" ? typeFilter.toLowerCase() : undefined,
          status:
            statusFilter !== "All Status"
              ? statusFilter.toLowerCase()
              : undefined,
        }),
      );

      setIsAddPanelOpen(false);
      setAddForm({
        name: "",
        type: "public",
        event_type: "Wedding",
        description: "",
        owner_id: "",
      });
    } catch (error: any) {
      showError(error || "Failed to initialize collective");
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    try {
      await dispatch(
        updateGroup({
          groupId: editingGroup.id,
          groupData: editForm,
        }),
      ).unwrap();

      showSuccess("Group updated successfully!");

      // Refresh groups list
      await dispatch(
        fetchGroups({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          type:
            typeFilter !== "All Types" ? typeFilter.toLowerCase() : undefined,
          status:
            statusFilter !== "All Status"
              ? statusFilter.toLowerCase()
              : undefined,
        }),
      );

      setIsEditPanelOpen(false);
      setEditingGroup(null);
    } catch (error: any) {
      showError(error || "Failed to update group");
      console.error("Failed to update group:", error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedGroups([id]);
    setIsDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  const filteredAndSortedGroups = useMemo(() => {
    let result = (apiGroups || []).filter((group) => {
      const ownerInfo = getOwnerInfo(group);
      const matchesSearch =
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerInfo.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "All Types" ||
        group.type?.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus =
        statusFilter === "All Status" ||
        group.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesEvent =
        eventTypeFilter === "All Events" ||
        group.event_type === eventTypeFilter;

      return matchesSearch && matchesType && matchesStatus && matchesEvent;
    });

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key.includes(".")) {
          const keys = sortConfig.key.split(".");
          valA = keys.reduce((o, i) => o[i], a);
          valB = keys.reduce((o, i) => o[i], b);
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    apiGroups,
    searchTerm,
    typeFilter,
    statusFilter,
    eventTypeFilter,
    sortConfig,
  ]);

  const paginatedGroups = filteredAndSortedGroups;

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

  const handleSelectGroup = (id: number) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tight">
            {" "}
            Groups
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">
            Governance, moderation and oversight of photography collectives.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center justify-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex-1 md:flex-none p-2 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-white text-navy shadow-sm"
                  : "text-gray-400 hover:text-navy",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 md:flex-none p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-white text-navy shadow-sm"
                  : "text-gray-400 hover:text-navy",
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setAddForm({
                name: "",
                type: "public",
                event_type: "Wedding",
                description: "",
                owner_id: "",
              });
              setIsAddPanelOpen(true);
            }}
            className="btn-primary py-3.5 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 px-8 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm whitespace-nowrap">
              Create Group
            </span>
          </button>
        </div>
      </div>

      <div className="premium-card overflow-hidden relative">
        <AnimatePresence>
          {selectedGroups.length > 0 && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-30 bg-navy text-white p-4 md:px-8 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center sm:justify-start">
                <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">
                  {selectedGroups.length} Groups Selected
                </span>
                <div className="hidden sm:block h-6 w-px bg-white/10" />
                <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-[10px] font-bold hover:text-danger transition-colors flex items-center gap-2 uppercase tracking-tight"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroups([])}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#fcfcfc]">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by group name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 md:py-2 bg-white border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="p-2 shrink-0 border border-gray-200 rounded-[8px] bg-white text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="shrink-0 px-3 py-2 border border-gray-200 rounded-[8px] bg-white text-[10px] md:text-xs font-semibold focus:outline-none cursor-pointer hover:bg-gray-50 uppercase tracking-widest"
            >
              <option>All Types</option>
              <option>Public</option>
              <option>Private</option>
            </select>

            {/*           
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="shrink-0 px-3 py-2 border border-gray-200 rounded-[8px] bg-white text-[10px] md:text-xs font-semibold focus:outline-none cursor-pointer hover:bg-gray-50 uppercase tracking-widest"
          >
            <option>All Events</option>
            <option>Season</option>
            <option>Event</option>
            <option>Hobby</option>
            <option>Adventure</option>
            <option>Design</option>
            <option>Commercial</option>
          </select> */}
          </div>
        </div>

        {viewMode === "grid" ? (
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                Loading Groups...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-navy uppercase tracking-tight">
                Failed to Load Groups
              </h3>
              <p className="text-gray-400 font-medium max-w-xs">{error}</p>
              <button
                onClick={() =>
                  dispatch(fetchGroups({ page: currentPage, limit: pageSize }))
                }
                className="mt-2 px-6 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
              >
                Retry
              </button>
            </div>
          ) : paginatedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center border border-gray-100">
                <Users2 className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-navy tracking-tight">
                No Groups Found
              </h3>
              <p className="text-gray-400 font-medium max-w-sm">
                {searchTerm ||
                typeFilter !== "All Types" ||
                statusFilter !== "All Status"
                  ? "No groups match your current filters. Try adjusting your search."
                  : "No groups have been created yet. Create your first group to get started."}
              </p>
              {(searchTerm ||
                typeFilter !== "All Types" ||
                statusFilter !== "All Status") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("All Types");
                    setStatusFilter("All Status");
                  }}
                  className="mt-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {paginatedGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => navigate(`/admin/groups/${group.id}`)}
                  className={cn(
                    "group bg-white rounded-[20px] md:rounded-[24px] overflow-hidden border border-gray-100 flex flex-col transition-all hover:shadow-2xl hover:shadow-navy/5 cursor-pointer",
                    selectedGroups.includes(group.id) &&
                      "ring-2 ring-primary border-transparent",
                  )}
                >
                  <div className="relative h-40 md:h-44 overflow-hidden">
                    <img
                      src={
                        group.coverImage ||
                        `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60`
                      }
                      alt={group.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest backdrop-blur-md border",
                          group.type === "Public"
                            ? "bg-success/20 text-white border-success/30"
                            : "bg-primary/20 text-white border-primary/30",
                        )}
                      >
                        {group.type}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest backdrop-blur-md border",
                          group.status === "Active"
                            ? "bg-white/10 text-white border-white/20"
                            : group.status === "Reported"
                              ? "bg-danger/20 text-white border-danger/30"
                              : "bg-gray-500/20 text-white border-white/20",
                        )}
                      >
                        {group.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectGroup(group.id);
                        }}
                        className={cn(
                          "w-6 h-6 md:w-7 md:h-7 rounded-full border flex items-center justify-center transition-all",
                          selectedGroups.includes(group.id)
                            ? "bg-primary border-primary text-white"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20",
                        )}
                      >
                        <Check className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === group.id ? null : group.id,
                            );
                          }}
                          className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === group.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-1.5"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(group);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-navy hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-primary" />
                                <span>Edit Group</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(group.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-danger hover:bg-danger/5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Group</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4">
                      <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight line-clamp-1">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-2 md:gap-3 mt-1.5 text-white/60 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-1">
                          <Users2 className="w-2.5 md:w-3 h-2.5 md:h-3" />{" "}
                          {group.memberCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Images className="w-2.5 md:w-3 h-2.5 md:h-3" />{" "}
                          {group.photoCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-2.5 md:w-3 h-2.5 md:h-3" />{" "}
                          {group.eventType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-navy font-bold text-[9px] uppercase">
                          {getOwnerInitials(getOwnerInfo(group).name)}
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            Ownership
                          </p>
                          <p className="text-[10px] font-bold text-navy truncate max-w-[100px]">
                            {getOwnerInfo(group).name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                          Created
                        </p>
                        <p className="text-[10px] font-bold text-navy">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 mb-4 md:mb-5 italic">
                      "{group.description}"
                    </p>
                    <div className="mt-auto pt-3 md:pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center border border-navy/5">
                          <Activity className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            Active Status
                          </p>
                          <p className="text-[9px] md:text-[10px] font-bold text-success">
                            {group.last_activity || group.lastActivity || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="group/btn flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-navy group-hover:text-primary transition-all">
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <>
            {/* Mobile Card List - visible only on small screens */}
            <div className="block sm:hidden divide-y divide-gray-100 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {paginatedGroups.map((group) => (
                  <motion.div
                    key={group.id}
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
                      onClick={() => toggleGroupExpand(group.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox for selection */}
                          <div
                            className="shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedGroups.includes(group.id)}
                              onChange={() => handleSelectGroup(group.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                            />
                          </div>
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                            <img
                              src={
                                group.coverImage ||
                                `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop`
                              }
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-navy truncate">
                              {group.name}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold truncate mt-0.5">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {new Date(group.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Expand/Collapse Icon */}
                        <button
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-all shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroupExpand(group.id);
                          }}
                        >
                          {expandedGroupId === group.id ? (
                            <Minus className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Content - Expandable */}
                    <AnimatePresence>
                      {expandedGroupId === group.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
                            {/* Type & Status */}
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 flex-1">
                                <Globe className="w-4 h-4 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    Type
                                  </p>
                                  <p className="text-xs font-black uppercase tracking-wide text-navy truncate">
                                    {group.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <Activity className="w-4 h-4 text-success shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    Status
                                  </p>
                                  <p
                                    className={cn(
                                      "text-xs font-black uppercase tracking-wide truncate",
                                      group.status === "Active"
                                        ? "text-success"
                                        : "text-danger",
                                    )}
                                  >
                                    {group.status}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Owner */}
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center text-[10px] font-black text-navy uppercase shrink-0">
                                {getOwnerInitials(getOwnerInfo(group).name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                  Owner
                                </p>
                                <p className="text-xs font-bold text-navy truncate">
                                  {getOwnerInfo(group).name}
                                </p>
                              </div>
                            </div>

                            {/* Members & Photos */}
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 flex-1">
                                <Users2 className="w-4 h-4 text-info shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    Members
                                  </p>
                                  <p className="text-xs font-black text-navy truncate">
                                    {group.memberCount}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <Images className="w-4 h-4 text-success shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    Photos
                                  </p>
                                  <p className="text-xs font-black text-navy truncate">
                                    {group.photoCount}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Event Type */}
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 flex-1">
                                <Shield className="w-4 h-4 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    Event Type
                                  </p>
                                  <p className="text-xs font-bold text-navy truncate">
                                    {group.eventType}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {group.description && (
                              <div className="p-3 bg-white rounded-xl border border-gray-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                  Description
                                </p>
                                <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                                  "{group.description}"
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-2 pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/groups/${group.id}`);
                                }}
                                className="py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(group);
                                }}
                                className="py-2.5 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-success/90 flex items-center justify-center gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(group.id);
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
                ))}
              </AnimatePresence>
            </div>

            {/* Groups Table (stacks into labeled cards on mobile) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left mobile-stack-table">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedGroups.length === paginatedGroups.length &&
                          paginatedGroups.length > 0
                        }
                        onChange={() =>
                          setSelectedGroups(
                            selectedGroups.length === paginatedGroups.length
                              ? []
                              : paginatedGroups.map((g) => g.id),
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th
                      className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Group Entity{" "}
                        {sortConfig?.key === "name" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort("owner.name")}
                    >
                      <div className="flex items-center gap-2">
                        Ownership{" "}
                        {sortConfig?.key === "owner.name" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort("type")}
                    >
                      <div className="flex items-center gap-2">
                        Type/Event{" "}
                        {sortConfig?.key === "type" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort("members")}
                    >
                      <div className="flex items-center gap-2">
                        Scale{" "}
                        {sortConfig?.key === "members" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status{" "}
                        {sortConfig?.key === "status" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          ))}
                      </div>
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedGroups.map((group) => (
                    <tr
                      key={group.id}
                      onClick={() => navigate(`/admin/groups/${group.id}`)}
                      className={cn(
                        "group hover:bg-primary-light transition-colors cursor-pointer",
                        selectedGroups.includes(group.id) && "bg-primary/5",
                      )}
                    >
                      <td
                        data-label=""
                        data-no-label="true"
                        className="px-8 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => handleSelectGroup(group.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td data-label="Group" className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                            <img
                              src={
                                group.coverImage ||
                                `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop`
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-navy">{group.name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                              Created{" "}
                              {new Date(group.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Owner" className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                            {getOwnerInitials(getOwnerInfo(group).name)}
                          </div>
                          <p className="text-sm font-bold text-gray-700">
                            {getOwnerInfo(group).name}
                          </p>
                        </div>
                      </td>
                      <td data-label="Type/Event" className="px-8 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-navy/60">
                            {group.type}
                          </span>
                          <span className="text-xs font-bold text-gray-400">
                            {group.eventType}
                          </span>
                        </div>
                      </td>
                      <td data-label="Scale" className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-navy">
                            {group.memberCount} Members
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {group.photoCount} Photos
                          </span>
                        </div>
                      </td>
                      <td data-label="Status" className="px-8 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            group.status === "Active"
                              ? "bg-success/5 text-success border-success/10"
                              : "bg-danger/5 text-danger border-danger/10",
                          )}
                        >
                          {group.status}
                        </span>
                      </td>
                      <td data-actions="true" className="px-8 py-4 text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEditClick(group)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all"
                            title="Edit Group"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(group.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-danger transition-all"
                            title="Delete Group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        <div className="p-6 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Reporting{" "}
              <span className="font-black text-navy">
                {filteredAndSortedGroups.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-navy">
                {pagination?.total_items ?? filteredAndSortedGroups.length}
              </span>{" "}
              entities
            </p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Capacity
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none shadow-sm"
              >
                <option value={6}>6 Entities</option>
                <option value={9}>9 Entities</option>
                <option value={12}>12 Entities</option>
                <option value={24}>24 Entities</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from(
                {
                  length:
                    pagination?.total_pages ??
                    Math.ceil(filteredAndSortedGroups.length / pageSize),
                },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-[10px] font-black tracking-widest transition-all outline-none",
                    currentPage === page
                      ? "bg-navy text-white shadow-xl shadow-navy/20"
                      : "hover:bg-gray-100 text-gray-400 hover:text-navy",
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    Math.ceil(filteredAndSortedGroups.length / pageSize),
                    prev + 1,
                  ),
                )
              }
              disabled={
                currentPage ===
                  Math.ceil(filteredAndSortedGroups.length / pageSize) ||
                filteredAndSortedGroups.length === 0
              }
              className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredAndSortedGroups.length === 0 && viewMode === "list" && !isLoading && !error && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6 border border-gray-100">
              <Users2 className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-navy tracking-tight">
              No Groups Found
            </h3>
            <p className="text-gray-400 font-medium max-w-sm mt-2">
              {searchTerm ||
              typeFilter !== "All Types" ||
              statusFilter !== "All Status"
                ? "No groups match your current filters. Try adjusting your search."
                : "No groups have been created yet."}
            </p>
            {(searchTerm ||
              typeFilter !== "All Types" ||
              statusFilter !== "All Status") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("All Types");
                  setStatusFilter("All Status");
                }}
                className="mt-8 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModerationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModerationModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm md:max-w-md bg-white rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl p-6 md:p-10"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-danger/10 text-danger rounded-[20px] md:rounded-[28px] flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-navy text-center tracking-tight mb-2">
                Governance Intervention
              </h3>
              <p className="text-xs md:text-sm text-gray-500 text-center font-medium leading-relaxed mb-8 md:mb-10 px-2 md:px-4">
                Apply restrictive protocols to reported collective. This action
                informs the owner and halts all public visibility.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Handle moderation action here
                    setIsModerationModalOpen(false);
                    setSelectedGroups([]);
                  }}
                  className="w-full py-4 bg-danger text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-danger/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Freeze Entity Logic
                </button>
                <button
                  onClick={() => setIsModerationModalOpen(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-xs md:text-sm hover:text-navy transition-all"
                >
                  Dismiss Intelligence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
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
              className="relative w-full max-w-xs md:max-w-sm bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 text-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-danger/10 text-danger rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-5">
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-navy tracking-tight mb-2">
                Confirm Delete
              </h3>
              <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="text-navy font-black">
                  {selectedGroups.length}
                </span>{" "}
                group(s)? All associated photos, videos, and members will be removed.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    try {
                      // Delete selected groups
                      for (const groupId of selectedGroups) {
                        await dispatch(deleteGroup(groupId)).unwrap();
                      }
                      showSuccess(
                        `${selectedGroups.length} group(s) deleted successfully`,
                      );

                      // Refresh groups list
                      await dispatch(
                        fetchGroups({
                          page: currentPage,
                          limit: pageSize,
                          search: searchTerm || undefined,
                          type:
                            typeFilter !== "All Types"
                              ? typeFilter.toLowerCase()
                              : undefined,
                          status:
                            statusFilter !== "All Status"
                              ? statusFilter.toLowerCase()
                              : undefined,
                        }),
                      );

                      setIsDeleteModalOpen(false);
                      setSelectedGroups([]);
                    } catch (error: any) {
                      showError(error || "Failed to delete groups");
                    }
                  }}
                  className="w-full py-3 bg-danger text-white rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-danger/20 hover:scale-[1.02] active:scale-95 transition-all group flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
                  <span>Confirm Delete</span>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-2.5 md:py-3 text-gray-400 font-bold text-[10px] md:text-xs hover:text-navy transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Group Slide-over Panel */}
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
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                    Initialize Collective
                  </h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
                    New Entity Configuration Profile
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Entity Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Neo-Brutalist Architecture"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Privacy Protocol
                      </label>
                      <div className="relative">
                        <select
                          value={addForm.type}
                          onChange={(e) =>
                            setAddForm({ ...addForm, type: e.target.value })
                          }
                          className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Category Logic
                      </label>
                      <div className="relative">
                        <select
                          value={addForm.event_type}
                          onChange={(e) =>
                            setAddForm({
                              ...addForm,
                              event_type: e.target.value,
                            })
                          }
                          className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                        >
                          <option>Wedding</option>
                          <option>Engagement</option>
                          <option>Baby Shower</option>
                          <option>Corporate</option>
                          <option>Festival</option>
                          <option>Concert</option>
                          <option>Birthday</option>
                          <option>Reunion</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Owner (User)
                    </label>
                    <div className="relative">
                      <select
                        value={addForm.owner_id}
                        onChange={(e) =>
                          setAddForm({ ...addForm, owner_id: e.target.value })
                        }
                        className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                      >
                        <option value="">
                          {isUsersLoading ? "Loading users..." : "Select owner"}
                        </option>
                        {users?.map((u) => (
                          <option key={u.id} value={String(u.id)}>
                            {(u.first_name || u.last_name
                              ? `${u.first_name ?? ""} ${u.last_name ?? ""}`
                              : u.name || u.email
                            ).trim()}{" "}
                            ({u.email})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Description Brief
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Operational scope of this collective..."
                      value={addForm.description}
                      onChange={(e) =>
                        setAddForm({ ...addForm, description: e.target.value })
                      }
                      className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-600 focus:outline-none focus:border-primary/40 transition-all resize-none outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-navy hover:bg-gray-100 transition-all outline-none"
                >
                  Discard
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={
                    isLoading ||
                    !addForm.name.trim() ||
                    !addForm.owner_id ||
                    isUsersLoading
                  }
                  className={cn(
                    "flex-[2] py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group",
                    (isLoading ||
                      !addForm.name.trim() ||
                      !addForm.owner_id ||
                      isUsersLoading) &&
                      "opacity-60 cursor-not-allowed hover:shadow-none active:scale-100",
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Submit Entity</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Group Slide-over Panel */}
      <AnimatePresence>
        {isEditPanelOpen && editingGroup && (
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
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                    Modify Collective
                  </h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
                    Update Configuration Profile
                  </p>
                </div>
                <button
                  onClick={() => setIsEditPanelOpen(false)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Entity Designation
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Privacy Protocol
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.type}
                          onChange={(e) =>
                            setEditForm({ ...editForm, type: e.target.value })
                          }
                          className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Category Logic
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.event_type}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              event_type: e.target.value,
                            })
                          }
                          className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                        >
                          <option>Wedding</option>
                          <option>Engagement</option>
                          <option>Baby Shower</option>
                          <option>Corporate</option>
                          <option>Festival</option>
                          <option>Concert</option>
                          <option>Birthday</option>
                          <option>Reunion</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Description Brief
                    </label>
                    <textarea
                      rows={6}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-600 focus:outline-none focus:border-primary/40 transition-all resize-none outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setIsEditPanelOpen(false);
                    setEditingGroup(null);
                  }}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-navy hover:bg-gray-100 transition-all outline-none"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleUpdateGroup}
                  disabled={isLoading}
                  className="flex-[2] py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
