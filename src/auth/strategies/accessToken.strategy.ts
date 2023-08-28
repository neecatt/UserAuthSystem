import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import * as dotenv from "dotenv";
import { AuthService } from "../auth.service";
import { TJwtPayload } from "../types";
dotenv.config();

export class AtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: TJwtPayload): Promise<TJwtPayload> {
    return payload;
  }
}
