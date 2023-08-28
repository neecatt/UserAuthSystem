import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsOptional, MinLength } from "class-validator";

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MinLength(8)
  password?: string;
}
