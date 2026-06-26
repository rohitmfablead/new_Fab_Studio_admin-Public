import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Edit2,
  Users,
  MoreVertical,
  Check,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  History,
  UserPlus,
  Search,
  Filter,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchRoles, createRole, updateRole, deleteRole } from '../store/slices/rolesSlice';

// --- Types ---
type PermissionCategory = 'User Management' | 'Group Management' | 'Photo Management' | 'Analytics Access' | 'Settings Access' | 'Billing Access' | 'Content Moderation';

interface Permission {
  id: string;
  name: string;
  category: PermissionCategory;
}

interface Role {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: any;
  color: string;
  isCustom: boolean;
  permissions: string[]; // IDs of granted permissions
  level: number; // For hierarchy visualization
}

interface UserRole {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  assignedAt: string;
}

// --- Constants & Data ---

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  'User Management',
  'Group Management',
  'Photo Management',
  'Analytics Access',
  'Settings Access',
  'Billing Access',
  'Content Moderation'
];

const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'u_read', name: 'View Users', category: 'User Management' },
  { id: 'u_create', name: 'Create Users', category: 'User Management' },
  { id: 'u_edit', name: 'Update Users', category: 'User Management' },
  { id: 'u_delete', name: 'Delete Users', category: 'User Management' },
  { id: 'u_roles', name: 'Manage Roles', category: 'User Management' },

  // Group Management
  { id: 'g_read', name: 'View Groups', category: 'Group Management' },
  { id: 'g_create', name: 'Create Groups', category: 'Group Management' },
  { id: 'g_edit', name: 'Update Groups', category: 'Group Management' },
  { id: 'g_delete', name: 'Delete Groups', category: 'Group Management' },

  // Photo Management
  { id: 'p_read', name: 'View Photos', category: 'Photo Management' },
  { id: 'p_delete', name: 'Delete Photos', category: 'Photo Management' },
  { id: 'p_moderate', name: 'Approve/Reject', category: 'Photo Management' },

  // Analytics
  { id: 'a_read', name: 'View Dashboards', category: 'Analytics Access' },
  { id: 'a_export', name: 'Export Data', category: 'Analytics Access' },

  // Settings
  { id: 's_read', name: 'View Settings', category: 'Settings Access' },
  { id: 's_edit', name: 'Modify Settings', category: 'Settings Access' },

  // Billing
  { id: 'b_read', name: 'View Transactions', category: 'Billing Access' },
  { id: 'b_refund', name: 'Process Refunds', category: 'Billing Access' },

  // Moderation
  { id: 'm_read', name: 'View Reports', category: 'Content Moderation' },
  { id: 'm_act', name: 'Take Action', category: 'Content Moderation' },
];

const initialRoles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Master control node. Absolute access to architecture, security, and financial systems.',
    count: 2,
    icon: ShieldAlert,
    color: 'text-primary',
    isCustom: false,
    level: 1,
    permissions: PERMISSIONS.map(p => p.id)
  },
  {
    id: 'sub_admin',
    name: 'Sub-Admin',
    description: 'Operational lead. Manages users, groups, and standard moderation workflows.',
    count: 5,
    icon: ShieldCheck,
    color: 'text-info',
    isCustom: false,
    level: 2,
    permissions: ['u_read', 'u_edit', 'g_read', 'g_edit', 'p_read', 'p_moderate', 'a_read']
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Content integrity unit. Focused on photo gallery moderation and reported items.',
    count: 8,
    icon: Layers,
    color: 'text-warning',
    isCustom: true,
    level: 3,
    permissions: ['p_read', 'p_moderate', 'm_read', 'm_act']
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Analytical observer. Read-only access to statistical pulses and user registries.',
    count: 12,
    icon: Eye,
    color: 'text-success',
    isCustom: false,
    level: 4,
    permissions: ['u_read', 'g_read', 'p_read', 'a_read']
  },
];

const mockUsers: UserRole[] = [
  { id: '1', name: 'Alex Rivers', email: 'a.rivers@enterprise.com', roleId: 'super_admin', assignedAt: '2026-01-15' },
  { id: '2', name: 'Sarah Jenkins', email: 's.jenkins@enterprise.com', roleId: 'sub_admin', assignedAt: '2026-02-10' },
  { id: '3', name: 'Marcus Chen', email: 'm.chen@enterprise.com', roleId: 'moderator', assignedAt: '2026-03-20' },
  { id: '4', name: 'Elena Rodriguez', email: 'e.rodriguez@enterprise.com', roleId: 'viewer', assignedAt: '2026-04-05' },
  { id: '5', name: 'Jordan Smith', email: 'j.smith@enterprise.com', roleId: 'viewer', assignedAt: '2026-04-22' },
];

// --- Sub-Components ---

interface RoleCardProps {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="premium-card p-8 bg-white border border-gray-100 group relative flex flex-col h-full"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={cn("p-4 rounded-2xl bg-gray-50 group-hover:bg-primary/5 transition-colors", role.color)}>
        <role.icon className="w-8 h-8" />
      </div>
      <div className="flex items-center gap-2">
        {role.isCustom && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[8px] font-black uppercase text-gray-500 tracking-widest">Custom</span>
        )}
        <div className="relative group/menu">
          <button className="p-2 hover:bg-gray-50 rounded-lg">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
            <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-navy hover:bg-gray-50">
              <Edit2 className="w-3.5 h-3.5" /> Edit Role
            </button>
            {role.isCustom && (
              <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-danger hover:bg-danger/5">
                <Trash2 className="w-3.5 h-3.5" /> Delete Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="mb-2 flex items-center gap-2">
      <h3 className="text-xl font-black text-navy">{role.name}</h3>
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-navy/5 text-navy rounded-md text-[8px] font-black uppercase">
        Lvl {role.level}
      </div>
    </div>

    <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed flex-1">{role.description}</p>

    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-navy">{role.count} Users</span>
      </div>
      <button
        onClick={onEdit}
        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
      >
        Manage Rules <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  </motion.div>
);

export function RolesPage() {
  const dispatch = useAppDispatch();
  const { roles, isLoading, error, pagination } = useAppSelector((state) => state.roles);

  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<UserRole[]>(mockUsers);

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserRole | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch roles on component mount
  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 50 }));
  }, [dispatch]);

  const [rolesList, setRolesList] = useState(roles || initialRoles);

  const [auditLogs, setAuditLogs] = useState([
    { id: '1', actor: 'Alex Rivers', action: 'Created Role', target: 'Regional Moderator', time: '2 mins ago', type: 'create' },
    { id: '2', actor: 'Sarah Jenkins', action: 'Modified Permissions', target: 'Sub-Admin', time: '1 hour ago', type: 'edit' },
    { id: '3', actor: 'Alex Rivers', action: 'Assigned Role', target: 'Elena Rodriguez', time: '3 hours ago', type: 'assignment' },
  ]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const roleName = rolesList.find(r => r.id === u.roleId)?.name;
      const matchesRole = roleFilter === 'All Roles' || roleName === roleFilter;
      return matchesSearch && matchesRole;
    });

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'roleId') {
          valA = rolesList.find(r => r.id === a.roleId)?.name || '';
          valB = rolesList.find(r => r.id === b.roleId)?.name || '';
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, userSearch, roleFilter, sortConfig, rolesList]);

  const paginatedUsers = filteredAndSortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const level = parseInt(formData.get('level') as string);

    if (editingRole) {
      setRolesList(prev => prev.map(r => r.id === editingRole.id ? { ...r, name, description, level } : r));
    } else {
      const newRole: Role = {
        id: `role_${Date.now()}`,
        name,
        description,
        count: 0,
        icon: Shield,
        color: 'text-primary',
        isCustom: true,
        level,
        permissions: []
      };
      setRolesList(prev => [...prev, newRole]);
    }
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (id: string) => {
    setRolesList(prev => prev.filter(r => r.id !== id));
  };

  const handleBulkRoleAssign = (roleId: string) => {
    setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, roleId } : u));
    setSelectedUserIds([]);
    setIsBulkRoleModalOpen(false);
  };

  const togglePermission = (roleId: string, permissionId: string) => {
    setRolesList(prev => prev.map(r => {
      if (r.id === roleId) {
        const hasPermission = r.permissions.includes(permissionId);
        return {
          ...r,
          permissions: hasPermission
            ? r.permissions.filter(id => id !== permissionId)
            : [...r.permissions, permissionId]
        };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 md:px-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight uppercase">Access Control Protocol</h2>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Surgical management of administrative identities and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }}
            className="flex-1 md:flex-none btn-primary py-3.5 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 px-8 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm whitespace-nowrap">Create Role</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white sticky top-0 z-30 pt-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Role Assignment', icon: UserPlus },
          { id: 'matrix', label: 'Permission Matrix', icon: Layers },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap",
              activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-navy"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* PERMISSION MATRIX */}
        {activeTab === 'matrix' && (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="premium-card overflow-hidden bg-white border border-gray-100">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 md:px-8 py-5 md:py-6 sticky left-0 bg-gray-50/50 z-20 min-w-[200px] md:min-w-[280px] border-r border-gray-100">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Permission Registry</p>
                      </th>
                      {rolesList.map(role => (
                        <th key={role.id} className="px-4 md:px-6 py-5 md:py-6 text-center min-w-[100px] md:min-w-[140px]">
                          <div className="flex flex-col items-center gap-2">
                            <role.icon className={cn("w-4 h-4 md:w-5 md:h-5", role.color)} />
                            <span className="text-[8px] md:text-[10px] font-black text-navy uppercase tracking-widest whitespace-nowrap">{role.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {PERMISSION_CATEGORIES.map(category => (
                      <React.Fragment key={category}>
                        <tr className="bg-gray-100/30">
                          <td colSpan={rolesList.length + 1} className="px-6 md:px-8 py-2 md:py-3 sticky left-0 z-10 border-r border-gray-100 bg-gray-100/30">
                            <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary" />
                              {category}
                            </span>
                          </td>
                        </tr>
                        {PERMISSIONS.filter(p => p.category === category).map(permission => (
                          <tr key={permission.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 md:px-10 py-4 md:py-5 sticky left-0 bg-white z-10 border-r border-gray-100">
                              <div className="flex flex-col">
                                <span className="text-[10px] md:text-xs font-bold text-navy">{permission.name}</span>
                                <span className="text-[8px] md:text-[9px] font-medium text-gray-400 font-mono mt-0.5">{permission.id}</span>
                              </div>
                            </td>
                            {rolesList.map(role => (
                              <td key={role.id} className="px-4 md:px-6 py-4 md:py-5 text-center">
                                <button
                                  onClick={() => togglePermission(role.id, permission.id)}
                                  className={cn(
                                    "w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center m-auto transition-all transform active:scale-90",
                                    role.permissions.includes(permission.id)
                                      ? "bg-success/10 text-success shadow-lg shadow-success/5"
                                      : "bg-gray-50 text-gray-200"
                                  )}
                                >
                                  {role.permissions.includes(permission.id) ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                </button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-navy/5 p-6 rounded-3xl border border-navy/10">
              <div className="p-3 bg-navy text-white rounded-2xl">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h5 className="text-sm font-black text-navy uppercase tracking-widest">Real-time sync enabled</h5>
                <p className="text-xs font-medium text-navy/60">Changes to the permission matrix are applied instantly across the network. Audit logs reflect every toggle event.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ROLE ASSIGNMENT */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search identities by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-gray-100 rounded-2xl text-[10px] md:text-sm font-bold text-navy focus:outline-none focus:ring-2 ring-primary/10 shadow-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-6 py-3.5 md:py-4 bg-white border border-gray-100 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest text-navy focus:outline-none shadow-sm cursor-pointer"
                >
                  <option>All Roles</option>
                  {rolesList.map(r => <option key={r.id}>{r.name}</option>)}
                </select>
                {selectedUserIds.length > 0 && (
                  <button
                    onClick={() => setIsBulkRoleModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4 shadow-xl shadow-navy/20"
                  >
                    <Edit2 className="w-4 h-4" />
                    Assign Role ({selectedUserIds.length})
                  </button>
                )}
              </div>
            </div>

            <div className="premium-card overflow-hidden bg-white border border-gray-100">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[800px] md:min-w-0">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 md:px-8 py-5 w-10">
                        <button
                          onClick={() => setSelectedUserIds(selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0 ? [] : paginatedUsers.map(u => u.id))}
                          className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                            selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0 ? "bg-primary border-primary text-white" : "border-gray-200 bg-white"
                          )}
                        >
                          {selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0 && <Check className="w-3 h-3" />}
                        </button>
                      </th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('name')}>
                        <div className="flex items-center gap-2">
                          Administrative Identity {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('roleId')}>
                        <div className="flex items-center gap-2">
                          Assigned Protocol {sortConfig?.key === 'roleId' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('assignedAt')}>
                        <div className="flex items-center gap-2">
                          Assigned On {sortConfig?.key === 'assignedAt' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="px-6 md:px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedUsers.map(user => {
                      const role = rolesList.find(r => r.id === user.roleId);
                      return (
                        <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-6 md:px-8 py-5">
                            <button
                              onClick={() => setSelectedUserIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                              className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                selectedUserIds.includes(user.id) ? "bg-primary border-primary text-white" : "border-gray-200 bg-white group-hover:border-gray-300"
                              )}
                            >
                              {selectedUserIds.includes(user.id) && <Check className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy font-black text-[10px] md:text-xs uppercase shrink-0">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-navy truncate">{user.name}</p>
                                <p className="text-[10px] font-medium text-gray-400 truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-black uppercase tracking-widest whitespace-nowrap",
                              role?.color.replace('text-', 'bg-') + '/10',
                              role?.color
                            )}>
                              {role?.name}
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <span className="text-sm font-bold text-gray-400 font-mono italic whitespace-nowrap">{user.assignedAt}</span>
                          </td>
                          <td className="px-6 md:px-8 py-5 text-right">
                            <button
                              onClick={() => setViewingUser(user)}
                              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-navy transition-all shadow-sm"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="p-6 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Reporting <span className="font-black text-navy">{Math.min(filteredAndSortedUsers.length, pageSize)}</span> of <span className="font-black text-navy">{filteredAndSortedUsers.length}</span> identities
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Capacity</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none shadow-sm"
                    >
                      <option value={5}>5 Entities</option>
                      <option value={10}>10 Entities</option>
                      <option value={20}>20 Entities</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.ceil(filteredAndSortedUsers.length / pageSize) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-9 h-9 rounded-xl text-[10px] font-black tracking-widest transition-all outline-none",
                          currentPage === page ? "bg-navy text-white shadow-xl shadow-navy/20" : "hover:bg-gray-100 text-gray-400 hover:text-navy"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredAndSortedUsers.length / pageSize), prev + 1))}
                    disabled={currentPage === Math.ceil(filteredAndSortedUsers.length / pageSize) || filteredAndSortedUsers.length === 0}
                    className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Role Management Modal (Create/Edit) */}
      {/* Bulk Assignment Modal */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingUser(null)} className="fixed inset-0 bg-navy/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="premium-card w-full max-w-xl bg-white p-6 md:p-10 relative z-10 overflow-hidden m-auto"
            >
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24 md:-mr-32 md:-mt-32" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8 md:mb-10 overflow-hidden relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[32px] bg-navy text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-2xl shadow-navy/20 shrink-0">
                  {viewingUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-navy leading-none mb-2 truncate">{viewingUser.name}</h3>
                  <p className="text-xs md:text-sm font-medium text-gray-400 mb-3 truncate">{viewingUser.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                      {rolesList.find(r => r.id === viewingUser.roleId)?.name}
                    </span>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-300 font-mono italic">UID: {viewingUser.id.padStart(6, '0')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned On</p>
                    <p className="text-sm font-black text-navy">{viewingUser.assignedAt}</p>
                  </div>
                  <div className="p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identity Status</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <p className="text-xs md:text-sm font-black text-navy uppercase tracking-widest">Active State</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] md:text-[11px] font-black text-navy uppercase tracking-[0.2em] mb-4 flex items-center justify-center sm:justify-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Privilege Snapshot
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {PERMISSIONS.filter(p => rolesList.find(r => r.id === viewingUser.roleId)?.permissions.includes(p.id)).slice(0, 6).map(p => (
                      <div key={p.id} className="flex items-center gap-2 justify-center sm:justify-start">
                        <Check className="w-3.5 h-3.5 text-success" />
                        <span className="text-[10px] md:text-xs font-bold text-gray-500 truncate">{p.name}</span>
                      </div>
                    ))}
                    {rolesList.find(r => r.id === viewingUser.roleId)?.permissions.length! > 6 && (
                      <div className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest text-center sm:text-left pt-2">+ {rolesList.find(r => r.id === viewingUser.roleId)?.permissions.length! - 6} more privileges granted</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10">
                <button
                  onClick={() => {
                    setSelectedUserIds([viewingUser.id]);
                    setIsBulkRoleModalOpen(true);
                    setViewingUser(null);
                  }}
                  className="flex-1 py-4 bg-navy text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                >
                  Reassign Role
                </button>
                <button
                  onClick={() => setViewingUser(null)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-navy transition-all outline-none"
                >
                  Close Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBulkRoleModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkRoleModalOpen(false)} className="absolute inset-0 bg-navy/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="premium-card w-full max-w-lg bg-white p-10 relative z-10">
              <h3 className="text-2xl font-black text-navy mb-2">Protocol Override</h3>
              <p className="text-xs text-gray-400 mb-8 font-medium">Reassign administrative tier for {selectedUserIds.length} selected identities.</p>

              <div className="grid grid-cols-1 gap-4 mb-10">
                {rolesList.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleBulkRoleAssign(role.id)}
                    className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-primary/40 hover:bg-white transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg bg-white shadow-sm", role.color)}>
                        <role.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-navy uppercase tracking-widest">{role.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsBulkRoleModalOpen(false)}
                className="w-full py-4 text-xs font-black uppercase text-gray-400 tracking-widest hover:text-navy"
              >
                Abort Reassignment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoleModalOpen(false)}
              className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-2xl bg-white p-6 md:p-10 relative z-10 overflow-hidden m-auto"
            >
              <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24" />

              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-navy">{editingRole ? 'Edit Operational Role' : 'Initialize New Identity Tier'}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400">Configure core attributes and base privileges.</p>
                  </div>
                </div>
                <button onClick={() => setIsRoleModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveRole}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Name</label>
                      <input
                        required
                        name="name"
                        type="text"
                        defaultValue={editingRole?.name}
                        placeholder="e.g. Regional Moderator"
                        className="w-full px-4 py-3.5 md:py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 ring-primary/20 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity Level (Hierarchy)</label>
                      <select
                        name="level"
                        defaultValue={editingRole?.level || 5}
                        className="w-full px-4 py-3.5 md:py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-0 cursor-pointer outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(l => <option key={l} value={l}>Level {l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Functional Description</label>
                    <textarea
                      required
                      name="description"
                      defaultValue={editingRole?.description}
                      placeholder="Define the scope of this administrative identity..."
                      className="w-full h-24 md:h-[126px] px-4 py-3 md:py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-navy focus:ring-2 ring-primary/20 resize-none transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8 md:mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Inheritance Mode</p>
                    <div className="flex items-center gap-2">
                      <Unlock className="w-3 h-3 md:w-3.5 md:h-3.5 text-success" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase text-success tracking-widest">Flexible Scaling</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PERMISSION_CATEGORIES.slice(0, 4).map(c => (
                      <div key={c} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[8px] md:text-[9px] font-bold text-navy">
                        {c}
                      </div>
                    ))}
                    <div className="px-3 py-1 bg-navy/5 border border-navy/10 rounded-full text-[8px] md:text-[9px] font-black text-navy uppercase">
                      +3 Categories
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button type="submit" className="w-full sm:flex-1 py-4 bg-navy text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-95 transition-all outline-none group flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{editingRole ? 'Commit Protocol Changes' : 'Initialize Identity Tier'}</span>
                  </button>
                  <button type="button" onClick={() => setIsRoleModalOpen(false)} className="w-full sm:px-10 py-4 bg-gray-50 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all outline-none">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
