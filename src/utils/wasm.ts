import type { Profile, BrowsingActivity, Schedule } from "../types";

/**
 * Wrapper for the WASM module
 * This provides type-safe access to Rust functions compiled to WebAssembly
 */
export class WasmCore {
  private static instance: WasmCore | null = null;
  private wasm: any = null;
  private initialized = false;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): WasmCore {
    if (!WasmCore.instance) {
      WasmCore.instance = new WasmCore();
    }
    return WasmCore.instance;
  }

  /**
   * Initialize the WASM module
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // In production, the WASM module would be loaded from the compiled output
      // For now, we'll create a placeholder
      // const module = await import('../../rust_core/pkg/doubletrack_core');
      // await module.default();
      // this.wasm = module;

      console.log("WASM module initialization placeholder");
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize WASM module:", error);
      throw error;
    }
  }

  /**
   * Generate a new profile
   */
  async generateProfile(seed?: number): Promise<Profile> {
    await this.ensureInitialized();

    // Placeholder implementation
    // In production: return this.wasm.generate_profile(seed);

    return this.mockGenerateProfile(seed);
  }

  /**
   * Generate browsing activities for a profile
   */
  async generateActivities(
    profile: Profile,
    durationHours: number
  ): Promise<BrowsingActivity[]> {
    await this.ensureInitialized();

    // Placeholder implementation
    // In production: return this.wasm.generate_activities(profile, durationHours);

    return this.mockGenerateActivities(profile, durationHours);
  }

  /**
   * Validate a profile
   */
  async validateProfile(profile: Profile): Promise<boolean> {
    await this.ensureInitialized();

    // Placeholder implementation
    // In production: return this.wasm.validate_profile(profile);

    return (
      profile.name !== "" &&
      profile.interests.length > 0 &&
      profile.demographics.age >= 18
    );
  }

  /**
   * Get activity schedule for a profile
   */
  async getActivitySchedule(profile: Profile): Promise<Schedule> {
    await this.ensureInitialized();

    // Placeholder implementation
    // In production: return this.wasm.get_activity_schedule(profile);

    return this.mockGetSchedule(profile);
  }

  /**
   * Ensure WASM is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Mock profile generation (to be replaced with actual WASM call)
   */
  private mockGenerateProfile(seed?: number): Profile {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const names = ["Alex Smith", "Jordan Johnson", "Taylor Williams"];
    const name = names[seed ? seed % names.length : Math.floor(Math.random() * names.length)];

    return {
      id,
      name,
      demographics: {
        age: 25 + Math.floor(Math.random() * 40),
        gender: "Male" as any,
        location_type: "Urban" as any,
        occupation_category: "Technology" as any,
        education_level: "Bachelor" as any,
      },
      interests: ["Technology", "Gaming", "Programming"] as any[],
      browsing_style: "Explorer" as any,
      activity_level: "Medium" as any,
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Mock activity generation (to be replaced with actual WASM call)
   */
  private mockGenerateActivities(
    profile: Profile,
    durationHours: number
  ): BrowsingActivity[] {
    const activities: BrowsingActivity[] = [];
    const baseTime = Math.floor(Date.now() / 1000);
    const activitiesCount = Math.floor(durationHours * 4); // 4 activities per hour

    for (let i = 0; i < activitiesCount; i++) {
      const timestamp = baseTime + i * 900; // Every 15 minutes

      activities.push({
        activity_type: "PageVisit" as any,
        url: `https://example.com/page-${i}`,
        title: `Example Page ${i}`,
        duration_seconds: 60 + Math.floor(Math.random() * 300),
        timestamp,
        interest_category: profile.interests[0] || null,
      });
    }

    return activities;
  }

  /**
   * Mock schedule generation (to be replaced with actual WASM call)
   */
  private mockGetSchedule(profile: Profile): Schedule {
    return {
      time_patterns: [],
      timezone_offset: 0,
    };
  }
}

/**
 * Convenience function to get the WASM core instance
 */
export function getWasmCore(): WasmCore {
  return WasmCore.getInstance();
}
