import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ChangePasswordInput {
  @Field(() => String, { description: "The user's current password" })
  oldPassword: string;

  @Field(() => String, { description: "The user's new password" })
  newPassword: string;
}
