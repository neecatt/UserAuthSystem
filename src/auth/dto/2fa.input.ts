import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class TwoFactorInput {
  @Field(() => String)
  authCode: string;
}
