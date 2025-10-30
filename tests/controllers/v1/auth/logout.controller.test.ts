import { Request, Response, NextFunction } from "express";
import logout from "@/controllers/v1/auth/logout.controller";
import { RefreshToken } from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { getAuthToken, verifyToken } from "@/utils/jwtUtil";

// Mock dependencies
jest.mock("@/models");
jest.mock("@/utils/jwtUtil");
jest.mock("@/logger");

// Mock ApiResponse
const mockSend = jest.fn();
jest.mock("@/utils/apiResponse", () => {
  return jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
});

describe("Logout Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockClear();

    mockRequest = {
      headers: {
        authorization: "Bearer valid-token",
      },
      cookies: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Success Cases", () => {
    it("should logout successfully with valid token", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(getAuthToken).toHaveBeenCalledWith({ req: mockRequest });
      expect(verifyToken).toHaveBeenCalledWith({
        token: "valid-token",
        ignoreExpiration: true,
      });
      expect(RefreshToken.findByPk).toHaveBeenCalledWith("1");
      expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
        force: true,
      });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(ApiResponse).toHaveBeenCalledWith({
        status: 200,
        message: "Logged out",
      });
      expect(mockSend).toHaveBeenCalledWith(mockResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should logout successfully even when refresh token is not found", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(null);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(RefreshToken.findByPk).toHaveBeenCalledWith("1");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(ApiResponse).toHaveBeenCalledWith({
        status: 200,
        message: "Logged out",
      });
      expect(mockSend).toHaveBeenCalledWith(mockResponse);
    });

    it("should clear both accessToken and refreshToken cookies", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenNthCalledWith(
        1,
        "accessToken"
      );
      expect(mockResponse.clearCookie).toHaveBeenNthCalledWith(
        2,
        "refreshToken"
      );
    });

    it("should force delete refresh token from database", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
        force: true,
      });
    });
  });

  describe("Failure Cases", () => {
    it("should return error when token is not provided", async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Unauthorized");
      expect(mockResponse.clearCookie).not.toHaveBeenCalled();
      expect(ApiResponse).not.toHaveBeenCalled();
    });

    it("should return error when token verification fails", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("invalid-token");
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Unauthorized");
    });

    it("should handle database errors gracefully", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Unauthorized");
    });

    it("should handle destroy errors gracefully", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockRejectedValue(new Error("Delete error")),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Unauthorized");
    });
  });

  describe("Token Verification", () => {
    it("should verify token with ignoreExpiration flag", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith({
        token: "valid-token",
        ignoreExpiration: true,
      });
    });

    it("should extract rfId from decoded token", async () => {
      const mockRefreshToken = {
        id: 5,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "5",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(RefreshToken.findByPk).toHaveBeenCalledWith("5");
    });
  });

  describe("Edge Cases", () => {
    it("should handle expired tokens", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "expired-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("expired-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith({
        token: "expired-token",
        ignoreExpiration: true,
      });
      expect(mockRefreshToken.destroy).toHaveBeenCalled();
      expect(ApiResponse).toHaveBeenCalledWith({
        status: 200,
        message: "Logged out",
      });
    });

    it("should handle undefined token from getAuthToken", async () => {
      (getAuthToken as jest.Mock).mockReturnValue(undefined);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
    });

    it("should handle null token from getAuthToken", async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
    });

    it("should handle empty string token from getAuthToken", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("");

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
    });

    it("should not call destroy when refresh token is null", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(null);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(RefreshToken.findByPk).toHaveBeenCalledWith("1");
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(ApiResponse).toHaveBeenCalledWith({
        status: 200,
        message: "Logged out",
      });
    });

    it("should handle different refresh token IDs", async () => {
      const mockRefreshToken = {
        id: 999,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "999",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(RefreshToken.findByPk).toHaveBeenCalledWith("999");
      expect(mockRefreshToken.destroy).toHaveBeenCalled();
    });
  });

  describe("Cookie Clearing", () => {
    it("should clear cookies before sending response", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify cookies are cleared
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should clear accessToken cookie", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith("accessToken");
    });

    it("should clear refreshToken cookie", async () => {
      const mockRefreshToken = {
        id: 1,
        token: "refresh-token",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (getAuthToken as jest.Mock).mockReturnValue("valid-token");
      (verifyToken as jest.Mock).mockReturnValue({
        userId: "1",
        rfId: "1",
      });
      (RefreshToken.findByPk as jest.Mock).mockResolvedValue(mockRefreshToken);

      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken");
    });
  });
});
