import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const useMongoose = process.env.MONGO_URI && process.env.USE_REAL_MONGO === 'true';

let UserMongooseModel;
if (useMongoose) {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: {
      theme: { type: String, default: 'dark' },
      recentSearches: { type: [String], default: [] }
    },
    createdAt: { type: Date, default: Date.now }
  });
  UserMongooseModel = mongoose.model('User', userSchema);
}

const JSON_DB_PATH = path.resolve('data/users.json');

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(filePath);
};

const readUsersFromFile = () => {
  try {
    const dir = path.dirname(JSON_DB_PATH);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error("Read users file error, returning empty", error);
    return [];
  }
};

const writeUsersToFile = (users) => {
  try {
    const dir = path.dirname(JSON_DB_PATH);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Write users file error", error);
  }
};

const MockUserModel = {
  findOne: async (query) => {
    const users = readUsersFromFile();
    return users.find(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findById: async (id) => {
    const users = readUsersFromFile();
    return users.find(u => u._id === id);
  },
  create: async (userData) => {
    const users = readUsersFromFile();
    const newUser = {
      _id: Math.random().toString(36).substring(2, 11),
      preferences: { theme: 'dark', recentSearches: [] },
      createdAt: new Date(),
      ...userData
    };
    users.push(newUser);
    writeUsersToFile(users);
    return newUser;
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    const users = readUsersFromFile();
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    
    const user = users[idx];
    if (update.$push && update.$push['preferences.recentSearches']) {
      const searchItem = update.$push['preferences.recentSearches'];
      const current = user.preferences.recentSearches || [];
      if (!current.includes(searchItem)) {
        user.preferences.recentSearches = [searchItem, ...current].slice(0, 10);
      }
    }
    if (update.preferences) {
      user.preferences = { ...user.preferences, ...update.preferences };
    }
    
    users[idx] = user;
    writeUsersToFile(users);
    return user;
  }
};

const UserModel = useMongoose ? UserMongooseModel : MockUserModel;
export default UserModel;
