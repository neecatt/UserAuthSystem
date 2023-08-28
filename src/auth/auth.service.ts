import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { RegisterUserInput } from "./dto/register.input";
import { ChangePasswordInput } from "./dto/change-password.input";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { TJwtPayload, TokenType } from "./types";
import { authenticator } from "otplib";
import { UsersService } from "src/users/users.service";
import { toDataURL } from "qrcode";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Validate JWT payload asynchronously.
   * @param {TJwtPayload} payload - JWT payload to validate.
   * @returns {Promise<TJwtPayload>} - Validated payload.
   * @throws {UnauthorizedException} - If the user is not valid.
   */
  async validateJwtPayloadAsync(payload: TJwtPayload): Promise<TJwtPayload> {
    const user = await this.findUserById(payload.id);

    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    return payload;
  }

  /**
   * Register a new user.
   * @param {RegisterUserInput} registerUserInput - User input for registration.
   * @returns {Promise<User>} - Registered user.
   * @throws {ConflictException} - If a user with the email already exists.
   */
  async register(registerUserInput: RegisterUserInput): Promise<User> {
    const { email, password } = registerUserInput;
    await this.checkIfUserExistsByEmail(email);

    const hashedPassword = await this.hashPassword(password);
    const user = await this.prisma.user.create({
      data: { ...registerUserInput, password: hashedPassword },
    });

    return user;
  }

  /**
   * Log in a user.
   * @param {RegisterUserInput} loginUserInput - User input for login.
   * @returns {Promise<TokenType>} - Access token.
   * @throws {NotFoundException} - If no user is found with the given email.
   * @throws {UnauthorizedException} - If the password is invalid.
   */
  async login(loginUserInput: RegisterUserInput): Promise<TokenType> {
    const { email, password } = loginUserInput;
    const user = await this.findUserByEmail(email);
    await this.checkUserExists(user);

    const isPasswordValid = await this.comparePasswords(
      password,
      user.password
    );
    this.throwUnauthorizedExceptionIfInvalid(isPasswordValid);

    const payload: TJwtPayload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  /**
   * Change user's password.
   * @param {string} userId - User ID.
   * @param {ChangePasswordInput} changePasswordInput - Input for password change.
   * @returns {Promise<User>} - Updated user.
   * @throws {NotFoundException} - If no user is found with the given ID.
   * @throws {UnauthorizedException} - If the old password is invalid.
   */
  async changePassword(
    userId: string,
    changePasswordInput: ChangePasswordInput
  ) {
    const { oldPassword, newPassword } = changePasswordInput;
    const user = await this.findUserById(userId);
    await this.checkUserExists(user);

    const isPasswordValid = await this.comparePasswords(
      oldPassword,
      user.password
    );
    this.throwUnauthorizedExceptionIfInvalid(isPasswordValid);

    const hashedPassword = await this.hashPassword(newPassword);
    const updatedUser = await this.updateUserPassword(userId, hashedPassword);

    return updatedUser;
  }

  /**
   * Generates a two-factor authentication secret for the specified user.
   * @param user The user for which to generate the secret.
   * @returns An object containing the secret and the OTPAuth URL.
   */
  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email,
      "DjinniAuthAppTask",
      secret
    );

    await this.usersService.setTwoFactorSecret(user.id, secret);

    return {
      secret,
      otpauthUrl,
    };
  }

  /**
   * Generates a QR code data URL for the specified OTPAuth URL.
   * @param otpAuthUrl The OTPAuth URL for which to generate the QR code data URL.
   * @returns The QR code data URL.
   */
  async generateQrCodeDataURL(otpAuthUrl: string): Promise<string> {
    return await toDataURL(otpAuthUrl);
  }

  async generateTwoFactorQrCode(user: User) {
    const { secret, otpauthUrl } =
      await this.generateTwoFactorAuthenticationSecret(user);

    const qrCodeDataURL = await this.generateQrCodeDataURL(otpauthUrl);

    return {
      qrCodeUrl: qrCodeDataURL,
      secret,
    };
  }

  /**
   * Logs in the user with two-factor authentication.
   * @param userWithoutPsw The user object without the password.
   * @returns An object containing the user's email and access token.
   */
  async loginWith2fa(userWithoutPsw: Partial<User>) {
    const payload = {
      email: userWithoutPsw.email,
      isTwoFactorAuthenticationEnabled: !!userWithoutPsw.twoFactorEnabled,
      isTwoFactorAuthenticated: true,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Finds a user by ID.
   * @param id The ID of the user to find.
   * @returns The user with the specified ID, or null if no user is found.
   */
  private async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Finds a user by email.
   * @param email The email of the user to find.
   * @returns The user with the specified email, or null if no user is found.
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Checks if a user exists.
   * @param user The user to check.
   * @throws NotFoundException if the user does not exist.
   */
  private async checkUserExists(user: User | null): Promise<void> {
    if (!user) {
      throw new NotFoundException("No user found");
    }
  }

  /**
   * Checks if a user with the specified email exists.
   * @param email The email to check.
   * @throws ConflictException if a user with the specified email already exists.
   */
  private async checkIfUserExistsByEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new ConflictException("A user with this email already exists");
    }
  }

  /**
   * Compares a password with a hashed password.
   * @param password The password to compare.
   * @param hashedPassword The hashed password to compare.
   * @returns True if the password matches the hashed password, false otherwise.
   */
  private async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Hashes a password.
   * @param password The password to hash.
   * @returns The hashed password.
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Throws an UnauthorizedException if the password is invalid.
   * @param isPasswordValid True if the password is valid, false otherwise.
   * @throws UnauthorizedException if the password is invalid.
   */
  private throwUnauthorizedExceptionIfInvalid(isPasswordValid: boolean): void {
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password");
    }
  }

  /**
   * Updates a user's password.
   * @param userId The ID of the user to update.
   * @param newPassword The new password.
   * @returns The updated user.
   */
  private async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }
}
