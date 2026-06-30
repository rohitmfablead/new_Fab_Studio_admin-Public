import React, { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Lock,
  Bell,
  Globe,
  Camera,
  Save,
  ChevronRight,
  ShieldAlert,
  User,
  Mail,
  Database,
  HardDrive,
  Zap,
  ShieldCheck,
  Layout,
  Clock,
  Languages,
  Server,
  Cloud,
  FileCode,
  Shield,
  Activity,
  Key,
  KeyRound,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  MessageSquare,
  Send,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchSystemSettings,
  updateSystemSettings,
} from "../store/slices/settingsSlice";
import { showSuccess, showError } from "@/src/lib/toast";
import { clearCurrentGroup } from "../store/slices/groupsSlice";

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, error, isUpdating } = useAppSelector(
    (state) => state.settings,
  );

  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    professional_title: "",
    executive_region: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [generalForm, setGeneralForm] = useState({
    platform_name: "",
    default_language: "en",
    system_timezone: "UTC",
    date_format: "YYYY-MM-DD",
    maintenance_mode: "0",
    admin_email: "",
  });

  const [brandingForm, setBrandingForm] = useState({
    logo_url: "",
    platform_logo: null as string | null,
    favicon: null as string | null,
    primary_color: "#007bff",
  });

  const [platformLogoFile, setPlatformLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [platformLogoPreview, setPlatformLogoPreview] = useState<string | null>(
    null,
  );
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const [smtpForm, setSmtpForm] = useState({
    mail_host: "",
    mail_port: 587,
    mail_username: "",
    mail_password: "",
    mail_from_address: "",
    mail_from_name: "",
    mail_encryption: "tls",
    admin_email: "",
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    push_notifications: true,
  });

  const [testEmail, setTestEmail] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // WhatsApp settings form
  const [whatsappForm, setWhatsappForm] = useState({
    name: "",
    access_token: "",
    phone_number_id: "",
    business_id: "",
    whatsapp_number: "",
    is_active: false,
  });

  const [isWhatsappEditingEnabled, setIsWhatsappEditingEnabled] =
    useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [whatsappSubTab, setWhatsappSubTab] = useState("api"); // 'api' or 'templates'
  const [testPhone, setTestPhone] = useState("");
  const [isSendingTestWhatsApp, setIsSendingTestWhatsApp] = useState(false);

  // Password change form
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [pwShow, setPwShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [pwStatus, setPwStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [pwLoading, setPwLoading] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  // Update form states when settings are loaded
  useEffect(() => {
    if (settings) {
      if (settings.profile) {
        setProfileForm({
          first_name: settings.profile.first_name || "",
          last_name: settings.profile.last_name || "",
          email: settings.profile.email || "",
          professional_title: settings.profile.professional_title || "",
          executive_region: settings.profile.executive_region || "",
          bio: settings.profile.bio || "",
        });
      }

      if (settings.general) {
        setGeneralForm({
          platform_name: settings.general.platform_name || "",
          default_language: settings.general.default_language || "en",
          system_timezone: settings.general.system_timezone || "UTC",
          date_format: settings.general.date_format || "YYYY-MM-DD",
          maintenance_mode: settings.general.maintenance_mode || "0",
          admin_email: settings.general.admin_email || "",
        });
      }

      if (settings.branding) {
        setBrandingForm({
          logo_url: settings.branding.logo_url || "",
          platform_logo: settings.branding.platform_logo || null,
          favicon: settings.branding.favicon || null,
          primary_color: settings.branding.primary_color || "#007bff",
        });
      }

      if (settings.notifications?.smtp_settings) {
        setSmtpForm({
          mail_host: settings.notifications.smtp_settings.host || "",
          mail_port: settings.notifications.smtp_settings.port || 587,
          mail_username: settings.notifications.smtp_settings.username || "",
          mail_password: settings.notifications.smtp_settings.password || "",
          mail_from_address:
            settings.notifications.smtp_settings.from_address || "",
          mail_from_name: settings.notifications.smtp_settings.from_name || "",
          mail_encryption:
            settings.notifications.smtp_settings.encryption || "tls",
          admin_email: settings.notifications.smtp_settings.to_admin || "",
        });
      }

      if (settings.notifications) {
        setNotificationPrefs({
          email_notifications:
            settings.notifications.email_notifications ?? true,
          push_notifications: settings.notifications.push_notifications ?? true,
        });
      }

      if (settings.whatsapp) {
        setWhatsappForm({
          name: settings.whatsapp.name || "",
          access_token: settings.whatsapp.access_token || "",
          phone_number_id: settings.whatsapp.phone_number_id || "",
          business_id: settings.whatsapp.business_id || "",
          whatsapp_number: settings.whatsapp.whatsapp_number || "",
          is_active: settings.whatsapp.is_active ?? false,
        });
        setIsWhatsappEditingEnabled(settings.whatsapp.is_active ?? false);
      }
    }
  }, [settings]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("File size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setImageError(false); // Reset error state on new upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const errors: Record<string, string> = {};
    if (!profileForm.first_name.trim()) errors.first_name = "First name is required";
    if (!profileForm.last_name.trim()) errors.last_name = "Last name is required";
    if (!profileForm.professional_title.trim()) errors.professional_title = "Title is required";
    if (!profileForm.executive_region.trim()) errors.executive_region = "Region is required";
    if (!profileForm.bio.trim()) errors.bio = "Bio is required";

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      showError("Please fill in all required fields");
      return;
    }

    setProfileErrors({});
    setIsSavingProfile(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("first_name", profileForm.first_name);
        formData.append("last_name", profileForm.last_name);
        formData.append("email", profileForm.email);
        formData.append("professional_title", profileForm.professional_title);
        formData.append("executive_region", profileForm.executive_region);
        formData.append("bio", profileForm.bio);
        formData.append("avatar", avatarFile);
        formData.append("_method", "PUT");

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "https://api.fabphotopic.com"}/admin/settings/profile`,
          {
            method: "post",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: formData,
          },
        );
        const result = await response.json();
        if (result.success) {
          showSuccess("Profile updated successfully!");
          dispatch(fetchSystemSettings());
          setAvatarFile(null);
          setAvatarPreview(null);
        } else {
          showError(result.message || "Failed to update profile");
        }
      } else {
        await dispatch(
          updateSystemSettings({
            profile: profileForm,
          }),
        ).unwrap();
        showSuccess("Profile updated successfully!");
      }
    } catch (error: any) {
      showError(error?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      await dispatch(
        updateSystemSettings({
          general: generalForm,
        }),
      ).unwrap();
      showSuccess("General settings updated successfully!");
    } catch (error: any) {
      showError(error?.message || "Failed to update settings");
    }
  };

  const handleToggleMaintenanceMode = async () => {
    const previousValue = generalForm.maintenance_mode;
    const nextValue = previousValue === "1" ? "0" : "1";

    setGeneralForm((prev) => ({ ...prev, maintenance_mode: nextValue }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.fabphotopic.com"}/admin/is-live/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            is_live: nextValue === "0" // true if going live, false if maintenance mode
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // API returns is_live: false when maintenance mode is ON
        const newMaintenanceMode = result.is_live ? "0" : "1";
        setGeneralForm((prev) => ({ ...prev, maintenance_mode: newMaintenanceMode }));
        showSuccess(result.message || "Maintenance mode updated");
      } else {
        setGeneralForm((prev) => ({ ...prev, maintenance_mode: previousValue }));
        showError(result.message || "Failed to update maintenance mode");
      }
    } catch (error: any) {
      setGeneralForm((prev) => ({ ...prev, maintenance_mode: previousValue }));
      showError(error?.message || "Failed to update maintenance mode");
    }
  };

  const handlePlatformLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPlatformLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlatformLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    try {
      setIsSavingBranding(true);
      const formData = new FormData();

      // Add text fields
      formData.append("logo_url", brandingForm.logo_url);
      formData.append("primary_color", brandingForm.primary_color);
      formData.append("_method", "PUT");

      // Add file uploads if selected
      if (platformLogoFile) {
        formData.append("platform_logo", platformLogoFile);
      }
      if (faviconFile) {
        formData.append("favicon", faviconFile);
      }

      // Call API with FormData using PUT method
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.fabphotopic.com"}/admin/settings/branding`,
        {
          method: "post",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (result.success) {
        showSuccess("Branding settings updated successfully!");
        // Refresh settings to get updated URLs
        dispatch(fetchSystemSettings());
        // Clear file states
        setPlatformLogoFile(null);
        setFaviconFile(null);
        setPlatformLogoPreview(null);
        setFaviconPreview(null);
      } else {
        showError(result.message || "Failed to update branding");
      }
    } catch (error: any) {
      showError(error?.message || "Failed to update branding");
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await dispatch(
        updateSystemSettings({
          notifications: {
            ...notificationPrefs,
            smtp_settings: {
              host: smtpForm.mail_host,
              port: Number(smtpForm.mail_port),
              username: smtpForm.mail_username,
              password: smtpForm.mail_password,
              from_address: smtpForm.mail_from_address,
              from_name: smtpForm.mail_from_name,
              encryption: smtpForm.mail_encryption,
              to_admin: smtpForm.admin_email,
            },
          },
        }),
      ).unwrap();
      showSuccess("Notification settings updated successfully!");
    } catch (error: any) {
      showError(error?.message || "Failed to update settings");
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      showError("Please enter a test email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      showError("Please enter a valid email address");
      return;
    }

    try {
      setIsSendingTestEmail(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.fabphotopic.com"}/admin/settings/email/test`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            test_email: testEmail,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        showSuccess(`Test email sent successfully to ${testEmail}!`);
        setTestEmail(""); // Clear input after success
      } else {
        showError(result.message || "Failed to send test email");
      }
    } catch (error: any) {
      showError(error?.message || "Failed to send test email");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    try {
      await dispatch(
        updateSystemSettings({
          whatsapp: whatsappForm,
        }),
      ).unwrap();
      showSuccess("WhatsApp settings updated successfully!");
    } catch (error: any) {
      showError(error?.message || "Failed to update WhatsApp settings");
    }
  };

  const handleSendTestWhatsApp = async () => {
    if (!testPhone.trim()) {
      showError("Please enter a phone number with country code");
      return;
    }
    try {
      setIsSendingTestWhatsApp(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.fabphotopic.com"}/admin/settings/whatsapp/test`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: testPhone.trim(),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        showSuccess(`Test OTP sent successfully to ${testPhone}!`);
        setTestPhone("");
      } else {
        showError(result.message || "Failed to send test OTP");
      }
    } catch (error: any) {
      showError(error?.message || "Failed to send test OTP");
    } finally {
      setIsSendingTestWhatsApp(false);
    }
  };

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous status
    setPwStatus(null);

    // Validation
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwStatus({
        type: "error",
        message: "New password and confirm password do not match",
      });
      return;
    }

    if (pwForm.new_password.length < 8) {
      setPwStatus({
        type: "error",
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    try {
      setPwLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.fabphotopic.com"}/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: pwForm.current_password,
            new_password: pwForm.new_password,
            confirm_password: pwForm.confirm_password,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setPwStatus({
          type: "success",
          message: "Password changed successfully!",
        });
        showSuccess("Password changed successfully!");
        // Clear form
        setPwForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        // Clear status after 5 seconds
        setTimeout(() => setPwStatus(null), 5000);
      } else {
        setPwStatus({
          type: "error",
          message: result.message || "Failed to change password",
        });
      }
    } catch (error: any) {
      setPwStatus({
        type: "error",
        message: error?.message || "Failed to change password",
      });
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User, color: "text-primary" },
    {
      id: "general",
      label: "General Settings",
      icon: Globe,
      color: "text-success",
    },
    // {
    //   id: "branding",
    //   label: "Branding & UI",
    //   icon: Palette,
    //   color: "text-primary",
    // },
    {
      id: "notifications",
      label: "Email & Alerts",
      icon: Bell,
      color: "text-primary",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Config",
      icon: MessageSquare,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">
          Configure your platform identity, security and global rules.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            Loading Settings
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-2">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-navy uppercase tracking-tight">
            Failed to Load Settings
          </h3>
          <p className="text-gray-500 font-medium max-w-xs">{error}</p>
          <button
            onClick={() => dispatch(fetchSystemSettings())}
            className="mt-4 px-6 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Navigation Sidebar */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl font-bold text-sm transition-all text-left",
                  activeTab === tab.id
                    ? "bg-navy text-white shadow-xl shadow-navy/20 translate-x-1"
                    : "text-gray-400 hover:bg-white hover:text-navy",
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon
                    className={cn(
                      "w-5 h-5",
                      activeTab === tab.id ? "text-primary" : "text-gray-400",
                    )}
                  />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    activeTab === tab.id
                      ? "rotate-90 opacity-100"
                      : "opacity-0",
                  )}
                />
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  {/* Minimal Executive Header */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-[32px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="premium-card relative overflow-hidden p-0 border-none shadow-lg">
                      <div className="h-32 bg-navy px-8 py-6 flex items-center justify-between relative overflow-hidden">
                        {/* Abstract Design Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24" />

                        <div className="flex items-center gap-6 relative z-10">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl overflow-hidden flex items-center justify-center">
                              {(!imageError && (avatarPreview || settings?.profile?.avatar)) ? (
                                <img
                                  src={avatarPreview || settings?.profile?.avatar}
                                  className="w-full h-full object-cover rounded-xl"
                                  alt="Executive Avatar"
                                  onError={() => setImageError(true)}
                                />
                              ) : (
                                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-2xl">
                                  {`${(profileForm.first_name || 'A').charAt(0)}${(profileForm.last_name || 'A').charAt(0)}`.toUpperCase()}
                                </div>
                              )}
                            </div>
                            <label 
                              className={cn(
                                "absolute -bottom-1.5 -right-1.5 p-2 bg-primary text-white rounded-lg shadow-lg border-2 border-navy transition-transform cursor-pointer z-20",
                                (isSavingProfile || isUpdating) ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
                              )}
                            >
                              <Camera className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={isSavingProfile || isUpdating}
                              />
                            </label>
                          </div>
                          <div>
                            <h3 className="text-4xl font-black text-white tracking-tight">
                              {profileForm.first_name} {profileForm.last_name}
                            </h3>
                            <p className="text-primary font-bold tracking-widest uppercase text-xs mt-2 flex items-center gap-2">
                              {profileForm.professional_title ||
                                "Professional Title"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              First Name
                            </label>
                            <div className="flex items-center gap-3 border-b border-gray-100 py-3 focus-within:border-primary transition-colors">
                              <User className="w-4 h-4 text-gray-300" />
                              <input
                                type="text"
                                value={profileForm.first_name}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    first_name: e.target.value,
                                  })
                                }
                                disabled={isUpdating}
                                className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none disabled:opacity-50"
                              />
                            </div>
                            {profileErrors.first_name && (
                              <p className="text-xs text-danger font-medium mt-1">{profileErrors.first_name}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Last Name
                            </label>
                            <div className="flex items-center gap-3 border-b border-gray-100 py-3 focus-within:border-primary transition-colors">
                              <User className="w-4 h-4 text-gray-300" />
                              <input
                                type="text"
                                value={profileForm.last_name}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    last_name: e.target.value,
                                  })
                                }
                                disabled={isUpdating}
                                className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none disabled:opacity-50"
                              />
                            </div>
                            {profileErrors.last_name && (
                              <p className="text-xs text-danger font-medium mt-1">{profileErrors.last_name}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Professional Email
                          </label>
                          <div className="flex items-center gap-3 border-b border-gray-100 py-3 opacity-50 cursor-not-allowed">
                            <Mail className="w-4 h-4 text-gray-300" />
                            <input
                              type="email"
                              value={profileForm.email}
                              disabled
                              readOnly
                              className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none cursor-not-allowed"
                            />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 ml-1">
                            Email cannot be changed
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Professional Title
                            </label>
                            <div className="flex items-center gap-3 border-b border-gray-100 py-2 focus-within:border-primary transition-colors">
                              <ShieldAlert className="w-4 h-4 text-gray-300" />
                              <input
                                type="text"
                                value={profileForm.professional_title}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    professional_title: e.target.value,
                                  })
                                }
                                disabled={isUpdating}
                                className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none disabled:opacity-50"
                              />
                            </div>
                            {profileErrors.professional_title && (
                              <p className="text-xs text-danger font-medium mt-1">{profileErrors.professional_title}</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Executive Region
                            </label>
                            <div className="flex items-center gap-3 border-b border-gray-100 py-2 focus-within:border-primary transition-colors">
                              <Globe className="w-4 h-4 text-gray-300" />
                              <input
                                type="text"
                                value={profileForm.executive_region}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    executive_region: e.target.value,
                                  })
                                }
                                disabled={isUpdating}
                                className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none disabled:opacity-50"
                              />
                            </div>
                            {profileErrors.executive_region && (
                              <p className="text-xs text-danger font-medium mt-1">{profileErrors.executive_region}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Strategic Focus & Bio
                          </label>
                          <textarea
                            value={profileForm.bio}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                bio: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 min-h-[140px] focus:outline-none focus:border-primary/40 focus:bg-white transition-all resize-none leading-relaxed disabled:opacity-50"
                          />
                          {profileErrors.bio && (
                            <p className="text-xs text-danger font-medium mt-1">{profileErrors.bio}</p>
                          )}
                        </div>

                        {/* Save Button at bottom */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                          <button
                            onClick={handleSaveProfile}
                            disabled={isUpdating || isSavingProfile}
                            className="btn-primary px-10 py-4 shadow-xl shadow-primary/20 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating || isSavingProfile ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-black uppercase tracking-widest text-sm">
                                  Updating...
                                </span>
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span className="font-black uppercase tracking-widest text-sm">
                                  Update Profile
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Change Password Section */}
                  <div className="premium-card p-10 border-t-4 border-t-primary space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <KeyRound className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-navy">
                          Change Password
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">
                          Update your account password. Use at least 8
                          characters.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Current Password
                          </label>
                          <div className="flex items-center gap-3 border-b border-gray-100 py-3 focus-within:border-primary transition-colors">
                            <Lock className="w-4 h-4 text-gray-300 shrink-0" />
                            <input
                              type={pwShow.current ? "text" : "password"}
                              name="current_password"
                              value={pwForm.current_password}
                              onChange={handlePwChange}
                              placeholder="••••••••"
                              required
                              className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none placeholder:font-normal placeholder:text-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPwShow((s) => ({
                                  ...s,
                                  current: !s.current,
                                }))
                              }
                              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                            >
                              {pwShow.current ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            New Password
                          </label>
                          <div className="flex items-center gap-3 border-b border-gray-100 py-3 focus-within:border-primary transition-colors">
                            <Key className="w-4 h-4 text-gray-300 shrink-0" />
                            <input
                              type={pwShow.new ? "text" : "password"}
                              name="new_password"
                              value={pwForm.new_password}
                              onChange={handlePwChange}
                              placeholder="••••••••"
                              required
                              className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none placeholder:font-normal placeholder:text-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPwShow((s) => ({ ...s, new: !s.new }))
                              }
                              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                            >
                              {pwShow.new ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Confirm New Password
                          </label>
                          <div className="flex items-center gap-3 border-b border-gray-100 py-3 focus-within:border-primary transition-colors">
                            <ShieldCheck className="w-4 h-4 text-gray-300 shrink-0" />
                            <input
                              type={pwShow.confirm ? "text" : "password"}
                              name="confirm_password"
                              value={pwForm.confirm_password}
                              onChange={handlePwChange}
                              placeholder="••••••••"
                              required
                              className="w-full bg-transparent border-none text-sm font-bold text-navy focus:outline-none placeholder:font-normal placeholder:text-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPwShow((s) => ({
                                  ...s,
                                  confirm: !s.confirm,
                                }))
                              }
                              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                            >
                              {pwShow.confirm ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Status Message */}
                      <AnimatePresence>
                        {pwStatus && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className={cn(
                              "flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold",
                              pwStatus.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-red-50 text-red-600 border border-red-100",
                            )}
                          >
                            {pwStatus.type === "success" ? (
                              <Check className="w-4 h-4 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 shrink-0" />
                            )}
                            {pwStatus.message}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={pwLoading}
                          className="btn-primary px-10 py-3 flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {pwLoading ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          <span className="font-black uppercase tracking-widest text-sm">
                            {pwLoading ? "Updating..." : "Update Password"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="premium-card p-10 space-y-10 border-t-4 border-t-success"
                >
                  <section className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold">
                          Platform Configuration
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">
                          Global environment variables and localized settings.
                        </p>
                      </div>
                      {/* <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 border rounded-2xl transition-all",
                          generalForm.maintenance_mode === "1"
                            ? "bg-amber/10 border-amber/30"
                            : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <div className="flex flex-col items-start">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              generalForm.maintenance_mode === "1"
                                ? "text-amber"
                                : "text-gray-400",
                            )}
                          >
                            Maintenance Mode
                          </span>
                          <span className="text-[8px] font-bold text-gray-400">
                            {generalForm.maintenance_mode === "1"
                              ? "Site is offline"
                              : "Site is live"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleMaintenanceMode}
                          disabled={isUpdating}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all disabled:opacity-50",
                            generalForm.maintenance_mode === "1"
                              ? "bg-amber shadow-lg shadow-amber/30"
                              : "bg-gray-300",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                              generalForm.maintenance_mode === "1"
                                ? "right-1"
                                : "left-1",
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleMaintenanceMode}
                          disabled={isUpdating}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                            generalForm.maintenance_mode === "1"
                              ? "bg-success/10 text-success hover:bg-success/15"
                              : "bg-amber/10 text-amber hover:bg-amber/15",
                          )}
                        >
                          {generalForm.maintenance_mode === "1"
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </div> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={generalForm.platform_name}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              platform_name: e.target.value,
                            })
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          value={generalForm.admin_email}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              admin_email: e.target.value,
                            })
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          System Timezone
                        </label>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <select
                            value={generalForm.system_timezone}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                system_timezone: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            className="w-full bg-transparent border-none text-sm font-bold text-navy focus:ring-0 disabled:opacity-50"
                          >
                            <option value="America/Los_Angeles">
                              (GMT-08:00) Pacific Time (US & Canada)
                            </option>
                            <option value="UTC">(GMT+00:00) UTC</option>
                            <option value="Asia/Kolkata">
                              (GMT+05:30) Mumbai, New Delhi
                            </option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Date Format
                        </label>
                        <select
                          value={generalForm.date_format}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              date_format: e.target.value,
                            })
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Default Language
                        </label>
                        <select
                          value={generalForm.default_language}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              default_language: e.target.value,
                            })
                          }
                          disabled={isUpdating}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                        >
                          <option value="en">English (United States)</option>
                          <option value="es">Spanish (ES)</option>
                          <option value="hi">Hindi (IN)</option>
                          <option value="fr">French (FR)</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <div className="pt-10 border-t border-gray-50 flex justify-end gap-3">
                    <button
                      onClick={() => dispatch(fetchSystemSettings())}
                      disabled={isUpdating}
                      className="px-8 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-navy transition-colors disabled:opacity-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveGeneral}
                      disabled={isUpdating}
                      className="btn-primary px-10 flex items-center gap-2 bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Apply Configuration</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              /* {activeTab === "branding" && (
                <motion.div
                  key="branding"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="premium-card p-10 space-y-12 border-t-4 border-t-primary"
                >
                  <section className="space-y-6">
                    <h4 className="text-xl font-bold">Visual Identity</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Logo URL
                        </label>
                        <input
                          type="text"
                          value={brandingForm.logo_url}
                          onChange={(e) =>
                            setBrandingForm({
                              ...brandingForm,
                              logo_url: e.target.value,
                            })
                          }
                          disabled={isSavingBranding}
                          placeholder="https://example.com/logo.svg"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-primary/20 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={brandingForm.primary_color}
                            onChange={(e) =>
                              setBrandingForm({
                                ...brandingForm,
                                primary_color: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            className="w-16 h-12 rounded-xl border border-gray-100 cursor-pointer disabled:opacity-50"
                          />
                          <input
                            type="text"
                            value={brandingForm.primary_color}
                            onChange={(e) =>
                              setBrandingForm({
                                ...brandingForm,
                                primary_color: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="#007bff"
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-primary/20 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                            {platformLogoPreview ? (
                              <img
                                src={platformLogoPreview}
                                alt="Platform Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            ) : brandingForm.platform_logo ? (
                              <img
                                src={brandingForm.platform_logo}
                                alt="Platform Logo"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Zap className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="font-bold text-navy">Platform Logo</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              PNG, SVG or WEBP
                            </p>
                            {platformLogoFile && (
                              <p className="text-[10px] text-success font-bold mt-1">
                                ✓ {platformLogoFile.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <label className="block">
                          <input
                            type="file"
                            accept="image/png,image/svg+xml,image/webp,image/jpeg"
                            onChange={handlePlatformLogoChange}
                            disabled={isSavingBranding}
                            className="hidden"
                            id="platform-logo-upload"
                          />
                          <label
                            htmlFor="platform-logo-upload"
                            className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <Camera className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs font-black text-primary uppercase">
                              Upload Image
                            </span>
                          </label>
                        </label>
                      </div>

                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                            {faviconPreview ? (
                              <img
                                src={faviconPreview}
                                alt="Favicon Preview"
                                className="w-full h-full object-contain"
                              />
                            ) : brandingForm.favicon ? (
                              <img
                                src={brandingForm.favicon}
                                alt="Favicon"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Layout className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="font-bold text-navy">Favicon</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              32x32 ico/png
                            </p>
                            {faviconFile && (
                              <p className="text-[10px] text-success font-bold mt-1">
                                ✓ {faviconFile.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <label className="block">
                          <input
                            type="file"
                            accept="image/x-icon,image/png,image/jpeg"
                            onChange={handleFaviconChange}
                            disabled={isSavingBranding}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <label
                            htmlFor="favicon-upload"
                            className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <Camera className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs font-black text-primary uppercase">
                              Upload Icon
                            </span>
                          </label>
                        </label>
                      </div>
                    </div>
                  </section>

                  <div className="pt-10 border-t border-gray-50 flex justify-end gap-3">
                    <button
                      onClick={() => dispatch(fetchSystemSettings())}
                      disabled={isSavingBranding}
                      className="px-8 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-navy transition-colors disabled:opacity-50"
                    >
                      Reset Defaults
                    </button>
                    <button
                      onClick={handleSaveBranding}
                      disabled={isSavingBranding}
                      className="btn-primary px-10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingBranding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Commit Branding</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )} */

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="premium-card p-10 space-y-12 border-t-4 border-t-primary"
                >
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <Server className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">
                          SMTP Configuration
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">
                          Outbound mail server architecture.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            SMTP Host
                          </label>
                          <input
                            type="text"
                            value={smtpForm.mail_host}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_host: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="smtp.provider.com"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Port
                          </label>
                          <input
                            type="number"
                            value={smtpForm.mail_port}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_port: Number(e.target.value),
                              })
                            }
                            disabled={isUpdating}
                            placeholder="587"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Username
                          </label>
                          <input
                            type="text"
                            value={smtpForm.mail_username}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_username: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="your-email@example.com"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Password
                          </label>
                          <input
                            type="password"
                            value={smtpForm.mail_password}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_password: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            From Address
                          </label>
                          <input
                            type="email"
                            value={smtpForm.mail_from_address}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_from_address: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="noreply@example.com"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            From Name
                          </label>
                          <input
                            type="text"
                            value={smtpForm.mail_from_name}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_from_name: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="FabPhotopic"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            To Admin Email
                          </label>
                          <input
                            type="email"
                            value={smtpForm.admin_email}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                admin_email: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            placeholder="admin@example.com"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Encryption
                          </label>
                          <select
                            value={smtpForm.mail_encryption}
                            onChange={(e) =>
                              setSmtpForm({
                                ...smtpForm,
                                mail_encryption: e.target.value,
                              })
                            }
                            disabled={isUpdating}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy disabled:opacity-50"
                          >
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-6 bg-navy text-white rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                        <Zap className="w-8 h-8 text-primary mb-2" />
                        <h5 className="text-xs font-black uppercase tracking-[0.2em]">
                          Test SMTP Connection
                        </h5>
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          disabled={isSendingTestEmail}
                          placeholder="test@example.com"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-white/50 focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                        <button
                          onClick={handleSendTestEmail}
                          disabled={isSendingTestEmail}
                          className="w-full px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSendingTestEmail ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Send Test Email</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">
                      Notification Prefs
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-sm font-bold text-navy">
                            Email Notifications
                          </p>
                          <p className="text-[10px] font-medium text-gray-400">
                            Notify admins of critical system spikes.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              email_notifications:
                                !notificationPrefs.email_notifications,
                            })
                          }
                          disabled={isUpdating}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors disabled:opacity-50",
                            notificationPrefs.email_notifications
                              ? "bg-primary"
                              : "bg-gray-200",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                              notificationPrefs.email_notifications
                                ? "right-1"
                                : "left-1",
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-sm font-bold text-navy">
                            Push Notifications
                          </p>
                          <p className="text-[10px] font-medium text-gray-400">
                            Real-time browser notifications for alerts.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              push_notifications:
                                !notificationPrefs.push_notifications,
                            })
                          }
                          disabled={isUpdating}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors disabled:opacity-50",
                            notificationPrefs.push_notifications
                              ? "bg-primary"
                              : "bg-gray-200",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                              notificationPrefs.push_notifications
                                ? "right-1"
                                : "left-1",
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </section>

                  <div className="pt-10 border-t border-gray-50 flex justify-end gap-3">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={isUpdating}
                      className="btn-primary px-10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Commit Protocols</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "whatsapp" && (
                <motion.div
                  key="whatsapp"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="premium-card p-10 border-t-4 border-t-success space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-success/10 rounded-xl">
                          <MessageSquare className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-navy">
                            WhatsApp Configuration
                          </h4>
                          <p className="text-sm text-gray-400 font-medium">
                            Manage automated WhatsApp API gateways and message
                            templates.
                          </p>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 border rounded-2xl transition-all shrink-0 self-start md:self-auto",
                          whatsappForm.is_active
                            ? "bg-success/10 border-success/30"
                            : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <div className="flex flex-col items-start">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              whatsappForm.is_active
                                ? "text-success"
                                : "text-gray-400",
                            )}
                          >
                            Service Status
                          </span>
                          <span className="text-[8px] font-bold text-gray-400 font-mono">
                            {whatsappForm.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setWhatsappForm({
                              ...whatsappForm,
                              is_active: !whatsappForm.is_active,
                            })
                          }
                          disabled={isUpdating}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all disabled:opacity-50",
                            whatsappForm.is_active
                              ? "bg-success shadow-lg shadow-success/30"
                              : "bg-gray-300",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                              whatsappForm.is_active ? "right-1" : "left-1",
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* API Credentials Fields */}
                    <motion.div
                      key="api-credentials"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Name - Required */}
                        {/* <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Credential Name{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={whatsappForm.name}
                            onChange={(e) =>
                              setWhatsappForm({
                                ...whatsappForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="e.g. whasapp_devloper"
                            disabled={isUpdating}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                          />
                        </div> */}

                        {/* Access Token - Full Width with Eye Toggle */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Access Token <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showAccessToken ? "text" : "password"}
                              value={whatsappForm.access_token}
                              onChange={(e) =>
                                setWhatsappForm({
                                  ...whatsappForm,
                                  access_token: e.target.value,
                                })
                              }
                              placeholder="••••••••••••••••••••••••••••••••"
                              disabled={isUpdating}
                              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowAccessToken(!showAccessToken)
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showAccessToken ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Phone Number ID */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Phone Number ID{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={whatsappForm.phone_number_id}
                            onChange={(e) =>
                              setWhatsappForm({
                                ...whatsappForm,
                                phone_number_id: e.target.value,
                              })
                            }
                            placeholder="534467606409704"
                            disabled={isUpdating}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                          />
                        </div>

                        {/* Business ID */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Business ID <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={whatsappForm.business_id}
                            onChange={(e) =>
                              setWhatsappForm({
                                ...whatsappForm,
                                business_id: e.target.value,
                              })
                            }
                            placeholder="547180221801061"
                            disabled={isUpdating}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                          />
                        </div>

                        {/* WhatsApp Number */}
                        {/* <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            WhatsApp Number{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={whatsappForm.whatsapp_number}
                            onChange={(e) =>
                              setWhatsappForm({
                                ...whatsappForm,
                                whatsapp_number: e.target.value,
                              })
                            }
                            placeholder="919427555696"
                            disabled={isUpdating}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 disabled:opacity-50"
                          />
                        </div> */}
                      </div>
                    </motion.div>

                    {/* Test WhatsApp Section */}
                    <div className="p-6 bg-gray-50/80 border border-gray-100 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <Send className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-navy uppercase tracking-widest">
                            Test WhatsApp
                          </h5>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            Send a test OTP to verify your WhatsApp API
                            connection.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <input
                          type="text"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          disabled={isSendingTestWhatsApp}
                          placeholder="e.g. 919876543210 (with country code)"
                          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-navy focus:ring-2 ring-success/20 focus:outline-none disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={handleSendTestWhatsApp}
                          disabled={isSendingTestWhatsApp || !testPhone.trim()}
                          className="px-6 py-3 bg-success hover:bg-success/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:shrink-0 w-full md:w-auto"
                        >
                          {isSendingTestWhatsApp ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Test</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                      <button
                        onClick={handleSaveWhatsApp}
                        disabled={isUpdating}
                        className="btn-primary px-10 flex items-center gap-2 bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
