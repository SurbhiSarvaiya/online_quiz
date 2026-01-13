const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataPath = path.join(__dirname, '../data/users.json');

const getUsers = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error("Error reading users file:", err);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing users file:", err);
    }
};

class User {
    constructor(userData) {
        this._id = userData._id || Date.now().toString();
        this.name = userData.name;
        this.mobile = userData.mobile;
        this.password = userData.password;
        this.role = userData.role || 'student';
        this.createdAt = userData.createdAt || new Date();
    }

    static async findOne(query) {
        const users = getUsers();
        // Simple finding logic supporting one field
        const key = Object.keys(query)[0];
        const value = query[key];

        const userData = users.find(u => u[key] === value);
        if (userData) {
            const user = new User(userData);
            user.select = function () { return this; }; // Mock select
            return user;
        }
        return null;
    }

    static async findById(id) {
        const users = getUsers();
        const userData = users.find(u => u._id === id);
        if (userData) {
            const user = new User(userData);
            user.select = function () { return this; }; // Mock select
            return user;
        }
        return null;
    }


    static async create(userData) {
        const users = getUsers();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = new User({
            ...userData,
            password: hashedPassword
        });

        users.push(newUser);
        saveUsers(users);
        return newUser;
    }

    async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }
}

module.exports = User;
