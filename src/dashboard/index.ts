/**
 * Dashboard page for activity analytics and visualization
 */

import type { BrowsingActivity, Profile, Statistics, ActivityType } from "../types";

interface DashboardData {
  activities: BrowsingActivity[];
  profile: Profile | null;
  stats: Statistics;
}

class DashboardController {
  private data: DashboardData = {
    activities: [],
    profile: null,
    stats: {} as Statistics,
  };

  async initialize(): Promise<void> {
    await this.loadData();
    this.setupEventListeners();
    this.renderDashboard();
  }

  private async loadData(): Promise<void> {
    const result = await chrome.storage.local.get([
      "doubletrack_activity_history",
      "doubletrack_profile",
      "doubletrack_statistics",
    ]);

    this.data.activities = result.doubletrack_activity_history || [];
    this.data.profile = result.doubletrack_profile || null;
    this.data.stats = result.doubletrack_statistics || {
      total_activities: 0,
      activities_today: 0,
      profile_age_days: 0,
      last_activity: null,
      activity_by_type: {},
    };
  }

  private setupEventListeners(): void {
    document.getElementById("back-btn")?.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
      window.close();
    });
  }

  private renderDashboard(): void {
    if (this.data.activities.length === 0) {
      this.showEmptyState();
      return;
    }

    this.renderOverviewCards();
    this.renderTimelineChart();
    this.renderTypeChart();
    this.renderHourlyChart();
    this.renderInterestBars();
    this.renderHeatmap();
    this.renderRecentActivities();
    this.renderInsights();
  }

  private showEmptyState(): void {
    const content = document.querySelector(".content");
    if (content) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">No Activity Data Yet</div>
          <div class="empty-state-text">
            Enable DoubleTrack and generate a profile to start seeing analytics
          </div>
        </div>
      `;
    }
  }

  private renderOverviewCards(): void {
    // Total activities
    document.getElementById("total-activities")!.textContent =
      this.data.stats.total_activities.toString();

    // Daily average
    const avgPerDay = this.data.profile
      ? Math.floor(
          this.data.stats.total_activities / Math.max(1, this.data.stats.profile_age_days)
        )
      : 0;
    document.getElementById("daily-average")!.textContent = avgPerDay.toString();

    // Total duration
    const totalSeconds = this.data.activities.reduce(
      (sum, a) => sum + a.duration_seconds,
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    document.getElementById("total-duration")!.textContent = `${hours}h`;

    // Streak (simplified - counts consecutive days with activity)
    const streak = this.calculateStreak();
    document.getElementById("streak-days")!.textContent = streak.toString();
  }

  private calculateStreak(): number {
    if (this.data.activities.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set(
      this.data.activities.map((a) => {
        const date = new Date(a.timestamp * 1000);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    let streak = 0;
    let currentDate = today.getTime();

    while (activityDates.has(currentDate)) {
      streak++;
      currentDate -= 86400000; // Subtract one day
    }

    return streak;
  }

  private renderTimelineChart(): void {
    const canvas = document.getElementById("timeline-chart") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Get last 7 days of data
    const days = 7;
    const dailyCounts = this.getDailyCounts(days);

    // Draw chart
    this.drawBarChart(ctx, canvas, dailyCounts);
  }

  private getDailyCounts(days: number): number[] {
    const counts = new Array(days).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.data.activities.forEach((activity) => {
      const activityDate = new Date(activity.timestamp * 1000);
      activityDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - activityDate.getTime()) / 86400000
      );

      if (daysDiff >= 0 && daysDiff < days) {
        counts[days - 1 - daysDiff]++;
      }
    });

    return counts;
  }

  private drawBarChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: number[]
  ): void {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length;
    const maxValue = Math.max(...data, 1);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    data.forEach((value, i) => {
      const barHeight = ((height - padding * 2) * value) / maxValue;
      const x = padding + i * barWidth;
      const y = height - padding - barHeight;

      // Bar
      ctx.fillStyle = "#667eea";
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

      // Value label
      if (value > 0) {
        ctx.fillStyle = "#2c3e50";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
      }

      // Day label
      const date = new Date();
      date.setDate(date.getDate() - (data.length - 1 - i));
      const label = date.toLocaleDateString("en-US", { weekday: "short" });

      ctx.fillStyle = "#7f8c8d";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x + barWidth / 2, height - padding + 20);
    });
  }

  private renderTypeChart(): void {
    const canvas = document.getElementById("type-chart") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Count by type
    const typeCounts: Record<string, number> = {};
    this.data.activities.forEach((a) => {
      typeCounts[a.activity_type] = (typeCounts[a.activity_type] || 0) + 1;
    });

    const entries = Object.entries(typeCounts);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    // Draw pie chart
    this.drawPieChart(ctx, canvas, entries, total);

    // Draw legend
    this.drawTypeLegend(entries, total);
  }

  private drawPieChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: [string, number][],
    total: number
  ): void {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const colors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#4facfe",
      "#43e97b",
      "#fa709a",
      "#fee140",
    ];

    let currentAngle = -Math.PI / 2;

    data.forEach(([type, count], i) => {
      const sliceAngle = (count / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  private drawTypeLegend(data: [string, number][], total: number): void {
    const legend = document.getElementById("type-legend");
    if (!legend) return;

    const colors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#4facfe",
      "#43e97b",
      "#fa709a",
      "#fee140",
    ];

    legend.innerHTML = data
      .map(
        ([type, count], i) => `
      <div class="legend-item">
        <div class="legend-color" style="background: ${colors[i % colors.length]}"></div>
        <span>${type}: ${count} (${Math.round((count / total) * 100)}%)</span>
      </div>
    `
      )
      .join("");
  }

  private renderHourlyChart(): void {
    const canvas = document.getElementById("hourly-chart") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Count by hour
    const hourlyCounts = new Array(24).fill(0);
    this.data.activities.forEach((a) => {
      const hour = new Date(a.timestamp * 1000).getHours();
      hourlyCounts[hour]++;
    });

    this.drawLineChart(ctx, canvas, hourlyCounts);
  }

  private drawLineChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: number[]
  ): void {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 40;
    const maxValue = Math.max(...data, 1);
    const stepX = (width - padding * 2) / (data.length - 1);

    ctx.clearRect(0, 0, width, height);

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "#667eea";
    ctx.lineWidth = 2;

    data.forEach((value, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((height - padding * 2) * value) / maxValue;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    data.forEach((value, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((height - padding * 2) * value) / maxValue;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = value > maxValue * 0.7 ? "#764ba2" : "#667eea";
      ctx.fill();
    });
  }

  private renderInterestBars(): void {
    const container = document.getElementById("interest-bars");
    if (!container) return;

    // Count by interest
    const interestCounts: Record<string, number> = {};
    this.data.activities.forEach((a) => {
      if (a.interest_category) {
        interestCounts[a.interest_category] =
          (interestCounts[a.interest_category] || 0) + 1;
      }
    });

    const sorted = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0]?.[1] || 1;

    container.innerHTML = sorted
      .map(
        ([interest, count]) => `
      <div class="interest-bar">
        <div class="interest-label">${interest}</div>
        <div class="interest-bar-track">
          <div class="interest-bar-fill" style="width: ${(count / maxCount) * 100}%">
            <span class="interest-count">${count}</span>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  private renderHeatmap(): void {
    const grid = document.getElementById("heatmap-grid");
    if (!grid) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Count activities by day and hour
    const heatmapData: number[][] = Array.from({ length: 7 }, () =>
      new Array(24).fill(0)
    );

    this.data.activities.forEach((a) => {
      const date = new Date(a.timestamp * 1000);
      const day = (date.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
      const hour = date.getHours();
      heatmapData[day][hour]++;
    });

    const maxCount = Math.max(...heatmapData.flat(), 1);

    // Build grid HTML
    let html = '<div class="heatmap-label"></div>';
    hours.forEach((hour) => {
      html += `<div class="heatmap-label">${hour % 3 === 0 ? hour : ""}</div>`;
    });

    days.forEach((day, dayIndex) => {
      html += `<div class="heatmap-label">${day}</div>`;
      hours.forEach((hour) => {
        const count = heatmapData[dayIndex][hour];
        const intensity = count / maxCount;
        const color = this.getHeatmapColor(intensity);

        html += `<div class="heatmap-cell" style="background: ${color}" title="${day} ${hour}:00 - ${count} activities"></div>`;
      });
    });

    grid.innerHTML = html;
  }

  private getHeatmapColor(intensity: number): string {
    if (intensity === 0) return "#ebedf0";
    if (intensity < 0.25) return "#c6e48b";
    if (intensity < 0.5) return "#7bc96f";
    if (intensity < 0.75) return "#239a3b";
    return "#196127";
  }

  private renderRecentActivities(): void {
    const container = document.getElementById("recent-activities");
    if (!container) return;

    const recent = this.data.activities.slice(-20).reverse();

    const icons: Record<string, string> = {
      Search: "🔍",
      PageVisit: "📄",
      VideoWatch: "🎥",
      Shopping: "🛒",
      SocialMedia: "💬",
      News: "📰",
      Research: "📚",
    };

    container.innerHTML = recent
      .map(
        (activity) => `
      <div class="activity-item">
        <div class="activity-icon">${icons[activity.activity_type] || "📄"}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-url">${activity.url}</div>
        </div>
        <div class="activity-meta">
          ${new Date(activity.timestamp * 1000).toLocaleTimeString()}
        </div>
      </div>
    `
      )
      .join("");
  }

  private renderInsights(): void {
    if (!this.data.profile) return;

    const insights = this.generateInsights();

    document.getElementById("insight-profile")!.textContent = insights.profile;
    document.getElementById("insight-activity")!.textContent = insights.activity;
    document.getElementById("insight-pattern")!.textContent = insights.pattern;
    document.getElementById("insight-performance")!.textContent = insights.performance;
  }

  private generateInsights() {
    const profile = this.data.profile!;
    const activities = this.data.activities;

    return {
      profile: `Your profile "${profile.name}" is a ${profile.demographics.age}-year-old ${profile.demographics.occupation_category.toLowerCase()} with ${profile.interests.length} main interests.`,
      activity: `Generated ${activities.length} activities over ${this.data.stats.profile_age_days} days, averaging ${Math.floor(activities.length / Math.max(1, this.data.stats.profile_age_days))} per day.`,
      pattern: `Your ${profile.browsing_style.toLowerCase()} browsing style creates a natural, believable activity pattern.`,
      performance: `Activity level is ${profile.activity_level.toLowerCase()}, which provides good privacy coverage without excessive resource usage.`,
    };
  }
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  const controller = new DashboardController();
  controller.initialize().catch((error) => {
    console.error("Failed to initialize dashboard:", error);
  });
});

export { DashboardController };
