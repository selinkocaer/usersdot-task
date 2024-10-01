import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class MySQLService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      this.pool = createPool({
        host: 'localhost',
        user: 'root',
        password: 'Sk7212364.', 
        database: 'usersdot',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      console.log('MySQL bağlantısı başarılı!');
    } catch (error) {
      console.error('MySQL bağlantı hatası:', error);
      throw new Error('MySQL bağlantısı sağlanamadı.');
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('SQL sorgusu hatası:', error);
      throw new Error('SQL sorgusu çalıştırılırken bir hata oluştu.');
    }
  }

  async close() {
    await this.pool.end();
    console.log('MySQL bağlantısı kapatıldı.');
  }

  onModuleDestroy() {
    this.close(); 
  }
}
