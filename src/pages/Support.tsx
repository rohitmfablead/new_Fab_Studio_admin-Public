import React, { useState, useMemo, useEffect } from 'react';
import { LifeBuoy, Search, Filter, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, User, Eye, X, Calendar, Tag, Mail, Phone, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchSupportTickets, createSupportTicket, updateSupportTicket, updateTicketStatus } from '../store/slices/supportSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { showSuccess, showError } from '@/src/lib/toast';

export function SupportPage() {
  const dispatch = useAppDispatch();
  const { tickets, isLoading, error, pagination } = useAppSelector((state) => state.support);
  const { users } = useAppSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [statusModalTicket, setStatusModalTicket] = useState<any>(null);

  // Accordion state for mobile view
  const [expandedTicketId, setExpandedTicketId] = useState<string | number | null>(null);

  const toggleTicketExpand = (id: string | number) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
  };

  const [newTicket, setNewTicket] = useState({
    user_id: '',
    subject: '',
    priority: 'medium',
    description: ''
  });

  // Fetch users when modal opens
  useEffect(() => {
    if (isAddModalOpen && users.length === 0) {
      dispatch(fetchUsers({ limit: 100 })); // Fetch all users for dropdown
    }
  }, [isAddModalOpen, dispatch, users.length]);

  // Fetch support tickets on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      status: statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined,
    };
    dispatch(fetchSupportTickets(params));
  }, [dispatch, currentPage, pageSize, searchTerm, statusFilter]);

  const filteredAndSortedTickets = useMemo(() => {
    // Filter out any null/undefined items the API may return
    let result = (tickets || []).filter(Boolean);

    if (sortConfig) {
      result = [...result].sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tickets, sortConfig]);

  const totalPages = pagination ? pagination.total_pages : 1;
  const totalTickets = pagination ? pagination.total_items : 0;

  const toggleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await dispatch(createSupportTicket({
        user_id: Number(newTicket.user_id),
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority
      })).unwrap();

      // Refetch the list so the new ticket appears immediately
      dispatch(fetchSupportTickets({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined,
      }));

      showSuccess('Support ticket created successfully!');
      setIsAddModalOpen(false);
      setNewTicket({ user_id: '', subject: '', priority: 'medium', description: '' });
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to create ticket';
      showError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await dispatch(updateTicketStatus({ ticketId, status })).unwrap();
      showSuccess('Ticket status updated!');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update status';
      showError(errorMessage);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-3">
            <LifeBuoy className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Help Desk</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tight">Support Tickets</h2>
          <p className="text-gray-500 font-medium mt-2">Manage customer issues and requests.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-100 min-w-[200px]">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Tickets</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-navy uppercase tracking-tight">Failed to Load</h3>
            <p className="text-gray-500 font-medium max-w-xs">{error}</p>
            <button
              onClick={() => dispatch(fetchSupportTickets({ page: currentPage, limit: pageSize }))}
              className="mt-4 px-6 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card List - visible only on small screens */}
            <div className="block md:hidden divide-y divide-gray-100 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedTickets.length > 0 ? (
                  filteredAndSortedTickets.map(ticket => (
                    <motion.div
                      key={ticket.id}
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
                        onClick={() => toggleTicketExpand(ticket.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-navy/5 border border-navy/5 flex items-center justify-center text-xs font-black text-navy shadow-sm shrink-0">
                              #{ticket.id}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-navy truncate">{ticket.subject}</p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold truncate mt-0.5">
                                <User className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {typeof ticket.user === 'object' && ticket.user !== null
                                    ? ticket.user.name
                                    : String(ticket.user || '')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-all shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTicketExpand(ticket.id);
                            }}
                          >
                            {expandedTicketId === ticket.id ? (
                              <Minus className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {expandedTicketId === ticket.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
                              {/* Status & Priority badges */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                    ticket.status?.toLowerCase() === 'open' && "bg-primary/5 text-primary border-primary/20",
                                    ticket.status?.toLowerCase() === 'in-progress' && "bg-amber/5 text-amber border-amber/20",
                                    ticket.status?.toLowerCase() === 'resolved' && "bg-success/5 text-success border-success/20",
                                    ticket.status?.toLowerCase() === 'closed' && "bg-gray-100 text-gray-500 border-gray-200"
                                  )}>
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full animate-pulse",
                                      ticket.status?.toLowerCase() === 'open' && "bg-primary",
                                      ticket.status?.toLowerCase() === 'in-progress' && "bg-amber",
                                      ticket.status?.toLowerCase() === 'resolved' && "bg-success",
                                      ticket.status?.toLowerCase() === 'closed' && "bg-gray-400 animate-none"
                                    )} />
                                    <span>{ticket.status}</span>
                                  </div>
                                </div>

                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Priority</p>
                                  <span className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                    ticket.priority?.toLowerCase() === 'high' && "bg-danger/5 text-danger border-danger/10",
                                    ticket.priority?.toLowerCase() === 'medium' && "bg-amber/5 text-amber border-amber/10",
                                    ticket.priority?.toLowerCase() === 'low' && "bg-success/5 text-success border-success/10"
                                  )}>
                                    <span>{ticket.priority}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Description Preview */}
                              {ticket.description && (
                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Description</p>
                                  <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">
                                    {ticket.description}
                                  </p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket(ticket);
                                  }}
                                  className="py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                {ticket.status?.toLowerCase() !== 'resolved' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStatusModalTicket(ticket);
                                    }}
                                    className="py-2.5 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-success/90 flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Update
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
                      <LifeBuoy className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Tickets</h3>
                    <p className="text-sm text-gray-400 max-w-xs text-center font-medium">
                      No support tickets found.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Table - hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('id')}>
                      <div className="flex items-center gap-2">
                        Ticket ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('user')}>
                      <div className="flex items-center gap-2">
                        User {sortConfig?.key === 'user' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('subject')}>
                      <div className="flex items-center gap-2">
                        Subject {sortConfig?.key === 'subject' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('priority')}>
                      <div className="flex items-center gap-2">
                        Priority {sortConfig?.key === 'priority' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('date')}>
                      <div className="flex items-center gap-2">
                        Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedTickets.length > 0 ? (
                      filteredAndSortedTickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                          <td data-label="Ticket ID" className="px-6 py-4">
                            <span className="text-xs font-black text-navy">{ticket.id}</span>
                          </td>
                          <td data-label="User" className="px-6 py-4">
                            <span className="text-sm font-bold text-navy">
                              {typeof ticket.user === 'object' && ticket.user !== null
                                ? ticket.user.name
                                : String(ticket.user || '')}
                            </span>
                          </td>
                          <td data-label="Subject" className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-600">{ticket.subject}</span>
                          </td>
                          <td data-label="Status" className="px-6 py-4">
                            <select
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                              disabled={ticket.status?.toLowerCase() === 'resolved'}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border focus:outline-none appearance-none",
                                ticket.status?.toLowerCase() === 'resolved'
                                  ? "bg-success/10 text-success border-success/20 cursor-not-allowed opacity-80"
                                  : "cursor-pointer",
                                ticket.status?.toLowerCase() === 'open' ? "bg-warning/10 text-warning border-warning/20" :
                                  ticket.status?.toLowerCase() === 'in_progress' || ticket.status?.toLowerCase() === 'in progress' ? "bg-info/10 text-info border-info/20" :
                                    ticket.status?.toLowerCase() === 'closed' ? "bg-gray-100 text-gray-500 border-gray-200" :
                                      ticket.status?.toLowerCase() === 'pending' ? "bg-primary/10 text-primary border-primary/20" :
                                        ""
                              )}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td data-label="Priority" className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                              ticket.priority?.toLowerCase() === 'high' ? "bg-danger/10 text-danger" :
                                ticket.priority?.toLowerCase() === 'medium' ? "bg-warning/10 text-warning" :
                                  "bg-gray-100 text-gray-500"
                            )}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td data-label="Date" className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-400">
                              {ticket.date || ticket.created_at
                                ? new Date(ticket.date || ticket.created_at!).toLocaleDateString()
                                : '—'}
                            </span>
                          </td>
                          <td data-actions="true" className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ticket.status?.toLowerCase() !== 'resolved' && (
                                <button
                                  onClick={() => setStatusModalTicket(ticket)}
                                  className="p-2 bg-white hover:bg-primary hover:text-white rounded-xl text-gray-400 shadow-sm border border-gray-100 transition-all active:scale-90"
                                  title="Change Status"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-2 bg-white hover:bg-navy hover:text-white rounded-xl text-gray-400 shadow-sm border border-gray-100 transition-all active:scale-90"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <LifeBuoy className="w-12 h-12 text-gray-300" />
                            <p className="text-sm font-bold text-gray-400">No tickets found</p>
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
                  Reporting <span className="font-black text-navy">{filteredAndSortedTickets.length}</span> of <span className="font-black text-navy">{totalTickets}</span> tickets
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
                    <option value={5}>5 Tickets</option>
                    <option value={10}>10 Tickets</option>
                    <option value={20}>20 Tickets</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status Change Modal */}
      <AnimatePresence>
        {statusModalTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusModalTicket(null)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 bg-navy text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 blur-[40px] pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black tracking-tight uppercase">Update Status</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-0.5">
                      #{statusModalTicket.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setStatusModalTicket(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Options */}
              <div className="p-6 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Select new status for this ticket
                </p>
                {[
                  { value: 'open', label: 'Open', color: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
                  { value: 'in_progress', label: 'In Progress', color: 'bg-info/10 text-info border-info/20', dot: 'bg-info' },
                  { value: 'resolved', label: 'Resolved', color: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
                  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
                ]
                  .filter(option => option.value !== 'resolved')
                  .map((option) => {
                    const isCurrent = statusModalTicket.status?.toLowerCase() === option.value;
                    return (
                      <button
                        key={option.value}
                        disabled={isCurrent}
                        onClick={async () => {
                          await handleStatusChange(statusModalTicket.id, option.value);
                          setStatusModalTicket(null);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border font-black text-sm uppercase tracking-widest transition-all",
                          option.color,
                          isCurrent
                            ? "ring-2 ring-offset-2 ring-current cursor-not-allowed opacity-70"
                            : "hover:scale-[1.02] active:scale-95 cursor-pointer"
                        )}
                      >
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0",
                          option.dot,
                          option.value === 'open' || option.value === 'in_progress' ? "animate-pulse" : ""
                        )} />
                        {option.label}
                        {isCurrent && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setStatusModalTicket(null)}
                  className="w-full py-3 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-navy hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Ticket Detail Panel */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full md:max-w-lg bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/10 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <LifeBuoy className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-black tracking-tight uppercase">Ticket Details</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                {/* Status & Priority */}
                <div className="flex items-center gap-3">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTicket.id, e.target.value);
                      setSelectedTicket({ ...selectedTicket, status: e.target.value });
                    }}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer focus:outline-none appearance-none text-center",
                      selectedTicket.status?.toLowerCase() === 'open' ? "bg-warning/10 text-warning border-warning/20" :
                        selectedTicket.status?.toLowerCase() === 'in_progress' ? "bg-info/10 text-info border-info/20" :
                          selectedTicket.status?.toLowerCase() === 'resolved' ? "bg-success/10 text-success border-success/20" :
                            selectedTicket.status?.toLowerCase() === 'closed' ? "bg-gray-100 text-gray-500 border-gray-200" :
                              "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <div className={cn(
                    "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    selectedTicket.priority?.toLowerCase() === 'high' ? "bg-danger/10 text-danger border-danger/20" :
                      selectedTicket.priority?.toLowerCase() === 'medium' ? "bg-warning/10 text-warning border-warning/20" :
                        "bg-gray-100 text-gray-500 border-gray-200"
                  )}>
                    {selectedTicket.priority} Priority
                  </div>
                </div>

                {/* Subject */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Subject
                  </p>
                  <p className="text-sm font-bold text-navy">{selectedTicket.subject || '—'}</p>
                </div>

                {/* Description */}
                {selectedTicket.description && (
                  <div className="p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Description
                    </p>
                    <p className="text-sm text-navy font-medium leading-relaxed italic">"{selectedTicket.description}"</p>
                  </div>
                )}

                {/* User Info */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Customer
                  </p>
                  <div className="p-5 bg-navy/5 rounded-2xl border border-navy/10 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center text-xs font-black text-navy uppercase">
                        {typeof selectedTicket.user === 'object' && selectedTicket.user
                          ? selectedTicket.user.name?.charAt(0)
                          : (selectedTicket.user as string)?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-navy">
                          {typeof selectedTicket.user === 'object' && selectedTicket.user
                            ? selectedTicket.user.name
                            : selectedTicket.user || '—'}
                        </p>
                        {typeof selectedTicket.user === 'object' && selectedTicket.user?.email && (
                          <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {selectedTicket.user.email}
                          </p>
                        )}
                        {typeof selectedTicket.user === 'object' && selectedTicket.user?.phone && (
                          <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {selectedTicket.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Created</p>
                    <p className="text-sm font-bold text-navy">
                      {selectedTicket.date || selectedTicket.created_at
                        ? new Date(selectedTicket.date || selectedTicket.created_at).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-gray-100 bg-[#fcfcfc] shrink-0">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-full py-3.5 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-navy hover:bg-white transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Ticket Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCreating && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-navy to-[#1a1c2c] text-white relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <LifeBuoy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">Add Support Request</h3>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-1">Create New Ticket</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto">
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Selection */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Select User <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <select
                          required
                          value={newTicket.user_id}
                          onChange={(e) => setNewTicket({ ...newTicket, user_id: e.target.value })}
                          disabled={isCreating}
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Select a user...</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      {users.length === 0 && (
                        <p className="text-[9px] font-bold text-gray-400 ml-1">Loading users...</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Subject <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        placeholder="Brief description of the issue"
                        disabled={isCreating}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy placeholder:text-gray-400 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-50"
                      />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Priority <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                          disabled={isCreating}
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        placeholder="Provide detailed information about the support request..."
                        disabled={isCreating}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-navy placeholder:text-gray-400 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none disabled:opacity-50"
                      />
                      <p className="text-[9px] font-bold text-gray-400 ml-1">Minimum 10 characters required</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 pt-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      disabled={isCreating}
                      className="flex-1 py-4 border-2 border-gray-200 rounded-2xl font-black text-gray-500 hover:text-navy hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 py-4 bg-gradient-to-r from-primary to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isCreating ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Ticket...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          <span>Create Request</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
