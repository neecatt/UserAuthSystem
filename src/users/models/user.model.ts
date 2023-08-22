import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Exclude } from "class-transformer";

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  password: string;
}
