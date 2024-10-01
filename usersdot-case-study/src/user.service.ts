import { Injectable, ConflictException } from '@nestjs/common';
import { MySQLService } from './mysql.service';
import { User } from './user.interface';
import { createHash } from 'crypto'; 

@Injectable()
export class UserService {
  constructor(private readonly mysqlService: MySQLService) {}

  async findAll(page: number = 1, limit: number = 5, query?: string): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit; 
    let sql = 'SELECT * FROM users';
    const params: string[] = [];

    if (query) {
        sql += ' WHERE name LIKE ? OR surname LIKE ?';
        params.push(`%${query}%`, `%${query}%`);
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`; 

    console.log('Executing SQL:', sql);
    console.log('With parameters:', params);

    const users = await this.mysqlService.query(sql, params); 

    const countSql = 'SELECT COUNT(*) AS total FROM users' + (query ? ' WHERE name LIKE ? OR surname LIKE ?' : '');
    const countParams: string[] = query ? [`%${query}%`, `%${query}%`] : [];
    const countResult = await this.mysqlService.query(countSql, countParams);
    const total = countResult[0].total;

    return { users, total }; 
}


  async search(query: string): Promise<User[]> {
    const sql = `
      SELECT * FROM users WHERE name LIKE ? OR surname LIKE ?
    `;
    const results = await this.mysqlService.query(sql, [`%${query}%`, `%${query}%`]);
    return results;
  }

  async findOne(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const result = await this.mysqlService.query(sql, [id]);
    return result.length > 0 ? result[0] : null; 
  }

  async emailExists(email: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    const result = await this.mysqlService.query(sql, [email]);
    return result[0].count > 0;
  }

  async create(user: User): Promise<User> {
    if (await this.emailExists(user.email)) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
    }

    const hashedPassword = this.hashPasswordSHA256(user.password); 
    const sql = `
      INSERT INTO users (name, surname, email, password, phone, age, country, district, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.mysqlService.query(sql, [
      user.name,
      user.surname,
      user.email,
      hashedPassword, 
      user.phone,
      user.age,
      user.country,
      user.district,
      user.role,
    ]);
    user.id = result.insertId; 
    return user;
  }

  async update(id: number, userData: User): Promise<User | null> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new ConflictException('Kullanıcı bulunamadı');
    }

    if (userData.email !== existingUser.email && await this.emailExists(userData.email)) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
    }

    const sql = `
      UPDATE users
      SET 
        name = ?, 
        surname = ?, 
        email = ?, 
        password = ?, 
        phone = ?, 
        age = ?, 
        country = ?, 
        district = ?, 
        role = ?
      WHERE id = ?
    `;

    const hashedPassword = userData.password ? this.hashPasswordSHA256(userData.password) : existingUser.password;

    const result = await this.mysqlService.query(sql, [
      userData.name ?? null,
      userData.surname ?? null,
      userData.email ?? null,
      hashedPassword, 
      userData.phone ?? null,
      userData.age ?? null,
      userData.country ?? null,
      userData.district ?? null,
      userData.role ?? null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return null; 
    }

    return { ...userData, id };
  }

  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await this.mysqlService.query(sql, [id]);
    return result.affectedRows > 0; 
  }

  private hashPasswordSHA256(password: string): string {
    return createHash('sha256').update(password).digest('hex'); 
  }
}
