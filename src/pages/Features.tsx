import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, ListPlus, Plus, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { showSuccess, showError } from '@/src/lib/toast';
import { get, post } from '@/src/lib/api';
import { Loader2 } from 'lucide-react';

// Features data will be fetched from API

export function FeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  const fetchFeatures = async () => {
    try {
      const response = await get('/admin/subscription-features');
      if (response.success || response.status === 'success') {
        const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const resourceFeatures = ['Photos', 'Videos', 'Storage', 'Events'];
        const mappedData = rawData.map((f: any) => ({
          ...f,
          name: f.feature_name,
          type: resourceFeatures.includes(f.feature_name) ? 'resource' : 'boolean'
        }));
        setFeatures(mappedData);
      } else {
        showError(response.message || 'Failed to fetch features');
      }
    } catch (error) {
      showError('An error occurred while fetching features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // State for the modal
  const [resourceTiers, setResourceTiers] = useState<{ quantity: string; price: string }[]>([]);
  const [booleanPrice, setBooleanPrice] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openEditModal = (feature: any) => {
    setEditingFeature(feature);
    setErrors({});
    if (feature.type === 'resource') {
      // Initialize with existing tiers from API if available
      if (feature.addons && feature.addons.length > 0) {
        setResourceTiers(
          feature.addons.map((addon: any) => ({
            quantity: addon.feature_value?.toString() || '',
            price: addon.addon_price?.toString() || ''
          }))
        );
      } else {
        setResourceTiers([{ quantity: '100', price: '50' }]);
      }
    } else {
      // Initialize with default price or load from API/state
      setBooleanPrice(feature.value?.toString() || '99');
    }
  };

  const closeEditModal = () => {
    setEditingFeature(null);
  };

  const handleAddTier = () => {
    setResourceTiers([...resourceTiers, { quantity: '', price: '' }]);
    setErrors({});
  };

  const handleRemoveTier = (index: number) => {
    setResourceTiers(resourceTiers.filter((_, i) => i !== index));
    setErrors({});
  };

  const handleTierChange = (index: number, field: 'quantity' | 'price', value: string) => {
    const updatedTiers = [...resourceTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setResourceTiers(updatedTiers);
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (editingFeature.type === 'resource') {
      if (resourceTiers.length === 1) {
        if (!resourceTiers[0].quantity || !resourceTiers[0].price) {
          newErrors['tier-0'] = 'Quantity and Price are required.';
        }
      } else {
        let hasValidRow = false;
        for (let i = 0; i < resourceTiers.length; i++) {
          const tier = resourceTiers[i];
          const hasQty = !!tier.quantity;
          const hasPrice = !!tier.price;

          if (hasQty && hasPrice) {
            hasValidRow = true;
          } else if (hasQty !== hasPrice) {
            newErrors[`tier-${i}`] = `Both Quantity and Price are required for Tier ${i + 1}.`;
          }
        }
        if (!hasValidRow && Object.keys(newErrors).length === 0) {
          newErrors['global'] = 'At least one tier must be filled.';
        }
      }
    } else {
      if (!booleanPrice) {
        newErrors['price'] = 'Feature Price is required.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const saveChanges = async () => {
      setSaving(true);
      try {
        const payload: any = {
          subscription_feature_id: editingFeature.id,
          type: editingFeature.name
        };

        if (editingFeature.type === 'resource') {
          payload[editingFeature.name] = resourceTiers.map(t => ({
            qty: Number(t.quantity),
            price: Number(t.price)
          }));
        } else {
          payload.price = Number(booleanPrice);
        }

        const response = await post('/admin/subscription-features/update-addon', payload);

        if (response.success || (response as any).status === 'success') {
          showSuccess(`${editingFeature.name} pricing updated successfully!`);
          fetchFeatures(); // Refresh the list
          closeEditModal();
        } else {
          showError(response.message || 'Failed to update feature pricing');
        }
      } catch (error) {
        showError('An error occurred while saving.');
      } finally {
        setSaving(false);
      }
    };

    saveChanges();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight uppercase">
            Feature Management
          </h2>
          <p className="text-sm font-medium text-gray-400 mt-1 max-w-xl">
            Configure pricing and tiers for all platform features and resource add-ons.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <ListPlus className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">{features.length} Features</span>
          </div>
        </div>
      </div>

      {/* Listing */}
      <div className="premium-card bg-white rounded-3xl shadow-xl shadow-navy/5 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16 text-center">No</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Feature Name</th>

                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-sm font-medium text-gray-400 mt-2">Loading features...</p>
                  </td>
                </tr>
              ) : features.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <p className="text-sm font-medium text-gray-400">No features found.</p>
                  </td>
                </tr>
              ) : features.map((feature, idx) => (
                <tr key={feature.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6 text-sm font-bold text-gray-400 text-center">{(idx + 1).toString().padStart(2, '0')}</td>
                  <td className="py-4 px-6 text-sm font-black text-navy">{feature.name}</td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openEditModal(feature)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-primary/10 text-gray-500 hover:text-primary rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                <div>
                  <h3 className="text-2xl font-black text-navy tracking-tight">Edit Pricing</h3>
                  <p className="text-sm font-medium text-gray-400 mt-1">Configure pricing for {editingFeature.name}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto">
                {editingFeature.type === 'resource' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-navy uppercase tracking-widest">Pricing Tiers</h4>
                      <button
                        type="button"
                        onClick={handleAddTier}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add Tier
                      </button>
                    </div>

                    {errors['global'] && (
                      <div className="p-3 bg-danger/10 text-danger text-xs font-bold rounded-xl mb-4">
                        {errors['global']}
                      </div>
                    )}
                    <div className="space-y-3">
                      {resourceTiers.map((tier, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <div className={`flex gap-3 items-end bg-gray-50 p-4 rounded-2xl border ${errors[`tier-${idx}`] ? 'border-danger' : 'border-gray-100'}`}>
                            <div className="flex-1 space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity {resourceTiers.length === 1 ? '*' : ''}</label>
                              <input
                                type="number"
                                value={tier.quantity}
                                onChange={(e) => handleTierChange(idx, 'quantity', e.target.value)}
                                placeholder="e.g. 100"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (₹) {resourceTiers.length === 1 ? '*' : ''}</label>
                              <input
                                type="number"
                                value={tier.price}
                                onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                                placeholder="e.g. 50"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-primary/40 transition-all"
                              />
                            </div>
                            {resourceTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTier(idx)}
                                className="h-[42px] px-3 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-all flex items-center justify-center shrink-0"
                                title="Remove Tier"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {errors[`tier-${idx}`] && (
                            <p className="text-danger text-xs font-bold px-2">{errors[`tier-${idx}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-sm">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Feature Price (₹) *</label>
                    <input
                      type="number"
                      value={booleanPrice}
                      onChange={(e) => {
                        setBooleanPrice(e.target.value);
                        setErrors({});
                      }}
                      placeholder="e.g. 99"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-lg font-bold text-navy focus:outline-none focus:border-primary/40 transition-all ${errors['price'] ? 'border-danger' : 'border-gray-200'}`}
                    />
                    <p className="text-xs text-gray-400 mt-2">Enter the flat price for enabling this feature.</p>
                    {errors['price'] && (
                      <p className="text-danger text-xs font-bold mt-2">{errors['price']}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex gap-4 shrink-0">
                <button
                  onClick={closeEditModal}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-400 hover:text-navy transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-navy text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-navy/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
