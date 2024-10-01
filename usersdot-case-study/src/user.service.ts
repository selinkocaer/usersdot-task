import { Injectable, ConflictException } from '@nestjs/common';
import { MySQLService } from './mysql.service';
import { User } from './user.interface';
import { createHash } from 'crypto'; // Importing the crypto module

@Injectable()
export class UserService {
  constructor(private readonly mysqlService: MySQLService) {}

  // Tüm kullanıcıları bul
  async findAll(page: number = 1, limit: number = 5, query?: string): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit; // Calculate the offset
    let sql = 'SELECT * FROM users';
    const params: string[] = [];

    if (query) {
        sql += ' WHERE name LIKE ? OR surname LIKE ?';
        params.push(`%${query}%`, `%${query}%`);
    }

    // Add LIMIT and OFFSET
    sql += ` LIMIT ${limit} OFFSET ${offset}`; 

    console.log('Executing SQL:', sql);
    console.log('With parameters:', params);

    const users = await this.mysqlService.query(sql, params); 

    // Get the total count of users
    const countSql = 'SELECT COUNT(*) AS total FROM users' + (query ? ' WHERE name LIKE ? OR surname LIKE ?' : '');
    const countParams: string[] = query ? [`%${query}%`, `%${query}%`] : [];
    const countResult = await this.mysqlService.query(countSql, countParams);
    const total = countResult[0].total;

    return { users, total }; // Return users and total count
}


  // Kullanıcıları arama
  async search(query: string): Promise<User[]> {
    const sql = `
      SELECT * FROM users WHERE name LIKE ? OR surname LIKE ?
    `;
    const results = await this.mysqlService.query(sql, [`%${query}%`, `%${query}%`]);
    return results;
  }

  // Belirli bir kullanıcıyı ID ile bul
  async findOne(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const result = await this.mysqlService.query(sql, [id]);
    return result.length > 0 ? result[0] : null; 
  }

  // Kullanıcı email'ini kontrol et
  async emailExists(email: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    const result = await this.mysqlService.query(sql, [email]);
    return result[0].count > 0;
  }

  // Yeni kullanıcı oluştur
  async create(user: User): Promise<User> {
    // Email kontrolü
    if (await this.emailExists(user.email)) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
    }

    // Şifreyi hash'le (SHA-256)
    const hashedPassword = this.hashPasswordSHA256(user.password); // Hashing using SHA-256
    const sql = `
      INSERT INTO users (name, surname, email, password, phone, age, country, district, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.mysqlService.query(sql, [
      user.name,
      user.surname,
      user.email,
      hashedPassword, // Hash'lenmiş şifreyi kullan
      user.phone,
      user.age,
      user.country,
      user.district,
      user.role,
    ]);
    user.id = result.insertId; // Yeni oluşturulan kullanıcının ID'sini al
    return user;
  }

  // Kullanıcıyı güncelle
  async update(id: number, userData: User): Promise<User | null> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new ConflictException('Kullanıcı bulunamadı');
    }

    // Email kontrolü
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

    const hashedPassword = userData.password ? this.hashPasswordSHA256(userData.password) : existingUser.password; // Hash'leme

    const result = await this.mysqlService.query(sql, [
      userData.name ?? null,
      userData.surname ?? null,
      userData.email ?? null,
      hashedPassword, // use the hashed password
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

  // Kullanıcıyı sil
  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await this.mysqlService.query(sql, [id]);
    return result.affectedRows > 0; 
  }

  // Şifreyi SHA-256 ile hash'le
  private hashPasswordSHA256(password: string): string {
    return createHash('sha256').update(password).digest('hex'); // SHA-256 hash
  }
}
