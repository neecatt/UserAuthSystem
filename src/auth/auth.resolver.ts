import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "src/users/models/user.model";
import { RegisterUserInput } from "./dto/register.input";
import { AuthService } from "./auth.service";
import { TokenType } from "./types";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "./guards/gql-auth.guard";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @Mutation(() => User)
  async register(
    @Args("input") registerUserInput: RegisterUserInput
  ): Promise<User> {
    return await this.authService.register(registerUserInput);
  }

  @Mutation(() => TokenType)
  async login(
    @Args("input") loginUserInput: RegisterUserInput
  ): Promise<TokenType> {
    return await this.authService.login(loginUserInput);
  }
}
