import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { createPlan, updatePlan } from '@/src/store/slices/planSlice';
import { showSuccess, showError } from '@/src/lib/toast';
import { Check, Save, Plus, Trash2, X, ArrowLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const CustomSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === String(value));

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all flex items-center justify-between"
      >
        <span className={selectedOption ? "text-navy" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map(opt => (
               <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors ${String(value) === String(opt.value) ? 'bg-primary/5 text-primary font-black' : 'text-navy font-bold'}`}
               >
                  {opt.label}
               </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function PlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plans } = useAppSelector((state) => state.plans);

  const isEditing = id !== 'new' && id !== undefined;
  
  const editingPlan = isEditing ? plans?.find(p => p.id.toString() === id) : null;

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

  useEffect(() => {
    if (isEditing && editingPlan) {
      setPlanForm({
        role: editingPlan.role,
        name: editingPlan.name,
        slug: editingPlan.slug,
        price: editingPlan.price.toString(),
        currency: editingPlan.currency,
        desc: editingPlan.description || '',
        max_photos: editingPlan.max_photos.toString(),
        max_videos: editingPlan.max_videos.toString(),
        max_storage_gb: (editingPlan.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(0),
        max_events: editingPlan.max_events.toString(),
        has_custom_watermark: editingPlan.has_custom_watermark || false,
        has_face_recognition: editingPlan.has_face_recognition,
        has_business_branding: editingPlan.has_business_branding || false,
        has_view_client_favorites: editingPlan.has_view_client_favorites || false,
        has_switch_downloads: editingPlan.has_switch_downloads || false,
        has_bulk_download: editingPlan.has_bulk_download || false,
        has_portfolio_website: editingPlan.has_portfolio_website || false,
        has_team_login: editingPlan.has_team_login || false,
        has_digital_album: editingPlan.has_digital_album || false,
        is_active: editingPlan.is_active,
        features: (editingPlan.features && editingPlan.features.length > 0) ? [...editingPlan.features, ...Array(Math.max(0, 4 - editingPlan.features.length)).fill('')] : ['', '', '', '']
      });
    } else if (!isEditing) {
      setPlanForm({
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
    }
  }, [isEditing, editingPlan]);

  const [addOns, setAddOns] = useState<any>({
    photos: [{ quantity: '', price: '' }],
    videos: [{ quantity: '', price: '' }],
    storage: [{ quantity: '', price: '' }],
    events: [{ quantity: '', price: '' }]
  });
  const handleAddOnTier = (category: string) => {
    setAddOns({
      ...addOns,
      [category]: [...addOns[category], { quantity: '', price: '' }]
    });
  };

  const handleRemoveAddOnTier = (category: string, index: number) => {
    setAddOns({
      ...addOns,
      [category]: addOns[category].filter((_: any, i: number) => i !== index)
    });
  };

  const handleAddOnUpdate = (category: string, index: number, field: string, value: string) => {
    const newAddOns = { ...addOns };
    newAddOns[category][index][field] = value;
    setAddOns(newAddOns);
  };
  


  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

      if (isEditing && editingPlan) {
        await dispatch(updatePlan({ planId: editingPlan.id, planData })).unwrap();
        showSuccess('Plan updated successfully!');
      } else {
        await dispatch(createPlan(planData)).unwrap();
        showSuccess('Plan created successfully!');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
        navigate('/admin/subscription');
      }, 1500);
    } catch (error: any) {
      setIsSaving(false);
      const errorMessage = error?.message || error?.toString() || 'Failed to save plan';
      showError(errorMessage);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate('/admin/subscription')}
            className="p-2 mt-1 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-navy group shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-navy tracking-tight">{isEditing ? 'Edit Plan' : 'Create New Plan'}</h1>
            <p className="text-gray-400 font-medium max-w-2xl text-sm">Subscription Configuration</p>
          </div>
        </div>
      </div>

      <div className="premium-card bg-white rounded-3xl shadow-xl shadow-navy/5 overflow-hidden border-none">
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role *</label>
            <select
              required
              value={planForm.role}
              onChange={(e) => {
                const newRole = e.target.value;
                const updates: any = { role: newRole };
                if (newRole !== 'photographer') {
                  updates.has_custom_watermark = false;
                  updates.has_business_branding = false;
                  updates.has_view_client_favorites = false;
                  updates.has_portfolio_website = false;
                  updates.has_team_login = false;
                  updates.has_digital_album = false;
                }
                setPlanForm({ ...planForm, ...updates });
              }}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
            >
              <option value="photographer">Photographer</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Plan Name *</label>
              <input
                type="text"
                required
                value={planForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                  setPlanForm({ ...planForm, name, slug });
                }}
                placeholder="e.g. Pro Studio"
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Slug *
                <span className="text-[8px] text-gray-300 ml-2">(Auto-generated)</span>
              </label>
              <input
                type="text"
                required
                value={planForm.slug}
                onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. pro-studio"
                className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 focus:outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-navy pointer-events-none">
                  {planForm.currency}
                </div>
                <input
                  type="number"
                  required
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                  placeholder="2499"
                  className="w-full pl-14 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
                />
                <select
                  value={planForm.currency}
                  onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-navy focus:outline-none focus:border-primary/40 transition-all cursor-pointer"
                >
                  <option value="₹">₹ INR</option>
                  <option value="$">$ USD</option>
                  <option value="€">€ EUR</option>
                </select>
              </div>
            </div>

          

                    <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description *</label>
            <textarea
              required
              value={planForm.desc}
              onChange={(e) => setPlanForm({ ...planForm, desc: e.target.value })}
              placeholder="Brief description of the plan..."
              rows={3}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-navy focus:outline-none focus:border-primary/40 transition-all resize-none"
            />
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-100">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-3">Plan Limits</label>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Photos *</label>
                <CustomSelect 
                  value={String(planForm.max_photos)} 
                  onChange={(v) => setPlanForm({ ...planForm, max_photos: v })}
                  placeholder="Select Photos Limit"
                  options={[
                    { value: '100', label: '100' },
                    { value: '500', label: '500' },
                    { value: '1000', label: '1000' },
                    { value: '0', label: 'Unlimited' }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Videos *</label>
                <CustomSelect 
                  value={String(planForm.max_videos)} 
                  onChange={(v) => setPlanForm({ ...planForm, max_videos: v })}
                  placeholder="Select Videos Limit"
                  options={[
                    { value: '10', label: '10' },
                    { value: '50', label: '50' },
                    { value: '100', label: '100' },
                    { value: '0', label: 'Unlimited' }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Storage (GB) *</label>
                <CustomSelect 
                  value={String(planForm.max_storage_gb)} 
                  onChange={(v) => setPlanForm({ ...planForm, max_storage_gb: v })}
                  placeholder="Select Storage"
                  options={[
                    { value: '10', label: '10 GB' },
                    { value: '50', label: '50 GB' },
                    { value: '100', label: '100 GB' },
                    { value: '500', label: '500 GB' },
                    { value: '0', label: 'Unlimited' }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Events *</label>
                <CustomSelect 
                  value={String(planForm.max_events)} 
                  onChange={(v) => setPlanForm({ ...planForm, max_events: v })}
                  placeholder="Select Events Limit"
                  options={[
                    { value: '1', label: '1' },
                    { value: '5', label: '5' },
                    { value: '10', label: '10' },
                    { value: '0', label: 'Unlimited' }
                  ]}
                />
              </div>
            </div>
          </div>

{/* 
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Features (Optional)</label>
              <button
                type="button"
                onClick={() => setPlanForm({ ...planForm, features: [...planForm.features, ''] })}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Feature
              </button>
            </div>
            {planForm.features.map((feature, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...planForm.features];
                    newFeatures[idx] = e.target.value;
                    setPlanForm({ ...planForm, features: newFeatures });
                  }}
                  placeholder={`Feature ${idx + 1}`}
                  className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-navy focus:outline-none focus:border-primary/40 transition-all"
                />
                {planForm.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = planForm.features.filter((_, i) => i !== idx);
                      setPlanForm({ ...planForm, features: newFeatures });
                    }}
                    className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-all"
                    title="Remove Feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div> 
          */}

          <div className="grid grid-cols-2 gap-4">
            {planForm.role === 'photographer' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="has_custom_watermark"
                  checked={planForm.has_custom_watermark}
                  onChange={(e) => setPlanForm({ ...planForm, has_custom_watermark: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="has_custom_watermark" className="text-sm font-bold text-navy cursor-pointer">Custom Watermark</label>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                id="has_face_recognition"
                checked={planForm.has_face_recognition}
                onChange={(e) => setPlanForm({ ...planForm, has_face_recognition: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="has_face_recognition" className="text-sm font-bold text-navy cursor-pointer">Face Recognition</label>
            </div>
            {planForm.role === 'photographer' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="has_business_branding"
                  checked={planForm.has_business_branding}
                  onChange={(e) => setPlanForm({ ...planForm, has_business_branding: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="has_business_branding" className="text-sm font-bold text-navy cursor-pointer">Business Branding</label>
              </div>
            )}
            {planForm.role === 'photographer' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="has_view_client_favorites"
                  checked={planForm.has_view_client_favorites}
                  onChange={(e) => setPlanForm({ ...planForm, has_view_client_favorites: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="has_view_client_favorites" className="text-sm font-bold text-navy cursor-pointer">View Client Favorites</label>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                id="has_switch_downloads"
                checked={planForm.has_switch_downloads}
                onChange={(e) => setPlanForm({ ...planForm, has_switch_downloads: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="has_switch_downloads" className="text-sm font-bold text-navy cursor-pointer">Switch On/Off Downloads</label>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                id="has_bulk_download"
                checked={planForm.has_bulk_download}
                onChange={(e) => setPlanForm({ ...planForm, has_bulk_download: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="has_bulk_download" className="text-sm font-bold text-navy cursor-pointer">Bulk Download</label>
            </div>
            {planForm.role === 'photographer' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="has_portfolio_website"
                  checked={planForm.has_portfolio_website}
                  onChange={(e) => setPlanForm({ ...planForm, has_portfolio_website: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="has_portfolio_website" className="text-sm font-bold text-navy cursor-pointer">Portfolio Website</label>
              </div>
            )}
            {planForm.role === 'photographer' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="has_team_login"
                  checked={planForm.has_team_login}
                  onChange={(e) => setPlanForm({ ...planForm, has_team_login: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="has_team_login" className="text-sm font-bold text-navy cursor-pointer">Team Login & Controls</label>
              </div>
            )}
            {planForm.role === 'photographer' && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="has_digital_album"
                  checked={planForm.has_digital_album}
                  onChange={(e) => setPlanForm({ ...planForm, has_digital_album: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="has_digital_album" className="text-sm font-bold text-navy cursor-pointer">Digital Album</label>
              </div>
            )}
          </div>

          <div className="p-4 bg-success/5 rounded-xl border border-success/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  planForm.is_active ? "bg-success/10 text-success" : "bg-gray-100 text-gray-400"
                )}>
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <label htmlFor="is_active" className="text-sm font-black text-navy block">Plan Status</label>
                  <p className="text-[10px] text-gray-400 font-medium">Make this plan available to users</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlanForm({ ...planForm, is_active: !planForm.is_active })}
                className={cn(
                  "w-14 h-7 rounded-full relative transition-colors",
                  planForm.is_active ? "bg-success" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                  planForm.is_active ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        
          

</div>

        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button
            onClick={() => navigate('/admin/subscription')}
            disabled={isSaving}
            className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-400 hover:text-navy transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="flex-1 py-4 bg-navy text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-navy/30 transition-all disabled:bg-gray-400 group relative overflow-hidden"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : saveSuccess ? (
              <div className="flex items-center justify-center gap-3 text-success">
                <Check className="w-4 h-4" />
                <span>Success!</span>
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 inline-block mr-2 group-hover:rotate-12 transition-transform" />
                {isEditing ? 'Update Plan' : 'Create Plan'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
