import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, put, post } from "../../lib/api";

// Types
export interface ProfileSettings {
  first_name: string;
  last_name: string;
  email: string;
  professional_title: string;
  executive_region: string;
  bio: string;
  avatar?: string;
}

export interface BrandingSettings {
  logo_url: string;
  platform_logo: string | null;
  favicon: string | null;
  primary_color: string;
  _method?: string;
}

export interface GeneralSettings {
  platform_name: string;
  default_language: string;
  system_timezone: string;
  date_format: string;
  maintenance_mode: string; // "0" or "1"
  admin_email: string;
}

export interface SecuritySettings {
  password_min_length: number;
  session_timeout: number;
  max_login_attempts: number;
}

export interface StorageSettings {
  max_file_size: number;
  allowed_formats: string[];
  storage_provider: string;
}

export interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password?: string;
  from_address: string;
  from_name: string;
  encryption: string;
  to_admin: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  smtp_settings: SMTPSettings;
}

export interface WhatsAppSettings {
  name: string;
  description: string;
  access_token: string;
  phone_number_id: string;
  business_id: string;
  whatsapp_number: string;
  is_active: boolean;
}

export interface SystemSettings {
  profile: ProfileSettings;
  general: GeneralSettings;
  branding: BrandingSettings;
  security: SecuritySettings;
  storage: StorageSettings;
  notifications: NotificationSettings;
  whatsapp?: WhatsAppSettings;
}

export interface UpdateSettingsData {
  profile?: Partial<ProfileSettings>;
  general?: Partial<GeneralSettings>;
  branding?: Partial<BrandingSettings>;
  security?: Partial<SecuritySettings>;
  storage?: Partial<StorageSettings>;
  notifications?: Partial<NotificationSettings>;
  whatsapp?: Partial<WhatsAppSettings>;
}

// State
export interface SettingsState {
  settings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Helper function to parse SMTP settings from API response
const parseSMTPSettings = (emailData: any): SMTPSettings => {
  // Check if smtp_settings exists as a JSON string
  if (emailData.smtp_settings && typeof emailData.smtp_settings === "string") {
    try {
      const parsed = JSON.parse(emailData.smtp_settings);
      return {
        host: parsed.host || parsed.mail_host || "",
        port: parsed.port ? Number(parsed.port) : (parsed.mail_port ? Number(parsed.mail_port) : 587),
        username: parsed.username || parsed.mail_username || "",
        password: parsed.password || parsed.mail_password || "",
        from_address: parsed.from_address || parsed.mail_from_address || "",
        from_name: parsed.from_name || parsed.mail_from_name || "",
        encryption: parsed.encryption || parsed.mail_encryption || "tls",
        to_admin: parsed.to_admin || parsed.admin_email || "",
      };
    } catch (e) {
      console.error("Failed to parse smtp_settings JSON:", e);
    }
  }

  // Fallback to flat structure
  return {
    host: emailData.mail_host || emailData.smtp_host || "",
    port: emailData.mail_port ? Number(emailData.mail_port) : (emailData.smtp_port ? Number(emailData.smtp_port) : 587),
    username: emailData.mail_username || emailData.smtp_username || "",
    password: emailData.mail_password || "",
    from_address: emailData.mail_from_address || "",
    from_name: emailData.mail_from_name || "",
    encryption: emailData.mail_encryption || "tls",
    to_admin: emailData.admin_email || "",
  };
};

// Async thunks
export const fetchSystemSettings = createAsyncThunk(
  "settings/fetchSystemSettings",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all settings from different endpoints
      const [profileRes, generalRes, brandingRes, emailRes] = await Promise.all(
        [
          get<any>("/admin/settings/profile"),
          get<any>("/admin/settings/general"),
          get<any>("/admin/settings/branding"),
          get<any>("/admin/settings/email"),
        ],
      );

      let whatsappData: any = {};
      try {
        const whatsappRes = await get<any>("/admin/settings/whatsapp");
        if (whatsappRes && whatsappRes.success && whatsappRes.data) {
          whatsappData = whatsappRes.data;
        }
      } catch (e) {
        console.warn("Failed to fetch whatsapp settings, using defaults:", e);
      }

      // Extract data from flat structure
      const generalData =
        generalRes.success && generalRes.data ? generalRes.data : {};
      const brandingData =
        brandingRes.success && brandingRes.data ? brandingRes.data : {};
      const emailData = emailRes.success && emailRes.data ? emailRes.data : {};

      const settings: SystemSettings = {
        profile:
          profileRes.success && profileRes.data
            ? profileRes.data
            : {
                first_name: "",
                last_name: "",
                email: "",
                professional_title: "",
                executive_region: "",
                bio: "",
              },
        general: {
          platform_name: generalData.platform_name || "",
          default_language: generalData.default_language || "en",
          system_timezone: generalData.system_timezone || "UTC",
          date_format: generalData.date_format || "YYYY-MM-DD",
          maintenance_mode: generalData.maintenance_mode || "0",
          admin_email: generalData.admin_email || "",
        },
        branding: {
          logo_url: brandingData.logo_url || "",
          platform_logo: brandingData.platform_logo || null,
          favicon: brandingData.favicon || null,
          primary_color: brandingData.primary_color || "#007bff",
        },
        security: {
          password_min_length: 8,
          session_timeout: 3600,
          max_login_attempts: 5,
        },
        storage: {
          max_file_size: 10485760,
          allowed_formats: ["jpg", "png", "gif"],
          storage_provider: "local",
        },
        notifications: {
          email_notifications:
            emailData.email_notifications === "1" ||
            emailData.email_notifications === true,
          push_notifications:
            emailData.push_notifications === "1" ||
            emailData.push_notifications === true,
          smtp_settings: parseSMTPSettings(emailData),
        },
        whatsapp: {
          name: whatsappData.name || "",
          description: whatsappData.description || "",
          access_token: whatsappData.access_token || "",
          phone_number_id: whatsappData.phone_number_id || "",
          business_id: whatsappData.business_id || "",
          whatsapp_number: whatsappData.whatsapp_number || "",
          is_active:
            whatsappData.is_active === true || whatsappData.is_active === 1,
        },
      };

      return settings;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch system settings",
      );
    }
  },
);

export const updateSystemSettings = createAsyncThunk(
  "settings/updateSystemSettings",
  async (settingsData: UpdateSettingsData, { rejectWithValue }) => {
    try {
      const promises = [];

      // Update profile settings if provided
      if (settingsData.profile) {
        promises.push(
          put<any>("/admin/settings/profile", settingsData.profile),
        );
      }

      // Update branding settings if provided
      if (settingsData.branding) {
        promises.push(
          put<any>("/admin/settings/branding", settingsData.branding),
        );
      }

      // Update general settings if provided
      if (settingsData.general) {
        promises.push(
          put<any>("/admin/settings/general", settingsData.general),
        );
      }

      // Update email/notification settings if provided
      if (settingsData.notifications) {
        const smtp = settingsData.notifications.smtp_settings;
        const payload = {
          email_notifications: settingsData.notifications.email_notifications ? "1" : "0",
          push_notifications: settingsData.notifications.push_notifications ? "1" : "0",
          smtp_settings: smtp ? {
            host: smtp.host,
            port: smtp.port,
            username: smtp.username,
            password: smtp.password,
            from_address: smtp.from_address,
            from_name: smtp.from_name,
            encryption: smtp.encryption,
            to_admin: smtp.to_admin,
          } : undefined,
          // Flat fields fallback
          mail_host: smtp?.host,
          mail_port: smtp?.port,
          mail_username: smtp?.username,
          mail_password: smtp?.password,
          mail_from_address: smtp?.from_address,
          mail_from_name: smtp?.from_name,
          mail_encryption: smtp?.encryption,
          admin_email: smtp?.to_admin,
        };
        promises.push(
          put<any>("/admin/settings/email", payload),
        );
      }

      // Update whatsapp settings if provided
      if (settingsData.whatsapp) {
        promises.push(
          put<any>("/admin/settings/whatsapp", settingsData.whatsapp).catch(
            (err) => {
              console.warn(
                "WhatsApp settings update endpoint failed, proceeding:",
                err,
              );
              return { success: false, error: err };
            },
          ),
        );
      }

      await Promise.all(promises);

      // Fetch updated settings
      const [profileRes, generalRes, brandingRes, emailRes] = await Promise.all(
        [
          get<any>("/admin/settings/profile"),
          get<any>("/admin/settings/general"),
          get<any>("/admin/settings/branding"),
          get<any>("/admin/settings/email"),
        ],
      );

      let whatsappData: any = {};
      try {
        const whatsappRes = await get<any>("/admin/settings/whatsapp");
        if (whatsappRes && whatsappRes.success && whatsappRes.data) {
          whatsappData = whatsappRes.data;
        }
      } catch (e) {
        console.warn("Failed to fetch whatsapp settings, using defaults:", e);
      }

      // Extract data from flat structure
      const generalData =
        generalRes.success && generalRes.data ? generalRes.data : {};
      const brandingData =
        brandingRes.success && brandingRes.data ? brandingRes.data : {};
      const emailData = emailRes.success && emailRes.data ? emailRes.data : {};

      const settings: SystemSettings = {
        profile:
          profileRes.success && profileRes.data
            ? profileRes.data
            : {
                first_name: "",
                last_name: "",
                email: "",
                professional_title: "",
                executive_region: "",
                bio: "",
              },
        general: {
          platform_name: generalData.platform_name || "",
          default_language: generalData.default_language || "en",
          system_timezone: generalData.system_timezone || "UTC",
          date_format: generalData.date_format || "YYYY-MM-DD",
          maintenance_mode: generalData.maintenance_mode || "0",
          admin_email: generalData.admin_email || "",
        },
        branding: {
          logo_url: brandingData.logo_url || "",
          platform_logo: brandingData.platform_logo || null,
          favicon: brandingData.favicon || null,
          primary_color: brandingData.primary_color || "#007bff",
        },
        security: {
          password_min_length: 8,
          session_timeout: 3600,
          max_login_attempts: 5,
        },
        storage: {
          max_file_size: 10485760,
          allowed_formats: ["jpg", "png", "gif"],
          storage_provider: "local",
        },
        notifications: {
          email_notifications:
            emailData.email_notifications === "1" ||
            emailData.email_notifications === true,
          push_notifications:
            emailData.push_notifications === "1" ||
            emailData.push_notifications === true,
          smtp_settings: parseSMTPSettings(emailData),
        },
        whatsapp: {
          name: whatsappData.name || "",
          description: whatsappData.description || "",
          access_token: whatsappData.access_token || "",
          phone_number_id: whatsappData.phone_number_id || "",
          business_id: whatsappData.business_id || "",
          whatsapp_number: whatsappData.whatsapp_number || "",
          is_active:
            whatsappData.is_active === true || whatsappData.is_active === 1,
        },
      };

      return settings;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update system settings",
      );
    }
  },
);

// Slice
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSettings: (state) => {
      state.settings = null;
    },
    updateProfileSettings: (
      state,
      action: PayloadAction<Partial<ProfileSettings>>,
    ) => {
      if (state.settings) {
        state.settings.profile = {
          ...state.settings.profile,
          ...action.payload,
        };
      }
    },
    updateGeneralSettings: (
      state,
      action: PayloadAction<Partial<GeneralSettings>>,
    ) => {
      if (state.settings) {
        state.settings.general = {
          ...state.settings.general,
          ...action.payload,
        };
      }
    },
    updateBrandingSettings: (
      state,
      action: PayloadAction<Partial<BrandingSettings>>,
    ) => {
      if (state.settings) {
        state.settings.branding = {
          ...state.settings.branding,
          ...action.payload,
        };
      }
    },
    updateSecuritySettings: (
      state,
      action: PayloadAction<Partial<SecuritySettings>>,
    ) => {
      if (state.settings) {
        state.settings.security = {
          ...state.settings.security,
          ...action.payload,
        };
      }
    },
    updateStorageSettings: (
      state,
      action: PayloadAction<Partial<StorageSettings>>,
    ) => {
      if (state.settings) {
        state.settings.storage = {
          ...state.settings.storage,
          ...action.payload,
        };
      }
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>,
    ) => {
      if (state.settings) {
        state.settings.notifications = {
          ...state.settings.notifications,
          ...action.payload,
        };
      }
    },
    updateWhatsAppSettings: (
      state,
      action: PayloadAction<Partial<WhatsAppSettings>>,
    ) => {
      if (state.settings && state.settings.whatsapp) {
        state.settings.whatsapp = {
          ...state.settings.whatsapp,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch System Settings
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update System Settings
    builder
      .addCase(updateSystemSettings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSettings,
  updateProfileSettings,
  updateGeneralSettings,
  updateBrandingSettings,
  updateSecuritySettings,
  updateStorageSettings,
  updateNotificationSettings,
  updateWhatsAppSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
