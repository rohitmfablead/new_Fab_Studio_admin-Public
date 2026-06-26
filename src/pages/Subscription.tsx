import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, Zap, Star, ShieldCheck, Check, ArrowRight, Wallet, History, Receipt, X, Shield, Lock, Plus, Edit2, Trash2, AlertCircle, Save, Search, ChevronUp, ChevronDown, ChevronRight, Loader2, Eye, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchPlans, Plan as ApiPlan, createPlan, updatePlan, deletePlan } from '@/src/store/slices/planSlice';
import { showSuccess, showError, showWarning } from '@/src/lib/toast';

interface Plan {
  id: number;
  role: string;
  name: string;
  slug: string;
  price: string;
  rawPrice: number;
  currency: string;
  period: string;
  desc: string;
  features: string[];
  isPopular?: boolean;
  tier: string;
  max_events: number;
  has_face_recognition: boolean;
  has_custom_watermark: boolean;
  has_business_branding: boolean;
  has_view_client_favorites: boolean;
  has_switch_downloads: boolean;
  has_bulk_download: boolean;
  has_portfolio_website: boolean;
  has_team_login: boolean;
  has_digital_album: boolean;
  is_active: boolean;
  max_photos: number;
  max_videos: number;
  max_storage_bytes: number;
}

export function Subscription() {
  const navigate = useNavigate();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<Plan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<Plan | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);


  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Accordion state for mobile view
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);

  const togglePlanExpand = (id: number) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  const dispatch = useAppDispatch();
  const { plans: apiPlans, isLoading: plansLoading, error: plansError } = useAppSelector((state) => state.plans);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);


  const plans = useMemo(() => {
    return (apiPlans ?? [])
      .filter(plan => plan && plan.id) // Filter out null/undefined entries
      .map(plan => ({
        id: plan.id,
        role: plan.role,
        name: plan.name,
        slug: plan.slug,
        price: `${plan.currency}${plan.price.toLocaleString()}`,
        rawPrice: plan.price, // Keep raw numeric price
        currency: plan.currency, // Keep currency separate
        period: '/yr',
        desc: plan.description,
        features: [
          `${plan.max_photos === 0 ? 'Unlimited' : plan.max_photos} Photos`,
          `${(plan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0)} GB Storage`,
        ],
        tier: plan.slug === 'basic' ? 'Tier 1' : plan.slug === 'standard' ? 'Tier 2' : 'Tier 3',
        isPopular: plan.slug === 'standard',
        max_events: plan.max_events,
        has_face_recognition: plan.has_face_recognition,
        has_custom_watermark: plan.has_custom_watermark,
        has_business_branding: plan.has_business_branding,
        has_view_client_favorites: plan.has_view_client_favorites,
        has_switch_downloads: plan.has_switch_downloads,
        has_bulk_download: plan.has_bulk_download,
        has_portfolio_website: plan.has_portfolio_website,
        has_team_login: plan.has_team_login,
        has_digital_album: plan.has_digital_album,
        is_active: plan.is_active,
        max_photos: plan.max_photos,
        max_videos: plan.max_videos,
        max_storage_bytes: plan.max_storage_bytes
      }));
  }, [apiPlans]);



  const [planForm, setPlanForm] = useState({
    role: 'photographer',
    name: '',
    slug: '',
    price: '',
    currency: '₹',
    desc: '',
    max_photos: '',
    max_videos: '',
    max_storage_gb: '',
    max_events: '',
    has_custom_watermark: false,
    has_face_recognition: false,
    has_business_branding: false,
    has_view_client_favorites: false,
    has_switch_downloads: false,
    has_bulk_download: false,
    has_portfolio_website: false,
    has_team_login: false,
    has_digital_album: false,
    is_active: true,
    features: ['', '', '', '']
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsUpdateModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleOpenAddPlan = () => {
    navigate('/admin/subscription/new');
  };

  const handleOpenEditPlan = (plan: Plan) => {
    navigate(`/admin/subscription/${plan.id}`);
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const planData = {
        role: planForm.role,
        name: planForm.name,
        slug: planForm.slug,
        description: planForm.desc,
        price: parseFloat(planForm.price) || 0,
        currency: planForm.currency,
        max_photos: parseInt(planForm.max_photos) || 0,
        max_videos: parseInt(planForm.max_videos) || 0,
        max_storage_bytes: parseInt(planForm.max_storage_gb) * 1024 * 1024 * 1024,
        max_events: parseInt(planForm.max_events) || 0,
        has_custom_watermark: planForm.has_custom_watermark,
        has_face_recognition: planForm.has_face_recognition,
        has_business_branding: planForm.has_business_branding,
        has_view_client_favorites: planForm.has_view_client_favorites,
        has_switch_downloads: planForm.has_switch_downloads,
        has_bulk_download: planForm.has_bulk_download,
        has_portfolio_website: planForm.has_portfolio_website,
        has_team_login: planForm.has_team_login,
        has_digital_album: planForm.has_digital_album,
        is_active: planForm.is_active,
        features: planForm.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        // Update existing plan
        await dispatch(updatePlan({ planId: editingPlan.id, planData })).unwrap();
        showSuccess('Plan updated successfully!');
      } else {
        // Create new plan
        await dispatch(createPlan(planData)).unwrap();
        showSuccess('Plan created successfully!');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
        setIsPlanModalOpen(false);
      }, 1500);
    } catch (error: any) {
      setIsSaving(false);
      const errorMessage = error?.message || error?.toString() || 'Failed to save plan';
      showError(errorMessage);
    }
  };

  const handleDeletePlan = async () => {
    if (deletingPlan) {
      try {
        await dispatch(deletePlan(deletingPlan.id)).unwrap();
        showSuccess('Plan deleted successfully!');
        setIsDeleteModalOpen(false);
        setDeletingPlan(null);
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || 'Failed to delete plan';
        showError(errorMessage);
      }
    }
  };



  const handleUpgradePlan = (plan: Plan) => {
    setUpgradingPlan(plan);
    setIsUpgradeModalOpen(true);
    // Automatically trigger upgrade logic
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      setUpgradeSuccess(true);
      setTimeout(() => {
        setUpgradeSuccess(false);
        setIsUpgradeModalOpen(false);
        setUpgradingPlan(null);
      }, 2000);
    }, 1500);
  };

  const filteredPlans = useMemo(() => {
    let items = plans.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tier.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    if (sortConfig) {
      items.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [plans, searchTerm, sortConfig]);

  const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Tiers</span>
          </div>
          <h1 className="text-4xl font-black text-navy tracking-tight">Active Subscriptions</h1>
          <p className="text-gray-400 font-medium max-w-2xl">Manage your corporate billing, ecosystem tiers, and service level agreements.</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-navy focus:outline-none focus:border-primary/40 transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <button
            onClick={handleOpenAddPlan}
            className="btn-primary flex items-center gap-2 px-6 py-3.5 shadow-xl shadow-primary/20 group whitespace-nowrap"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-black uppercase tracking-widest text-xs">Add New Plan</span>
          </button>
        </div>
      </div>

      <div className="premium-card overflow-hidden relative border-none shadow-2xl shadow-navy/5">
        {plansLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Synchronizing Ecosystem</p>
          </div>
        ) : plansError ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-navy uppercase tracking-tight">Synchronized Failure</h3>
            <p className="text-gray-500 font-medium max-w-xs">{plansError}</p>
            <button
              onClick={() => dispatch(fetchPlans())}
              className="mt-4 px-6 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
            >
              Retry Protocol
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card List - visible only on small screens */}
            <div className="block md:hidden divide-y divide-gray-100 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {paginatedPlans.length > 0 ? (
                  paginatedPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
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
                        onClick={() => togglePlanExpand(plan.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-navy truncate">{plan.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-base font-black text-primary">{plan.price}</span>
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{plan.period}</span>
                            </div>
                          </div>
                          <button
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-all shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlanExpand(plan.id);
                            }}
                          >
                            {expandedPlanId === plan.id ? (
                              <Minus className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {expandedPlanId === plan.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
                              {/* Role & Status */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                                <div className="flex-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Role</p>
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-xl border border-primary/20 mt-1">
                                    <span className="text-xs font-black uppercase tracking-widest">{plan.role}</span>
                                  </div>
                                </div>
                                <div className={cn(
                                  "inline-flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0",
                                  plan.is_active ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
                                )}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full", plan.is_active ? "bg-success animate-pulse" : "bg-danger")} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">{plan.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                              </div>

                              {/* Features */}
                              {plan.features.length > 0 && (
                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Features</p>
                                  <div className="space-y-2">
                                    {plan.features.slice(0, 3).map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                        <Check className="w-3 h-3 text-success shrink-0" />
                                        <span className="truncate">{feature}</span>
                                      </div>
                                    ))}
                                    {plan.features.length > 3 && (
                                      <p className="text-[9px] text-gray-400 font-bold">+{plan.features.length - 3} more</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="grid grid-cols-3 gap-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingPlan(plan);
                                  }}
                                  className="py-2.5 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-navy/90 flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditPlan(plan);
                                  }}
                                  className="py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingPlan(plan);
                                    setIsDeleteModalOpen(true);
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
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="p-5 bg-gray-50 rounded-full border border-gray-100">
                      <CreditCard className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight">No Plans</h3>
                    <p className="text-sm text-gray-400 max-w-xs text-center font-medium">
                      No subscription plans found.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Table - hidden on mobile */}
            <div className="hidden md:block overflow-x-auto no-scrollbar min-h-[400px]">
              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-gray-100">
                    <th
                      className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Ecosystem Tier {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th
                      className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Role {sortConfig?.key === 'role' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th
                      className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('price')}
                    >
                      <div className="flex items-center gap-2">
                        Investment Protocol {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>

                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedPlans.map((plan, idx) => (
                    <motion.tr
                      key={plan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group hover:bg-gray-50/50 transition-all duration-300 cursor-pointer"
                    >
                      <td data-label="Tier" className="px-8 py-7">
                        <div>
                          <h3 className="text-base font-black text-navy group-hover:text-primary transition-colors tracking-tight">{plan.name}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{plan.tier}</p>
                        </div>
                      </td>
                      <td data-label="Role" className="px-8 py-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl border border-primary/20">
                          <span className="text-xs font-black uppercase tracking-widest">{plan.role}</span>
                        </div>
                      </td>
                      <td data-label="Price" className="px-8 py-7">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-navy">{plan.price}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.period}</span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Status" className="px-8 py-7">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-2xl border",
                          plan.is_active ? "bg-success/10 text-success border-success/20 shadow-sm" : "bg-danger/10 text-danger border-danger/20 shadow-sm"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", plan.is_active ? "bg-success animate-pulse" : "bg-danger")} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{plan.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td data-actions="true" className="px-8 py-7 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all duration-300">
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewingPlan(plan); }}
                            className="p-3 bg-white hover:bg-navy hover:text-white rounded-2xl text-gray-400 shadow-sm border border-gray-100 transition-all active:scale-90"
                            title="View Full Intel"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditPlan(plan); }}
                            className="p-3 bg-white hover:bg-primary hover:text-white rounded-2xl text-gray-400 shadow-sm border border-gray-100 transition-all active:scale-90"
                            title="Modify Specification"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingPlan(plan); setIsDeleteModalOpen(true); }}
                            className="p-3 bg-white hover:bg-danger hover:text-white rounded-2xl text-gray-400 shadow-sm border border-gray-100 transition-all active:scale-90"
                            title="Decommission Protocol"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {/* Pagination for Subscriptions */}
        <div className="p-8 bg-[#fcfcfc] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Reporting <span className="font-black text-navy">{Math.min(filteredPlans.length, pageSize)}</span> of <span className="font-black text-navy">{filteredPlans.length}</span> tiers
            </p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Capacity</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none shadow-sm"
              >
                <option value={10}>10 Tiers</option>
                <option value={25}>25 Tiers</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 outline-none"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.ceil(filteredPlans.length / pageSize) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-[10px] font-black tracking-widest transition-all outline-none",
                    currentPage === page ? "bg-navy text-white shadow-xl shadow-navy/20" : "hover:bg-gray-100 text-gray-400 hover:text-navy"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredPlans.length / pageSize), prev + 1))}
              disabled={currentPage === Math.ceil(filteredPlans.length / pageSize) || filteredPlans.length === 0}
              className="p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isUpdateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUpdating && setIsUpdateModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-gray-100 bg-navy text-white relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">Update Infrastructure</h3>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">Secure Payment Gateway</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateMethod} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cardholder Designation</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Alex Rivers"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Card Number</label>
                    <div className="relative text-navy">
                      <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input
                        required
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration</label>
                      <input
                        required
                        type="text"
                        placeholder="MM / YY"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Key (CVV)</label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input
                          required
                          type="password"
                          maxLength={4}
                          className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="flex-1 py-5 border border-gray-200 rounded-2xl font-bold text-gray-400 hover:text-navy transition-all disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-[2] py-5 bg-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-navy/30 transition-all disabled:bg-gray-400 relative overflow-hidden group"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : success ? (
                      <div className="flex items-center justify-center gap-3 text-success">
                        <Check className="w-4 h-4" />
                        <span>Success</span>
                      </div>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Apply New Protocol</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingPlan && (
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
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-navy tracking-tight mb-2">Delete Plan</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Are you sure you want to delete <span className="font-bold text-navy">{deletingPlan.name}</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeletePlan}
                  className="w-full py-4 bg-danger text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-danger/20 transition-all"
                >
                  Delete Plan
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-bold text-sm hover:text-navy transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Plan Modal */}
      <AnimatePresence>
        {isUpgradeModalOpen && upgradingPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUpgrading && setIsUpgradeModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 bg-navy text-white relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Upgrade Plan</h3>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">Subscription Change</p>
                  </div>
                  <button
                    onClick={() => setIsUpgradeModalOpen(false)}
                    disabled={isUpgrading}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Selected Plan</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-navy">{upgradingPlan.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">{upgradingPlan.tier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{upgradingPlan.price}</p>
                      <p className="text-xs text-gray-400 font-bold">{upgradingPlan.period}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Features</p>
                  {upgradingPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-navy">
                      <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-info/5 border border-info/20 rounded-xl">
                  <p className="text-xs font-bold text-navy">
                    <span className="font-black">Note:</span> Your current billing cycle will be adjusted and prorated charges may apply.
                  </p>
                </div>
              </div>

              {/* Modal Actions removed as per request for immediate upgrade */}
              {!isUpgrading && !upgradeSuccess && (
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                  <button
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-400 hover:text-navy transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Details View Modal */}
      <AnimatePresence>
        {viewingPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingPlan(null)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-navy text-white relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{viewingPlan.name}</h3>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">Technical Specification Report</p>
                  </div>
                  <button
                    onClick={() => setViewingPlan(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto flex-1 no-scrollbar">

                {/* Identity */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Name</p>
                    <p className="text-lg font-black text-navy">{viewingPlan.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug</p>
                    <p className="text-sm font-bold text-navy bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block font-mono">{viewingPlan.slug}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl border border-primary/20">
                      <span className="text-xs font-black uppercase tracking-widest">{viewingPlan.role}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mt-0.5",
                      viewingPlan.is_active ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", viewingPlan.is_active ? "bg-success animate-pulse" : "bg-danger")} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{viewingPlan.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Pricing */}
                <div className="flex items-center gap-6 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-3xl font-black text-primary">{viewingPlan.price}<span className="text-xs text-gray-400 font-bold ml-1">{viewingPlan.period}</span></p>
                  </div>
                  <div className="h-10 w-px bg-primary/20" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Currency</p>
                    <p className="text-xl font-black text-navy">{viewingPlan.currency}</p>
                  </div>
                  <div className="h-10 w-px bg-primary/20" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Raw Price</p>
                    <p className="text-xl font-black text-navy">{viewingPlan.rawPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Limits */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resource Limits</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Events</p>
                      <p className="text-2xl font-black text-navy">{viewingPlan.max_events === 0 ? '∞' : viewingPlan.max_events}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Photos</p>
                      <p className="text-2xl font-black text-navy">{viewingPlan.max_photos === 0 ? '∞' : viewingPlan.max_photos.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Videos</p>
                      <p className="text-2xl font-black text-navy">{viewingPlan.max_videos === 0 ? '∞' : viewingPlan.max_videos}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Storage</p>
                      <p className="text-2xl font-black text-navy">{(viewingPlan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0)}<span className="text-xs font-bold text-gray-400 ml-1">GB</span></p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Feature Flags */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Feature Flags</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {([
                      { key: 'has_face_recognition', label: 'Face Recognition' },
                      { key: 'has_custom_watermark', label: 'Custom Watermark' },
                      { key: 'has_digital_album', label: 'Digital Album' },
                      { key: 'has_business_branding', label: 'Business Branding' },
                      { key: 'has_view_client_favorites', label: 'View Client Favorites' },
                      { key: 'has_switch_downloads', label: 'Switch Downloads' },
                      { key: 'has_bulk_download', label: 'Bulk Download' },
                      { key: 'has_portfolio_website', label: 'Portfolio Website' },
                      { key: 'has_team_login', label: 'Team Login' },
                    ] as { key: keyof Plan; label: string }[]).map(({ key, label }) => {
                      const enabled = !!viewingPlan[key];
                      return (
                        <div key={key} className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border",
                          enabled ? "bg-success/5 border-success/20" : "bg-gray-50 border-gray-100"
                        )}>
                          <span className="text-xs font-black text-navy uppercase tracking-widest">{label}</span>
                          {enabled
                            ? <Check className="w-4 h-4 text-success shrink-0" />
                            : <X className="w-4 h-4 text-gray-300 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Description */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                    "{viewingPlan.desc}"
                  </p>
                </div>

              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                <button
                  onClick={() => setViewingPlan(null)}
                  className="flex-1 py-4 bg-navy text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-navy/30 transition-all"
                >
                  Terminate Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
