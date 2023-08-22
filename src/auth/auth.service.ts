import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { RegisterUserInput } from "./dto/register.input";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { TJwtPayload, TokenType } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    protected readonly jwtService: JwtService
  ) {}

  async validateJwtPayloadAsync(payload: TJwtPayload): Promise<TJwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    return payload;
  }

  async register(registerUserInput: RegisterUserInput): Promise<User> {
    const { email, password } = registerUserInput;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("A user with this email already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await this.prisma.user.create({
      data: { ...registerUserInput, password: hashedPassword },
    });

    return user;
  }

  async login(loginUserInput: RegisterUserInput): Promise<TokenType> {
    const { email, password } = loginUserInput;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("No user found with this email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password");
    }

    const payload: TJwtPayload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
