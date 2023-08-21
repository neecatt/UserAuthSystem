import { Injectable } from "@nestjs/common";
import { CreateUserInput } from "./dto/create-user.input";
import { PrismaService } from "src/prisma.service";

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
}
