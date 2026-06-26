import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Users2, 
  Images, 
  IndianRupee, 
  HardDrive, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CheckCircle2,
  X,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchDashboardAnalytics } from '../store/slices/analyticsSlice';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
const navigate = useNavigate();
const dispatch = useAppDispatch();
const { user } = useAppSelector((state) => state.auth);
const { dashboard, isLoading: analyticsLoading } = useAppSelector((state) => state.analytics);

const [activeRange, setActiveRange] = useState('1W');
const [showAllActivities, setShowAllActivities] = useState(false);

useEffect(() => {
  dispatch(fetchDashboardAnalytics('30d'));
}, [dispatch]);

const handleLogout = () => {
  dispatch(logout());
  navigate('/login');
};

// Build KPIs from API data
const overview = dashboard?.overview;
const currentKPIs = [
  {
    label: 'Total Users',
    value: overview ? overview.total_users.toLocaleString() : '—',
    change: '+12.5%',
    isUp: true,
    icon: Users,
    link: '/admin/users',
  },
  {
    label: 'Active Groups',
    value: overview ? overview.total_groups.toLocaleString() : '—',
    change: '+5.2%',
    isUp: true,
    icon: Users2,
    link: '/admin/groups',
  },
  {
    label: 'Total Photos',
    value: overview ? (overview.total_photos >= 1000000 ? `${(overview.total_photos / 1000000).toFixed(1)}M` : overview.total_photos.toLocaleString()) : '—',
    change: '+18.4%',
    isUp: true,
    icon: Images,
    link: '/admin/groups',
  },
  {
    label: 'Storage Used',
    value: overview?.storageUsed ?? '—',
    change: '-2.4%',
    isUp: false,
    icon: HardDrive,
    link: '/admin/settings',
  },
];

// Build chart data from API
const currentChartData = dashboard?.user_growth?.map(d => ({
  name: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  count: d.new_users,
})) ?? [];

// Storage distribution from API storageDistribution field
const currentStorage = dashboard?.storageDistribution?.length
  ? dashboard.storageDistribution.map(s => ({
      name: s.label,
      value: parseFloat(s.value) || 0,
      color: s.color,
    }))
  : [
      { name: 'Photos', value: 0, color: 'hsl(24, 100%, 50%)' },
      { name: 'Videos', value: 0, color: 'hsl(0, 0%, 0%)' },
      { name: 'System', value: 0, color: 'hsl(210, 80%, 55%)' },
    ];

// Activity feed from API recentActivity
const recentActivity = dashboard?.recentActivity || [];
const currentActivities = recentActivity.slice(0, 5).map((a, i) => ({
  id: i + 1,
  event: a.title,
  user: a.description,
  time: a.time,
  status: a.type === 'user' ? 'Success' : 'Success',
}));

const allActivitiesData = recentActivity.map((a, i) => ({
  id: i + 1,
  event: a.title,
  user: a.description,
  time: a.time,
  status: 'Success',
}));

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        {analyticsLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading analytics...
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {currentKPIs.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(kpi.link)}
            className="premium-card p-5 md:p-6 border-t-4 border-t-primary relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                <kpi.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] md:text-xs font-bold px-2 py-1 rounded-full",
                kpi.isUp ? "text-success bg-success/10" : "text-danger bg-danger/10"
              )}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{kpi.value}</h3>
            
            {/* Decorative Grid Line */}
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
               <TrendingUp className="w-full h-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 premium-card p-5 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h4 className="text-lg font-bold">User Growth</h4>
              <p className="text-sm text-gray-400">Total registrations per day</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>New Users</span>
              </div>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(24, 100%, 50%)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-5 md:p-8 flex flex-col">
          <h4 className="text-base md:text-lg font-bold mb-8">Storage Distribution</h4>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[180px] md:h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentStorage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {currentStorage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full space-y-4 mt-8">
              {currentStorage.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value} GB</span>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/admin/settings')}
            className="mt-8 w-full py-3 border border-gray-100 rounded-[12px] text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            View Settings
          </button>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
         <div className="premium-card p-5 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base md:text-lg font-bold">Recent Activity</h4>
              <button
                onClick={() => navigate('/admin/logs')}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                View Logs →
              </button>
            </div>
            <div className="space-y-6">
              {currentActivities.map((activity, i) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(recentActivity[i]?.type === 'user' ? '/admin/users' : '/admin/groups')}
                  className="flex items-start md:items-center gap-3 md:gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                    {activity.user.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-bold text-gray-900">{activity.event}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">{activity.user}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-medium">{activity.time}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0",
                    activity.status === 'Success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  )}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowAllActivities(true)}
              className="mt-8 text-primary text-sm font-bold hover:underline py-2"
            >
              View All Activity
            </button>
         </div>

         <div className="premium-card p-5 md:p-8">
            <h4 className="text-base md:text-lg font-bold mb-6">System Health</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Server Load', value: dashboard?.systemHealth?.serverLoad?.value ?? '12%', status: dashboard?.systemHealth?.serverLoad?.status ?? 'OPTIMAL' },
                { label: 'API Latency', value: dashboard?.systemHealth?.apiLatency?.value ?? '42ms', status: dashboard?.systemHealth?.apiLatency?.status ?? 'OPTIMAL' },
                { label: 'Error Rate', value: dashboard?.systemHealth?.errorRate?.value ?? '0.01%', status: dashboard?.systemHealth?.errorRate?.status ?? 'OPTIMAL' },
                { label: 'Backup Status', value: dashboard?.systemHealth?.backupStatus?.value ?? 'Synced', status: dashboard?.systemHealth?.backupStatus?.status ?? 'OPTIMAL' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-[12px]">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight mb-1">{stat.label}</p>
                  <p className="text-lg md:text-xl font-bold text-navy">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[10px] font-bold text-success uppercase leading-none">{stat.status}</span>
                  </div>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* View All Activity Modal */}
      <AnimatePresence>
        {showAllActivities && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllActivities(false)}
              className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden m-auto"
            >
              <div className="p-6 md:p-8 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-navy tracking-tight">System Logs</h3>
                  <p className="text-xs md:text-sm text-gray-400 font-medium">Real-time platform activity history</p>
                </div>
                <button 
                  onClick={() => setShowAllActivities(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="p-4 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {allActivitiesData.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-500 text-base md:text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {activity.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-navy truncate mr-2">{activity.event}</p>
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0",
                            activity.status === 'Success' ? 'bg-success/10 text-success' : 
                            activity.status === 'Warning' ? 'bg-primary/10 text-primary' : 
                            'bg-danger/10 text-danger'
                          )}>
                            {activity.status}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate">Triggered by <span className="font-bold text-gray-900">{activity.user}</span></p>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 md:p-8 bg-gray-50 border-t flex justify-end">
                <button 
                  onClick={() => setShowAllActivities(false)}
                  className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-navy hover:bg-gray-100 transition-all shadow-sm"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
