import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AtStrategy } from "./strategies/accessToken.strategy";
import { PrismaService } from "src/prisma.service";
import { AuthResolver } from "./auth.resolver";
import * as dotenv from "dotenv";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { UsersService } from "src/users/users.service";
dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      privateKey: process.env.JWT_ACCESS_SECRET,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME },
    }),
    PassportModule,
  ],
  providers: [
    AuthService,
    AtStrategy,
    PrismaService,
    AuthResolver,
    GqlAuthGuard,
    UsersService,
  ],
})
export class AuthModule {}
