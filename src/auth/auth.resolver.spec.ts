import { Test, TestingModule } from "@nestjs/testing";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { UnauthorizedException } from "@nestjs/common";
import { User } from "@prisma/client";
import { TwoFactorInput } from "./dto/2fa.input";
import { QrCodeType } from "./types/qrCode.type";

describe("AuthResolver", () => {
  let authResolver: AuthResolver;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            changePassword: jest.fn(),
            loginWith2fa: jest.fn(),
            generateTwoFactorQrCode: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            isTwoFactorAuthenticationCodeValid: jest.fn(),
            setTwoFactorStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  // Tests for each mutation will go here.

  it("should register a new user", async () => {
    const mockRegisterInput = {
      email: "test@example.com",
      password: "password",
    };
    const mockUser: Partial<User> = { id: "mockUserId", ...mockRegisterInput };
    authService.register = jest.fn().mockResolvedValue(mockUser);

    const result = await authResolver.register(mockRegisterInput);
    expect(result).toBe(mockUser);
    expect(authService.register).toHaveBeenCalledWith(mockRegisterInput);
  });

  it("should log in a user", async () => {
    const mockLoginInput = { email: "test@example.com", password: "password" };
    const mockTokenType = { access_token: "token" };
    authService.login = jest.fn().mockResolvedValue(mockTokenType);

    const result = await authResolver.login(mockLoginInput);
    expect(result).toBe(mockTokenType);
    expect(authService.login).toHaveBeenCalledWith(mockLoginInput);
  });

  it("should change a user's password", async () => {
    const mockChangePasswordInput = {
      oldPassword: "oldPassword",
      newPassword: "newPassword",
    };
    const mockUser: Partial<User> = { id: "mockUserId" };
    authService.changePassword = jest.fn().mockResolvedValue(mockUser);

    const result = await authResolver.changePassword(
      mockChangePasswordInput,
      mockUser as User
    );
    expect(result).toBe(mockUser);
    expect(authService.changePassword).toHaveBeenCalledWith(
      mockUser.id,
      mockChangePasswordInput
    );
  });

  it("should enable two-factor authentication", async () => {
    const mockTwoFactorInput: TwoFactorInput = {
      authCode: "authCode",
    };
    const mockUser: Partial<User> = { id: "mockUserId" };
    const mockUpdatedUser: Partial<User> = {
      id: "mockUserId",
      twoFactorEnabled: true,
    };
    usersService.isTwoFactorAuthenticationCodeValid = jest
      .fn()
      .mockResolvedValue(true);
    usersService.setTwoFactorStatus = jest
      .fn()
      .mockResolvedValue(mockUpdatedUser);

    const result = await authResolver.enableTwoFactorAuthentication(
      mockUser as User,
      mockTwoFactorInput
    );
    expect(result).toBe(mockUpdatedUser);
    expect(
      usersService.isTwoFactorAuthenticationCodeValid
    ).toHaveBeenCalledWith(mockTwoFactorInput.authCode, mockUser);
    expect(usersService.setTwoFactorStatus).toHaveBeenCalledWith(
      mockUser.id,
      true
    );
  });
});
