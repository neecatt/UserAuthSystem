import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UserType } from "../users/models/user.model";
import { RegisterUserInput } from "./dto/register.input";
import { AuthService } from "./auth.service";
import { TokenType } from "./types";
import { UnauthorizedException, UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { CurrentUser } from "./decorators/get-user-id.decorator";
import { ChangePasswordInput } from "./dto/change-password.input";
import { UsersService } from "../users/users.service";
import { User } from "@prisma/client";
import { TwoFactorInput } from "./dto/2fa.input";
import { QrCodeType } from "./types/qrCode.type";

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Register a new user.
   */
  @Mutation(() => UserType)
  async register(
    @Args("input") { email, password }: RegisterUserInput
  ): Promise<User> {
    return this.authService.register({ email, password });
  }

  /**
   * Log in a user.
   */
  @Mutation(() => TokenType)
  async login(
    @Args("input") { email, password }: RegisterUserInput
  ): Promise<TokenType> {
    return this.authService.login({ email, password });
  }

  /**
   * Change user's password.
   */
  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args("input") changePasswordInput: ChangePasswordInput,
    @CurrentUser() user: User
  ): Promise<User> {
    return this.authService.changePassword(user.id, changePasswordInput);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async enableTwoFactorAuthentication(
    @CurrentUser() user: User,
    @Args("input") twoFactorInput: TwoFactorInput
  ) {
    const isCodeValid = this.usersService.isTwoFactorAuthenticationCodeValid(
      twoFactorInput.authCode,
      user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException("Invalid two-factor authentication code");
    }
    return await this.usersService.setTwoFactorStatus(user.id, true);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async authenticateTwoFactor(
    @CurrentUser() user: User,
    @Args("input") twoFactorInput: TwoFactorInput
  ) {
    const isCodeValid = this.usersService.isTwoFactorAuthenticationCodeValid(
      twoFactorInput.authCode,
      user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException("Invalid two-factor authentication code");
    }
    return await this.authService.loginWith2fa(user);
  }

  @Mutation(() => QrCodeType)
  @UseGuards(GqlAuthGuard)
  async generateQrCode(@CurrentUser() user: User) {
    return await this.authService.generateTwoFactorQrCode(user);
  }
}
