import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, AlertCircle, Zap, Send, ChevronLeft, ChevronRight, X, Clock, Eye, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, sendNotification, SendNotificationData, deleteNotification, type Notification } from '../store/slices/notificationsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { showSuccess, showError } from '../lib/toast';

export function Notifications() {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, error, isSending, pagination } = useAppSelector((state) => state.notifications);
  const { users } = useAppSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    body: '',
    type: 'info',
  });

  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage, per_page: 20 }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (showBroadcastModal && users.length === 0) {
      dispatch(fetchUsers({ limit: 1000 }));
    }
  }, [dispatch, showBroadcastModal, users.length]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => {
        showSuccess('All notifications marked as read');
      })
      .catch((error) => {
        showError(error || 'Failed to mark all as read');
      });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!broadcastForm.title || !broadcastForm.body) {
      showError('Please fill in all required fields');
      return;
    }

    const user_ids = sendToAll ? users.map(u => u.id) : selectedUserIds;

    if (user_ids.length === 0) {
      showError('Please select at least one recipient');
      return;
    }

    try {
      await dispatch(sendNotification({
        ...broadcastForm,
        user_ids
      })).unwrap();
      showSuccess('Notification broadcast successfully');
      setShowBroadcastModal(false);
      setBroadcastForm({
        title: '',
        body: '',
        type: 'info',
      });
      setSelectedUserIds([]);
      setSendToAll(true);
    } catch (error: any) {
      showError(error || 'Failed to send notification');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const confirmDelete = (notification: Notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleDeleteNotification = async () => {
    if (notificationToDelete) {
      try {
        await dispatch(deleteNotification(notificationToDelete.id)).unwrap();
        showSuccess('Notification deleted successfully');
        setShowDeleteModal(false);
        setNotificationToDelete(null);
      } catch (error: any) {
        showError(error || 'Failed to delete notification');
      }
    }
  };

  // Debounce search term for smooth filtering
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' ||
      (statusFilter === 'Read' && n.read) ||
      (statusFilter === 'Unread' && !n.read);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy text-white rounded-[20px] shadow-lg shadow-navy/20">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase italic">Notifications</h1>
          </div>
          <p className="text-sm md:text-base text-gray-500 font-medium pl-1">
            Manage your <span className="text-primary font-black">System Notifications</span> and alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={handleMarkAllAsRead}
            className="flex-1 lg:flex-none px-4 md:px-6 py-2.5 md:py-3 border border-gray-200 text-gray-400 hover:text-navy hover:bg-gray-50 rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all active:scale-95 shadow-sm whitespace-nowrap"
          >
            Acknowledge All
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex-1 lg:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-navy text-white rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-navy/20 flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Broadcast</span>
            <span className="sm:hidden">Broadcast</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-white border border-gray-200 rounded-[16px] text-xs md:text-sm font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400">
                <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-100 rounded-[12px] text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest text-navy focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm outline-none appearance-none pr-8 md:pr-10 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23001F3F\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
              >
                <option>All Status</option>
                <option>Unread</option>
                <option>Read</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 space-y-4">
            <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-gray-400">Syncing Intelligence...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-[24px] md:rounded-[32px] flex items-center justify-center mb-4 md:mb-6">
              <Bell className="w-8 h-8 md:w-10 md:h-10 text-gray-200" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-navy uppercase tracking-tight mb-2">No Notifications</h3>
            <p className="text-xs md:text-sm text-gray-400 font-medium max-w-[280px] mx-auto leading-relaxed">
              You have no new notifications.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Notification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 w-40">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 w-48">Date & Time</th>
                    <th className="px-8 py-5 text-right border-b border-gray-50 w-32 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                              <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-sm font-black text-navy uppercase tracking-tight mb-1">No Notifications Found</h3>
                            <p className="text-xs text-gray-400 font-medium">Try adjusting your filters or search criteria.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <motion.tr
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "group hover:bg-gray-50/50 transition-colors cursor-pointer",
                            notif.read && "bg-gray-50/20"
                          )}
                        >
                          <td className="px-8 py-6 max-w-xl">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-navy group-hover:text-primary transition-colors">{notif.title}</h3>
                                {!notif.read && (
                                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 font-bold leading-relaxed line-clamp-1 transition-all duration-300">
                                {notif.message}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              notif.read
                                ? "text-gray-300"
                                : "text-primary bg-primary/5"
                            )}>
                              {notif.read ? "Acknowledged" : "Pending Sync"}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5" />
                              {notif.timestamp}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 transition-all duration-300">
                              <button
                                onClick={() => setSelectedNotification(notif)}
                                className="p-2.5 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-navy transition-all shadow-sm border border-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="p-2.5 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-100"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => confirmDelete(notif)}
                                className="p-2.5 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-danger transition-all shadow-sm border border-gray-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-black text-navy uppercase tracking-tight mb-1">No Intelligence Found</h3>
                    <p className="text-xs text-gray-400 font-medium">Try adjusting your filters.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "p-4 hover:bg-gray-50/50 transition-colors",
                        notif.read && "bg-gray-50/20"
                      )}
                    >
                      <div className="space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-black text-navy line-clamp-1">{notif.title}</h3>
                              {!notif.read && (
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge and Timestamp */}
                        <div className="flex items-center justify-between gap-2">
                          <div className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                            notif.read
                              ? "text-gray-300"
                              : "text-primary bg-primary/5"
                          )}>
                            {notif.read ? "Acknowledged" : "Pending Sync"}
                          </div>
                          <button 
                            onClick={() => confirmDelete(notif)}
                            className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            <span className="whitespace-nowrap">{notif.timestamp}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedNotification(notif)}
                            className="flex-1 px-3 py-2 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-navy transition-all shadow-sm border border-gray-100 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-wider"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="flex-1 px-3 py-2 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-100 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-wider"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark Read
                            </button>
                          )}
                          <button
                            className="px-3 py-2 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-danger transition-all shadow-sm border border-gray-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredNotifications.length > 0 && pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 md:p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
          <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest text-center sm:text-left">
            Showing Notifications <span className="text-navy">{filteredNotifications.length}</span> of <span className="text-navy">{pagination.total_items}</span>
          </p>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 md:p-3 rounded-xl md:rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm outline-none"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-navy" />
            </button>

            <div className="flex items-center gap-1.5 md:gap-2">
              {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black transition-all outline-none",
                    currentPage === page
                      ? "bg-navy text-white shadow-lg shadow-navy/20 scale-110"
                      : "bg-white border border-gray-200 text-gray-400 hover:border-navy/20 hover:text-navy"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.total_pages}
              className="p-2 md:p-3 rounded-xl md:rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm outline-none"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-navy" />
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBroadcastModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-black text-navy tracking-tight uppercase">Broadcast Notification</h2>
                  <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">Send a message to all users</p>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-2 md:p-3 hover:bg-gray-50 rounded-[16px] md:rounded-[20px] transition-all active:scale-90"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-black text-navy uppercase tracking-wider md:tracking-widest mb-2 md:mb-3">Send To *</label>
                    <div className="flex p-1 md:p-1.5 bg-gray-100 rounded-xl md:rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setSendToAll(true)}
                        className={cn(
                          "flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest transition-all",
                          sendToAll ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
                        )}
                      >
                        All Users ({users.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendToAll(false)}
                        className={cn(
                          "flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest transition-all",
                          !sendToAll ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
                        )}
                      >
                        Specific Users
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-black text-navy uppercase tracking-wider md:tracking-widest mb-2 md:mb-3">Type *</label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      className="w-full px-3 md:px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50 text-[11px] md:text-xs font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    >
                      <option value="info">Standard Broadcast</option>
                      <option value="success">Success Confirmation</option>
                      <option value="alert">Security / Urgent Alert</option>
                      <option value="system">System Maintenance</option>
                    </select>
                  </div>
                </div>

                {!sendToAll && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs md:text-sm font-black text-navy uppercase tracking-wider md:tracking-widest mb-2 md:mb-3">Recipient Selection *</label>
                    <div className="max-h-40 md:max-h-48 overflow-y-auto p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 space-y-2 custom-scrollbar">
                      {users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 md:gap-3 p-2 hover:bg-white rounded-lg md:rounded-xl transition-all cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUserIds([...selectedUserIds, u.id]);
                              } else {
                                setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                              }
                            }}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="flex flex-col">
                            <span className="text-[11px] md:text-xs font-black text-navy group-hover:text-primary transition-colors">{u.name || u.email}</span>
                            <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest">{u.role}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2 ml-1">
                      Selected Recipients: <span className="text-primary font-black">{selectedUserIds.length} Entities</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs md:text-sm font-black text-navy uppercase tracking-wider md:tracking-widest mb-2 md:mb-3">Transmission Title *</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-4 md:px-5 py-3 md:py-4 rounded-[16px] md:rounded-[20px] border border-gray-100 bg-gray-50 text-xs md:text-sm font-black text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-gray-300"
                    placeholder="E.g. System Protocol Update"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-black text-navy uppercase tracking-wider md:tracking-widest mb-2 md:mb-3">Intelligence Body *</label>
                  <textarea
                    value={broadcastForm.body}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                    className="w-full px-4 md:px-5 py-3 md:py-4 rounded-[20px] md:rounded-[24px] border border-gray-100 bg-gray-50 text-xs md:text-sm font-medium text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none placeholder:text-gray-300"
                    placeholder="Type the broadcast message details here..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-primary hover:bg-primary/90 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Send Broadcast
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-danger" />
                </div>
                
                <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-2">Confirm Delete</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                  Are you sure you want to permanently delete this notification? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleDeleteNotification}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-danger hover:bg-danger/90 transition-colors shadow-lg shadow-danger/20"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Detail View Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/5 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl" />

              <div className="relative space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0",
                        selectedNotification.type === 'alert' ? "bg-danger/10 text-danger" :
                          selectedNotification.type === 'success' ? "bg-success/10 text-success" :
                            "bg-primary/10 text-primary"
                      )}>
                        {selectedNotification.type === 'alert' && <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />}
                        {selectedNotification.type === 'success' && <Check className="w-5 h-5 md:w-6 md:h-6" />}
                        {selectedNotification.type === 'info' && <Bell className="w-5 h-5 md:w-6 md:h-6" />}
                        {selectedNotification.type === 'system' && <Zap className="w-5 h-5 md:w-6 md:h-6" />}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-black text-navy uppercase italic line-clamp-2">{selectedNotification.title}</h2>
                        <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest mt-0.5">
                          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                          <span className="truncate">{selectedNotification.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-2 md:p-3 hover:bg-gray-50 rounded-[16px] md:rounded-[20px] transition-all active:scale-90 flex-shrink-0"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-gray-100 max-h-[50vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 md:pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedNotification.read ? "bg-gray-300" : "bg-primary animate-pulse"
                    )} />
                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest">
                      {selectedNotification.read ? "Acknowledged Protocol" : "Active Intelligence"}
                    </span>
                  </div>
                  {!selectedNotification.read && (
                    <button
                      onClick={() => {
                        handleMarkAsRead(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-navy text-white rounded-[16px] md:rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-navy/20"
                    >
                      Acknowledge & Close
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
