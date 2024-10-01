import { Controller, Get, Post, Body, Put, Param, Delete, NotFoundException, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Tüm kullanıcıları listele (pagination ve arama desteği ile)
  @Get()
  async findAll(
    @Query('page') page: number = 1, // Varsayılan değer 1
    @Query('limit') limit: number = 10, // Varsayılan limit 10
    @Query('query') query?: string, // Opsiyonel arama terimi
  ): Promise<{ users: User[]; total: number }> {
    return this.userService.findAll(page, limit, query); // Servis metodunu çağır
  }

  // Belirli bir kullanıcıyı ID ile bul
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(parseInt(id, 10));
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return user;
  }

  // Yeni kullanıcı oluştur
  @Post()
  async create(@Body() user: User): Promise<User> {
    return this.userService.create(user);
  }

  // Belirli bir kullanıcıyı güncelle
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: User): Promise<User> {
    const updatedUser = await this.userService.update(parseInt(id, 10), user);
    if (!updatedUser) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return updatedUser;
  }

  // Belirli bir kullanıcıyı sil
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.userService.delete(parseInt(id, 10));
    if (!deleted) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
  }
}
