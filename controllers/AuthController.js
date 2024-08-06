import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * AuthController class to handle authentication-related operations
 */
class AuthController {
  /**
   * GET /connect
   * Sign in the user by generating a new authentication token
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sha1Password = createHash('sha1').update(password).digest('hex');

    try {
      const user = await dbClient.client.db().collection('users').findOne({ email, password: sha1Password });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 86400); // 24 hours in seconds

      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /disconnect
   * Sign out the user by deleting the authentication token
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
