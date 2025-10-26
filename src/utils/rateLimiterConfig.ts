import rateLimit from "express-rate-limit";
import ApiError from "./apiError";

/**
 * Rate limiter configuration
 * @type {rateLimit}
 */
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 60 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: () =>
    // request: Request,
    // response: Response,
    // next: NextFunction,
    // optionsUsed: Options
    {
      throw new ApiError({
        status: 429,
        message: "Too many requests, please try again later.",
      });
    },
});

export default limiter;
