import { Response } from "express";

interface ApiResponseOptions {
  status?: number;
  message?: string;
  data?: any;
  errors?: any;
}

class ApiResponse {
  public status: number;
  public message?: string;
  public data: any;
  public errors: any;

  constructor(options: ApiResponseOptions) {
    this.status = options.status || 200;
    this.message = options.message || undefined;
    this.data = options.data || undefined;
    this.errors = options.errors || undefined;
  }

  public send(res: Response) {
    if (res.statusCode === 200) {
      res.locals.data = this.data;
    }
    return res.status(this.status).json(this);
  }
}

export default ApiResponse;
