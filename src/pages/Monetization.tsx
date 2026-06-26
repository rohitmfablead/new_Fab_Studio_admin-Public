import React, { useState, useMemo, useEffect } from 'react';
import {
   IndianRupee,
   ArrowUpRight,
   Check,
   X,
   Zap,
   Star,
   Download,
   Filter,
   Search,
   MoreVertical,
   ChevronUp,
   ChevronDown,
   BarChart3,
   TrendingUp,
   Wallet,
   Settings,
   FileText,
   CreditCard,
   RefreshCcw,
   AlertCircle,
   Percent,
   Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   AreaChart,
   Area,
   Cell,
   PieChart,
   Pie
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchTransactions, fetchRevenueAnalytics, fetchSubscriptions } from '../store/slices/billingSlice';

// --- Typed Constants & Mock Data ---

const plans = [
   { id: 'starter', name: 'Starter', price: '₹0', features: ['10GB Storage', 'Basic Support', 'Limited Boards', 'Standard Stats'], isPopular: false, icon: Zap },
   { id: 'pro', name: 'Pro', price: '₹1,999', features: ['500GB Storage', 'Priority Support', 'Unlimited Boards', 'Advanced Analytics', 'Raw File Support'], isPopular: true, icon: Star },
   { id: 'enterprise', name: 'Enterprise', price: '₹7,999', features: ['10TB Storage', '24/7 Phone Support', 'API Access', 'Custom Branding', 'Single Sign-On'], isPopular: false, icon: IndianRupee },
];

const transactions = [
   { id: '#TRX-2042', user: 'Mike Ross', email: 'mike@pearson.com', plan: 'Pro Monthly', amount: 1999.00, date: '2026-10-24', status: 'Completed', method: 'Visa •••• 4242' },
   { id: '#TRX-2043', user: 'Harvey Specter', email: 'harvey@specter.com', plan: 'Enterprise Yearly', amount: 84999.00, date: '2026-10-25', status: 'Completed', method: 'Wire Transfer' },
   { id: '#TRX-2044', user: 'Rachel Zane', email: 'rachel@zane.com', plan: 'Pro Monthly', amount: 1999.00, date: '2026-10-26', status: 'Failed', method: 'Mastercard •••• 5555' },
   { id: '#TRX-2045', user: 'Louis Litt', email: 'louis@litt.com', plan: 'Pro Monthly', amount: 1999.00, date: '2026-10-27', status: 'Processing', method: 'Visa •••• 1234' },
   { id: '#TRX-2046', user: 'Donna Paulsen', email: 'donna@pearson.com', plan: 'Pro Monthly', amount: 1999.00, date: '2026-10-28', status: 'Refunded', method: 'Amex •••• 9876' },
];

const revenueTrendData = [
   { date: 'Oct 22', revenue: 4200, transactions: 120 },
   { date: 'Oct 23', revenue: 3800, transactions: 110 },
   { date: 'Oct 24', revenue: 5100, transactions: 145 },
   { date: 'Oct 25', revenue: 6200, transactions: 180 },
   { date: 'Oct 26', revenue: 5800, transactions: 165 },
   { date: 'Oct 27', revenue: 7400, transactions: 210 },
   { date: 'Oct 28', revenue: 8100, transactions: 230 },
];

const earningGroupsData = [
   { name: 'Wedding Photography', value: 45 },
   { name: 'Nature Explorers', value: 25 },
   { name: 'Corporate Events', value: 20 },
   { name: 'Other', value: 10 },
];

const COLORS = ['#1D4ED8', '#10B981', '#F59E0B', '#6B7280'];

const payouts = [
   { id: 'PAY-101', recipient: 'Sarah Jenkins', amount: 124050.50, date: '2026-10-28', status: 'Pending', method: 'PayPal' },
   { id: 'PAY-102', recipient: 'Alex Rivers', amount: 84020.20, date: '2026-10-27', status: 'Completed', method: 'Wise' },
   { id: 'PAY-103', recipient: 'Marcus Chen', amount: 210000.00, date: '2026-10-25', status: 'Completed', method: 'Bank Transfer' },
];

// --- Sub-Components ---

const StatCard = ({ title, value, trend, icon: Icon, color = "blue" }: any) => (
   <div className="premium-card p-6 bg-white border border-gray-100">
      <div className="flex items-start justify-between">
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-navy">{value}</h4>
            {trend && (
               <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-bold",
                  trend.startsWith('+') ? "text-success" : "text-danger"
               )}>
                  {trend.startsWith('+') ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {trend} from last month
               </div>
            )}
         </div>
         <div className={cn(
            "p-3 rounded-2xl",
            color === "blue" ? "bg-primary/10 text-primary" :
               color === "green" ? "bg-success/10 text-success" :
                  "bg-orange/10 text-orange"
         )}>
            <Icon className="w-5 h-5" />
         </div>
      </div>
   </div>
);

export function MonetizationPage() {
   const dispatch = useAppDispatch();
   const { transactions, subscriptions, revenueAnalytics, isLoading, error } = useAppSelector((state) => state.billing);

   const [activeTab, setActiveTab] = useState('revenue');
   const [activePricingSubTab, setActivePricingSubTab] = useState('plans');
   const [transactionSearch, setTransactionSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState('All');

   // Fetch billing data on component mount
   useEffect(() => {
      dispatch(fetchTransactions({ page: 1, limit: 10 }));
      dispatch(fetchRevenueAnalytics());
      dispatch(fetchSubscriptions({ page: 1, limit: 10 }));
   }, [dispatch]);
   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
   const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
   const [transactionSort, setTransactionSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
   const [payoutSort, setPayoutSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
   const [trxCurrentPage, setTrxCurrentPage] = useState(1);
   const [trxPageSize, setTrxPageSize] = useState(10);
   const [payCurrentPage, setPayCurrentPage] = useState(1);
   const [payPageSize, setPayPageSize] = useState(5);

   const filteredAndSortedTransactions = useMemo(() => {
      let result = transactions.filter(t => {
         const matchesSearch = t.user_name.toLowerCase().includes(transactionSearch.toLowerCase()) ||
            t.id.toLowerCase().includes(transactionSearch.toLowerCase());
         const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
         return matchesSearch && matchesStatus;
      });

      if (transactionSort) {
         result.sort((a: any, b: any) => {
            if (a[transactionSort.key] < b[transactionSort.key]) return transactionSort.direction === 'asc' ? -1 : 1;
            if (a[transactionSort.key] > b[transactionSort.key]) return transactionSort.direction === 'asc' ? 1 : -1;
            return 0;
         });
      }
      return result;
   }, [transactions, transactionSearch, statusFilter, transactionSort]);

   const paginatedTransactions = filteredAndSortedTransactions.slice((trxCurrentPage - 1) * trxPageSize, trxCurrentPage * trxPageSize);

   const filteredAndSortedPayouts = useMemo(() => {
      let result = [...payouts];
      if (payoutSort) {
         result.sort((a: any, b: any) => {
            if (a[payoutSort.key] < b[payoutSort.key]) return payoutSort.direction === 'asc' ? -1 : 1;
            if (a[payoutSort.key] > b[payoutSort.key]) return payoutSort.direction === 'asc' ? 1 : -1;
            return 0;
         });
      }
      return result;
   }, [payoutSort]);

   const paginatedPayouts = filteredAndSortedPayouts.slice((payCurrentPage - 1) * payPageSize, payCurrentPage * payPageSize);

   const toggleTrxSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (transactionSort && transactionSort.key === key && transactionSort.direction === 'asc') {
         direction = 'desc';
      }
      setTransactionSort({ key, direction });
   };

   const togglePaySort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (payoutSort && payoutSort.key === key && payoutSort.direction === 'asc') {
         direction = 'desc';
      }
      setPayoutSort({ key, direction });
   };

   const tabs = [
      { id: 'revenue', label: 'Revenue Dashboard', icon: BarChart3 },
      { id: 'transactions', label: 'Transactions', icon: CreditCard },
      { id: 'payouts', label: 'Payouts', icon: Wallet },
   ];

   return (
      <div className="space-y-10 pb-20">
         {/* Header Area */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black text-navy tracking-tight">Monetization</h2>
               <p className="text-gray-500 font-medium mt-1">Control revenue, pricing, and financial architecture.</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase text-navy hover:bg-gray-100 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Sync Data
               </button>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-2 border-b border-gray-100 bg-white sticky top-0 z-30 pt-4 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
            {/* REVENUE DASHBOARD */}
            {activeTab === 'revenue' && (
               <motion.div
                  key="revenue"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
               >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <StatCard title="Gross Revenue" value="₹48,24,000" trend="+12.5%" icon={IndianRupee} color="blue" />
                     <StatCard title="Active Subscriptions" value="1,240" trend="+8.2%" icon={Zap} color="green" />
                     <StatCard title="Platform Commission" value="₹7,23,600" trend="+15.1%" icon={Percent} color="orange" />
                     <StatCard title="Avg. Ticket Size" value="₹3,890" trend="-2.4%" icon={TrendingUp} color="blue" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Trend Chart */}
                     <div className="lg:col-span-2 premium-card p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                           <h4 className="text-lg font-black text-navy">Revenue Velocity</h4>
                           <select className="bg-gray-50 border-none text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-lg px-3 py-1">
                              <option>Last 7 Days</option>
                              <option>Last 30 Days</option>
                           </select>
                        </div>
                        <div className="h-[300px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revenueTrendData}>
                                 <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.1} />
                                       <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                 <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                                    dy={10}
                                 />
                                 <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                                 />
                                 <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    labelStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, marginBottom: '4px', letterSpacing: '0.1em' }}
                                 />
                                 <Area type="monotone" dataKey="revenue" stroke="#1D4ED8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Pie Chart */}
                     <div className="premium-card p-8">
                        <h4 className="text-lg font-black text-navy mb-8">Revenue Origin</h4>
                        <div className="h-[250px] w-full mb-8">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={earningGroupsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                 >
                                    {earningGroupsData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                 </Pie>
                                 <Tooltip />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                           {earningGroupsData.map((item, index) => (
                              <div key={item.name} className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-xs font-bold text-gray-500">{item.name}</span>
                                 </div>
                                 <span className="text-xs font-black text-navy">{item.value}%</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {/* TRANSACTIONS */}
            {activeTab === 'transactions' && (
               <motion.div
                  key="transactions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
               >
                  {/* Filters Bar */}
                  <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
                     <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="text"
                           placeholder="Search by ID, Customer Name..."
                           value={transactionSearch}
                           onChange={(e) => setTransactionSearch(e.target.value)}
                           className="w-full pl-12 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 ring-primary/20"
                        />
                     </div>
                     <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                           <Filter className="w-3.5 h-3.5 text-gray-500" />
                           <select
                              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-navy focus:ring-0"
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                           >
                              <option>All</option>
                              <option>Completed</option>
                              <option>Processing</option>
                              <option>Failed</option>
                              <option>Refunded</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Table */}
                  <div className="premium-card overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50">
                              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => toggleTrxSort('id')}>
                                    <div className="flex items-center gap-2">
                                       Transaction {transactionSort?.key === 'id' && (transactionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => toggleTrxSort('user')}>
                                    <div className="flex items-center gap-2">
                                       Platform User {transactionSort?.key === 'user' && (transactionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => toggleTrxSort('plan')}>
                                    <div className="flex items-center gap-2">
                                       Plan Entity {transactionSort?.key === 'plan' && (transactionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => toggleTrxSort('amount')}>
                                    <div className="flex items-center gap-2">
                                       Amount {transactionSort?.key === 'amount' && (transactionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => toggleTrxSort('status')}>
                                    <div className="flex items-center gap-2">
                                       Status {transactionSort?.key === 'status' && (transactionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => toggleTrxSort('date')}>
                                    <div className="flex items-center gap-2">
                                       Activity Date {transactionSort?.key === 'date' && (transactionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              <AnimatePresence mode="popLayout">
                                 {paginatedTransactions.map(trx => (
                                    <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors group">
                                       <td className="px-8 py-5">
                                          <div className="flex flex-col">
                                             <span className="text-xs font-black text-navy">{trx.id}</span>
                                             <span className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{trx.method}</span>
                                          </div>
                                       </td>
                                       <td className="px-8 py-5">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-black text-navy">
                                                {trx.user.split(' ').map(n => n[0]).join('')}
                                             </div>
                                             <div className="flex flex-col">
                                                <span className="text-xs font-black text-navy">{trx.user}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{trx.email}</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-8 py-5 text-xs font-bold text-gray-600">{trx.plan}</td>
                                       <td className="px-8 py-5 text-sm font-black text-navy">₹{trx.amount.toFixed(2)}</td>
                                       <td className="px-8 py-5">
                                          <span className={cn(
                                             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                             trx.status === 'Completed' ? "bg-success/10 text-success" :
                                                trx.status === 'Processing' ? "bg-info/10 text-info" :
                                                   trx.status === 'Failed' ? "bg-danger/10 text-danger" : "bg-gray-100 text-gray-400"
                                          )}>{trx.status}</span>
                                       </td>
                                       <td className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(trx.date).toLocaleDateString()}</td>
                                       <td className="px-8 py-5 text-right">
                                          <button
                                             onClick={() => { setSelectedTransaction(trx); setIsDetailsModalOpen(true); }}
                                             className="p-2 text-gray-300 hover:text-navy transition-colors"
                                          >
                                             <MoreVertical className="w-4 h-4" />
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </AnimatePresence>
                           </tbody>
                        </table>
                     </div>
                     <div className="flex items-center justify-between px-8 py-4 border-t border-gray-50">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Showing {(trxCurrentPage - 1) * trxPageSize + 1} to {Math.min(trxCurrentPage * trxPageSize, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length}</span>
                        <div className="flex gap-2">
                           <button disabled={trxCurrentPage === 1} onClick={() => setTrxCurrentPage(p => p - 1)} className="px-3 py-1 bg-gray-50 rounded text-[10px] font-black uppercase text-navy disabled:opacity-50">Prev</button>
                           <button disabled={trxCurrentPage * trxPageSize >= filteredAndSortedTransactions.length} onClick={() => setTrxCurrentPage(p => p + 1)} className="px-3 py-1 bg-gray-50 rounded text-[10px] font-black uppercase text-navy disabled:opacity-50">Next</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {/* PAYOUTS MANAGEMENT */}
            {activeTab === 'payouts' && (
               <motion.div
                  key="payouts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
               >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-8 bg-black text-white rounded-3xl relative overflow-hidden">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Pending Payouts</p>
                        <h3 className="text-4xl font-black">₹4,24,050</h3>
                        <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                           Process Queue
                        </button>
                     </div>
                     <div className="premium-card p-8">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Processed This Month</p>
                        <h3 className="text-4xl font-black text-navy">₹18,84,000</h3>
                        <div className="mt-4 flex items-center gap-2 text-success font-bold text-xs uppercase">
                           <ChevronUp className="w-4 h-4" />
                           Efficiency up 4%
                        </div>
                     </div>
                     <div className="premium-card p-8">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Active Photographers</p>
                        <h3 className="text-4xl font-black text-navy">420</h3>
                        <div className="mt-4 flex -space-x-2">
                           {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                 <img src={`https://i.pravatar.cc/100?u=pay${i}`} alt="user" />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="premium-card overflow-hidden">
                     <div className="p-6 border-b border-gray-50">
                        <h4 className="font-black text-navy uppercase tracking-widest text-[10px]">Payout Registry</h4>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50">
                              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => togglePaySort('id')}>
                                    <div className="flex items-center gap-2">
                                       Payout ID {payoutSort?.key === 'id' && (payoutSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => togglePaySort('recipient')}>
                                    <div className="flex items-center gap-2">
                                       Photographer {payoutSort?.key === 'recipient' && (payoutSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => togglePaySort('amount')}>
                                    <div className="flex items-center gap-2">
                                       Amount {payoutSort?.key === 'amount' && (payoutSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => togglePaySort('method')}>
                                    <div className="flex items-center gap-2">
                                       Method {payoutSort?.key === 'method' && (payoutSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => togglePaySort('status')}>
                                    <div className="flex items-center gap-2">
                                       Status {payoutSort?.key === 'status' && (payoutSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5 cursor-pointer hover:text-navy transition-colors" onClick={() => togglePaySort('date')}>
                                    <div className="flex items-center gap-2">
                                       Date {payoutSort?.key === 'date' && (payoutSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                 </th>
                                 <th className="px-8 py-5"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              <AnimatePresence mode="popLayout">
                                 {paginatedPayouts.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                       <td className="px-8 py-5 text-xs font-black text-navy">{p.id}</td>
                                       <td className="px-8 py-5">
                                          <span className="text-xs font-bold text-navy">{p.recipient}</span>
                                       </td>
                                       <td className="px-8 py-5 text-sm font-black text-navy">₹{p.amount.toFixed(2)}</td>
                                       <td className="px-8 py-5 text-xs font-bold text-gray-500">{p.method}</td>
                                       <td className="px-8 py-5">
                                          <span className={cn(
                                             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                             p.status === 'Completed' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                          )}>{p.status}</span>
                                       </td>
                                       <td className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</td>
                                       <td className="px-8 py-5 text-right">
                                          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Details</button>
                                       </td>
                                    </tr>
                                 ))}
                              </AnimatePresence>
                           </tbody>
                        </table>
                     </div>
                     <div className="flex items-center justify-between px-8 py-4 border-t border-gray-50">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Showing {(payCurrentPage - 1) * payPageSize + 1} to {Math.min(payCurrentPage * payPageSize, filteredAndSortedPayouts.length)} of {filteredAndSortedPayouts.length}</span>
                        <div className="flex gap-2">
                           <button disabled={payCurrentPage === 1} onClick={() => setPayCurrentPage(p => p - 1)} className="px-3 py-1 bg-gray-50 rounded text-[10px] font-black uppercase text-navy disabled:opacity-50">Prev</button>
                           <button disabled={payCurrentPage * payPageSize >= filteredAndSortedPayouts.length} onClick={() => setPayCurrentPage(p => p + 1)} className="px-3 py-1 bg-gray-50 rounded text-[10px] font-black uppercase text-navy disabled:opacity-50">Next</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}


         </AnimatePresence>

         {/* Transaction Details Modal */}
         <AnimatePresence>
            {isDetailsModalOpen && selectedTransaction && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsDetailsModalOpen(false)}
                     className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="premium-card w-full max-w-xl bg-white p-10 relative z-10 overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24" />

                     <div className="flex items-center justify-between mb-10">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <IndianRupee className="w-6 h-6 text-primary" />
                        </div>
                        <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-navy p-2 hover:bg-gray-100 rounded-lg transition-all">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     <div className="space-y-8">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Receipt for</p>
                           <h3 className="text-2xl font-black text-navy">{selectedTransaction.user}</h3>
                           <p className="text-xs font-bold text-gray-400">{selectedTransaction.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction ID</p>
                              <p className="text-xs font-mono font-bold text-navy">{selectedTransaction.id}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Method</p>
                              <p className="text-xs font-bold text-navy uppercase tracking-tight">{selectedTransaction.method}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Plan Details</p>
                              <p className="text-xs font-bold text-navy">{selectedTransaction.plan}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Amount</p>
                              <p className="text-xl font-black text-navy">₹{selectedTransaction.amount.toFixed(2)}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <button className="flex-1 py-4 bg-navy text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-navy/20 hover:scale-[1.02] transition-all">
                              Download Invoice
                           </button>
                           <button className="flex-1 py-4 bg-gray-50 text-danger rounded-xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-danger/5 transition-all">
                              Issue Refund
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
