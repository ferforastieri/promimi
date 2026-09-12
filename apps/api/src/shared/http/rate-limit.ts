/** Policy names keep rate limits out of domain routes and make reviews auditable. */
export const rateLimits = {
  default: { max: 100, timeWindow: "1 minute", ban: 2 },
  registration: { max: 3, timeWindow: "1 hour" },
  login: { max: 5, timeWindow: "15 minutes" },
  passwordReset: { max: 3, timeWindow: "1 hour" },
  tokenAction: { max: 10, timeWindow: "1 hour" },
  accountDeletion: { max: 3, timeWindow: "1 hour" },
  comment: { max: 5, timeWindow: "1 minute" },
  report: { max: 10, timeWindow: "1 hour" },
} as const;
