import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Download,
  Calendar,
  Layers,
  Image as ImageIcon,
  Heart,
  Share2,
  IndianRupee,
  ChevronRight,
  FileText,
  MousePointer2,
  Filter,
  Eye,
  Map as MapIcon,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchDashboardAnalytics } from '../store/slices/analyticsSlice';

// --- Types ---
type AnalyticsTab = 'users' | 'content' | 'engagement' | 'revenue';

// --- Mock Data ---

const userStats = {
  registrationData: [
    { name: 'Week 1', users: 400 },
    { name: 'Week 2', users: 600 },
    { name: 'Week 3', users: 800 },
    { name: 'Week 4', users: 1200 },
    { name: 'Week 5', users: 1500 },
    { name: 'Week 6', users: 2100 },
  ],
  activeUsersData: [
    { name: 'Mon', dau: 1200, mau: 5000 },
    { name: 'Tue', dau: 1400, mau: 5200 },
    { name: 'Wed', dau: 1100, mau: 5100 },
    { name: 'Thu', dau: 1600, mau: 5500 },
    { name: 'Fri', dau: 1800, mau: 5800 },
    { name: 'Sat', dau: 2200, mau: 6200 },
    { name: 'Sun', dau: 2000, mau: 6000 },
  ],
  roleDistribution: [
    { name: 'Users', value: 85, color: 'hsl(24, 100%, 50%)' },
    { name: 'Sub-Admins', value: 10, color: 'hsl(222, 47%, 11%)' },
    { name: 'Super Admins', value: 5, color: 'hsl(210, 80%, 55%)' },
  ],
  retentionData: [
    { name: 'Month 1', rate: 100 },
    { name: 'Month 2', rate: 85 },
    { name: 'Month 3', rate: 70 },
    { name: 'Month 4', rate: 65 },
    { name: 'Month 5', rate: 60 },
    { name: 'Month 6', rate: 58 },
  ]
};

const contentStats = {
  photoUploadData: [
    { name: 'Jan', uploads: 4500 },
    { name: 'Feb', uploads: 5200 },
    { name: 'Mar', uploads: 4800 },
    { name: 'Apr', uploads: 6100 },
    { name: 'May', uploads: 7500 },
    { name: 'Jun', uploads: 8900 },
  ],
  groupCreationData: [
    { name: 'Jan', groups: 120 },
    { name: 'Feb', groups: 150 },
    { name: 'Mar', groups: 140 },
    { name: 'Apr', groups: 200 },
    { name: 'May', groups: 280 },
    { name: 'Jun', groups: 350 },
  ],
  topGroups: [
    { name: 'Tech Conf 2024', members: 1200, uploads: 4500 },
    { name: 'Sunset Wedding', members: 450, uploads: 2100 },
    { name: 'Music Festival', members: 890, uploads: 1800 },
    { name: 'Graduation 24', members: 600, uploads: 1500 },
    { name: 'Road Trip', members: 320, uploads: 900 },
  ],
  eventTypeDistribution: [
    { name: 'Events', value: 45, color: 'hsl(24, 100%, 50%)' },
    { name: 'Personal', value: 30, color: 'hsl(222, 47%, 11%)' },
    { name: 'Professional', value: 15, color: 'hsl(210, 80%, 55%)' },
    { name: 'Educational', value: 10, color: 'hsl(152, 60%, 42%)' },
  ],
  storageTrend: [
    { name: 'Jan', used: 450 },
    { name: 'Feb', used: 520 },
    { name: 'Mar', used: 600 },
    { name: 'Apr', used: 750 },
    { name: 'May', used: 920 },
    { name: 'Jun', used: 1200 },
  ]
};

const engagementStats = {
  photoViewsTrend: [
    { name: 'Jan', views: 25000 },
    { name: 'Feb', views: 32000 },
    { name: 'Mar', views: 28000 },
    { name: 'Apr', views: 45000 },
    { name: 'May', views: 58000 },
    { name: 'Jun', views: 72000 },
  ],
  downloadsData: [
    { name: 'Jan', count: 1200 },
    { name: 'Feb', count: 1500 },
    { name: 'Mar', count: 1300 },
    { name: 'Apr', count: 2200 },
    { name: 'May', count: 3100 },
    { name: 'Jun', count: 4500 },
  ],
  favoritesData: [
    { name: 'Jan', count: 800 },
    { name: 'Feb', count: 1000 },
    { name: 'Mar', count: 950 },
    { name: 'Apr', count: 1600 },
    { name: 'May', count: 2400 },
    { name: 'Jun', count: 3500 },
  ]
};

const revenueStats = {
  revenueTrend: [
    { name: 'Jan', revenue: 4500 },
    { name: 'Feb', revenue: 5200 },
    { name: 'Mar', revenue: 4800 },
    { name: 'Apr', revenue: 8500 },
    { name: 'May', revenue: 12000 },
    { name: 'Jun', revenue: 18500 },
  ],
  topEarners: [
    { name: 'VIP Gallery Pass', revenue: 8500 },
    { name: 'Business Plan', revenue: 6200 },
    { name: 'Extra Storage', revenue: 2400 },
    { name: 'Print Service', revenue: 1200 },
    { name: 'Event Streaming', revenue: 1000 },
  ],
  transactionHistory: [
    { id: 'T1092', user: 'Alex Rivers', amount: 8999.00, status: 'Completed', date: '2026-04-28' },
    { id: 'T1091', user: 'Sarah Jenkins', amount: 4500.00, status: 'Completed', date: '2026-04-28' },
    { id: 'T1090', user: 'Marcus Chen', amount: 12000.00, status: 'Pending', date: '2026-04-27' },
    { id: 'T1089', user: 'Elena Rodriguez', amount: 2550.50, status: 'Completed', date: '2026-04-27' },
    { id: 'T1088', user: 'Jordan Smith', amount: 1500.00, status: 'Refunded', date: '2026-04-26' },
  ]
};

// --- Sub-components ---

const MetricCard = ({ label, value, trend, trendUp, icon: Icon }: any) => (
  <div className="premium-card p-6 bg-white border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase",
        trendUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      )}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-black text-navy">{value}</p>
  </div>
);

export function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { dashboard, isLoading, error } = useAppSelector((state) => state.analytics);

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('users');

  // Fetch analytics data on component mount
  useEffect(() => {
    dispatch(fetchDashboardAnalytics('30d'));
  }, [dispatch]);

  // Build chart data from API or fall back to mock
  const registrationData = dashboard?.user_growth?.map(d => ({
    name: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    users: d.new_users,
  })) ?? userStats.registrationData;

  const activeUsersData = dashboard?.user_growth?.map(d => ({
    name: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    dau: d.active_users,
    mau: d.active_users * 4,
  })) ?? userStats.activeUsersData;

  const photoUploadData = dashboard?.content_stats?.map(d => ({
    name: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    uploads: d.photos_uploaded,
  })) ?? contentStats.photoUploadData;

  const revenueTrendData = dashboard?.revenue_data?.map(d => ({
    name: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
  })) ?? revenueStats.revenueTrend;

  const overview = dashboard?.overview;

  // Fetch analytics data on component mount
  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  return (
    <div className="space-y-10 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-navy tracking-tight">Ecosystem Intelligence</h2>
          <p className="text-gray-500 font-medium mt-1">Real-time synthesis of platform metrics and user behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-navy focus:ring-0">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Year to Date</option>
              <option>Dynamic Range</option>
            </select>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-navy/20 hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-navy hover:bg-gray-50">
                <FileText className="w-4 h-4" /> CSV Format (.csv)
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-navy hover:bg-gray-50">
                <PieChartIcon className="w-4 h-4" /> PDF Report (.pdf)
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5">
                <Calendar className="w-4 h-4" /> Schedule Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white sticky top-0 z-30 pt-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'User Analytics', icon: Users },
          { id: 'content', label: 'Content Metrics', icon: Layers },
          { id: 'engagement', label: 'Engagement', icon: Activity },
          { id: 'revenue', label: 'Revenue Pulse', icon: IndianRupee },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AnalyticsTab)}
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
        {/* USER ANALYTICS */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Total Identities" value={overview ? overview.total_users.toLocaleString() : '14,204'} trend="+12%" trendUp={true} icon={Users} />
              <MetricCard label="Daily Active nodes" value={overview ? overview.active_users.toLocaleString() : '2,840'} trend="+5%" trendUp={true} icon={Activity} />
              <MetricCard label="Churn Rate" value="1.2%" trend="-0.4%" trendUp={false} icon={TrendingUp} />
              <MetricCard label="Avg Session" value="12m 45s" trend="+2m" trendUp={true} icon={MousePointer2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Registration Trend */}
              <div className="premium-card p-8">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Registration Trajectory</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="hsl(24, 100%, 50%)" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Users Comparison */}
              <div className="premium-card p-8">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Activity Cycles (DAU vs MAU)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeUsersData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="dau" name="Daily Active" fill="hsl(24, 100%, 50%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="mau" name="Monthly Active" fill="hsl(222, 47%, 11%)" radius={[4, 4, 0, 0]} />
                      <Legend iconType="circle" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Role Distribution */}
              <div className="premium-card p-8 lg:col-span-1">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Role Architecture</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userStats.roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userStats.roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                  {userStats.roleDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-navy">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention Rate */}
              <div className="premium-card p-8 lg:col-span-2">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Cohort Retention Curve</h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userStats.retentionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="stepAfter" dataKey="rate" stroke="hsl(24, 100%, 50%)" strokeWidth={3} dot={{ fill: 'hsl(24, 100%, 50%)', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CONTENT ANALYTICS */}
        {activeTab === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Total Assets" value={overview ? (overview.total_photos >= 1000000 ? `${(overview.total_photos/1000000).toFixed(1)}M` : overview.total_photos.toLocaleString()) : '2.4M'} trend="+45k" trendUp={true} icon={ImageIcon} />
              <MetricCard label="Active Clusters" value={overview ? overview.total_groups.toLocaleString() : '842'} trend="+12" trendUp={true} icon={Layers} />
              <MetricCard label="Storage Load" value={overview ? `${(overview.storage_used / (1024*1024*1024)).toFixed(1)} GB` : '12.4 TB'} trend="+1.2 TB" trendUp={true} icon={TrendingUp} />
              <MetricCard label="Moderation Rate" value="98.2%" trend="+0.2%" trendUp={true} icon={Activity} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Photo Upload Trend */}
              <div className="premium-card p-8">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Asset Ingestion Velocity</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={photoUploadData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="uploads" fill="hsl(24, 100%, 50%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Group Creation Trend */}
              <div className="premium-card p-8">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Clustering Trends (Groups)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={contentStats.groupCreationData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" dataKey="groups" stroke="hsl(222, 47%, 11%)" strokeWidth={3} dot={{ fill: 'hsl(222, 47%, 11%)', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Distribution */}
              <div className="premium-card p-8 lg:col-span-1">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Ecosystem Taxonomy</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentStats.eventTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {contentStats.eventTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-8">
                  {contentStats.eventTypeDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                          <span className="text-navy">{item.name}</span>
                          <span className="text-primary">{item.value}%</span>
                        </div>
                        <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Clusters */}
              <div className="premium-card p-8 lg:col-span-2">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">High-Activity Clusters (Top Groups)</h4>
                <div className="space-y-6">
                  {contentStats.topGroups.map((group, i) => (
                    <div key={group.name} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center text-xs font-black text-navy">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-navy">{group.name}</h5>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Users className="w-3 h-3" /> {group.members.toLocaleString()} Members
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> {group.uploads.toLocaleString()} Uploads
                          </span>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 border border-transparent hover:border-gray-100 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ENGAGEMENT ANALYTICS */}
        {activeTab === 'engagement' && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="Visual Impressions" value="1.2M" trend="+18%" trendUp={true} icon={Eye} />
              <MetricCard label="Asset Acquisition" value="42.5k" trend="+22%" trendUp={true} icon={Download} />
              <MetricCard label="Curation (Favs)" value="18.2k" trend="+15%" trendUp={true} icon={Heart} />
            </div>

            <div className="premium-card p-8">
              <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-10">Attention Landscape (Impressions vs Action)</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementStats.photoViewsTrend}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="views" name="Impressions" stroke="hsl(210, 80%, 55%)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="premium-card p-8">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Asset Acquisition (Downloads)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementStats.downloadsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="premium-card p-8">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Sentiment Tracking (Favorites)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementStats.favoritesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="hsl(24, 100%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* REVENUE ANALYTICS */}
        {activeTab === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Gross Flow" value={overview ? `₹${overview.revenue.toLocaleString()}` : '₹42,85,000'} trend="+24%" trendUp={true} icon={IndianRupee} />
              <MetricCard label="Avg Order" value="₹3,240" trend="+5%" trendUp={true} icon={Activity} />
              <MetricCard label="Net Conversion" value="4.8%" trend="+0.8%" trendUp={true} icon={TrendingUp} />
              <MetricCard label="Refund Ratio" value="0.2%" trend="-0.1%" trendUp={false} icon={BarChart3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Trend */}
              <div className="premium-card p-8 lg:col-span-2">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Financial Trajectory</h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 42%)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Yielding Units */}
              <div className="premium-card p-8 lg:col-span-1">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-8">Top Yielding Units</h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={revenueStats.topEarners}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="hsl(222, 47%, 11%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Transaction Ledger */}
            <div className="premium-card overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h4 className="text-sm font-black text-navy uppercase tracking-widest text-navy">Live Transaction Ledger</h4>
                <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-1">
                  Full Ledger <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50/30">
                  <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Protocol ID</th>
                    <th className="px-8 py-4">Identity</th>
                    <th className="px-8 py-4">Value</th>
                    <th className="px-8 py-4">Temporal Mark</th>
                    <th className="px-8 py-4">Stability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {revenueStats.transactionHistory.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <span className="text-[10px] font-mono font-bold text-gray-500">{tx.id}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-navy">{tx.user}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-black text-navy">₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{tx.date}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                          tx.status === 'Completed' ? "bg-success/10 text-success" :
                            tx.status === 'Pending' ? "bg-amber/10 text-amber" : "bg-danger/10 text-danger"
                        )}>
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            tx.status === 'Completed' ? "bg-success" :
                              tx.status === 'Pending' ? "bg-amber" : "bg-danger"
                          )} />
                          {tx.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
