import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { User } from "src/users/models/user.model";
import { RegisterUserInput } from "./dto/register.input";
import { AuthService } from "./auth.service";
import { TokenType } from "./types";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { CurrentUser } from "./decorators/get-user-id.decorator";
import { ChangePasswordInput } from "./dto/change-password.input";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user.
   */
  @Mutation(() => User)
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
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args("input") changePasswordInput: ChangePasswordInput,
    @CurrentUser() user: User
  ): Promise<User> {
    return this.authService.changePassword(user.id, changePasswordInput);
  }
}
