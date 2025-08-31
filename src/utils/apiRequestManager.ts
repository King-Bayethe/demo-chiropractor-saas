// Singleton request manager to prevent duplicate API calls
class APIRequestManager {
  private static instance: APIRequestManager;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private lastRequestTimes: Map<string, number> = new Map();
  private readonly RATE_LIMIT_MS = 2000; // 2 seconds between requests

  private constructor() {}

  static getInstance(): APIRequestManager {
    if (!APIRequestManager.instance) {
      APIRequestManager.instance = new APIRequestManager();
    }
    return APIRequestManager.instance;
  }

  async makeRequest<T>(
    key: string, 
    requestFn: () => Promise<T>, 
    forceRefresh: boolean = false
  ): Promise<T> {
    // If request is already pending and not forced, return the existing promise
    if (!forceRefresh && this.pendingRequests.has(key)) {
      console.log(`Returning existing request for: ${key}`);
      return this.pendingRequests.get(key)!;
    }

    // Check rate limiting
    const lastRequestTime = this.lastRequestTimes.get(key) || 0;
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    
    if (!forceRefresh && timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastRequest;
      console.log(`Rate limiting ${key}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Create and track the request
    const requestPromise = this.executeRequest(key, requestFn);
    this.pendingRequests.set(key, requestPromise);
    this.lastRequestTimes.set(key, Date.now());

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the pending request
      this.pendingRequests.delete(key);
    }
  }

  private async executeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    try {
      console.log(`Executing API request: ${key}`);
      const result = await requestFn();
      console.log(`API request completed: ${key}`);
      return result;
    } catch (error) {
      console.error(`API request failed: ${key}`, error);
      throw error;
    }
  }

  // Clear all pending requests (useful for cleanup)
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  // Check if a request is currently pending
  isRequestPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}

export const apiRequestManager = APIRequestManager.getInstance();