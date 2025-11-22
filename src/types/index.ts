/**
 * Type definitions for DoubleTrack Browser
 */

export interface Profile {
  id: string;
  name: string;
  demographics: Demographics;
  interests: InterestCategory[];
  browsing_style: BrowsingStyle;
  activity_level: ActivityLevel;
  created_at: number;
}

export interface Demographics {
  age: number;
  gender: Gender;
  location_type: LocationType;
  occupation_category: OccupationCategory;
  education_level: EducationLevel;
}

export enum Gender {
  Male = "Male",
  Female = "Female",
  NonBinary = "NonBinary",
  PreferNotToSay = "PreferNotToSay",
}

export enum LocationType {
  Urban = "Urban",
  Suburban = "Suburban",
  Rural = "Rural",
}

export enum OccupationCategory {
  Technology = "Technology",
  Healthcare = "Healthcare",
  Education = "Education",
  Finance = "Finance",
  Creative = "Creative",
  Service = "Service",
  Trades = "Trades",
  Retired = "Retired",
  Student = "Student",
}

export enum EducationLevel {
  HighSchool = "HighSchool",
  SomeCollege = "SomeCollege",
  Bachelor = "Bachelor",
  Master = "Master",
  Doctorate = "Doctorate",
}

export enum InterestCategory {
  Technology = "Technology",
  Gaming = "Gaming",
  Sports = "Sports",
  Fitness = "Fitness",
  Cooking = "Cooking",
  Travel = "Travel",
  Fashion = "Fashion",
  Music = "Music",
  Movies = "Movies",
  Books = "Books",
  Art = "Art",
  Science = "Science",
  Politics = "Politics",
  News = "News",
  Finance = "Finance",
  HomeImprovement = "HomeImprovement",
  Gardening = "Gardening",
  Photography = "Photography",
  Programming = "Programming",
  DataScience = "DataScience",
}

export enum BrowsingStyle {
  Focused = "Focused",
  Explorer = "Explorer",
  Researcher = "Researcher",
  Casual = "Casual",
}

export enum ActivityLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  VeryHigh = "VeryHigh",
}

export interface BrowsingActivity {
  activity_type: ActivityType;
  url: string;
  title: string;
  duration_seconds: number;
  timestamp: number;
  interest_category: InterestCategory | null;
}

export enum ActivityType {
  Search = "Search",
  PageVisit = "PageVisit",
  VideoWatch = "VideoWatch",
  Shopping = "Shopping",
  SocialMedia = "SocialMedia",
  News = "News",
  Research = "Research",
}

export interface Schedule {
  time_patterns: TimePattern[];
  timezone_offset: number;
}

export interface TimePattern {
  day_of_week: DayOfWeek;
  active_hours: HourRange[];
  activity_intensity: number;
}

export interface HourRange {
  start_hour: number;
  end_hour: number;
}

export enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export interface ExtensionConfig {
  enabled: boolean;
  current_profile: Profile | null;
  noise_level: number; // 0.0 to 1.0
  respect_schedule: boolean;
  privacy_mode: PrivacyMode;
}

export enum PrivacyMode {
  Full = "Full",           // Full simulation
  Moderate = "Moderate",   // Reduced activity
  Minimal = "Minimal",     // Minimal noise
  Disabled = "Disabled",   // Extension disabled
}

export interface Statistics {
  total_activities: number;
  activities_today: number;
  profile_age_days: number;
  last_activity: number | null;
  activity_by_type: Record<ActivityType, number>;
}

/**
 * Message types for communication between components
 */
export interface Message {
  type: MessageType;
  payload?: unknown;
}

export enum MessageType {
  GetConfig = "GET_CONFIG",
  UpdateConfig = "UPDATE_CONFIG",
  GenerateProfile = "GENERATE_PROFILE",
  GetStatistics = "GET_STATISTICS",
  GetCurrentProfile = "GET_CURRENT_PROFILE",
  SimulateActivity = "SIMULATE_ACTIVITY",
  ClearHistory = "CLEAR_HISTORY",
}

/**
 * Storage keys
 */
export enum StorageKey {
  Config = "doubletrack_config",
  Profile = "doubletrack_profile",
  Statistics = "doubletrack_statistics",
  ActivityHistory = "doubletrack_activity_history",
}
