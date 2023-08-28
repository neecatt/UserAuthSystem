import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserInput } from "./dto/create-user.input";
import { PrismaService } from "../prisma.service";
import { User } from "@prisma/client";
import { authenticator } from "otplib";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateUserInput) {
    return await this.prisma.user.create({
      data,
    });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async setTwoFactorSecret(id: string, secret: string) {
    console.log("id", id);
    return await this.prisma.user.update({
      where: { id },
      data: { twoFactorSecret: secret },
    });
  }

  async setTwoFactorStatus(userId: string, status: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: status },
    });
  }
  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User
  ) {
    const prisma_user = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!prisma_user?.twoFactorSecret) {
      throw new BadRequestException("User or two-factor secret is missing");
    }

    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: prisma_user.twoFactorSecret,
    });
  }
}
