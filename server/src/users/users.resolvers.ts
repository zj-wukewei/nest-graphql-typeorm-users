import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User } from './models/user';
import { User as UserEntity } from './entity/user.entity';
import { NewUserInput } from './dto/new-user.input';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '../auth/gql.auth.guard';
import { CurrentUser } from '../auth/create.param.decorator';
import BasePageArgs from '../common/page/base-page-args';
import { UserPageInfo } from './models/user-page';

const pubSub = new PubSub();

@Resolver(of => User)
export class UsersResolvers {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => [User])
  @UseGuards(GqlAuthGuard)
  async users(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Query(returns => UserPageInfo)
  async usersPage(@Args() args: BasePageArgs): Promise<UserPageInfo> {
    return await this.usersService.users(args);
  }

  @Query(returns => User)
  async user(
    @Args('id', ParseIntPipe)
    id: number,
  ): Promise<UserEntity> {
    return await this.usersService.findOneById(id);
  }

  @Query(returns => User)
  @UseGuards(GqlAuthGuard)
  async whoAmI(@CurrentUser() user: User): Promise<UserEntity> {
    return await this.usersService.findOneById(user.id);
  }

  @Mutation(returns => User)
  async addUser(@Args('newUserData') newUserData: NewUserInput): Promise<UserEntity> {
    const userEntity = new UserEntity();
    userEntity.phone = newUserData.phone;
    userEntity.password = '123456';
    userEntity.createDate = new Date();
    const createdUser = await this.usersService.create(userEntity);
    pubSub.publish('userCreated', { userCreated: createdUser });
    return createdUser;
  }

  @Subscription(returns => User)
  userCreated() {
    return pubSub.asyncIterator('userCreated');
  }
}
