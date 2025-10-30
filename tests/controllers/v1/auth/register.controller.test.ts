import { Request, Response } from "express";
import register from "@/controllers/v1/auth/register.controller";
import { User, UserProfile, EmailVerification, Media } from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import {
  FileStorageDirectory,
  Gender,
  MaritalStatus,
  OccupationStatus,
  Role,
  UserStatus,
} from "@/enums";
import { hashPassword } from "@/utils/passwordUtil";
import { createMedia } from "@/controllers/v1/media";

// Mock dependencies
jest.mock("@/models");
jest.mock("@/utils/passwordUtil");
jest.mock("@/controllers/v1/media");
jest.mock("@/helpers/helper");
jest.mock("@/logger");

// Mock ApiResponse
const mockSend = jest.fn();
jest.mock("@/utils/apiResponse", () => {
  return jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
});

describe("Register Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockClear();

    mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
        gender: Gender.MALE,
        dob: new Date("1990-01-01"),
        phone: "1234567890",
        occupationStatus: OccupationStatus.EMPLOYED,
        maritalStatus: MaritalStatus.SINGLE,
        role: Role.USER,
      },
      file: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("Success Cases", () => {
    it("should register a regular user successfully without document", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: "test" },
      });
      expect(User.create).toHaveBeenCalledWith({
        fullName: "Test User",
        email: "test@example.com",
        username: "test",
        password: "password123",
        isEmailVerified: true,
        isEnabled: false,
        role: Role.USER,
      });
      expect(UserProfile.create).toHaveBeenCalled();
      expect(hashPassword).toHaveBeenCalledWith("123456");
      expect(mockEmailVerification.save).toHaveBeenCalled();
      expect(ApiResponse).toHaveBeenCalledWith({
        message: "User registered successfully",
        status: 201,
      });
      expect(mockSend).toHaveBeenCalledWith(mockResponse);
    });

    it("should register a HOST user successfully with document", async () => {
      const mockFile = {
        fieldname: "document",
        originalname: "doc.pdf",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 1024,
        buffer: Buffer.from("test"),
      } as Express.Multer.File;

      mockRequest.file = mockFile;
      mockRequest.body.role = Role.HOST;

      const mockUser = {
        id: 2,
        email: "host@example.com",
        username: "host",
        fullName: "Host User",
        role: Role.HOST,
      };

      const mockMedia = {
        id: 1,
        fileName: "doc.pdf",
        path: "/uploads/documents/doc.pdf",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (createMedia as jest.Mock).mockResolvedValue(mockMedia);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(createMedia).toHaveBeenCalled();
      expect(UserProfile.create).toHaveBeenCalled();
      expect(ApiResponse).toHaveBeenCalledWith({
        message: "User registered successfully",
        status: 201,
      });
    });

    it("should handle duplicate username by appending count", async () => {
      const existingUser = {
        id: 1,
        username: "test",
        email: "existing@example.com",
      };

      const mockUser = {
        id: 2,
        email: "test@example.com",
        username: "test6",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingUser);
      (User.count as jest.Mock).mockResolvedValue(5);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: "test" },
      });
      expect(User.count).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "test6",
        })
      );
    });

    it("should create user with default role when role is not provided", async () => {
      delete mockRequest.body.role;

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: Role.USER,
        })
      );
    });

    it("should set user status based on role", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(UserProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: UserStatus.PENDING,
        })
      );
    });
  });

  describe("Failure Cases", () => {
    it("should throw error when HOST role requires document but none provided", async () => {
      mockRequest.body.role = Role.HOST;
      mockRequest.file = undefined;

      await expect(
        register(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(ApiError);

      await expect(
        register(mockRequest as Request, mockResponse as Response)
      ).rejects.toMatchObject({
        status: 400,
        message: "Document is required",
      });
    });

    it("should throw error with proper error details when document is missing for HOST", async () => {
      mockRequest.body.role = Role.HOST;
      mockRequest.file = undefined;

      try {
        await register(mockRequest as Request, mockResponse as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).message).toBe("Document is required");
        expect((error as ApiError).errors).toEqual([
          { document: "Document is required" },
        ]);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle email with complex username generation", async () => {
      mockRequest.body.email = "complex.email+test@example.com";

      const mockUser = {
        id: 1,
        email: "complex.email+test@example.com",
        username: "complex.email+test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "complex.email+test",
        })
      );
    });

    it("should set isEmailVerified to true and isEnabled to false for new users", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isEmailVerified: true,
          isEnabled: false,
        })
      );
    });

    it("should create EmailVerification with correct OTP and expiration", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(EmailVerification.build).toHaveBeenCalled();
      expect(hashPassword).toHaveBeenCalledWith("123456");
    });

    it("should set isPhoneVerified to false for new users", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(UserProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isPhoneVerified: false,
        })
      );
    });

    it("should handle different gender values", async () => {
      mockRequest.body.gender = Gender.FEMALE;

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(UserProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: Gender.FEMALE,
        })
      );
    });

    it("should handle different occupation statuses", async () => {
      mockRequest.body.occupationStatus = OccupationStatus.STUDENT;

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(UserProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          occupationStatus: OccupationStatus.STUDENT,
        })
      );
    });

    it("should handle different marital statuses", async () => {
      mockRequest.body.maritalStatus = MaritalStatus.MARRIED;

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(UserProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          maritalStatus: MaritalStatus.MARRIED,
        })
      );
    });
  });

  describe("OTP Generation", () => {
    it("should use static OTP 123456 for testing", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(hashPassword).toHaveBeenCalledWith("123456");
    });

    it("should hash the OTP before saving", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        fullName: "Test User",
        role: Role.USER,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (UserProfile.create as jest.Mock).mockResolvedValue({});
      (hashPassword as jest.Mock).mockResolvedValue("hashedOtp123");

      const mockEmailVerification = {
        save: jest.fn().mockResolvedValue({}),
      };
      (EmailVerification.build as jest.Mock).mockReturnValue(
        mockEmailVerification
      );

      await register(mockRequest as Request, mockResponse as Response);

      expect(EmailVerification.build).toHaveBeenCalledWith(
        expect.objectContaining({
          otp: "hashedOtp123",
        })
      );
    });
  });
});
