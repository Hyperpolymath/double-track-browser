/**
 * Tests for StorageManager
 */

import { StorageManager } from "../storage";
import type { ExtensionConfig, Profile, Statistics, BrowsingActivity } from "../../types";

// Mock chrome.storage API
const mockStorage: Record<string, any> = {};

global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, any> = {};

        keysArray.forEach((key) => {
          if (mockStorage[key] !== undefined) {
            result[key] = mockStorage[key];
          }
        });

        return Promise.resolve(result);
      }),
      set: jest.fn((items: Record<string, any>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
} as any;

describe("StorageManager", () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  describe("getConfig", () => {
    it("should return default config when none exists", async () => {
      const config = await StorageManager.getConfig();

      expect(config.enabled).toBe(false);
      expect(config.current_profile).toBeNull();
      expect(config.noise_level).toBe(0.5);
      expect(config.respect_schedule).toBe(true);
    });

    it("should return saved config", async () => {
      const savedConfig: ExtensionConfig = {
        enabled: true,
        current_profile: null,
        noise_level: 0.8,
        respect_schedule: false,
        privacy_mode: "Full" as any,
      };

      mockStorage["doubletrack_config"] = savedConfig;

      const config = await StorageManager.getConfig();
      expect(config).toEqual(savedConfig);
    });
  });

  describe("setConfig", () => {
    it("should save config to storage", async () => {
      const config: ExtensionConfig = {
        enabled: true,
        current_profile: null,
        noise_level: 0.7,
        respect_schedule: true,
        privacy_mode: "Moderate" as any,
      };

      await StorageManager.setConfig(config);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        doubletrack_config: config,
      });
      expect(mockStorage["doubletrack_config"]).toEqual(config);
    });
  });

  describe("getProfile", () => {
    it("should return null when no profile exists", async () => {
      const profile = await StorageManager.getProfile();
      expect(profile).toBeNull();
    });

    it("should return saved profile", async () => {
      const savedProfile: Profile = {
        id: "test_123",
        name: "Test User",
        demographics: {
          age: 30,
          gender: "Male" as any,
          location_type: "Urban" as any,
          occupation_category: "Technology" as any,
          education_level: "Bachelor" as any,
        },
        interests: ["Technology", "Gaming"] as any[],
        browsing_style: "Explorer" as any,
        activity_level: "Medium" as any,
        created_at: 1234567890,
      };

      mockStorage["doubletrack_profile"] = savedProfile;

      const profile = await StorageManager.getProfile();
      expect(profile).toEqual(savedProfile);
    });
  });

  describe("getStatistics", () => {
    it("should return default statistics when none exist", async () => {
      const stats = await StorageManager.getStatistics();

      expect(stats.total_activities).toBe(0);
      expect(stats.activities_today).toBe(0);
      expect(stats.profile_age_days).toBe(0);
      expect(stats.last_activity).toBeNull();
    });
  });

  describe("addActivity", () => {
    it("should add activity to history", async () => {
      const activity: BrowsingActivity = {
        activity_type: "PageVisit" as any,
        url: "https://example.com",
        title: "Example Page",
        duration_seconds: 120,
        timestamp: Math.floor(Date.now() / 1000),
        interest_category: "Technology" as any,
      };

      await StorageManager.addActivity(activity);

      const history = await StorageManager.getActivityHistory();
      expect(history).toContainEqual(activity);
      expect(history.length).toBe(1);
    });

    it("should update statistics when adding activity", async () => {
      const activity: BrowsingActivity = {
        activity_type: "Search" as any,
        url: "https://google.com",
        title: "Search",
        duration_seconds: 10,
        timestamp: Math.floor(Date.now() / 1000),
        interest_category: null,
      };

      await StorageManager.addActivity(activity);

      const stats = await StorageManager.getStatistics();
      expect(stats.total_activities).toBe(1);
      expect(stats.last_activity).toBe(activity.timestamp);
    });

    it("should limit history to 1000 items", async () => {
      // Add 1100 activities
      for (let i = 0; i < 1100; i++) {
        const activity: BrowsingActivity = {
          activity_type: "PageVisit" as any,
          url: `https://example.com/${i}`,
          title: `Page ${i}`,
          duration_seconds: 60,
          timestamp: Math.floor(Date.now() / 1000) + i,
          interest_category: null,
        };

        await StorageManager.addActivity(activity);
      }

      const history = await StorageManager.getActivityHistory();
      expect(history.length).toBe(1000);

      // Should keep the most recent ones
      expect(history[history.length - 1].url).toContain("1099");
    });
  });

  describe("clearActivityHistory", () => {
    it("should clear all activities and reset statistics", async () => {
      // Add some activities first
      const activity: BrowsingActivity = {
        activity_type: "PageVisit" as any,
        url: "https://example.com",
        title: "Example",
        duration_seconds: 60,
        timestamp: Math.floor(Date.now() / 1000),
        interest_category: null,
      };

      await StorageManager.addActivity(activity);

      // Clear
      await StorageManager.clearActivityHistory();

      const history = await StorageManager.getActivityHistory();
      const stats = await StorageManager.getStatistics();

      expect(history).toEqual([]);
      expect(stats.total_activities).toBe(0);
    });
  });

  describe("resetDailyStatistics", () => {
    it("should reset daily activity count", async () => {
      // Set some daily activities
      const stats: Statistics = {
        total_activities: 100,
        activities_today: 20,
        profile_age_days: 5,
        last_activity: null,
        activity_by_type: {},
      };

      mockStorage["doubletrack_statistics"] = stats;

      await StorageManager.resetDailyStatistics();

      const updatedStats = await StorageManager.getStatistics();
      expect(updatedStats.activities_today).toBe(0);
      expect(updatedStats.total_activities).toBe(100); // Should not change
    });
  });

  describe("updateProfileAge", () => {
    it("should calculate correct profile age in days", async () => {
      const now = Math.floor(Date.now() / 1000);
      const threeDaysAgo = now - 3 * 86400;

      const profile: Profile = {
        id: "test",
        name: "Test",
        demographics: {} as any,
        interests: [],
        browsing_style: "Casual" as any,
        activity_level: "Medium" as any,
        created_at: threeDaysAgo,
      };

      mockStorage["doubletrack_profile"] = profile;
      mockStorage["doubletrack_statistics"] = {
        total_activities: 0,
        activities_today: 0,
        profile_age_days: 0,
        last_activity: null,
        activity_by_type: {},
      };

      await StorageManager.updateProfileAge();

      const stats = await StorageManager.getStatistics();
      expect(stats.profile_age_days).toBe(3);
    });
  });
});
