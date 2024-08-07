import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
//import { ObjectId } from 'mongodb';

/**
 * UsersController class to handle user-related operations
 */
class UsersController {
  /**
   * POST /users
   * Create a new user in the database
   */
  static async postNew(req, res, next) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists in the database
      const existingUser = await dbClient.client.db().collection('users').findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

      // Create the new user object
      const newUser = {
        email,
        password: sha1Password,
        _id: uuidv4(), // Generate a new unique ID for the user
      };

      // Save the new user to the database
      await dbClient.client.db().collection('users').insertOne(newUser);

      // Respond with the new user's email and id
      return res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /users/me
   * Retrieve the user based on the token
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await dbClient.client.db().collection('users').findOne(
        { _id: dbClient.getObjectID(userId) },
        { projection: { email: 1 } },
      );

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
