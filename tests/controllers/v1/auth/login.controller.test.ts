import { Request, Response, NextFunction } from "express";
import login, {
  generateAuthTokens,
} from "@/controllers/v1/auth/login.controller";
import {
  User,
  UserProfile,
  Media,
  LoginHistory,
  Room,
  Payment,
  MembershipType,
} from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { ApiErrorCode, LoginMethod, PaymentStatus, Role } from "@/enums";
import env from "@/utils/validateEnv";

// Mock dependencies
jest.mock("@/models");
jest.mock("@/utils/validateEnv");
jest.mock("@/helpers/helper");

// Mock ApiResponse
const mockSend = jest.fn();
jest.mock("@/utils/apiResponse", () => {
  return jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
});

describe("Login Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockSend.mockClear();

    // Setup mock request
    mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
      clientIp: "127.0.0.1",
      headers: {
        "user-agent": "test-agent",
      },
      secure: false,
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      locals: {},
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Mock env
    (env as any).isProd = false;
    (env as any).JWT_EXPIRES_IN = 15;
    (env as any).JWT_REFRESH_EXPIRES_IN = 10080;
  });

  describe("login - Success Cases", () => {
    it("should login successfully with valid credentials for regular user", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        role: Role.USER,
        fullName: "Test User",
        password: "hashedPassword",
        isEmailVerified: true,
        isEnabled: true,
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 1,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      const mockUserProfile = {
        id: 1,
        phone: "1234567890",
        gender: "male",
        dob: new Date("1990-01-01"),
        occupationStatus: "employed",
        maritalStatus: "single",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue({
        ...mockUser,
        userProfile: mockUserProfile,
      });
      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        attributes: [
          "id",
          "username",
          "role",
          "email",
          "fullName",
          "isEmailVerified",
          "isEnabled",
          "password",
          "loginMethod",
        ],
      });

      expect(mockUser.isPasswordCorrect).toHaveBeenCalledWith("password123");
      expect(mockUser.generateRefreshToken).toHaveBeenCalled();
      expect(mockUser.generateAccessToken).toHaveBeenCalledWith("1");
      expect(LoginHistory.findOrCreate).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockSend).toHaveBeenCalledWith(mockResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should login successfully for HOST user and calculate available credits", async () => {
      const mockUser = {
        id: 2,
        username: "hostuser",
        email: "host@example.com",
        role: Role.HOST,
        fullName: "Host User",
        password: "hashedPassword",
        isEmailVerified: true,
        isEnabled: true,
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 2,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Room.count as jest.Mock).mockResolvedValue(2);
      (Payment.findAll as jest.Mock).mockResolvedValue([
        {
          id: 1,
          status: PaymentStatus.COMPLETED,
          membershipType: { id: 1, name: "Basic", limit: 5 },
        },
        {
          id: 2,
          status: PaymentStatus.COMPLETED,
          membershipType: { id: 2, name: "Premium", limit: 10 },
        },
      ]);
      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Room.count).toHaveBeenCalledWith({ where: { userId: 2 } });
      expect(Payment.findAll).toHaveBeenCalled();
      expect(ApiResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availableCredits: 13, // (5 + 10) - 2 rooms
          }),
        })
      );
    });

    it("should set availableCredits to 0 when HOST has no remaining credits", async () => {
      const mockUser = {
        id: 3,
        username: "hostuser2",
        email: "host2@example.com",
        role: Role.HOST,
        fullName: "Host User 2",
        password: "hashedPassword",
        isEmailVerified: true,
        isEnabled: true,
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 3,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Room.count as jest.Mock).mockResolvedValue(5);
      (Payment.findAll as jest.Mock).mockResolvedValue([
        {
          id: 1,
          status: PaymentStatus.COMPLETED,
          membershipType: { id: 1, name: "Basic", limit: 3 },
        },
      ]);
      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ApiResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availableCredits: 0, // (1 + 3) - 5 rooms = -1, but capped at 0
          }),
        })
      );
    });
  });

  describe("login - Failure Cases", () => {
    it("should return error when user does not exist", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Invalid email or password");
      expect(error.code).toBe(ApiErrorCode.ACCOUNT_NOT_FOUND);
    });

    it("should return error when login method is not EMAIL", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        loginMethod: LoginMethod.GOOGLE,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe(
        `Invalid login method. Please use ${LoginMethod.GOOGLE} to login`
      );
    });

    it("should return error when password is incorrect", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUser.isPasswordCorrect).toHaveBeenCalledWith("password123");
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Invalid email or password");
    });

    it("should return error when email is not verified", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        loginMethod: LoginMethod.EMAIL,
        isEmailVerified: false,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(403);
      expect(error.message).toBe("Email not verified");
      expect(error.errors).toEqual(
        expect.arrayContaining([
          { isEmailVerified: "Email not verified" },
          { email: "Email not verified" },
        ])
      );
    });

    it("should return error when user account is disabled", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        loginMethod: LoginMethod.EMAIL,
        isEmailVerified: true,
        isEnabled: false,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(403);
      expect(error.message).toBe(
        "Your account is currently disabled. Please wait for admin approval. If you believe this is a mistake, contact support."
      );
      expect(error.errors).toEqual(
        expect.arrayContaining([{ isEnabled: "User is disabled" }])
      );
    });
  });

  describe("generateAuthTokens", () => {
    it("should generate auth tokens and set cookies in production", async () => {
      (env as any).isProd = true;

      const mockUser = {
        id: 1,
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 1,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      const result = await generateAuthTokens({
        user: mockUser as any,
        req: mockRequest as Request,
        res: mockResponse as Response,
      });

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token",
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
      );
    });

    it("should generate auth tokens with lax sameSite in development", async () => {
      (env as any).isProd = false;

      const mockUser = {
        id: 1,
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 1,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await generateAuthTokens({
        user: mockUser as any,
        req: mockRequest as Request,
        res: mockResponse as Response,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token",
        expect.objectContaining({
          sameSite: "lax",
        })
      );
    });

    it("should create login history record", async () => {
      const mockUser = {
        id: 1,
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 1,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await generateAuthTokens({
        user: mockUser as any,
        req: mockRequest as Request,
        res: mockResponse as Response,
      });

      expect(LoginHistory.findOrCreate).toHaveBeenCalledWith({
        where: {
          userId: 1,
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
        defaults: {
          userId: 1,
          ip: "127.0.0.1",
          userAgent: "test-agent",
        },
      });
    });

    it("should handle secure connection with x-forwarded-proto header", async () => {
      mockRequest.headers = {
        ...mockRequest.headers,
        "x-forwarded-proto": "https",
      };

      const mockUser = {
        id: 1,
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 1,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await generateAuthTokens({
        user: mockUser as any,
        req: mockRequest as Request,
        res: mockResponse as Response,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token",
        expect.objectContaining({
          secure: true,
        })
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle HOST user with no memberships (default limit of 1)", async () => {
      const mockUser = {
        id: 4,
        username: "hostuser3",
        email: "host3@example.com",
        role: Role.HOST,
        fullName: "Host User 3",
        password: "hashedPassword",
        isEmailVerified: true,
        isEnabled: true,
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 4,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Room.count as jest.Mock).mockResolvedValue(0);
      (Payment.findAll as jest.Mock).mockResolvedValue([]);
      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ApiResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availableCredits: 1, // Default limit of 1 minus 0 rooms
          }),
        })
      );
    });

    it("should handle memberships with null or undefined limits", async () => {
      const mockUser = {
        id: 5,
        username: "hostuser4",
        email: "host4@example.com",
        role: Role.HOST,
        fullName: "Host User 4",
        password: "hashedPassword",
        isEmailVerified: true,
        isEnabled: true,
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 5,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Room.count as jest.Mock).mockResolvedValue(1);
      (Payment.findAll as jest.Mock).mockResolvedValue([
        {
          id: 1,
          status: PaymentStatus.COMPLETED,
          membershipType: { id: 1, name: "Basic", limit: null },
        },
        {
          id: 2,
          status: PaymentStatus.COMPLETED,
          membershipType: null,
        },
        {
          id: 3,
          status: PaymentStatus.COMPLETED,
          membershipType: { id: 3, name: "Premium", limit: 5 },
        },
      ]);
      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ApiResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availableCredits: 4, // 0 + 5 - 1 room
          }),
        })
      );
    });

    it("should not include availableCredits for non-HOST users", async () => {
      const mockUser = {
        id: 6,
        username: "regularuser",
        email: "regular@example.com",
        role: Role.USER,
        fullName: "Regular User",
        password: "hashedPassword",
        isEmailVerified: true,
        isEnabled: true,
        loginMethod: LoginMethod.EMAIL,
        isPasswordCorrect: jest.fn().mockResolvedValue(true),
        generateRefreshToken: jest.fn().mockResolvedValue({
          id: 6,
          token: "refresh-token",
        }),
        generateAccessToken: jest.fn().mockResolvedValue("access-token"),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (LoginHistory.findOrCreate as jest.Mock).mockResolvedValue([{}, true]);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Room.count).not.toHaveBeenCalled();
      expect(Payment.findAll).not.toHaveBeenCalled();
      expect(ApiResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availableCredits: undefined,
          }),
        })
      );
    });
  });
});
