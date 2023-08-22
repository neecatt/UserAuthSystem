import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AtStrategy } from "./strategies/accessToken.strategy";
import { PrismaService } from "src/prisma.service";
import { AuthResolver } from "./auth.resolver";
import * as dotenv from "dotenv";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      privateKey: process.env.JWT_ACCESS_SECRET,
      secret: process.env.JWT_ACCESS_SECRET,
    }),
    PassportModule,
  ],
  providers: [
    AuthService,
    AtStrategy,
    PrismaService,
    AuthResolver,
    GqlAuthGuard,
  ],
})
export class AuthModule {}
