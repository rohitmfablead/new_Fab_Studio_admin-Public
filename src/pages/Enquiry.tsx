import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Clock,
  Eye,
  UserCheck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  User,
  Shield,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  ExternalLink,
  Loader2,
  Plus,
  Minus,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchEnquiries, updateEnquiryStatus, activateEnquiry, assignEnquiry, assignPlanToEnquiry, Enquiry } from '@/src/store/slices/enquiriesSlice';
import { fetchPlans } from '@/src/store/slices/planSlice';
import { activateUser } from '@/src/store/slices/usersSlice';
import { showSuccess, showError } from '@/src/lib/toast';
import { get, put } from '@/src/lib/api';

type AdminTab = 'enquiries' | 'contacts';

type ContactMessage = {
  id: number | string;
  user_id?: number;
  plan_id?: number;
  subscription_id?: number | string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
  };
  name?: string;
  user_name?: string;
  email?: string;
  user_email?: string;
  phone?: string;
  user_phone?: string;
  subject?: string;
  message?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export function EnquiryPage() {
  const dispatch = useAppDispatch();
  const { enquiries, isLoading, error, pagination } = useAppSelector((state) => state.enquiries);
  const { plans } = useAppSelector((state) => state.plans);

  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [contactCurrentPage, setContactCurrentPage] = useState(1);
  const [contactPageSize, setContactPageSize] = useState(10);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactPagination, setContactPagination] = useState<{
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  } | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [selectedContactMessage, setSelectedContactMessage] = useState<ContactMessage | null>(null);
  const [contactStatusUpdating, setContactStatusUpdating] = useState(false);

  // Assign Plan state
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);
  const assignPlanRef = useRef<HTMLDivElement>(null);

  // Assign Plan Modal (from table row button)
  const [assignPlanModal, setAssignPlanModal] = useState<Enquiry | null>(null);
  const [modalSelectedPlanId, setModalSelectedPlanId] = useState<number | null>(null);
  const [isModalAssigning, setIsModalAssigning] = useState(false);

  // Assign Plan for Contact Messages
  const [contactAssignPlanModal, setContactAssignPlanModal] = useState<ContactMessage | null>(null);
  const [contactModalSelectedPlanId, setContactModalSelectedPlanId] = useState<number | null>(null);
  const [isContactModalAssigning, setIsContactModalAssigning] = useState(false);

  // Accordion state for mobile view
  const [expandedEnquiryId, setExpandedEnquiryId] = useState<number | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<number | string | null>(null);

  const toggleEnquiryExpand = (id: number) => {
    setExpandedEnquiryId(expandedEnquiryId === id ? null : id);
  };

  const toggleContactExpand = (id: number | string) => {
    setExpandedContactId(expandedContactId === id ? null : id);
  };

  // Fetch enquiries on mount and when filters change
  useEffect(() => {
    if (activeTab !== 'enquiries') return;

    dispatch(fetchEnquiries({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
    }));
  }, [dispatch, activeTab, currentPage, pageSize, searchTerm, statusFilter]);

  // Fetch plans when contacts tab is active
  useEffect(() => {
    if (activeTab === 'contacts') {
      dispatch(fetchPlans());
    }
  }, [dispatch, activeTab]);

  // Fetch contact messages when contact tab is active
  useEffect(() => {
    if (activeTab !== 'contacts') return;

    let isMounted = true;

    const loadContactMessages = async () => {
      try {
        setContactLoading(true);
        setContactError(null);

        const queryParams = new URLSearchParams();
        queryParams.append('page', contactCurrentPage.toString());
        queryParams.append('limit', contactPageSize.toString());
        if (contactSearchTerm.trim()) {
          queryParams.append('search', contactSearchTerm.trim());
        }

        const response = await get<any>(`/admin/contact-messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);

        if (!isMounted) return;

        if (response.success) {
          const apiData = response.data;
          const messages = Array.isArray(apiData)
            ? apiData
            : Array.isArray(apiData?.contact_messages)
              ? apiData.contact_messages
              : Array.isArray(apiData?.messages)
                ? apiData.messages
                : Array.isArray(apiData?.items)
                  ? apiData.items
                  : Array.isArray(apiData?.data)
                    ? apiData.data
                    : [];

          const paginationSource = apiData?.pagination || apiData?.meta || null;

          setContactMessages(messages);
          setContactPagination(
            paginationSource
              ? {
                current_page: paginationSource.current_page || contactCurrentPage,
                total_pages: paginationSource.total_pages || 1,
                total_items: paginationSource.total_items ?? messages.length,
                per_page: paginationSource.per_page || contactPageSize,
              }
              : {
                current_page: contactCurrentPage,
                total_pages: 1,
                total_items: messages.length,
                per_page: contactPageSize,
              }
          );
        } else {
          throw new Error(response.error?.message || response.message || 'Failed to fetch contact messages');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setContactError(err?.message || 'Failed to fetch contact messages');
      } finally {
        if (isMounted) setContactLoading(false);
      }
    };

    loadContactMessages();

    return () => {
      isMounted = false;
    };
  }, [activeTab, contactCurrentPage, contactPageSize, contactSearchTerm]);

  // Fetch plans when panel opens
  useEffect(() => {
    if (selectedEnquiry) {
      dispatch(fetchPlans());
    }
  }, [dispatch, selectedEnquiry]);

  // Fetch plans when assign plan modal opens
  useEffect(() => {
    if (assignPlanModal) {
      dispatch(fetchPlans());
    }
  }, [dispatch, assignPlanModal]);

  // Fetch plans when contact assign plan modal opens
  useEffect(() => {
    if (contactAssignPlanModal) {
      dispatch(fetchPlans());
    }
  }, [dispatch, contactAssignPlanModal]);

  // Auto-scroll to assign plan section when opened from table button
  useEffect(() => {
    if (showAssignPlan && assignPlanRef.current) {
      setTimeout(() => {
        assignPlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [showAssignPlan]);

  const filteredAndSortedEnquiries = useMemo(() => {
    let result = [...enquiries];

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'userName') {
          aVal = a.user?.name || '';
          bVal = b.user?.name || '';
        } else if (sortConfig.key === 'subscriptionId') {
          aVal = a.plan?.name || '';
          bVal = b.plan?.name || '';
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [enquiries, sortConfig]);

  const paginatedEnquiries = filteredAndSortedEnquiries;

  const toggleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await dispatch(updateEnquiryStatus({ id, status: newStatus })).unwrap();
      showSuccess('Enquiry status updated successfully!');

      // Update selected enquiry if it's the one being changed
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: any) {
      showError(error?.message || 'Failed to update enquiry status');
    }
  };

  const handleActivateEnquiry = async (id: number) => {
    try {
      await dispatch(activateEnquiry(id)).unwrap();
      showSuccess('Enquiry activated successfully!');
      // Refresh enquiries list
      dispatch(fetchEnquiries({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter,
      }));
    } catch (error: any) {
      showError(error?.message || 'Failed to activate enquiry');
    }
  };

  const handleAssignEnquiry = async (id: number, assigned_to: number) => {
    try {
      await dispatch(assignEnquiry({ id, assigned_to })).unwrap();
      showSuccess('Enquiry assigned successfully!');

      // Update selected enquiry if it's the one being changed
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(prev => prev ? { ...prev, assigned_to } : null);
      }
    } catch (error: any) {
      showError(error?.message || 'Failed to assign enquiry');
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedEnquiry || !selectedPlanId) {
      showError('Please select a plan to assign');
      return;
    }

    try {
      setIsAssigningPlan(true);
      await dispatch(assignPlanToEnquiry({
        id: selectedEnquiry.id,
        plan_id: selectedPlanId,
        user_id: selectedEnquiry.user_id
      })).unwrap();

      // Auto-activate user if they are not active
      const userStatus = selectedEnquiry.user?.status?.toString()?.toLowerCase();
      if (userStatus !== 'active' && userStatus !== '1') {
        try {
          await dispatch(activateUser(selectedEnquiry.user_id)).unwrap();
          showSuccess('Plan assigned & user activated successfully!');
        } catch (actError: any) {
          showSuccess('Plan assigned, but failed to activate user automatically.');
        }
      } else {
        showSuccess('Plan assigned successfully!');
      }

      setShowAssignPlan(false);
      setSelectedPlanId(null);

      // Refresh enquiries
      dispatch(fetchEnquiries({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter,
      }));
    } catch (error: any) {
      showError(error?.message || 'Failed to assign plan');
    } finally {
      setIsAssigningPlan(false);
    }
  };

  const handleModalAssignPlan = async () => {
    if (!assignPlanModal || !modalSelectedPlanId) {
      showError('Please select a plan to assign');
      return;
    }

    try {
      setIsModalAssigning(true);

      // Step 1: Assign the plan
      await dispatch(assignPlanToEnquiry({
        id: assignPlanModal.id,
        plan_id: modalSelectedPlanId,
        user_id: assignPlanModal.user_id
      })).unwrap();

      // Step 2: Auto-activate user if they are not active
      const userStatus = assignPlanModal.user?.status?.toString()?.toLowerCase();
      let activatedSuccessfully = false;
      if (userStatus !== 'active' && userStatus !== '1') {
        try {
          await dispatch(activateUser(assignPlanModal.user_id)).unwrap();
          activatedSuccessfully = true;
        } catch (actError: any) {
          // Silent catch or handled gracefully
        }
      }

      // Step 3: Mark enquiry as resolved
      await dispatch(updateEnquiryStatus({
        id: assignPlanModal.id,
        status: 'resolved'
      })).unwrap();

      if (userStatus !== 'active' && userStatus !== '1') {
        if (activatedSuccessfully) {
          showSuccess('Plan assigned, user activated & enquiry resolved!');
        } else {
          showSuccess('Plan assigned & enquiry resolved (user activation failed)!');
        }
      } else {
        showSuccess('Plan assigned & enquiry resolved!');
      }
      setAssignPlanModal(null);
      setModalSelectedPlanId(null);

      // Refresh enquiries
      dispatch(fetchEnquiries({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter,
      }));
    } catch (error: any) {
      showError(error?.message || 'Failed to assign plan');
    } finally {
      setIsModalAssigning(false);
    }
  };

  const handleContactAssignPlan = async () => {
    if (!contactAssignPlanModal || !contactModalSelectedPlanId) {
      showError('Please select a plan to assign');
      return;
    }

    const email = contactAssignPlanModal.email || contactAssignPlanModal.user_email || contactAssignPlanModal.user?.email;
    if (!email) {
      showError('Email not found for this contact');
      return;
    }

    try {
      setIsContactModalAssigning(true);

      // const response = await put<any>(`/admin/users/${encodeURIComponent(email)}/subscription`, {
      //   planId: contactModalSelectedPlanId,
      //   contactId: contactAssignPlanModal.id,
      // });
      const response = await put<any>(
        `/admin/users/subscription/${encodeURIComponent(email)}`,
        {
          planId: contactModalSelectedPlanId,
          contactId: contactAssignPlanModal.id,
        }
      );
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to assign plan');
      }

      showSuccess('Plan assigned successfully!');
      setContactAssignPlanModal(null);
      setContactModalSelectedPlanId(null);

      // Refresh contact messages list
      const queryParams = new URLSearchParams();
      queryParams.append('page', contactCurrentPage.toString());
      queryParams.append('limit', contactPageSize.toString());
      if (contactSearchTerm.trim()) {
        queryParams.append('search', contactSearchTerm.trim());
      }
      try {
        const refreshResponse = await get<any>(`/admin/contact-messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        if (refreshResponse.success) {
          const apiData = refreshResponse.data;
          const messages = Array.isArray(apiData) ? apiData
            : Array.isArray(apiData?.contact_messages) ? apiData.contact_messages
              : Array.isArray(apiData?.messages) ? apiData.messages
                : Array.isArray(apiData?.items) ? apiData.items
                  : Array.isArray(apiData?.data) ? apiData.data : [];
          setContactMessages(messages);
        }
      } catch (_) { }
    } catch (error: any) {
      showError(error?.message || 'Failed to assign plan');
    } finally {
      setIsContactModalAssigning(false);
    }
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to format status
  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Helper function to get priority from status or default
  const getPriority = (priority: string) => {
    const priorityMap: any = {
      'urgent': 'Urgent',
      'high': 'High',
      'normal': 'Medium',
      'low': 'Low'
    };
    return priorityMap[priority.toLowerCase()] || 'Medium';
  };

  const getContactName = (message: ContactMessage) => {
    return message.name || message.user_name || message.full_name || 'Unknown Contact';
  };

  const getContactEmail = (message: ContactMessage) => {
    return message.email || message.user_email || 'N/A';
  };

  const getContactPhone = (message: ContactMessage) => {
    return message.phone || message.user_phone || 'N/A';
  };

  const getContactPreview = (message: ContactMessage) => {
    const text = message.message || message.description || '';
    return text.length > 120 ? `${text.slice(0, 120)}...` : text || 'No message content provided.';
  };

  const getContactSubscriptionId = (message: ContactMessage): string | number => {
    return message.subscription_id ?? message.plan_id ?? 'N/A';
  };

  const getContactPlanName = (message: ContactMessage): string => {
    const subId = message.subscription_id ?? message.plan_id;
    if (subId == null) return 'N/A';
    const found = plans.find((p) => p.id === Number(subId));
    return found ? found.name : String(subId);
  };

  const getContactPlanId = (message: ContactMessage) => {
    const rawPlanId = message.plan_id ?? message.subscription_id;
    if (typeof rawPlanId === 'number' && Number.isFinite(rawPlanId)) {
      return rawPlanId;
    }
    if (typeof rawPlanId === 'string' && rawPlanId.trim()) {
      const parsed = Number(rawPlanId);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const formatContactDate = (value?: string) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getContactStatusClasses = (status?: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'pending') {
      return 'bg-warning/5 text-warning';
    }
    if (normalized === 'in_progress') {
      return 'bg-info/5 text-info';
    }
    if (normalized === 'resolved') {
      return 'bg-success/5 text-success';
    }
    return 'bg-danger/5 text-danger';
  };

  const updateContactMessageStatus = async (status: string) => {
    if (!selectedContactMessage) return;

    try {
      setContactStatusUpdating(true);
      const response = await put<any>(`/admin/contact-messages/${selectedContactMessage.id}/status`, {
        status,
      });

      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to update contact status');
      }

      const userId = selectedContactMessage.user_id ?? selectedContactMessage.user?.id;
      const planId = getContactPlanId(selectedContactMessage);

      if (userId && planId) {
        const subscriptionResponse = await put<any>(`/admin/users/${userId}/subscription`, {
          planId,
        });

        if (!subscriptionResponse.success) {
          throw new Error(subscriptionResponse.error?.message || subscriptionResponse.message || 'Failed to update user subscription');
        }
      }

      setContactMessages((prev) =>
        prev.map((message) =>
          message.id === selectedContactMessage.id
            ? { ...message, status }
            : message
        )
      );

      setSelectedContactMessage((prev) =>
        prev ? { ...prev, status } : prev
      );

      showSuccess('Contact message status updated successfully!');
    } catch (err: any) {
      showError(err?.message || 'Failed to update contact status');
    } finally {
      setContactStatusUpdating(false);
    }
  };

  const contactTotalItems = contactPagination?.total_items || contactMessages.length;
  const contactTotalPages = contactPagination?.total_pages || 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight uppercase">Inquiries</h2>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage inquiries and contact messages from one place.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-100 bg-white sticky top-0 z-30 pt-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'enquiries', label: 'Inquiries', icon: MessageSquare },
          { id: 'contacts', label: 'Contact Messages', icon: Mail },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as AdminTab);
              setSelectedEnquiry(null);
              setSelectedContactMessage(null);
            }}
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

      <div className="premium-card overflow-hidden relative">
        {activeTab === 'enquiries' ? (
          <>
            {/* Controls */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#fcfcfc]">
              <div className="relative w-full xl:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search enquiries by ID, name, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-white border border-gray-200 rounded-[16px] text-xs md:text-sm font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-all shrink-0">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-[12px] text-[10px] md:text-xs font-black uppercase tracking-widest text-navy focus:outline-none outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            {/* Mobile Card List - visible only on small screens */}
            <div className="block md:hidden divide-y divide-gray-100 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading...</p>
                  </div>
                ) : paginatedEnquiries.length > 0 ? (
                  paginatedEnquiries.map((enq) => (
                    <motion.div
                      key={enq.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {/* Accordion Header */}
                      <div
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleEnquiryExpand(enq.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shadow-sm shrink-0">
                              {getInitials(enq.user.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-navy truncate">{enq.user.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold truncate mt-0.5">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{enq.user.email}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-all shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEnquiryExpand(enq.id);
                            }}
                          >
                            {expandedEnquiryId === enq.id ? (
                              <Minus className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {expandedEnquiryId === enq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
                              {/* Status */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 flex-1">
                                  <Activity className="w-4 h-4 text-primary shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
                                    <p className={cn(
                                      "text-xs font-black uppercase tracking-wide truncate",
                                      enq.status === 'pending' ? "text-warning" :
                                        enq.status === 'in_progress' ? "text-info" :
                                          enq.status === 'resolved' ? "text-success" : "text-danger"
                                    )}>
                                      {formatStatus(enq.status)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Subscription */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                <CreditCard className="w-4 h-4 text-info shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Plan</p>
                                  <p className="text-xs font-black text-navy truncate">{enq.plan.name}</p>
                                </div>
                              </div>

                              {/* Phone */}
                              {(enq.user.phone || enq.phone) && (
                                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                  <Phone className="w-4 h-4 text-success shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                                    <p className="text-xs font-bold text-navy truncate">{enq.user.phone || enq.phone}</p>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEnquiry(enq);
                                  }}
                                  className="py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                {(enq.status === 'pending' || enq.status === 'in_progress') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssignPlanModal(enq);
                                      setModalSelectedPlanId(null);
                                    }}
                                    className="py-2.5 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-success/90 flex items-center justify-center gap-2"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Assign
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Inquiries</h3>
                    <p className="text-sm text-gray-400 max-w-xs text-center font-medium">
                      No inquiries found matching your filters.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Table - hidden on mobile */}
            <div className="hidden md:block overflow-x-auto no-scrollbar min-h-[400px]">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('userName')}>
                      <div className="flex items-center gap-2">
                        Customer Identity {sortConfig?.key === 'userName' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('subscriptionId')}>
                      <div className="flex items-center gap-2">
                        Subscription ID {sortConfig?.key === 'subscriptionId' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status Feed {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      <tr className="h-64">
                        <td colSpan={4} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm text-gray-400 font-medium">Loading enquiries...</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedEnquiries.length > 0 ? (
                      paginatedEnquiries.map((enq) => (
                        <motion.tr
                          key={enq.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="group hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEnquiry(enq)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shrink-0">
                                {getInitials(enq.user.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-navy truncate">{enq.user.name}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
                                  <Mail className="w-3 h-3" />
                                  {enq.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-300" />
                              <span className="text-xs font-black text-navy/70 uppercase tracking-widest">{enq.plan.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest",
                              enq.status === 'pending' ? "bg-warning/5 text-warning" :
                                enq.status === 'in_progress' ? "bg-info/5 text-info" :
                                  enq.status === 'resolved' ? "bg-success/5 text-success" : "bg-danger/5 text-danger"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full mr-2",
                                enq.status === 'pending' ? "bg-warning animate-pulse" :
                                  enq.status === 'in_progress' ? "bg-info" :
                                    enq.status === 'resolved' ? "bg-success" : "bg-danger"
                              )} />
                              {formatStatus(enq.status)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 transition-opacity">
                              <button
                                onClick={() => setSelectedEnquiry(enq)}
                                className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-navy transition-all shadow-sm"
                                title="View Intelligence"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {(enq.status === 'pending' || enq.status === 'in_progress') && (
                                <button
                                  onClick={() => {
                                    setAssignPlanModal(enq);
                                    setModalSelectedPlanId(null);
                                  }}
                                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm"
                                  title="Assign Plan"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}
                              {enq.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(enq.id, 'in_progress')}
                                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-success transition-all shadow-sm"
                                  title="Assign to Agent"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              {(enq.status === 'pending' || enq.status === 'in_progress') && (
                                <button
                                  onClick={() => handleStatusChange(enq.id, 'rejected')}
                                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-danger transition-all shadow-sm"
                                  title="Decline Enquiry"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr className="h-64">
                        <td colSpan={4} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                              <MessageSquare className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-navy uppercase tracking-tight">Intelligence Feed Empty</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
                              No inquiries found matching your current filter parameters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-6 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Reporting <span className="font-black text-navy">{paginatedEnquiries.length}</span> of <span className="font-black text-navy">{pagination?.total_items || 0}</span> inquiries
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Capacity</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none shadow-sm"
                  >
                    <option value={10}>10 Entities</option>
                    <option value={25}>25 Entities</option>
                    <option value={50}>50 Entities</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pagination?.total_pages || 1 }, (_, i) => i + 1).slice(
                    Math.max(0, currentPage - 3),
                    Math.min(pagination?.total_pages || 1, currentPage + 2)
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      className={cn(
                        "w-9 h-9 rounded-xl text-[10px] font-black tracking-widest transition-all outline-none",
                        currentPage === page ? "bg-navy text-white shadow-xl shadow-navy/20" : "hover:bg-gray-100 text-gray-400 hover:text-navy disabled:opacity-30"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination?.total_pages || 1, prev + 1))}
                  disabled={currentPage === (pagination?.total_pages || 1) || isLoading}
                  className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#fcfcfc]">
              <div className="relative w-full xl:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contact messages by name, email, or subject..."
                  value={contactSearchTerm}
                  onChange={(e) => {
                    setContactSearchTerm(e.target.value);
                    setContactCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-white border border-gray-200 rounded-[16px] text-xs md:text-sm font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">

                <select
                  value={contactPageSize}
                  onChange={(e) => {
                    setContactPageSize(Number(e.target.value));
                    setContactCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-200 rounded-[12px] text-[10px] md:text-xs font-black uppercase tracking-widest text-navy focus:outline-none outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                >
                  <option value={10}>10 Messages</option>
                  <option value={25}>25 Messages</option>
                  <option value={50}>50 Messages</option>
                </select>
              </div>
            </div>

            {/* Mobile Card List - visible only on small screens */}
            <div className="block md:hidden divide-y divide-gray-100 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {contactLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading...</p>
                  </div>
                ) : contactError ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="p-5 bg-danger/5 rounded-full border border-danger/10">
                      <AlertCircle className="w-8 h-8 text-danger" />
                    </div>
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight">Error</h3>
                    <p className="text-sm text-gray-400 max-w-xs text-center font-medium">{contactError}</p>
                  </div>
                ) : contactMessages.length > 0 ? (
                  contactMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {/* Accordion Header */}
                      <div
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleContactExpand(message.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shadow-sm shrink-0">
                              {getInitials(getContactName(message))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-navy truncate">{getContactName(message)}</p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold truncate mt-0.5">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{getContactEmail(message)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-all shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleContactExpand(message.id);
                            }}
                          >
                            {expandedContactId === message.id ? (
                              <Minus className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {expandedContactId === message.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
                              {/* Subject */}
                              {message.subject && (
                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Subject</p>
                                  <p className="text-xs font-bold text-navy">{message.subject}</p>
                                </div>
                              )}

                              {/* Status */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                <Activity className="w-4 h-4 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
                                  <p className={cn(
                                    "text-xs font-black uppercase tracking-wide truncate",
                                    getContactStatusClasses(message.status)
                                  )}>
                                    {formatStatus(message.status || 'pending')}
                                  </p>
                                </div>
                              </div>

                              {/* Plan */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                <CreditCard className="w-4 h-4 text-info shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Plan</p>
                                  <p className="text-xs font-black text-navy truncate">{getContactPlanName(message)}</p>
                                </div>
                              </div>

                              {/* Phone */}
                              {getContactPhone(message) !== 'N/A' && (
                                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                  <Phone className="w-4 h-4 text-success shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                                    <p className="text-xs font-bold text-navy truncate">{getContactPhone(message)}</p>
                                  </div>
                                </div>
                              )}

                              {/* Date */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Received</p>
                                  <p className="text-xs font-bold text-navy truncate">{formatContactDate(message.created_at || message.updated_at)}</p>
                                </div>
                              </div>

                              {/* Message Preview */}
                              {(message.message || message.description) && (
                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Message</p>
                                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{getContactPreview(message)}</p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContactMessage(message);
                                  }}
                                  className="py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(fetchPlans());
                                    setContactAssignPlanModal(message);
                                    setContactModalSelectedPlanId(null);
                                  }}
                                  className="py-2.5 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-success/90 flex items-center justify-center gap-2"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Assign
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                      <Mail className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Messages</h3>
                    <p className="text-sm text-gray-400 max-w-xs text-center font-medium">
                      No contact messages found.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Table - hidden on mobile */}
            <div className="hidden md:block overflow-x-auto no-scrollbar min-h-[400px]">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</th>
                    <th className="px-6 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {contactLoading ? (
                      <tr className="h-64">
                        <td colSpan={6} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm text-gray-400 font-medium">Loading contact messages...</p>
                          </div>
                        </td>
                      </tr>
                    ) : contactError ? (
                      <tr className="h-64">
                        <td colSpan={6} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-5 bg-danger/5 rounded-full border border-danger/10">
                              <AlertCircle className="w-8 h-8 text-danger" />
                            </div>
                            <h3 className="text-xl font-black text-navy uppercase tracking-tight">Unable to Load Messages</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">{contactError}</p>
                          </div>
                        </td>
                      </tr>
                    ) : contactMessages.length > 0 ? (
                      contactMessages.map((message) => (
                        <motion.tr
                          key={message.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="group hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedContactMessage(message)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shrink-0">
                                {getInitials(getContactName(message))}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-navy truncate">{getContactName(message)}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
                                  <Mail className="w-3 h-3" />
                                  {getContactEmail(message)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <p className="text-xs font-black text-navy uppercase tracking-widest">{message.subject || 'No Subject'}</p>
                              <p className="text-[11px] text-gray-400 font-medium line-clamp-2 max-w-[24rem]">{getContactPreview(message)}</p>
                            </div>
                          </td>
                      {/* <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-300" />
                              <span className="text-xs font-black text-navy/70 uppercase tracking-widest">{getContactPlanName(message)}</span>
                            </div>
                          </td> */}
   <td className="px-6 py-5">
  <div className="flex items-center gap-2 flex-wrap">
    <CreditCard className="w-4 h-4 text-gray-300" />

    {(() => {
      const previousInquiry = contactMessages.find(
        (item) =>
          item.email === message.email &&
          item.id !== message.id &&
          item.status === "resolved" // sirf resolved inquiry compare hogi
      );

      const previousPrice = previousInquiry?.plan?.price || 0;
      const currentPrice = message.plan?.price || 0;

      const currentPlanName = message.plan?.name || "NA";

      return (
        <>
          {/* Plan Name */}
          <span className="text-xs font-black text-navy uppercase tracking-widest">
            {currentPlanName}
          </span>

          {/* Pending Status */}
          {message.status === "pending" && (
            <>
              {/* Upgrade */}
              {previousInquiry && currentPrice > previousPrice && (
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                    dispatch(fetchPlans());
                    setContactAssignPlanModal(message);
                    setContactModalSelectedPlanId(null);
                  }}
                  className="px-2 py-1 cursor-pointer rounded-lg bg-success/10 text-success text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Upgrade
                </button>
              )}

              {/* Downgrade */}
              {previousInquiry && currentPrice < previousPrice && (
                <button
                
                  onClick={(e) => {
                     e.stopPropagation();
                    dispatch(fetchPlans());
                    setContactAssignPlanModal(message);
                    setContactModalSelectedPlanId(null);
                  }}
                  className="px-2 py-1 cursor-pointer rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Downgrade
                </button>
              )}

              {/* Same */}
              {/* {previousInquiry && currentPrice === previousPrice && (
                <button
                  onClick={() => {
                    dispatch(fetchPlans());
                    setContactAssignPlanModal(message);
                    setContactModalSelectedPlanId(null);
                  }}
                  className="px-2 py-1 rounded-lg bg-info/10 text-info text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Same
                </button>
              )} */}
            </>
          )}

          {/* Resolved */}
          {/* {message.status === "resolved" && (
            <button className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest cursor-default">
              Completed
            </button>
          )} */}
        </>
      );
    })()}
  </div>
</td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest",
                              getContactStatusClasses(message.status)
                            )}>
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full mr-2",
                                message.status?.toLowerCase().includes('read') || message.status?.toLowerCase().includes('resolved') || message.status?.toLowerCase().includes('replied')
                                  ? "bg-success"
                                  : message.status?.toLowerCase().includes('new') || message.status?.toLowerCase().includes('pending') || message.status?.toLowerCase().includes('unread')
                                    ? "bg-warning animate-pulse"
                                    : "bg-info"
                              )} />
                              {formatStatus(message.status || 'pending')}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-navy">{formatContactDate(message.created_at || message.updated_at)}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{getContactPhone(message)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedContactMessage(message)}
                                className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-navy transition-all shadow-sm"
                                title="View message"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  dispatch(fetchPlans());
                                  setContactAssignPlanModal(message);
                                  setContactModalSelectedPlanId(null);
                                }}
                                className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm"
                                title="Assign Plan"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr className="h-64">
                        <td colSpan={6} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                              <Mail className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Contact Messages</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
                              No messages found for the current search criteria.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Reporting <span className="font-black text-navy">{contactMessages.length}</span> of <span className="font-black text-navy">{contactTotalItems}</span> messages
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setContactCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={contactCurrentPage === 1 || contactLoading}
                  className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: contactTotalPages }, (_, i) => i + 1).slice(
                    Math.max(0, contactCurrentPage - 3),
                    Math.min(contactTotalPages, contactCurrentPage + 2)
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setContactCurrentPage(page)}
                      disabled={contactLoading}
                      className={cn(
                        "w-9 h-9 rounded-xl text-[10px] font-black tracking-widest transition-all outline-none",
                        contactCurrentPage === page ? "bg-navy text-white shadow-xl shadow-navy/20" : "hover:bg-gray-100 text-gray-400 hover:text-navy disabled:opacity-30"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setContactCurrentPage(prev => Math.min(contactTotalPages, prev + 1))}
                  disabled={contactCurrentPage === contactTotalPages || contactLoading}
                  className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enquiry Details Slide-over Panel */}
      <AnimatePresence>
        {selectedEnquiry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedEnquiry(null);
                setShowAssignPlan(false);
                setSelectedPlanId(null);
              }}
              className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full md:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">Inquiry Intelligence</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">Direct Customer Communication</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEnquiry(null);
                    setShowAssignPlan(false);
                    setSelectedPlanId(null);
                  }}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                {/* Status & Priority */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol ID</p>
                    <p className="text-sm font-black text-navy">{selectedEnquiry.protocol_id}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    selectedEnquiry.priority === 'urgent' ? "bg-danger text-white shadow-lg shadow-danger/20" :
                      selectedEnquiry.priority === 'high' ? "bg-primary text-white shadow-lg shadow-primary/20" :
                        "bg-navy text-white"
                  )}>
                    {getPriority(selectedEnquiry.priority)} Priority
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Intelligence Feed
                  </h5>
                  <div className="p-6 md:p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 relative">
                    <p className="text-sm md:text-base text-navy leading-relaxed font-medium italic">
                      "{selectedEnquiry.message}"
                    </p>
                  </div>
                </div>

                {/* Customer Overview */}
                <div className="space-y-6">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Customer Identity
                  </h5>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-lg font-black text-navy border border-gray-100">
                        {getInitials(selectedEnquiry.user.name)}
                      </div>
                      <div>
                        <p className="text-base font-black text-navy">{selectedEnquiry.user.name}</p>
                        <p className="text-xs text-gray-400 font-bold">{selectedEnquiry.plan.name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Access</p>
                        <p className="text-xs font-bold text-navy truncate">{selectedEnquiry.user.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secure Line</p>
                        <p className="text-xs font-bold text-navy truncate">{selectedEnquiry.user.phone || selectedEnquiry.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Context */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Subscription Intelligence
                  </h5>
                  <div className="p-8 bg-navy text-white rounded-[32px] relative overflow-hidden shadow-2xl shadow-navy/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] -mr-24 -mt-24 rounded-full" />

                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary shadow-inner">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Active Ecosystem Tier</p>
                            <h4 className="text-xl font-black tracking-tight">{selectedEnquiry.plan.name}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white">{selectedEnquiry.plan.currency}{selectedEnquiry.plan.price}</p>
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Provisioned Cost</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Asset Capacity</p>
                          <p className="text-sm font-black text-white">{selectedEnquiry.plan.max_photos.toLocaleString()} Photos</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Event Logic</p>
                          <p className="text-sm font-black text-white">{selectedEnquiry.plan.max_events} Entities</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Storage Vault</p>
                          <p className="text-sm font-black text-white">{(selectedEnquiry.plan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0)} GB SSD</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Video Stream</p>
                          <p className="text-sm font-black text-white">{selectedEnquiry.plan.max_videos} Nodes</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedEnquiry.plan.has_face_recognition && (
                          <div className="px-3 py-1.5 bg-success/20 text-success border border-success/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Face ID Enabled
                          </div>
                        )}
                        {selectedEnquiry.plan.has_custom_watermark && (
                          <div className="px-3 py-1.5 bg-info/20 text-info border border-info/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Custom Watermark
                          </div>
                        )}
                        <div className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          Role: {selectedEnquiry.plan.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>{/* end panel content */}

              {/* Panel Actions */}
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                {selectedEnquiry.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(selectedEnquiry.id, 'in_progress')}
                    className="flex-1 py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none"
                  >
                    <UserCheck className="w-5 h-5" />
                    Assign to Me
                  </button>
                )}
                {selectedEnquiry.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(selectedEnquiry.id, 'resolved')}
                    className="flex-1 py-4 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-success/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark Resolved
                  </button>
                )}
                {(selectedEnquiry.status === 'pending' || selectedEnquiry.status === 'in_progress') && (
                  <button
                    onClick={() => handleStatusChange(selectedEnquiry.id, 'rejected')}
                    className="p-4 border border-gray-200 rounded-2xl text-gray-400 hover:text-danger hover:border-danger/20 hover:bg-white transition-all shadow-sm active:scale-95 outline-none"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-4 border border-gray-200 rounded-2xl text-gray-400 hover:text-navy hover:bg-white transition-all shadow-sm active:scale-95 outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedContactMessage && activeTab === 'contacts' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContactMessage(null)}
              className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full md:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">Contact Message</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">API /admin/contact-messages</p>
                </div>
                <button
                  onClick={() => setSelectedContactMessage(null)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Message ID</p>
                    <p className="text-sm font-black text-navy">{selectedContactMessage.id}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    getContactStatusClasses(selectedContactMessage.status)
                  )}>
                    {formatStatus(selectedContactMessage.status || 'pending')}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Message Content
                  </h5>
                  <div className="p-6 md:p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 relative">
                    <p className="text-sm md:text-base text-navy leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedContactMessage.message || selectedContactMessage.description || 'No message content available.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Contact Details
                  </h5>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-lg font-black text-navy border border-gray-100">
                        {getInitials(getContactName(selectedContactMessage))}
                      </div>
                      <div>
                        <p className="text-base font-black text-navy">{getContactName(selectedContactMessage)}</p>
                        <p className="text-xs text-gray-400 font-bold">{selectedContactMessage.subject || 'No Subject'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-xs font-bold text-navy truncate">{getContactEmail(selectedContactMessage)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="text-xs font-bold text-navy truncate">{getContactPhone(selectedContactMessage)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Received At</p>
                        <p className="text-xs font-bold text-navy truncate">{formatContactDate(selectedContactMessage.created_at || selectedContactMessage.updated_at)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subscription Plan</p>
                        <p className="text-xs font-bold text-navy truncate">{getContactPlanName(selectedContactMessage)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Intelligence Card */}
                {(() => {
                  const planId = getContactPlanId(selectedContactMessage);
                  const plan = planId != null ? plans.find((p) => p.id === planId) : null;
                  if (!plan) return null;
                  return (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Subscription Intelligence
                      </h5>
                      <div className="p-8 bg-navy text-white rounded-[32px] relative overflow-hidden shadow-2xl shadow-navy/20">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] -mr-24 -mt-24 rounded-full" />
                        <div className="relative z-10 space-y-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary shadow-inner">
                                <CreditCard className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Active Ecosystem Tier</p>
                                <h4 className="text-xl font-black tracking-tight">{plan.name}</h4>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-white">{plan.currency}{plan.price}</p>
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Provisioned Cost</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Asset Capacity</p>
                              <p className="text-sm font-black text-white">{plan.max_photos.toLocaleString()} Photos</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Event Logic</p>
                              <p className="text-sm font-black text-white">{plan.max_events} Entities</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Storage Vault</p>
                              <p className="text-sm font-black text-white">{(plan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0)} GB SSD</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Video Stream</p>
                              <p className="text-sm font-black text-white">{plan.max_videos} Nodes</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {plan.has_face_recognition && (
                              <div className="px-3 py-1.5 bg-success/20 text-success border border-success/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Face ID Enabled
                              </div>
                            )}
                            {plan.has_custom_watermark && (
                              <div className="px-3 py-1.5 bg-info/20 text-info border border-info/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Custom Watermark
                              </div>
                            )}
                            <div className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5" />
                              Role: {plan.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                {(selectedContactMessage.status === 'pending' || selectedContactMessage.status === 'in_progress') && (
                  <button
                    onClick={() => {
                      setContactAssignPlanModal(selectedContactMessage);
                      setContactModalSelectedPlanId(null);
                    }}
                    className="p-4 border border-gray-200 rounded-2xl text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-white transition-all shadow-sm active:scale-95 outline-none"
                    title="Assign Plan"
                  >
                    <CreditCard className="w-5 h-5" />
                  </button>
                )}
                {selectedContactMessage.status === 'pending' && (
                  <button
                    onClick={() => updateContactMessageStatus('in_progress')}
                    disabled={contactStatusUpdating}
                    className="flex-1 py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none disabled:opacity-50"
                  >
                    <UserCheck className="w-5 h-5" />
                    Assign to Me
                  </button>
                )}
                {selectedContactMessage.status === 'in_progress' && (
                  <button
                    onClick={() => updateContactMessageStatus('resolved')}
                    disabled={contactStatusUpdating}
                    className="flex-1 py-4 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-success/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark Resolved
                  </button>
                )}
                {(selectedContactMessage.status === 'pending' || selectedContactMessage.status === 'in_progress') && (
                  <button
                    onClick={() => updateContactMessageStatus('rejected')}
                    disabled={contactStatusUpdating}
                    className="p-4 border border-gray-200 rounded-2xl text-gray-400 hover:text-danger hover:border-danger/20 hover:bg-white transition-all shadow-sm active:scale-95 outline-none disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedContactMessage(null)}
                  className="p-4 border border-gray-200 rounded-2xl text-gray-400 hover:text-navy hover:bg-white transition-all shadow-sm active:scale-95 outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Assign Plan Modal */}
      <AnimatePresence>
        {assignPlanModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setAssignPlanModal(null);
                setModalSelectedPlanId(null);
              }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-8 py-6 bg-navy text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 blur-[40px] pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight uppercase">Assign Plan</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                        {assignPlanModal.user.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAssignPlanModal(null);
                      setModalSelectedPlanId(null);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Current Plan Info */}
              <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Plan</p>
                  <p className="text-sm font-black text-navy mt-0.5">{assignPlanModal.plan.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</p>
                  <p className="text-sm font-black text-primary mt-0.5 capitalize">{assignPlanModal.plan.role}</p>
                </div>
              </div>

              {/* Plans List */}
              <div className="px-8 py-6 max-h-[50vh] overflow-y-auto space-y-4">
                {plans.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (() => {
                  const currentRole = assignPlanModal.plan?.role?.toLowerCase();
                  const filteredPlans = currentRole
                    ? plans.filter(p => p.role?.toLowerCase() === currentRole)
                    : plans;

                  if (filteredPlans.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CreditCard className="w-8 h-8 text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-gray-400">No plans for role</p>
                        <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest font-bold">{currentRole}</p>
                      </div>
                    );
                  }

                  const grouped = filteredPlans.reduce((acc: Record<string, typeof plans>, plan) => {
                    const role = plan.role || 'Other';
                    if (!acc[role]) acc[role] = [];
                    acc[role].push(plan);
                    return acc;
                  }, {});

                  const roleColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                    photographer: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
                    studio: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
                    enterprise: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
                    user: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
                    basic: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
                  };

                  return Object.entries(grouped).map(([role, rolePlans]) => {
                    const colors = roleColors[role.toLowerCase()] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
                    return (
                      <div key={role} className="space-y-2">
                        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit", colors.bg, colors.border, "border")}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", colors.text)}>{role}</span>
                          <span className={cn("text-[9px] font-bold opacity-60", colors.text)}>({rolePlans.length})</span>
                        </div>
                        <div className="space-y-2 pl-2">
                          {rolePlans.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => setModalSelectedPlanId(plan.id)}
                              className={cn(
                                "w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left",
                                modalSelectedPlanId === plan.id
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : plan.id === assignPlanModal.plan?.id
                                    ? "border-success/40 bg-success/5"
                                    : "border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  modalSelectedPlanId === plan.id ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-400"
                                )}>
                                  <CreditCard className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-black text-navy">{plan.name}</p>
                                    {plan.id === assignPlanModal.plan?.id && (
                                      <span className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-black uppercase tracking-widest rounded-md">Current</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                    {plan.max_photos.toLocaleString()} photos · {(plan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0)}GB
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <p className="text-sm font-black text-navy">{plan.currency}{plan.price}</p>
                                {modalSelectedPlanId === plan.id && (
                                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center ml-auto mt-1">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setAssignPlanModal(null);
                    setModalSelectedPlanId(null);
                  }}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-navy hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalAssignPlan}
                  disabled={!modalSelectedPlanId || isModalAssigning}
                  className="flex-[2] py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isModalAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Assign
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Assign Plan Modal */}
      <AnimatePresence>
        {contactAssignPlanModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setContactAssignPlanModal(null);
                setContactModalSelectedPlanId(null);
              }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 bg-navy text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 blur-[40px] pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight uppercase">Assign Plan</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                        {getContactName(contactAssignPlanModal)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setContactAssignPlanModal(null);
                      setContactModalSelectedPlanId(null);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Plan</p>
                  <p className="text-sm font-black text-navy mt-0.5">{getContactPlanName(contactAssignPlanModal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-black text-primary mt-0.5 truncate max-w-[180px]">
                    {contactAssignPlanModal.email || contactAssignPlanModal.user_email || contactAssignPlanModal.user?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="px-8 py-6 max-h-[50vh] overflow-y-auto space-y-4">
                {plans.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (() => {
                  // The user's current plan id from subscription_id or plan_id
                  const currentPlanId = (() => {
                    const raw = contactAssignPlanModal.subscription_id ?? contactAssignPlanModal.plan_id;
                    if (raw == null) return null;
                    const n = Number(raw);
                    return Number.isFinite(n) ? n : null;
                  })();

                  const grouped = plans.reduce((acc: Record<string, typeof plans>, plan) => {
                    const role = plan.role || 'Other';
                    if (!acc[role]) acc[role] = [];
                    acc[role].push(plan);
                    return acc;
                  }, {});

                  const roleColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                    photographer: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
                    studio: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
                    enterprise: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
                    user: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
                    basic: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
                  };

                  return Object.entries(grouped).map(([role, rolePlans]) => {
                    const colors = roleColors[role.toLowerCase()] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
                    return (
                      <div key={role} className="space-y-2">
                        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit", colors.bg, colors.border, "border")}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", colors.text)}>{role}</span>
                          <span className={cn("text-[9px] font-bold opacity-60", colors.text)}>({rolePlans.length})</span>
                        </div>
                        <div className="space-y-2 pl-2">
                          {rolePlans.map((plan) => {
                            const isCurrentPlan = plan.id === currentPlanId;
                            const isSelected = contactModalSelectedPlanId === plan.id;
                            return (
                              <button
                                key={plan.id}
                                onClick={() => setContactModalSelectedPlanId(plan.id)}
                                className={cn(
                                  "w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : isCurrentPlan
                                      ? "border-success/50 bg-success/5"
                                      : "border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    isSelected ? "bg-primary text-white"
                                      : isCurrentPlan ? "bg-success text-white"
                                        : "bg-white border border-gray-200 text-gray-400"
                                  )}>
                                    <CreditCard className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-black text-navy">{plan.name}</p>
                                      {isCurrentPlan && (
                                        <span className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-black uppercase tracking-widest rounded-md">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                      {plan.max_photos.toLocaleString()} photos · {(plan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0)}GB
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p className="text-sm font-black text-navy">{plan.currency}{plan.price}</p>
                                  {isSelected && (
                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center ml-auto mt-1">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setContactAssignPlanModal(null);
                    setContactModalSelectedPlanId(null);
                  }}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-navy hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContactAssignPlan}
                  disabled={!contactModalSelectedPlanId || isContactModalAssigning}
                  className="flex-[2] py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isContactModalAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Assign
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
