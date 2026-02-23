export const config = {
  // Maximum number of times to retry an API request in case of failure (e.g., 429 Too Many Requests)
  maxAPIRetries: 3,

  // Base delay in milliseconds between retries. The actual delay can increase exponentially per attempt.
  retryDelayMs: 1000,
};
