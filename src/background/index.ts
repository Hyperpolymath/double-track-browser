/**
 * Background service worker for DoubleTrack Browser
 * Handles activity simulation, scheduling, and coordination
 */

import { StorageManager } from "../utils/storage";
import { getWasmCore } from "../utils/wasm";
import type {
  Message,
  MessageType,
  ExtensionConfig,
  BrowsingActivity,
  Profile,
} from "../types";

class BackgroundService {
  private wasmCore = getWasmCore();
  private simulationInterval: number | null = null;
  private isRunning = false;

  async initialize(): Promise<void> {
    console.log("DoubleTrack Browser: Initializing background service");

    // Initialize WASM module
    try {
      await this.wasmCore.initialize();
      console.log("WASM core initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WASM core:", error);
    }

    // Set up message listeners
    this.setupMessageListeners();

    // Set up alarms for scheduled tasks
    this.setupAlarms();

    // Load configuration and start if enabled
    const config = await StorageManager.getConfig();
    if (config.enabled && config.current_profile) {
      await this.startSimulation();
    }

    console.log("DoubleTrack Browser: Background service initialized");
  }

  /**
   * Set up message listeners for communication with popup/options
   */
  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener(
      (message: Message, sender, sendResponse) => {
        this.handleMessage(message)
          .then(sendResponse)
          .catch((error) => {
            console.error("Error handling message:", error);
            sendResponse({ error: error.message });
          });

        // Return true to indicate async response
        return true;
      }
    );
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: Message): Promise<any> {
    switch (message.type) {
      case "GET_CONFIG":
        return await StorageManager.getConfig();

      case "UPDATE_CONFIG":
        const config = message.payload as ExtensionConfig;
        await StorageManager.setConfig(config);

        if (config.enabled) {
          await this.startSimulation();
        } else {
          await this.stopSimulation();
        }

        return { success: true };

      case "GENERATE_PROFILE":
        const seed = message.payload as number | undefined;
        const profile = await this.wasmCore.generateProfile(seed);
        await StorageManager.setProfile(profile);

        // Reset statistics for new profile
        await StorageManager.clearActivityHistory();

        return profile;

      case "GET_STATISTICS":
        return await StorageManager.getStatistics();

      case "GET_CURRENT_PROFILE":
        return await StorageManager.getProfile();

      case "SIMULATE_ACTIVITY":
        await this.simulateActivity();
        return { success: true };

      case "CLEAR_HISTORY":
        await StorageManager.clearActivityHistory();
        return { success: true };

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Set up periodic alarms
   */
  private setupAlarms(): void {
    // Daily reset at midnight
    chrome.alarms.create("daily-reset", {
      when: this.getNextMidnight(),
      periodInMinutes: 24 * 60,
    });

    // Update profile age daily
    chrome.alarms.create("update-profile-age", {
      periodInMinutes: 60 * 24,
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }

  /**
   * Handle alarm events
   */
  private async handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
    switch (alarm.name) {
      case "daily-reset":
        await StorageManager.resetDailyStatistics();
        break;

      case "update-profile-age":
        await StorageManager.updateProfileAge();
        break;

      case "simulate-activity":
        if (this.isRunning) {
          await this.simulateActivity();
        }
        break;
    }
  }

  /**
   * Get timestamp for next midnight
   */
  private getNextMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    return tomorrow.getTime();
  }

  /**
   * Start activity simulation
   */
  async startSimulation(): Promise<void> {
    if (this.isRunning) {
      console.log("Simulation already running");
      return;
    }

    const config = await StorageManager.getConfig();
    const profile = await StorageManager.getProfile();

    if (!profile) {
      console.error("No profile found, cannot start simulation");
      return;
    }

    console.log("Starting activity simulation");
    this.isRunning = true;

    // Schedule periodic activity simulation
    // Interval varies based on noise level and activity level
    const baseInterval = 15; // 15 minutes base
    const interval = baseInterval / config.noise_level;

    chrome.alarms.create("simulate-activity", {
      periodInMinutes: Math.max(5, interval), // At least 5 minutes
    });

    // Run initial simulation
    await this.simulateActivity();
  }

  /**
   * Stop activity simulation
   */
  async stopSimulation(): Promise<void> {
    console.log("Stopping activity simulation");
    this.isRunning = false;

    chrome.alarms.clear("simulate-activity");
  }

  /**
   * Simulate a browsing activity
   */
  private async simulateActivity(): Promise<void> {
    try {
      const config = await StorageManager.getConfig();
      const profile = await StorageManager.getProfile();

      if (!config.enabled || !profile) {
        return;
      }

      // Check if we should simulate based on schedule
      if (config.respect_schedule) {
        const schedule = await this.wasmCore.getActivitySchedule(profile);
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        // If schedule says we shouldn't be active now, skip
        // (This would use the schedule.is_active_hour logic from Rust)
      }

      // Generate a single activity
      const activities = await this.wasmCore.generateActivities(profile, 0.25); // 15 minutes worth

      if (activities.length > 0) {
        const activity = activities[0];

        // Add to history
        await StorageManager.addActivity(activity);

        // Optionally open the URL in a background tab
        // This is commented out for safety - uncomment to actually open tabs
        // await this.openActivityInBackground(activity);

        console.log("Simulated activity:", activity);
      }
    } catch (error) {
      console.error("Error simulating activity:", error);
    }
  }

  /**
   * Open an activity URL in a background tab
   * WARNING: This actually opens browser tabs!
   */
  private async openActivityInBackground(
    activity: BrowsingActivity
  ): Promise<void> {
    try {
      const tab = await chrome.tabs.create({
        url: activity.url,
        active: false, // Don't switch to the tab
      });

      // Close the tab after the activity duration
      setTimeout(() => {
        if (tab.id) {
          chrome.tabs.remove(tab.id);
        }
      }, activity.duration_seconds * 1000);
    } catch (error) {
      console.error("Error opening activity tab:", error);
    }
  }
}

// Initialize the background service
const service = new BackgroundService();
service.initialize().catch((error) => {
  console.error("Failed to initialize background service:", error);
});

// Export for testing
export { BackgroundService };
