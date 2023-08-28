import { Test, TestingModule } from "@nestjs/testing";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";

describe("UsersResolver", () => {
  let usersResolver: UsersResolver;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    usersResolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  it("should return 'Hello World!' from sayHello query", () => {
    const result = usersResolver.sayHello();
    expect(result).toBe("Hello World!");
  });

  it("should return a user from user query", async () => {
    const mockUser = {
      id: "1",
      email: "",
      password: "",
      twoFactorSecret: "",
      twoFactorEnabled: false,
      twoFactorVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .spyOn(usersService, "findOne")
      .mockImplementation(async () => mockUser);
    const result = await usersResolver.user("1");
    expect(result).toBe(mockUser);
  });

  it("should return a user from createUser mutation", async () => {
    const mockUser = {
      id: "1",
      email: "",
      password: "",
      twoFactorSecret: "",
      twoFactorEnabled: false,
      twoFactorVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(usersService, "create").mockImplementation(async () => mockUser);
    const result = await usersResolver.createUser({
      email: "",
      password: "",
    });
    expect(result).toBe(mockUser);
  });
});
