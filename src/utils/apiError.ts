import { ApiErrorCode } from "@/enums";

interface ApiErrorOptions {
  status?: number;
  message?: string;
  data?: any;
  errors?: any;
  stack?: string;
  code?: ApiErrorCode;
}

class ApiError extends Error {
  public status: number;
  public message: string;
  public data?: any;
  public errors?: any;
  public code?: ApiErrorCode;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.status = options.status || 500;
    this.message = options.message || "Something went wrong";
    this.data = options.data;
    this.errors = options.errors;
    this.code = options.code;

    Error.captureStackTrace(this, this.constructor);

    if (options.stack) {
      this.stack = options.stack;
    }
  }
}

export default ApiError;
