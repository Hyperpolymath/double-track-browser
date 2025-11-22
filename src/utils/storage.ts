import type {
  ExtensionConfig,
  Profile,
  Statistics,
  BrowsingActivity,
  StorageKey,
  PrivacyMode,
} from "../types";

/**
 * Storage utility for managing extension data
 */
export class StorageManager {
  /**
   * Get the current configuration
   */
  static async getConfig(): Promise<ExtensionConfig> {
    const result = await chrome.storage.local.get(StorageKey.Config);
    return result[StorageKey.Config] || this.getDefaultConfig();
  }

  /**
   * Update the configuration
   */
  static async setConfig(config: ExtensionConfig): Promise<void> {
    await chrome.storage.local.set({ [StorageKey.Config]: config });
  }

  /**
   * Get the current profile
   */
  static async getProfile(): Promise<Profile | null> {
    const result = await chrome.storage.local.get(StorageKey.Profile);
    return result[StorageKey.Profile] || null;
  }

  /**
   * Set the current profile
   */
  static async setProfile(profile: Profile): Promise<void> {
    await chrome.storage.local.set({ [StorageKey.Profile]: profile });
  }

  /**
   * Get statistics
   */
  static async getStatistics(): Promise<Statistics> {
    const result = await chrome.storage.local.get(StorageKey.Statistics);
    return result[StorageKey.Statistics] || this.getDefaultStatistics();
  }

  /**
   * Update statistics
   */
  static async setStatistics(stats: Statistics): Promise<void> {
    await chrome.storage.local.set({ [StorageKey.Statistics]: stats });
  }

  /**
   * Get activity history
   */
  static async getActivityHistory(): Promise<BrowsingActivity[]> {
    const result = await chrome.storage.local.get(StorageKey.ActivityHistory);
    return result[StorageKey.ActivityHistory] || [];
  }

  /**
   * Add an activity to history
   */
  static async addActivity(activity: BrowsingActivity): Promise<void> {
    const history = await this.getActivityHistory();
    history.push(activity);

    // Keep only the last 1000 activities to avoid storage bloat
    const trimmedHistory = history.slice(-1000);

    await chrome.storage.local.set({
      [StorageKey.ActivityHistory]: trimmedHistory,
    });

    // Update statistics
    await this.updateStatisticsWithActivity(activity);
  }

  /**
   * Clear all activity history
   */
  static async clearActivityHistory(): Promise<void> {
    await chrome.storage.local.set({ [StorageKey.ActivityHistory]: [] });
    await this.setStatistics(this.getDefaultStatistics());
  }

  /**
   * Update statistics with a new activity
   */
  private static async updateStatisticsWithActivity(
    activity: BrowsingActivity
  ): Promise<void> {
    const stats = await this.getStatistics();

    stats.total_activities += 1;
    stats.last_activity = activity.timestamp;

    // Update activities today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activityDate = new Date(activity.timestamp * 1000);

    if (activityDate >= today) {
      stats.activities_today += 1;
    }

    // Update activity by type
    stats.activity_by_type[activity.activity_type] =
      (stats.activity_by_type[activity.activity_type] || 0) + 1;

    await this.setStatistics(stats);
  }

  /**
   * Get default configuration
   */
  private static getDefaultConfig(): ExtensionConfig {
    return {
      enabled: false, // Disabled by default for safety
      current_profile: null,
      noise_level: 0.5,
      respect_schedule: true,
      privacy_mode: PrivacyMode.Moderate,
    };
  }

  /**
   * Get default statistics
   */
  private static getDefaultStatistics(): Statistics {
    return {
      total_activities: 0,
      activities_today: 0,
      profile_age_days: 0,
      last_activity: null,
      activity_by_type: {} as Record<string, number>,
    };
  }

  /**
   * Reset daily statistics (should be called at midnight)
   */
  static async resetDailyStatistics(): Promise<void> {
    const stats = await this.getStatistics();
    stats.activities_today = 0;
    await this.setStatistics(stats);
  }

  /**
   * Update profile age in statistics
   */
  static async updateProfileAge(): Promise<void> {
    const profile = await this.getProfile();
    if (!profile) return;

    const stats = await this.getStatistics();
    const now = Math.floor(Date.now() / 1000);
    const ageSeconds = now - profile.created_at;
    stats.profile_age_days = Math.floor(ageSeconds / 86400);

    await this.setStatistics(stats);
  }
}
