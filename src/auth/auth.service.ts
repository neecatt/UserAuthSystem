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

@Injectable()
export class AuthService {
  constructor(
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

  private async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  private async checkUserExists(user: User | null): Promise<void> {
    if (!user) {
      throw new NotFoundException("No user found");
    }
  }

  private async checkIfUserExistsByEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new ConflictException("A user with this email already exists");
    }
  }

  private async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private throwUnauthorizedExceptionIfInvalid(isPasswordValid: boolean): void {
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password");
    }
  }

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
