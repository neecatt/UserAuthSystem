import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { AuthService } from "./auth/auth.service";
import { AuthModule } from "./auth/auth.module";
import { upperDirectiveTransformer } from "./common/directives/upper-case.directive";
import { PrismaService } from "./prisma.service";
import { DirectiveLocation, GraphQLDirective } from "graphql";
import { JwtService } from "@nestjs/jwt";
import { GqlAuthGuard } from "./auth/guards/gql-auth.guard";

@Module({
  imports: [
    UsersModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: "schema.gql",
      transformSchema: (schema) => upperDirectiveTransformer(schema, "upper"),
      installSubscriptionHandlers: true,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          footer: false,
        }),
      ],
      playground: false,
      introspection: true,
      cors: {
        origin: "*",
        credentials: true,
      },
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: "upper",
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [AppService, AuthService, PrismaService, JwtService, GqlAuthGuard],
})
export class AppModule {}
