/**
 * Popup UI controller for DoubleTrack Browser
 */

import type { ExtensionConfig, Profile, Statistics, Message } from "../types";

class PopupController {
  private config: ExtensionConfig | null = null;
  private profile: Profile | null = null;
  private stats: Statistics | null = null;

  async initialize(): Promise<void> {
    // Load current state
    await this.loadState();

    // Set up event listeners
    this.setupEventListeners();

    // Update UI
    this.updateUI();
  }

  /**
   * Load current state from background
   */
  private async loadState(): Promise<void> {
    this.config = await this.sendMessage({ type: "GET_CONFIG" });
    this.profile = await this.sendMessage({ type: "GET_CURRENT_PROFILE" });
    this.stats = await this.sendMessage({ type: "GET_STATISTICS" });
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Toggle button
    const toggleBtn = document.getElementById("toggle-btn");
    toggleBtn?.addEventListener("click", () => this.handleToggle());

    // Generate profile button
    const generateBtn = document.getElementById("generate-profile-btn");
    generateBtn?.addEventListener("click", () => this.handleGenerateProfile());

    // Noise level slider
    const noiseSlider = document.getElementById("noise-level") as HTMLInputElement;
    noiseSlider?.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById("noise-value")!.textContent = `${value}%`;
    });

    noiseSlider?.addEventListener("change", (e) => {
      this.handleNoiseChange((e.target as HTMLInputElement).value);
    });

    // Respect schedule checkbox
    const scheduleCheckbox = document.getElementById("respect-schedule") as HTMLInputElement;
    scheduleCheckbox?.addEventListener("change", (e) => {
      this.handleScheduleChange((e.target as HTMLInputElement).checked);
    });

    // Options button
    const optionsBtn = document.getElementById("options-btn");
    optionsBtn?.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });

    // Clear history button
    const clearBtn = document.getElementById("clear-history-btn");
    clearBtn?.addEventListener("click", () => this.handleClearHistory());
  }

  /**
   * Update the UI with current state
   */
  private updateUI(): void {
    if (!this.config) return;

    // Update status
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    const toggleBtn = document.getElementById("toggle-btn");

    if (this.config.enabled) {
      statusDot?.classList.add("active");
      statusDot?.classList.remove("inactive");
      statusText!.textContent = "Enabled";
      toggleBtn!.textContent = "Disable";
      toggleBtn?.classList.add("active");
    } else {
      statusDot?.classList.remove("active");
      statusDot?.classList.add("inactive");
      statusText!.textContent = "Disabled";
      toggleBtn!.textContent = "Enable";
      toggleBtn?.classList.remove("active");
    }

    // Update profile info
    this.updateProfileInfo();

    // Update statistics
    this.updateStatistics();

    // Update controls
    const noiseSlider = document.getElementById("noise-level") as HTMLInputElement;
    const noiseValue = document.getElementById("noise-value");
    if (noiseSlider && noiseValue) {
      const percentage = Math.round(this.config.noise_level * 100);
      noiseSlider.value = percentage.toString();
      noiseValue.textContent = `${percentage}%`;
    }

    const scheduleCheckbox = document.getElementById("respect-schedule") as HTMLInputElement;
    if (scheduleCheckbox) {
      scheduleCheckbox.checked = this.config.respect_schedule;
    }
  }

  /**
   * Update profile information display
   */
  private updateProfileInfo(): void {
    const noProfile = document.getElementById("no-profile");
    const profileDetails = document.getElementById("profile-details");

    if (!this.profile) {
      noProfile!.style.display = "block";
      profileDetails!.style.display = "none";
      return;
    }

    noProfile!.style.display = "none";
    profileDetails!.style.display = "block";

    document.getElementById("profile-name")!.textContent = this.profile.name;
    document.getElementById("profile-age")!.textContent =
      this.profile.demographics.age.toString();
    document.getElementById("profile-occupation")!.textContent =
      this.profile.demographics.occupation_category;
    document.getElementById("profile-interests")!.textContent =
      this.profile.interests.join(", ");
    document.getElementById("profile-activity-level")!.textContent =
      this.profile.activity_level;
  }

  /**
   * Update statistics display
   */
  private updateStatistics(): void {
    if (!this.stats) return;

    document.getElementById("total-activities")!.textContent =
      this.stats.total_activities.toString();
    document.getElementById("today-activities")!.textContent =
      this.stats.activities_today.toString();
    document.getElementById("profile-age")!.textContent =
      this.stats.profile_age_days.toString();
  }

  /**
   * Handle toggle button click
   */
  private async handleToggle(): Promise<void> {
    if (!this.config) return;

    // Check if profile exists
    if (!this.profile && !this.config.enabled) {
      if (confirm("No profile exists. Generate one now?")) {
        await this.handleGenerateProfile();
      }
      return;
    }

    this.config.enabled = !this.config.enabled;
    await this.sendMessage({
      type: "UPDATE_CONFIG",
      payload: this.config,
    });

    await this.loadState();
    this.updateUI();
  }

  /**
   * Handle generate profile button click
   */
  private async handleGenerateProfile(): Promise<void> {
    if (this.config?.enabled) {
      if (!confirm("This will create a new profile and clear history. Continue?")) {
        return;
      }
    }

    const generateBtn = document.getElementById("generate-profile-btn");
    if (generateBtn) {
      generateBtn.textContent = "Generating...";
      (generateBtn as HTMLButtonElement).disabled = true;
    }

    try {
      this.profile = await this.sendMessage({
        type: "GENERATE_PROFILE",
      });

      await this.loadState();
      this.updateUI();
    } finally {
      if (generateBtn) {
        generateBtn.textContent = "Generate New Profile";
        (generateBtn as HTMLButtonElement).disabled = false;
      }
    }
  }

  /**
   * Handle noise level change
   */
  private async handleNoiseChange(value: string): Promise<void> {
    if (!this.config) return;

    this.config.noise_level = parseInt(value) / 100;
    await this.sendMessage({
      type: "UPDATE_CONFIG",
      payload: this.config,
    });
  }

  /**
   * Handle schedule checkbox change
   */
  private async handleScheduleChange(checked: boolean): Promise<void> {
    if (!this.config) return;

    this.config.respect_schedule = checked;
    await this.sendMessage({
      type: "UPDATE_CONFIG",
      payload: this.config,
    });
  }

  /**
   * Handle clear history button click
   */
  private async handleClearHistory(): Promise<void> {
    if (!confirm("Clear all activity history? This cannot be undone.")) {
      return;
    }

    await this.sendMessage({ type: "CLEAR_HISTORY" });
    await this.loadState();
    this.updateUI();
  }

  /**
   * Send a message to the background script
   */
  private async sendMessage(message: Message): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const controller = new PopupController();
  controller.initialize().catch((error) => {
    console.error("Failed to initialize popup:", error);
  });
});
