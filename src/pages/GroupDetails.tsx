import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Users2,
  Images,
  MoreVertical,
  Globe,
  Activity,
  Shield,
  X,
  ChevronUp,
  Archive,
  User,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Calendar,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Check,
  Loader2,
  UserPlus,
  Copy,
  Upload,
  Video as VideoIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchGroupById, addMemberToGroup, removeMemberFromGroup, updateGroup, deleteGroup } from '../store/slices/groupsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { fetchPhotos, fetchVideos, uploadPhotos, deletePhoto, bulkDownloadPhotos, Photo, Video } from '../store/slices/photosSlice';
import { showSuccess, showError } from '../lib/toast';

// Enhanced Mock Data (Replicated for now)
const initialGroups = [
  {
    id: 1,
    name: 'Summer 2026',
    type: 'Public',
    eventType: 'Season',
    status: 'Active',
    owner: { name: 'Alex Rivers', email: 'a.rivers@enterprise.com' },
    members: 1240,
    uploads: 12400,
    preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
    createdAt: '2026-01-15',
    description: 'Capturing the essence of the 2026 summer solstice and beyond.',
    lastActivity: '2m ago',
    participants: [
      { id: 101, name: 'Alex Rivers', role: 'Owner', joined: '2026-01-15' },
      { id: 102, name: 'Sarah Jenkins', role: 'Moderator', joined: '2026-01-20' },
      { id: 103, name: 'Marcus Chen', role: 'Contributor', joined: '2026-02-01' }
    ],
    gallery: [
      { id: 201, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop', photographer: 'Alex Rivers' },
      { id: 202, url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop', photographer: 'Sarah Jenkins' },
      { id: 203, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop', photographer: 'Marcus Chen' }
    ]
  },
  {
    id: 2,
    name: 'Street Photography',
    type: 'Public',
    eventType: 'Hobby',
    status: 'Active',
    owner: { name: 'Sarah Jenkins', email: 's.jenkins@enterprise.com' },
    members: 842,
    uploads: 8200,
    preview: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=60',
    createdAt: '2026-02-10',
    description: 'Urban life through the lens. Candid moments and city architecture.',
    lastActivity: '1h ago',
    participants: [
      { id: 104, name: 'Sarah Jenkins', role: 'Owner', joined: '2026-02-10' },
      { id: 105, name: 'Alex Rivers', role: 'Moderator', joined: '2026-02-15' }
    ],
    gallery: [
      { id: 204, url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop', photographer: 'Sarah Jenkins' },
      { id: 205, url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', photographer: 'Alex Rivers' },
      { id: 206, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop', photographer: 'Marcus Chen' }
    ]
  },
  {
    id: 3,
    name: 'Wedding Vibes',
    type: 'Private',
    eventType: 'Event',
    status: 'Active',
    owner: { name: 'Marcus Chen', email: 'm.chen@enterprise.com' },
    members: 42,
    uploads: 1200,
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60',
    createdAt: '2026-03-20',
    description: 'Private collection for the Chen-Smith wedding ceremony.',
    lastActivity: '1d ago',
    participants: [
      { id: 106, name: 'Marcus Chen', role: 'Owner', joined: '2026-03-20' }
    ],
    gallery: [
      { id: 207, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop', photographer: 'Marcus Chen' },
      { id: 208, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&h=200&fit=crop', photographer: 'Elena Rodriguez' },
      { id: 209, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200&h=200&fit=crop', photographer: 'Jordan Smith' },
      { id: 210, url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=200&h=200&fit=crop', photographer: 'Mia Watson' }
    ]
  },
  {
    id: 4,
    name: 'Mountain Peaks',
    type: 'Public',
    eventType: 'Adventure',
    status: 'Reported',
    owner: { name: 'Elena Rodriguez', email: 'e.rodriguez@enterprise.com' },
    members: 560,
    uploads: 4500,
    preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60',
    createdAt: '2026-04-05',
    description: 'Exploring the highest summits. High altitude, high resolution.',
    lastActivity: '5h ago',
    participants: [
      { id: 107, name: 'Elena Rodriguez', role: 'Owner', joined: '2026-04-05' }
    ],
    gallery: [
      { id: 211, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop', photographer: 'Elena Rodriguez' },
      { id: 212, url: 'https://images.unsplash.com/photo-1454496522488-7a8e48888054?w=200&h=200&fit=crop', photographer: 'Alex Rivers' },
      { id: 213, url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d11ce4e?w=200&h=200&fit=crop', photographer: 'Sarah Jenkins' }
    ]
  },
  {
    id: 5,
    name: 'Minimal Architecture',
    type: 'Public',
    eventType: 'Design',
    status: 'Active',
    owner: { name: 'Jordan Smith', email: 'j.smith@enterprise.com' },
    members: 320,
    uploads: 2100,
    preview: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
    createdAt: '2026-04-22',
    description: 'Lines, shapes, and shadows. The beauty of modern architectural design.',
    lastActivity: '3h ago',
    participants: [
      { id: 108, name: 'Jordan Smith', role: 'Owner', joined: '2026-04-22' }
    ],
    gallery: [
      { id: 214, url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', photographer: 'Jordan Smith' },
      { id: 215, url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=200&h=200&fit=crop', photographer: 'Marcus Chen' },
      { id: 216, url: 'https://images.unsplash.com/photo-1494145904049-0fe8c0c4b257?w=200&h=200&fit=crop', photographer: 'Alex Rivers' }
    ]
  },
  {
    id: 6,
    name: 'Product Shoots',
    type: 'Shared',
    eventType: 'Commercial',
    status: 'Archived',
    owner: { name: 'Mia Watson', email: 'm.watson@enterprise.com' },
    members: 15,
    uploads: 450,
    preview: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    createdAt: '2026-04-28',
    description: 'E-commerce photography workflows and asset management.',
    lastActivity: '1w ago',
    participants: [
      { id: 109, name: 'Mia Watson', role: 'Owner', joined: '2026-04-28' }
    ],
    gallery: [
      { id: 217, url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', photographer: 'Mia Watson' },
      { id: 218, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', photographer: 'Sarah Jenkins' },
      { id: 219, url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop', photographer: 'Elena Rodriguez' }
    ]
  }
];

export function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentGroup: group, isLoading, error } = useAppSelector((state) => state.groups);
  const { users } = useAppSelector((state) => state.users);
  const { photos, videos, pagination: photosPagination, stats: photosStats, isLoading: isLoadingPhotos, isDownloading } = useAppSelector((state) => state.photos);

  const [activeTab, setActiveTab] = useState<'participants' | 'gallery' | 'stats'>('gallery');
  const [activeGalleryTab, setActiveGalleryTab] = useState<'photos' | 'videos'>('photos');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [gallerySearchTerm, setGallerySearchTerm] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'public',
    event_type: 'Wedding',
    description: '',
  });

  
  // Bulk selection state
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [participantRoleFilter, setParticipantRoleFilter] = useState('All Roles');
  const [participantSortConfig, setParticipantSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [participantCurrentPage, setParticipantCurrentPage] = useState(1);
  const [participantPageSize, setParticipantPageSize] = useState(10);
  
  // Invite Member Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    user_id: 0,
    role: 'member'
  });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Remove Member Modal
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupById(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!group) return;
    setEditForm({
      name: group.name || '',
      type: (group.type || 'public').toLowerCase(),
      event_type: (group as any).eventType || (group as any).event_type || 'Wedding',
      description: group.description || '',
    });
  }, [group]);

  // Fetch photos when group is loaded or gallery tab is active
  useEffect(() => {
    if (id && activeTab === 'gallery') {
      dispatch(fetchPhotos({
        groupId: Number(id),
        limit: pageSize,
        search: gallerySearchTerm || undefined,
      }));

      // Always fetch videos for the group
      dispatch(fetchVideos({ groupId: Number(id), search: gallerySearchTerm || undefined }));
    }
  }, [dispatch, id, activeTab, currentPage, pageSize, gallerySearchTerm]);

  // Reset selection when switching asset types
  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedPhotos([]);
  }, [activeGalleryTab]);

  // Fetch users when invite modal opens
  useEffect(() => {
    if (showInviteModal) {
      dispatch(fetchUsers({ limit: 100 })); // Fetch users for dropdown
    }
  }, [dispatch, showInviteModal]);

  // Handle photo deletion
  const handleDeletePhoto = async (photoId: number) => {
    if (!group) return;
    
    try {
      await dispatch(deletePhoto({ groupId: group.id, photoId })).unwrap();
      showSuccess('Photo deleted successfully');
    } catch (error: any) {
      showError(error || 'Failed to delete photo');
    }
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (!group || selectedPhotos.length === 0) {
      showError('Please select photos to download');
      return;
    }
    
    try {
      await dispatch(bulkDownloadPhotos({
        groupId: group.id,
        photo_ids: selectedPhotos
      })).unwrap();
      
      showSuccess(`${selectedPhotos.length} photo(s) downloaded successfully`);
      setSelectedPhotos([]);
      setIsSelectionMode(false);
    } catch (error: any) {
      showError(error || 'Failed to download photos');
    }
  };

  const handleUpdateGroup = async () => {
    if (!group) return;
    if (!editForm.name.trim()) {
      showError('Please enter a collective name.');
      return;
    }

    try {
      await dispatch(
        updateGroup({
          groupId: group.id,
          groupData: {
            name: editForm.name.trim(),
            type: editForm.type,
            event_type: editForm.event_type,
            description: editForm.description?.trim() || '',
          },
        }),
      ).unwrap();

      showSuccess('Collective updated successfully!');
      await dispatch(fetchGroupById(group.id));
      setIsEditPanelOpen(false);
    } catch (err: any) {
      showError(err || 'Failed to update collective');
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!group) return;

    try {
      await dispatch(deleteGroup(group.id)).unwrap();
      showSuccess('Collective decommissioned successfully!');
      setIsDeleteModalOpen(false);
      navigate('/admin/groups');
    } catch (err: any) {
      showError(err || 'Failed to delete collective');
    }
  };

  // Toggle photo selection
  const togglePhotoSelection = (photoId: number) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  // Select all photos on current page
  const selectAllPhotos = () => {
    const allPhotoIds = photos.map(p => p.id);
    setSelectedPhotos(allPhotoIds);
  };

  // Deselect all photos
  const deselectAllPhotos = () => {
    setSelectedPhotos([]);
  };

  const sortedGallery = photos; // Photos are already sorted from API
  const paginatedGallery = photos; // Photos are already paginated from API

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (!gallerySearchTerm) return videos;
    const term = gallerySearchTerm.toLowerCase();
    return videos.filter(v => 
      (v.original_name || v.filename || '').toLowerCase().includes(term) ||
      (v.uploader?.name || '').toLowerCase().includes(term) ||
      v.id.toString().includes(term)
    );
  }, [videos, gallerySearchTerm]);

  const toggleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredParticipants = useMemo(() => {
    if (!group) return [];
    let items = (group.participants || []).filter((p: any) => {
      const matchesSearch = (p.name || '').toLowerCase().includes(participantSearchTerm.toLowerCase());
      const matchesRole = participantRoleFilter === 'All Roles' || p.role === participantRoleFilter;
      return matchesSearch && matchesRole;
    });
    if (participantSortConfig) {
      items.sort((a: any, b: any) => {
        if (a[participantSortConfig.key] < b[participantSortConfig.key]) return participantSortConfig.direction === 'asc' ? -1 : 1;
        if (a[participantSortConfig.key] > b[participantSortConfig.key]) return participantSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [group, participantSearchTerm, participantRoleFilter, participantSortConfig]);

  const paginatedParticipants = filteredParticipants.slice((participantCurrentPage - 1) * participantPageSize, participantCurrentPage * participantPageSize);

  const toggleParticipantSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (participantSortConfig && participantSortConfig.key === key && participantSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setParticipantSortConfig({ key, direction });
  };

  // Handle Invite Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group || !inviteForm.user_id) {
      showError('Please select a user');
      return;
    }

    try {
      await dispatch(addMemberToGroup({
        groupId: group.id,
        memberData: inviteForm
      })).unwrap();
      
      showSuccess('Member invited successfully');
      
      // Refetch group details to get updated participants list
      await dispatch(fetchGroupById(group.id));
      
      setShowInviteModal(false);
      setInviteForm({ user_id: 0, role: 'member' });
      setUserSearchTerm('');
      setSelectedUserName('');
      setShowUserDropdown(false);
    } catch (error: any) {
      showError(error || 'Failed to invite member');
    }
  };

  // Handle Remove Member - Open Modal
  const handleRemoveMember = (userId: number, memberName: string) => {
    setMemberToRemove({ id: userId, name: memberName });
    setShowRemoveMemberModal(true);
  };

  // Confirm Remove Member
  const confirmRemoveMember = async () => {
    if (!group || !memberToRemove) return;
    
    try {
      await dispatch(removeMemberFromGroup({
        groupId: group.id,
        userId: memberToRemove.id
      })).unwrap();
      
      showSuccess('Member removed successfully');
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    } catch (error: any) {
      showError(error || 'Failed to remove member');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Group...</p>
      </div>
    );
  }

  // Error or not found
  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-danger mb-4" />
        <h3 className="text-2xl font-black text-navy uppercase tracking-tight">Entity Not Found</h3>
        <p className="text-gray-500 font-medium mt-2">{error || 'The requested group does not exist.'}</p>
        <button
          onClick={() => navigate('/admin/groups')}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-navy/20 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header - Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/groups')}
          className="flex items-center gap-2 text-gray-400 hover:text-navy transition-colors group"
        >
          <div className="p-2 bg-white border border-gray-100 rounded-xl group-hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Groups</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsActionsOpen((v) => !v)}
              className="p-2 text-gray-400 hover:text-navy transition-colors"
              aria-label="Group actions"
            >
              <MoreVertical className="w-5 h-5 rotate-90" />
            </button>
            <AnimatePresence>
              {isActionsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsActionsOpen(false)}
                    className="fixed inset-0 z-[90]"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute right-0 top-11 z-[100] w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setIsActionsOpen(false);
                        setIsEditPanelOpen(true);
                      }}
                      className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-navy" />
                      <div>
                        <p className="text-xs font-black text-navy uppercase tracking-widest">Edit</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Modify collective</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsActionsOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-danger/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                      <div>
                        <p className="text-xs font-black text-danger uppercase tracking-widest">Delete</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Decommission permanently</p>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Group Slide-over Panel */}
      <AnimatePresence>
        {isEditPanelOpen && group && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditPanelOpen(false)}
              className="fixed inset-0 z-[100] bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full md:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-navy text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">Modify Collective</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">Update Configuration Profile</p>
                </div>
                <button
                  onClick={() => setIsEditPanelOpen(false)}
                  className="relative z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entity Designation</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Privacy Protocol</label>
                      <div className="relative">
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Logic</label>
                      <div className="relative">
                        <select
                          value={editForm.event_type}
                          onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value })}
                          className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-navy appearance-none focus:outline-none focus:border-primary/40 transition-all outline-none"
                        >
                          <option>Wedding</option>
                          <option>Engagement</option>
                          <option>Baby Shower</option>
                          <option>Corporate</option>
                          <option>Festival</option>
                          <option>Concert</option>
                          <option>Birthday</option>
                          <option>Reunion</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description Brief</label>
                    <textarea
                      rows={6}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-5 md:px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-600 focus:outline-none focus:border-primary/40 transition-all resize-none outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsEditPanelOpen(false)}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-navy hover:bg-gray-100 transition-all outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGroup}
                  disabled={isLoading || !editForm.name.trim()}
                  className={cn(
                    "flex-[2] py-4 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group",
                    (isLoading || !editForm.name.trim()) &&
                      "opacity-60 cursor-not-allowed hover:shadow-none active:scale-100",
                  )}
                >
                  <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="premium-card overflow-hidden bg-white shadow-2xl flex flex-col">
        {/* Detail Header */}
        <div className="relative h-80 overflow-hidden bg-navy">
          <img 
            src={group.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60'} 
            alt={group.name}
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

          <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
            <div className="flex gap-3">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                {group.type}
              </span>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <h3 className="text-5xl font-black text-navy tracking-tight leading-none">{group.name}</h3>
            <p className="text-base font-bold text-gray-500 mt-2 uppercase tracking-[0.2em]">{group.eventType} Community</p>
          </div>
        </div>

        {/* Join Code & Invite Link Section */}
        {(group.joinCode || group.inviteLink) && (
          <div className="px-4 md:px-10 py-4 md:py-6 bg-gradient-to-r from-primary/5 to-info/5 border-b border-gray-100 overflow-hidden">
            <div className="flex flex-col gap-4">
              {/* Join Code */}
              {group.joinCode && (
                <div className="flex items-center gap-2 w-full min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest">Join Code</p>
                      <p className="text-base md:text-lg font-black text-navy tracking-wider break-all">{group.joinCode}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(group.joinCode);
                      showSuccess('Join code copied to clipboard!');
                    }}
                    className="p-1.5 md:p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all flex-shrink-0"
                    title="Copy Join Code"
                  >
                    <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              )}

              {/* Invite Link */}
              {group.inviteLink && (
                <div className="flex items-center gap-2 w-full min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest">Invite Link</p>
                      <p className="text-xs md:text-sm font-bold text-navy truncate">{group.inviteLink}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(group.inviteLink);
                      showSuccess('Invite link copied to clipboard!');
                    }}
                    className="p-1.5 md:p-2 hover:bg-white rounded-lg text-gray-400 hover:text-info transition-all shrink-0"
                    title="Copy Invite Link"
                  >
                    <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detail Tabs */}
        <div className="px-10 border-b border-gray-100 flex items-center gap-8 bg-white sticky top-0 z-20">
          {['participants', 'gallery'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "py-6 text-[10px] font-black uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-navy"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Detail Content */}
        <div className="flex-1">

          {activeTab === 'participants' && (
            <div className="p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Participant Registry</h5>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={participantSearchTerm}
                      onChange={(e) => setParticipantSearchTerm(e.target.value)}
                      className="pl-11 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-primary/40 transition-all w-full md:w-64"
                    />
                  </div>
                  <select
                    value={participantRoleFilter}
                    onChange={(e) => setParticipantRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-navy focus:outline-none appearance-none cursor-pointer"
                  >
                    <option>All Roles</option>
                    <option>Owner</option>
                    <option>User</option>
                  </select>
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors" onClick={() => toggleParticipantSort('name')}>
                        <div className="flex items-center gap-2">
                          Identity {participantSortConfig?.key === 'name' && (participantSortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-navy transition-colors" onClick={() => toggleParticipantSort('role')}>
                        <div className="flex items-center gap-2">
                          Institutional Role {participantSortConfig?.key === 'role' && (participantSortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedParticipants.map((p) => (
                      <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-navy uppercase shadow-sm">
                              {(p.name || '?').split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <p className="text-sm font-bold text-navy">{p.name || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            p.role === 'Owner' ? "bg-primary/10 text-primary border border-primary/20" : "bg-gray-100 text-gray-500 border border-gray-200"
                          )}>{p.role}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRemoveMember(p.id, p.name)}
                            className="p-2 text-gray-300 hover:text-danger transition-all"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Participants */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Reporting <span className="font-black text-navy">{Math.min(filteredParticipants.length, participantPageSize)}</span> of <span className="font-black text-navy">{filteredParticipants.length}</span> members
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Page Capacity</label>
                    <select
                      value={participantPageSize}
                      onChange={(e) => setParticipantPageSize(Number(e.target.value))}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none outline-none"
                    >
                      <option value={10}>10 Entities</option>
                      <option value={25}>25 Entities</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setParticipantCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={participantCurrentPage === 1}
                    className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.ceil(filteredParticipants.length / participantPageSize) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setParticipantCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-xl text-[10px] font-black tracking-widest transition-all",
                          participantCurrentPage === page ? "bg-navy text-white shadow-lg shadow-navy/20" : "hover:bg-gray-50 text-gray-400 hover:text-navy"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setParticipantCurrentPage(prev => Math.min(Math.ceil(filteredParticipants.length / participantPageSize), prev + 1))}
                    disabled={participantCurrentPage === Math.ceil(filteredParticipants.length / participantPageSize) || filteredParticipants.length === 0}
                    className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="p-4 md:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div className="flex items-center gap-6">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Repository Preview</h5>
                  <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                    <button
                      onClick={() => setActiveGalleryTab('photos')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        activeGalleryTab === 'photos' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-navy"
                      )}
                    >
                      Photos
                    </button>
                    <button
                      onClick={() => setActiveGalleryTab('videos')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        activeGalleryTab === 'videos' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-navy"
                      )}
                    >
                      Videos
                    </button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={gallerySearchTerm}
                      onChange={(e) => {
                        setGallerySearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                      className="pl-11 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-primary/40 transition-all w-full md:w-64"
                    />
                  </div>

                  
                  {/* Bulk Actions */}
                  {activeGalleryTab === 'photos' && (
                    !isSelectionMode ? (
                      <button
                        onClick={() => setIsSelectionMode(true)}
                        className="px-6 py-2 bg-info text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-info/20 hover:scale-105 transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Select Photos
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedPhotos([]);
                        }}
                        className="px-6 py-2 bg-gray-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )
                  )}
                </div>
              </div>
              
              {/* Selection Actions Bar */}
              <AnimatePresence>
                {isSelectionMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 bg-info/10 border border-info/20 rounded-xl gap-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <p className="text-sm font-bold text-navy whitespace-nowrap">
                        {selectedPhotos.length} photo(s) selected
                      </p>
                      {selectedPhotos.length === 0 ? (
                        <button
                          onClick={selectAllPhotos}
                          className="text-xs font-bold text-info hover:text-info/80 transition-colors whitespace-nowrap"
                        >
                          Select All
                        </button>
                      ) : (
                        <button
                          onClick={deselectAllPhotos}
                          className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                        >
                          Deselect All
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleBulkDownload}
                      disabled={selectedPhotos.length === 0 || isDownloading}
                      className="px-6 py-2 bg-info text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-info/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Download Selected
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {isLoadingPhotos ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Assets...</p>
                </div>
              ) : activeGalleryTab === 'photos' ? (
                sortedGallery.length > 0 ? (
                  <>
                    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50">
                            {isSelectionMode && (
                              <th className="px-6 py-5 w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedPhotos.length === photos.length && photos.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      selectAllPhotos();
                                    } else {
                                      deselectAllPhotos();
                                    }
                                  }}
                                  className="w-4 h-4 text-info bg-gray-100 border-gray-300 rounded focus:ring-info focus:ring-2"
                                />
                              </th>
                            )}
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Preview</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                              Asset Details
                            </th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                              Source / Photographer
                            </th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Metadata</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedGallery.map((photo) => (
                            <tr key={photo.id} className="group hover:bg-gray-50/50 transition-colors">
                              {isSelectionMode && (
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedPhotos.includes(photo.id)}
                                    onChange={() => togglePhotoSelection(photo.id)}
                                    className="w-4 h-4 text-info bg-gray-100 border-gray-300 rounded focus:ring-info focus:ring-2"
                                  />
                                </td>
                              )}
                              <td className="px-6 py-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                  <img 
                                    src={photo.thumbnail_url} 
                                    alt={photo.filename}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-navy">{photo.filename}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                  {photo.id}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {photo.photographer.avatar ? (
                                    <img 
                                      src={photo.photographer.avatar} 
                                      alt={photo.photographer.name}
                                      className="w-8 h-8 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                                  {(photo.photographer.name || '?').split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                  )}
                                  <p className="text-sm font-bold text-gray-700">{photo.photographer.name || 'Unknown'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-primary" /> 
                                    {new Date(photo.uploaded_at).toLocaleDateString()}
                                  </span>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Images className="w-3.5 h-3.5 text-info" /> 
                                    {photo.format.toUpperCase()} • {photo.size_formatted}
                                  </span>
                                  {photo.width && photo.height && (
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                      {photo.width} × {photo.height}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedImage(photo)}
                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-navy transition-all shadow-sm border border-transparent hover:border-gray-100" 
                                    title="View Full Asset"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-danger transition-all shadow-sm border border-transparent hover:border-gray-100" 
                                    title="Remove Asset"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for Photos */}
                    {photosPagination && (
                      <div className="p-4 md:p-6 bg-white border border-gray-100 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 overflow-hidden">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            Reporting <span className="font-black text-navy">{photos.length}</span> of <span className="font-black text-navy">{photosPagination.total_items}</span> assets
                          </p>
                          {photosStats && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              Total Size: <span className="font-black text-navy">{photosStats.total_size_formatted}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Page Capacity</label>
                            <select
                              value={pageSize}
                              onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-navy focus:outline-none outline-none"
                            >
                              <option value={10}>10 Assets</option>
                              <option value={25}>25 Assets</option>
                              <option value={50}>50 Assets</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-end gap-2 overflow-x-auto">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 flex-shrink-0"
                          >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                          </button>
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.min(photosPagination.total_pages, 5) }, (_, i) => {
                              const totalPages = photosPagination.total_pages;
                              if (totalPages <= 5) return i + 1;
                              if (i === 0) return 1;
                              if (i === 4) return totalPages;
                              if (currentPage <= 3) return i + 1;
                              if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                              return currentPage - 2 + i;
                            }).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                  "w-8 h-8 rounded-xl text-[10px] font-black tracking-widest transition-all flex-shrink-0",
                                  currentPage === page ? "bg-navy text-white shadow-lg shadow-navy/20" : "hover:bg-gray-50 text-gray-400 hover:text-navy"
                                )}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(photosPagination.total_pages, prev + 1))}
                            disabled={currentPage === photosPagination.total_pages}
                            className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 flex-shrink-0"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6 text-gray-200">
                      <Images className="w-12 h-12" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Media Vault Empty</p>
                    <p className="text-gray-500 font-medium mt-2">No photos found in this group.</p>
                  </div>
                )
              ) : (
                videos.length > 0 ? (
                  <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Video Preview</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Details</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Metadata</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredVideos.map((video) => (
                          <tr key={video.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 relative bg-black">
                                {video.thumbnail_url ? (
                                  <img 
                                    src={video.thumbnail_url} 
                                    alt={video.filename}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-navy/20">
                                    <VideoIcon className="w-6 h-6 text-white/40" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                  </div>
                                </div>
                                {video.duration && (
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-black text-white">
                                    {video.duration}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-navy truncate max-w-[200px]" title={video.original_name}>
                                {video.original_name || video.filename}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                  {video.file_type?.toUpperCase() || 'VIDEO'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: {video.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  {video.uploader?.avatar ? (
                                    <img 
                                      src={video.uploader.avatar} 
                                      alt={video.uploader.name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary uppercase">
                                      {video.uploader?.name.charAt(0) || 'U'}
                                    </div>
                                  )}
                                  <p className="text-xs font-bold text-gray-700">{video.uploader?.name || 'Unknown'}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-primary" /> 
                                    {new Date(video.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <VideoIcon className="w-3.5 h-3.5 text-info" /> 
                                    {video.size_formatted}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-navy transition-all shadow-sm border border-transparent hover:border-gray-100" 
                                  title="Play Video"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6 text-gray-200">
                      <VideoIcon className="w-12 h-12" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Video Vault Empty</p>
                    <p className="text-gray-500 font-medium mt-2">No videos found in this group.</p>
                  </div>
                )
              )}
            </div>
          )}


        </div>

      
      </div>

      {/* Governance Intervention Modal */}
      <AnimatePresence>
        {isModerationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModerationModalOpen(false)} className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-[48px] overflow-hidden shadow-2xl p-12 text-center">
              <button
                onClick={() => setIsModerationModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-24 h-24 bg-danger/10 text-danger rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-danger/5">
                <Shield className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-navy tracking-tight mb-3">Governance Alert</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-10">
                Apply restrictive protocols to reported collective? This halts all public visibility immediately.
              </p>
              <div className="space-y-3">
                <button className="w-full py-5 bg-danger text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-danger/30 transition-all">
                  Freeze Entity Logic
                </button>
                <button
                  onClick={() => setIsModerationModalOpen(false)}
                  className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:text-navy transition-all"
                >
                  Dismiss Intelligence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Purge Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-[48px] overflow-hidden shadow-2xl p-12 text-center">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-24 h-24 bg-danger/10 text-danger rounded-[40px] flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-navy tracking-tight mb-3">Confirm Delete</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-10">
                Decommission <span className="text-navy font-black">{group.name}</span> permanently? This action is irreversible.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmDeleteGroup}
                  className="w-full py-5 bg-danger text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-danger/30 transition-all"
                >
                  Confirm Decommission
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-5 text-gray-400 font-bold text-sm hover:text-navy transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedImage(null)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative z-10 w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side - Image Preview */}
              <div className="flex-1 bg-[#1a2332] flex items-center justify-center p-8 relative">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.filename}
                  className="max-w-full max-h-full object-contain rounded-lg" 
                />
              </div>

              {/* Right Side - Details Panel */}
              <div className="w-[380px] bg-white flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Images className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate" title={selectedImage.filename}>
                        {selectedImage.filename}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Photo ID: {selectedImage.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedImage(null)} 
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Photographer Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Photographer</h4>
                      <div className="flex items-center gap-3">
                        {selectedImage.photographer.avatar ? (
                          <img 
                            src={selectedImage.photographer.avatar} 
                            alt={selectedImage.photographer.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                            {selectedImage.photographer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{selectedImage.photographer.name}</p>
                          <p className="text-xs text-gray-500">ID: {selectedImage.photographer.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* File Information */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">File Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Format</span>
                          <span className="text-sm font-semibold text-gray-900 uppercase">{selectedImage.format}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Size</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedImage.size_formatted}</span>
                        </div>
                        {selectedImage.width && selectedImage.height && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Dimensions</span>
                            <span className="text-sm font-semibold text-gray-900">{selectedImage.width} × {selectedImage.height}</span>
                          </div>
                        )}
                        {selectedImage.resolution && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Resolution</span>
                            <span className="text-sm font-semibold text-gray-900">{selectedImage.resolution}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Details */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upload Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Uploaded</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(selectedImage.uploaded_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })} at {new Date(selectedImage.uploaded_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Created</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(selectedImage.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    {(selectedImage.likes_count > 0 || selectedImage.comments_count > 0) && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Engagement</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Likes</p>
                            <p className="text-xl font-bold text-blue-600">{selectedImage.likes_count}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Comments</p>
                            <p className="text-xl font-bold text-purple-600">{selectedImage.comments_count}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedImage.tags && selectedImage.tags.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedImage.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {selectedImage.metadata && selectedImage.metadata.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Metadata</h4>
                        <div className="space-y-2">
                          {selectedImage.metadata.map((meta: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{meta.key}</span>
                              <span className="font-medium text-gray-900">{meta.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 space-y-2 bg-gray-50">
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Original
                  </a>
                  <button
                    onClick={() => {
                      handleDeletePhoto(selectedImage.id);
                      setSelectedImage(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Photo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Member Confirmation Modal */}
      <AnimatePresence>
        {showRemoveMemberModal && memberToRemove && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowRemoveMemberModal(false)} 
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-[48px] overflow-hidden shadow-2xl p-12 text-center"
            >
              <button
                onClick={() => {
                  setShowRemoveMemberModal(false);
                  setMemberToRemove(null);
                }}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-24 h-24 bg-danger/10 text-danger rounded-[40px] flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-12 h-12" />
              </div>
              
              <h3 className="text-3xl font-black text-navy tracking-tight mb-3">Remove Member</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-10">
                Are you sure you want to remove <span className="text-navy font-black">{memberToRemove.name}</span> from this group? This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmRemoveMember}
                  className="w-full py-5 bg-danger text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-danger/30 transition-all"
                >
                  Confirm Removal
                </button>
                <button
                  onClick={() => {
                    setShowRemoveMemberModal(false);
                    setMemberToRemove(null);
                  }}
                  className="w-full py-5 text-gray-400 font-bold text-sm hover:text-navy transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowInviteModal(false)} 
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black text-navy tracking-tight mb-2 text-center">Invite Member</h3>
              <p className="text-gray-500 font-medium text-center mb-6">
                Add a new member to this group
              </p>
              
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Select User *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all"
                      placeholder="Search users by name or email..."
                    />
                    {showUserDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {users
                          .filter(user => {
                            // Don't show users already in the group
                            return !group?.participants?.some(p => p.id === user.id);
                          })
                          .filter(user => {
                            // Filter by search term if provided
                            if (!userSearchTerm) return true;
                            const searchLower = userSearchTerm.toLowerCase();
                            // Build user name with null safety
                            const firstName = user.first_name || '';
                            const lastName = user.last_name || '';
                            const fullName = `${firstName} ${lastName}`.trim();
                            const userName = (user.name || fullName || 'Unknown').toLowerCase();
                            const userEmail = (user.email || '').toLowerCase();
                            return (
                              userName.includes(searchLower) ||
                              userEmail.includes(searchLower)
                            );
                          })
                          .slice(0, 10)
                          .map(user => {
                            // Build user name with null safety
                            const firstName = user.first_name || '';
                            const lastName = user.last_name || '';
                            const fullName = `${firstName} ${lastName}`.trim();
                            const userName = user.name || fullName || 'Unknown';
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setInviteForm({ ...inviteForm, user_id: user.id });
                                  setUserSearchTerm(userName);
                                  setSelectedUserName(userName);
                                  setShowUserDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  {user.avatar ? (
                                    <img 
                                      src={user.avatar} 
                                      alt={userName}
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-navy truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        {users.filter(user => {
                          // Don't show users already in the group
                          if (group?.participants?.some(p => p.id === user.id)) return false;
                          
                          // Filter by search term if provided
                          if (!userSearchTerm) return true;
                          const searchLower = userSearchTerm.toLowerCase();
                          // Build user name with null safety
                          const firstName = user.first_name || '';
                          const lastName = user.last_name || '';
                          const fullName = `${firstName} ${lastName}`.trim();
                          const userName = (user.name || fullName || 'Unknown').toLowerCase();
                          const userEmail = (user.email || '').toLowerCase();
                          return (
                            userName.includes(searchLower) ||
                            userEmail.includes(searchLower)
                          );
                        }).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {userSearchTerm ? 'No users found' : 'All users are already members'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {inviteForm.user_id > 0 && selectedUserName && (
                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Selected: <strong>{selectedUserName}</strong></span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Role *</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="owner">Owner</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setUserSearchTerm('');
                      setSelectedUserName('');
                      setShowUserDropdown(false);
                      setInviteForm({ user_id: 0, role: 'member' });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!inviteForm.user_id}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
