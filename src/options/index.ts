/**
 * Options page controller for DoubleTrack Browser
 */

import type {
  ExtensionConfig,
  Profile,
  Statistics,
  Message,
  BrowsingActivity,
} from "../types";

class OptionsController {
  private config: ExtensionConfig | null = null;
  private profile: Profile | null = null;
  private stats: Statistics | null = null;
  private activityHistory: BrowsingActivity[] = [];

  async initialize(): Promise<void> {
    await this.loadState();
    this.setupEventListeners();
    this.updateUI();
  }

  private async loadState(): Promise<void> {
    this.config = await this.sendMessage({ type: "GET_CONFIG" });
    this.profile = await this.sendMessage({ type: "GET_CURRENT_PROFILE" });
    this.stats = await this.sendMessage({ type: "GET_STATISTICS" });
  }

  private setupEventListeners(): void {
    // General settings
    document.getElementById("enabled")?.addEventListener("change", (e) => {
      this.handleEnabledChange((e.target as HTMLInputElement).checked);
    });

    document.getElementById("privacy-mode")?.addEventListener("change", (e) => {
      this.handlePrivacyModeChange((e.target as HTMLSelectElement).value);
    });

    const noiseSlider = document.getElementById("noise-level") as HTMLInputElement;
    noiseSlider?.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById("noise-value")!.textContent = `${value}%`;
    });

    noiseSlider?.addEventListener("change", (e) => {
      this.handleNoiseChange((e.target as HTMLInputElement).value);
    });

    // Schedule settings
    document.getElementById("respect-schedule")?.addEventListener("change", (e) => {
      this.handleScheduleChange((e.target as HTMLInputElement).checked);
    });

    // Profile actions
    document
      .getElementById("generate-profile-btn")
      ?.addEventListener("click", () => this.handleGenerateProfile());

    document
      .getElementById("export-profile-btn")
      ?.addEventListener("click", () => this.handleExportProfile());

    // Activity actions
    document
      .getElementById("view-history-btn")
      ?.addEventListener("click", () => this.handleViewHistory());

    document
      .getElementById("clear-history-btn")
      ?.addEventListener("click", () => this.handleClearHistory());

    // Modal
    document.querySelector(".modal-close")?.addEventListener("click", () => {
      this.closeModal();
    });
  }

  private updateUI(): void {
    if (!this.config) return;

    // General settings
    (document.getElementById("enabled") as HTMLInputElement).checked =
      this.config.enabled;

    (document.getElementById("privacy-mode") as HTMLSelectElement).value =
      this.config.privacy_mode;

    const noiseSlider = document.getElementById("noise-level") as HTMLInputElement;
    const noiseValue = document.getElementById("noise-value");
    if (noiseSlider && noiseValue) {
      const percentage = Math.round(this.config.noise_level * 100);
      noiseSlider.value = percentage.toString();
      noiseValue.textContent = `${percentage}%`;
    }

    // Schedule settings
    (document.getElementById("respect-schedule") as HTMLInputElement).checked =
      this.config.respect_schedule;

    // Profile display
    this.updateProfileDisplay();

    // Statistics
    this.updateStatistics();
  }

  private updateProfileDisplay(): void {
    const noProfileMsg = document.getElementById("no-profile-message");
    const profileDetails = document.getElementById("profile-details");
    const exportBtn = document.getElementById("export-profile-btn") as HTMLButtonElement;

    if (!this.profile) {
      noProfileMsg!.style.display = "block";
      profileDetails!.style.display = "none";
      exportBtn.disabled = true;
      return;
    }

    noProfileMsg!.style.display = "none";
    profileDetails!.style.display = "block";
    exportBtn.disabled = false;

    document.getElementById("profile-name")!.textContent = this.profile.name;
    document.getElementById("profile-age")!.textContent =
      this.profile.demographics.age.toString();
    document.getElementById("profile-gender")!.textContent =
      this.profile.demographics.gender;
    document.getElementById("profile-location")!.textContent =
      this.profile.demographics.location_type;
    document.getElementById("profile-occupation")!.textContent =
      this.profile.demographics.occupation_category;
    document.getElementById("profile-education")!.textContent =
      this.profile.demographics.education_level;
    document.getElementById("profile-interests")!.textContent =
      this.profile.interests.join(", ");
    document.getElementById("profile-style")!.textContent =
      this.profile.browsing_style;
    document.getElementById("profile-activity")!.textContent =
      this.profile.activity_level;
  }

  private updateStatistics(): void {
    if (!this.stats) return;

    document.getElementById("total-activities")!.textContent =
      this.stats.total_activities.toString();
    document.getElementById("today-activities")!.textContent =
      this.stats.activities_today.toString();
    document.getElementById("profile-age-days")!.textContent =
      this.stats.profile_age_days.toString();
  }

  private async handleEnabledChange(enabled: boolean): Promise<void> {
    if (!this.config) return;

    if (enabled && !this.profile) {
      alert("Please generate a profile first before enabling DoubleTrack.");
      (document.getElementById("enabled") as HTMLInputElement).checked = false;
      return;
    }

    this.config.enabled = enabled;
    await this.sendMessage({ type: "UPDATE_CONFIG", payload: this.config });
  }

  private async handlePrivacyModeChange(mode: string): Promise<void> {
    if (!this.config) return;

    this.config.privacy_mode = mode as any;
    await this.sendMessage({ type: "UPDATE_CONFIG", payload: this.config });
  }

  private async handleNoiseChange(value: string): Promise<void> {
    if (!this.config) return;

    this.config.noise_level = parseInt(value) / 100;
    await this.sendMessage({ type: "UPDATE_CONFIG", payload: this.config });
  }

  private async handleScheduleChange(checked: boolean): Promise<void> {
    if (!this.config) return;

    this.config.respect_schedule = checked;
    await this.sendMessage({ type: "UPDATE_CONFIG", payload: this.config });
  }

  private async handleGenerateProfile(): Promise<void> {
    if (this.config?.enabled) {
      if (
        !confirm(
          "Generating a new profile will clear all activity history and disable the extension temporarily. Continue?"
        )
      ) {
        return;
      }
    }

    const btn = document.getElementById("generate-profile-btn") as HTMLButtonElement;
    btn.textContent = "Generating...";
    btn.disabled = true;

    try {
      this.profile = await this.sendMessage({ type: "GENERATE_PROFILE" });
      await this.loadState();
      this.updateUI();
      alert("New profile generated successfully!");
    } catch (error) {
      console.error("Failed to generate profile:", error);
      alert("Failed to generate profile. Check console for details.");
    } finally {
      btn.textContent = "Generate New Profile";
      btn.disabled = false;
    }
  }

  private handleExportProfile(): void {
    if (!this.profile) return;

    const dataStr = JSON.stringify(this.profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `doubletrack-profile-${this.profile.id}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  private async handleViewHistory(): Promise<void> {
    // Load activity history from storage
    const result = await chrome.storage.local.get("doubletrack_activity_history");
    this.activityHistory = result.doubletrack_activity_history || [];

    const activityList = document.getElementById("activity-list");
    if (!activityList) return;

    if (this.activityHistory.length === 0) {
      activityList.innerHTML = '<p class="text-muted">No activities recorded yet</p>';
    } else {
      activityList.innerHTML = this.activityHistory
        .slice(-50) // Show last 50
        .reverse()
        .map(
          (activity) => `
        <div class="activity-item">
          <strong>${activity.title}</strong>
          <div>${activity.url}</div>
          <small>Type: ${activity.activity_type} | Duration: ${activity.duration_seconds}s | ${new Date(activity.timestamp * 1000).toLocaleString()}</small>
        </div>
      `
        )
        .join("");
    }

    this.showModal();
  }

  private async handleClearHistory(): Promise<void> {
    if (
      !confirm(
        "This will permanently delete all activity history and reset statistics. This cannot be undone. Continue?"
      )
    ) {
      return;
    }

    await this.sendMessage({ type: "CLEAR_HISTORY" });
    await this.loadState();
    this.updateUI();
    alert("Activity history cleared successfully.");
  }

  private showModal(): void {
    const modal = document.getElementById("activity-modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  private closeModal(): void {
    const modal = document.getElementById("activity-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

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

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const controller = new OptionsController();
  controller.initialize().catch((error) => {
    console.error("Failed to initialize options page:", error);
  });
});
