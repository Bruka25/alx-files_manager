import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.BD_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${host}:${port}/${database}`,
      { useUnifiedTopology: true });
    this.client.connect((error) => {
      if (!error) this.db = this.client.db(database);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const collection = this.db.collection('users');
    const count = await collection.countDocuments();
    return count;
  }

  async nbFiles() {
    const collection = this.db.collection('files');
    const count = await collection.countDocuments();
    return count;
  }
}
const dbClient = new DBClient();
export default dbClient;
