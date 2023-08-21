import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./models/user.model";
import { UsersService } from "./users.service";
import { CreateUserInput } from "./dto/create-user.input";

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  @Query(() => String)
  sayHello(): string {
    return "Hello World!";
  }

  @Query(() => User)
  async user(@Args("id") id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(
    @Args("CreateUserInput") createUserInput: CreateUserInput
  ): Promise<User> {
    return await this.usersService.create(createUserInput);
  }
}
