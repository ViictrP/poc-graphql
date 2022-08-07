import {
  Arg,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  ObjectType,
  Field,
  Ctx,
} from 'type-graphql';
import crypto from 'crypto';
import User from '../models/User';
import isAuthenticated from '../middlewares/isAuthenticated';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import MyContext from '../context/myContext';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken!: string;
}

@Resolver()
export class UserResolver {
  private data: User[] = [];

  @Query(() => [User])
  @UseMiddleware(isAuthenticated)
  async users() {
    console.log('[UserResolver]: fetching users');
    return this.data;
  }

  @Query(() => User)
  @UseMiddleware(isAuthenticated)
  async getProfile(@Ctx() { payload }: MyContext) {
    console.log(
      `[UserResolver]: getting logged in user: ${payload!.id} profile`,
    );
    return this.data.find((user) => user.id === payload!.id);
  }

  @Mutation(() => User)
  async createUser(
    @Arg('name') name: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
  ) {
    console.log(`[UserResolver]: verifying if user ${username} already exists`);
    const user = this.data.find((user) => user.username === username);
    if (user) {
      console.log(`[UserResolver]: user ${username} already exists`);
      throw new Error(`user ${username} already exists`);
    }

    console.log(`[UserResolver]: cryptographing user ${username}'s password`);
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      username,
      password: hashedPassword,
    };

    console.log(`[UserResolver]: persisting new user ${username}`);
    this.data.push(newUser);
    console.log(`[UserResolver]: User created ${newUser.name}`);
    return newUser;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
  ): Promise<LoginResponse> {
    console.log(`[UserResolver]: searching user by username: ${username}`);
    const user = this.data.find((user) => user.username === username);

    if (!user) {
      console.log(
        `[UserResolver]: user not found for the username: ${username}`,
      );
      throw new Error('user not found');
    }

    console.log(`[UserResolver]: validating credentials of user: ${username}`);
    const passwordIsEqual = await bcrypt.compare(password, user.password);

    if (!passwordIsEqual) {
      console.log(`[UserResolver]: invalid credentials for ${username}`);
      throw new Error('invalid credentials');
    }

    console.log(`[UserResolver]: ${user.name} is authenticated`);
    const data = { id: user.id, username: user.username, time: new Date() };
    const accessToken = sign(data, 'APP_SECRET');
    return { accessToken };
  }
}
