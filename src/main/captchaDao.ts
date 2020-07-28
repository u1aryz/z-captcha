import * as mysql from 'promise-mysql';
import * as snakeCaseKeys from 'snakecase-keys';

interface Captcha {
  sitekey: string;
  token: string;
  createdAt: string;
}

export default class CaptchaDao {
  constructor(private pool: mysql.Pool) {}

  public async add(sitekey: string, token: string): Promise<void> {
    const captcha: Captcha = {
      sitekey,
      token,
      createdAt: new Date().toLocaleString(),
    };

    let conn: mysql.PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      conn.query('INSERT INTO captcha SET ?', [snakeCaseKeys(captcha)]);
      await conn.commit();
    } catch (e) {
      await conn?.rollback();
    } finally {
      await conn?.release();
    }
  }
}
