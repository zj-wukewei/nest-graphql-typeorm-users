import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { CustomUserRepository } from './user.repository';
import BasePageArgs from '../../common/page/base-page-args';
import { paginate, Pagination } from '../../common/page';
import { RoleService } from '../role/role.service';
import { NewUserInput, UpdateUserInfo } from './dto';
import { ConfigService } from '../config/config.service';
import { CustomUserInfoRepository } from './user-Info.repository';
import { UserInfo } from './models';
import { errorUtil } from '../../utils';
import { AuthUser } from '../auth/models/auth-user';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: CustomUserRepository,
    private readonly roleService: RoleService,
    private readonly configService: ConfigService,
    private readonly userInfoRepository: CustomUserInfoRepository,
  ) {}

  async create(user: NewUserInput): Promise<User> {
    const findUser = await this.userRepository.findOneByPhone(user.phone);
    if (findUser) {
      return errorUtil.ERROR({ error: '用户已存在' });
    }
    return await this.userRepository.save({
      ...user,
      password: this.configService.getDefaultPassword(),
      createDate: new Date(),
    });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['info'], order: { createDate: 'DESC' } });
  }

  async users(args: BasePageArgs): Promise<Pagination<User>> {
    return await paginate(
      this.userRepository,
      { pageNumber: args.pn, pageSize: args.ps },
      { order: { createDate: 'DESC' } },
    );
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOne(id, { relations: ['info'] });
  }

  async updateUserInfo(current: AuthUser, args: UpdateUserInfo): Promise<User> {
    const updateInfo: UserInfo = Object.assign(new UserInfo(), args);
    if (current.info) {
      updateInfo.id = current.info.id;
    }
    updateInfo.createDate = new Date();
    const info = await this.userInfoRepository.save(updateInfo);
    const user = new User();
    user.id = current.id;
    user.info = info;
    return await this.userRepository.save(user);
  }

  async findOneByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOneByPhone(phone);
    if (!user) {
      throw new NotFoundException();
    }

    if (user.roles && user.roles.length > 0) {
      const roles = await this.roleService.findByIds(user);
      user.roles = roles;
    }
    return user;
  }
}
