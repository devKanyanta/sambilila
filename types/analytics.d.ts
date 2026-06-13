// types/analytics.d.ts
// Type declarations for the client-side analytics module

interface AnalyticsAPI {
  /**
   * Track a feature event (quiz created, flashcard generated, etc.)
   * @param eventName - Event name (e.g., 'quiz_created', 'user_registered')
   * @param properties - Event-specific properties
   */
  track(eventName: string, properties?: Record<string, unknown>): void

  /**
   * Identify the authenticated user.
   * Call after login/registration.
   * @param userId - The user's ID
   */
  identify(userId: string): void

  /**
   * Manually trigger a page view event.
   * @param path - Page path (defaults to current path)
   * @param title - Page title (defaults to current title)
   */
  pageView(path?: string, title?: string): void

  /**
   * Flush buffered events immediately.
   */
  flush(): void

  /**
   * Initialize the analytics (called automatically, but safe to call again).
   */
  init(): void
}

declare global {
  interface Window {
    __analytics?: AnalyticsAPI
  }
}

export {}
