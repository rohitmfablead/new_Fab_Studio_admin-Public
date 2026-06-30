import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Receipt,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  fetchTransactions,
  Transaction,
} from '@/src/store/slices/transactionsSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StatusKey = 'successful' | 'failed' | 'pending';

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; icon: React.ElementType; bg: string; text: string; dot: string; border: string }
> = {
  successful: {
    label: 'Successful',
    icon: CheckCircle2,
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
    border: 'border-success/20',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    bg: 'bg-danger/10',
    text: 'text-danger',
    dot: 'bg-danger',
    border: 'border-danger/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    dot: 'bg-yellow-500',
    border: 'border-yellow-200',
  },
};

function getStatusConfig(status: string) {
  const key = status?.toLowerCase() as StatusKey;
  return STATUS_CONFIG[key] ?? STATUS_CONFIG['pending'];
}

function formatAmount(amount: string, currency = 'INR') {
  const num = parseFloat(amount);
  const symbol = currency === 'INR' ? '₹' : currency;
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string | null, len = 18) {
  if (!id) return '—';
  return id.length > len ? id.slice(0, len) + '…' : id;
}

// ─── CopyButton ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-navy transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['all', 'successful', 'pending', 'failed'];
const PAGE_SIZES = [10, 25, 50];

// ─── Components ──────────────────────────────────────────────────────────────

const ItemsModal = ({ txn, onClose }: { txn: Transaction | null; onClose: () => void }) => {
  if (!txn) return null;

  const featureMap = new Map();
  txn.features?.forEach(f => {
    featureMap.set(f.id, { ...f, matchedAddons: [] });
  });
  txn.addons_id?.forEach(a => {
    if (featureMap.has(a.subscription_feature_id)) {
      featureMap.get(a.subscription_feature_id).matchedAddons.push(a);
    } else {
      featureMap.set(`unknown-${a.id}`, { feature_name: 'Addon', matchedAddons: [a] });
    }
  });
  const items = Array.from(featureMap.values());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/20 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-navy uppercase tracking-tight">Purchased Items</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Order: {txn.razorpay_order_id || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No items found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(f => (
              <div key={f.id || f.feature_name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{f.feature_name}</span>
                {f.matchedAddons.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {f.matchedAddons.map((a: any, i: number) => (
                      <span key={i} className="text-[11px] font-black text-navy bg-white px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                        {a.feature_value ?? `₹${a.addon_price}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, error } = useAppSelector(
    (state: any) => state.transactions
  );

  // ── filters & sort (client-side since API returns full list) ──
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItemsTxn, setSelectedItemsTxn] = useState<Transaction | null>(null);

  // Fetch on mount
  const loadTransactions = useCallback(() => {
    dispatch(fetchTransactions({}));
  }, [dispatch]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  // ── Filter + Sort ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let items: Transaction[] = transactions ?? [];

    // search across user name, email, razorpay_order_id, receipt
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) =>
          t.user?.name?.toLowerCase().includes(q) ||
          t.user?.email?.toLowerCase().includes(q) ||
          t.razorpay_order_id?.toLowerCase().includes(q) ||
          t.razorpay_payment_id?.toLowerCase().includes(q) ||
          t.receipt?.toLowerCase().includes(q)
      );
    }

    // status filter
    if (statusFilter !== 'all') {
      items = items.filter((t) => t.status?.toLowerCase() === statusFilter);
    }

    // sort
    items = [...items].sort((a: any, b: any) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      // numeric sort for amount
      if (sortConfig.key === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [transactions, search, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: keyof Transaction) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  };

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all: Transaction[] = transactions ?? [];
    const totalAmount = all
      .filter((t) => t.status?.toLowerCase() === 'successful')
      .reduce((sum, t) => sum + parseFloat(t.total_amount || t.amount), 0);
    return {
      total: all.length,
      successful: all.filter((t) => t.status?.toLowerCase() === 'successful').length,
      failed: all.filter((t) => t.status?.toLowerCase() === 'failed').length,
      pending: all.filter((t) => t.status?.toLowerCase() === 'pending').length,
      totalRevenue: totalAmount,
    };
  }, [transactions]);

  // ── Helpers ────────────────────────────────────────────────────
  const renderTransactionItems = (txn: Transaction) => {
    if (!txn.features?.length && !txn.addons_id?.length) {
      return <span className="text-xs text-gray-300">—</span>;
    }

    return (
      <button 
        onClick={(e) => { e.stopPropagation(); setSelectedItemsTxn(txn); }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl border border-primary/10 transition-colors"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">View Items</span>
        <span className="text-[10px] font-bold bg-white text-navy px-1.5 rounded shadow-sm border border-gray-100">
          {txn.features?.length || 0}
        </span>
      </button>
    );
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
            <Receipt className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Payments</span>
          </div>
          <h1 className="text-4xl font-black text-navy tracking-tight">Transactions</h1>
          <p className="text-gray-400 font-medium max-w-2xl">
            Monitor all Razorpay payment transactions on the platform.
          </p>
        </div>

        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="self-start flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-navy hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 flex flex-col gap-1 border border-gray-100 bg-white shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</span>
          <span className="text-3xl font-black text-navy">{stats.total}</span>
        </div>
        <div className="rounded-2xl p-5 flex flex-col gap-1 border border-success/20 bg-success/5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Successful</span>
          <span className="text-3xl font-black text-success">{stats.successful}</span>
        </div>
        <div className="rounded-2xl p-5 flex flex-col gap-1 border border-gray-100 bg-yellow-50 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending</span>
          <span className="text-3xl font-black text-yellow-600">{stats.pending}</span>
        </div>
        <div className="rounded-2xl p-5 flex flex-col gap-1 border border-danger/20 bg-danger/5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Failed</span>
          <span className="text-3xl font-black text-danger">{stats.failed}</span>
        </div>
      </div>

      {/* Revenue banner */}
      <div className="rounded-2xl bg-navy p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            Total Collected Revenue
          </p>
          <p className="text-3xl font-black text-white mt-1">
            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          From {stats.successful} successful transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search user, email, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-navy focus:outline-none focus:border-primary/40 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border',
                statusFilter === s
                  ? 'bg-navy text-white border-navy shadow-md'
                  : 'bg-white text-gray-400 border-gray-100 hover:border-navy/30 hover:text-navy'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2 md:ml-auto">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">
            Show
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none shadow-sm"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="premium-card overflow-hidden border-none shadow-2xl shadow-navy/5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Loading Transactions...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center px-6">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-navy uppercase tracking-tight">Failed to Load</h3>
            <p className="text-gray-500 font-medium max-w-xs">{error}</p>
            <button
              onClick={loadTransactions}
              className="mt-4 px-6 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* ── Mobile Cards ── */}
            <div className="block md:hidden divide-y divide-gray-100 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {paginated.length > 0 ? (
                  paginated.map((txn, idx) => {
                    const cfg = getStatusConfig(txn.status);
                    return (
                      <motion.div
                        key={txn.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="p-4 hover:bg-gray-50/60 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-navy truncate">
                              {txn.user?.name ?? `User #${txn.user_id}`}
                            </p>
                            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                              {txn.user?.email ?? '—'}
                            </p>
                            {/* Purchased Items */}
                            <div className="mt-2">
                              {renderTransactionItems(txn)}
                            </div>
                            <p className="text-[10px] text-gray-300 font-mono mt-2 truncate">
                              {truncateId(txn.razorpay_order_id, 22)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-black text-navy">
                              {formatAmount(txn.total_amount || txn.amount, txn.currency)}
                            </p>
                            <div className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border mt-1',
                              cfg.bg, cfg.text, cfg.border
                            )}>
                              <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot,
                                txn.status === 'pending' && 'animate-pulse')} />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-2">
                          {formatDate(txn.created_at)}
                        </p>
                      </motion.div>
                    );
                  })
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto no-scrollbar min-h-[200px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-gray-100">
                    {([
                      { key: 'id', label: '#' },
                      { key: 'user_id', label: 'User' },
                      { key: 'razorpay_order_id', label: 'Order ID' },
                      { key: 'razorpay_payment_id', label: 'Payment ID' },
                      { key: 'amount', label: 'Amount' },
                      { key: 'features', label: 'Purchased Items' },
                      { key: 'status', label: 'Status' },
                      { key: 'created_at', label: 'Date' }
                    ] as { key: keyof Transaction; label: string }[]).map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors whitespace-nowrap select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon column={col.key} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {paginated.length > 0 ? (
                      paginated.map((txn, idx) => {
                        const cfg = getStatusConfig(txn.status);
                        return (
                          <motion.tr
                            key={txn.id}
                            layout
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                            className="group hover:bg-gray-50/50 transition-all duration-200"
                          >
                            {/* # */}
                            <td className="px-6 py-5">
                              <span className="text-xs font-black text-gray-300">#{txn.id}</span>
                            </td>

                            {/* User */}
                            <td className="px-6 py-5">
                              <div>
                                <p className="text-sm font-black text-navy whitespace-nowrap">
                                  {txn.user?.name ?? `User #${txn.user_id}`}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium max-w-[180px] truncate">
                                  {txn.user?.email ?? '—'}
                                </p>
                              </div>
                            </td>

                            {/* Order ID */}
                            <td className="px-6 py-5">
                              <div className="flex items-center">
                                <span className="text-xs font-mono text-gray-500">
                                  {truncateId(txn.razorpay_order_id)}
                                </span>
                                {txn.razorpay_order_id && (
                                  <CopyButton value={txn.razorpay_order_id} />
                                )}
                              </div>
                            </td>

                            {/* Payment ID */}
                            <td className="px-6 py-5">
                              {txn.razorpay_payment_id ? (
                                <div className="flex items-center">
                                  <span className="text-xs font-mono text-gray-500">
                                    {truncateId(txn.razorpay_payment_id)}
                                  </span>
                                  <CopyButton value={txn.razorpay_payment_id} />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>

                            {/* Amount */}
                            <td className="px-6 py-5">
                              <p className="text-sm font-black text-navy">
                                {formatAmount(txn.total_amount || txn.amount, txn.currency)}
                              </p>
                            </td>

                            {/* Purchased Items */}
                            <td className="px-6 py-5">
                              {renderTransactionItems(txn)}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-5">
                              <div className={cn(
                                'inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border',
                                cfg.bg, cfg.text, cfg.border
                              )}>
                                <div className={cn(
                                  'w-1.5 h-1.5 rounded-full', cfg.dot,
                                  txn.status === 'pending' && 'animate-pulse'
                                )} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                  {cfg.label}
                                </span>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-5">
                              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                                {formatDate(txn.created_at)}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7}><EmptyState /></td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!isLoading && !error && (
          <div className="p-6 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing{' '}
              <span className="font-black text-navy">
                {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{' '}
              of <span className="font-black text-navy">{filtered.length}</span> transactions
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, currentPage - 2);
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-9 h-9 rounded-xl text-xs font-black transition-all border outline-none',
                      currentPage === page
                        ? 'bg-navy text-white border-navy shadow-md'
                        : 'bg-white text-gray-400 border-gray-100 hover:border-navy/30 hover:text-navy'
                    )}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItemsTxn && (
          <ItemsModal 
            txn={selectedItemsTxn} 
            onClose={() => setSelectedItemsTxn(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
        <Receipt className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Transactions</h3>
      <p className="text-sm text-gray-400 max-w-xs text-center font-medium">
        No transactions found matching your filters.
      </p>
    </div>
  );
}
