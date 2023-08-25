import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserType } from "./models/user.model";
import { UsersService } from "./users.service";
import { CreateUserInput } from "./dto/create-user.input";
import { User } from "@prisma/client";
import { CurrentUser } from "src/auth/decorators/get-user-id.decorator";

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  @Query(() => String)
  sayHello(): string {
    return "Hello World!";
  }

  @Query(() => UserType)
  async user(@Args("id") id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Mutation(() => UserType)
  async createUser(
    @Args("CreateUserInput") createUserInput: CreateUserInput
  ): Promise<User> {
    return await this.usersService.create(createUserInput);
  }
}
