import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class QrCodeType {
  @Field()
  qrCodeUrl: string;

  @Field()
  secret: string;
}
