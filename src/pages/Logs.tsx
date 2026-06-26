import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Terminal,
  User,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchSystemLogs } from '../store/slices/logsSlice';

const initialLogs = [
  { id: 1, action: 'Updated pricing plan', user: 'Admin Alex', module: 'Monetization', time: '2m ago', status: 'Success' },
  { id: 2, action: 'Deleted user #8423', user: 'Admin Alex', module: 'Users', time: '14m ago', status: 'Success' },
  { id: 3, action: 'Login attempt failed', user: 'Unknown', module: 'Security', time: '4h ago', status: 'Warning' },
  { id: 4, action: 'Batch group rename', user: 'Sarah Editor', module: 'Groups', time: '1d ago', status: 'Success' },
  { id: 5, action: 'API key generated', user: 'Admin Alex', module: 'System', time: '2d ago', status: 'Success' },
  { id: 6, action: 'Large file rejection', user: 'Mia Contributor', module: 'Media', time: '3d ago', status: 'Critical' },
  { id: 7, action: 'Settings updated', user: 'Admin Alex', module: 'Settings', time: '4d ago', status: 'Success' },
  { id: 8, action: 'Role permissions modified', user: 'Sarah Editor', module: 'Roles', time: '5d ago', status: 'Success' },
];

export function LogsPage() {
  const dispatch = useAppDispatch();
  const { logs, isLoading, error, pagination } = useAppSelector((state) => state.logs);

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Fetch system logs on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      module: moduleFilter !== 'All Modules' ? moduleFilter : undefined,
      status: statusFilter !== 'All Status' ? statusFilter : undefined,
    };
    dispatch(fetchSystemLogs(params));
  }, [dispatch, currentPage, pageSize, searchTerm, moduleFilter, statusFilter]);

  const filteredAndSortedLogs = useMemo(() => {
    let result = (logs || []).filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = moduleFilter === 'All Modules' || log.module === moduleFilter;
      const matchesStatus = statusFilter === 'All Status' || log.status === statusFilter;

      return matchesSearch && matchesModule && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [logs, initialLogs, searchTerm, moduleFilter, statusFilter, sortConfig]);

  const paginatedLogs = filteredAndSortedLogs;
  const totalPages = pagination?.total_pages ?? Math.ceil(filteredAndSortedLogs.length / pageSize);

  const toggleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const modules = Array.from(new Set((logs || []).map(l => l.module)));
  const statuses = Array.from(new Set((logs || []).map(l => l.status)));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-navy uppercase tracking-tight">Activity Logs</h2>
          <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Audit trail for all administrative actions across the platform.</p>
        </div>
        <button className="btn-primary py-3 px-8 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
          <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          <span className="font-black uppercase tracking-widest text-xs">Export Logs</span>
        </button>
      </div>

      <div className="premium-card overflow-hidden relative">
        <div className="p-6 bg-[#fcfcfc] border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by action, user, or module..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[16px] text-xs md:text-sm font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 border border-gray-200 rounded-[12px] bg-white text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-[12px] text-[10px] md:text-xs font-black uppercase tracking-widest text-navy focus:outline-none outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors bg-white shrink-0"
            >
              <option>All Modules</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-[12px] text-[10px] md:text-xs font-black uppercase tracking-widest text-navy focus:outline-none outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors bg-white shrink-0"
            >
              <option>All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar min-h-[400px]">
          <table className="w-full text-left border-collapse mobile-stack-table">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('action')}>
                  <div className="flex items-center gap-2">
                    Action {sortConfig?.key === 'action' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('user')}>
                  <div className="flex items-center gap-2">
                    User {sortConfig?.key === 'user' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('module')}>
                  <div className="flex items-center gap-2">
                    Module {sortConfig?.key === 'module' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('time')}>
                  <div className="flex items-center justify-end gap-2">
                    Timestamp {sortConfig?.key === 'time' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-navy transition-colors" onClick={() => toggleSort('status')}>
                  <div className="flex items-center justify-end gap-2">
                    Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr className="h-64">
                    <td colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-400 font-medium">Loading logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td data-label="Action" className="px-8 py-5 font-black text-navy text-sm">{log.action}</td>
                      <td data-label="User" className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-navy/5 flex items-center justify-center text-[10px] font-black text-navy uppercase shrink-0">
                            {log.user.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{log.user}</span>
                        </div>
                      </td>
                      <td data-label="Module" className="px-8 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm text-[9px] font-black uppercase text-gray-400 tracking-widest">
                          <Terminal className="w-3 h-3" />
                          {log.module}
                        </div>
                      </td>
                      <td data-label="Timestamp" className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </div>
                      </td>
                      <td data-label="Status" className="px-8 py-5 text-right">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          log.status === 'Success' ? "bg-success/5 text-success" :
                            log.status === 'Warning' ? "bg-primary/5 text-primary" : "bg-danger/5 text-danger"
                        )}>
                          <div className={cn("w-1 h-1 rounded-full",
                            log.status === 'Success' ? "bg-success" :
                              log.status === 'Warning' ? "bg-primary" : "bg-danger"
                          )} />
                          {log.status}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="h-64">
                    <td colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                          <History className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Logs Located</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
                          The audit trail does not contain any entries matching your current intelligence filters.
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
        <div className="p-8 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Reporting <span className="font-black text-navy">{paginatedLogs.length}</span> of <span className="font-black text-navy">{pagination?.total_items ?? filteredAndSortedLogs.length}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Capacity</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none shadow-sm"
              >
                <option value={10}>10 Entries</option>
                <option value={25}>25 Entries</option>
                <option value={50}>50 Entries</option>
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
      </div>
    </div>
  );
}

