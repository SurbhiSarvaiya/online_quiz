const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/questions.json');

const getQuestions = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
};

const saveQuestions = (questions) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(questions, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing questions file:", err);
    }
};

class Question {
    constructor(data) {
        this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.examId = data.examId;
        this.text = data.text;
        this.options = data.options;
        this.correctAnswer = data.correctAnswer;
        this.marks = data.marks || 1;
    }

    static async find(query = {}) {
        let questions = getQuestions();
        const keys = Object.keys(query);
        if (keys.length > 0) {
            questions = questions.filter(q => {
                return keys.every(key => q[key] == query[key]); // Use loose equality for IDs
            });
        }
        return questions.map(q => new Question(q));
    }

    static async findById(id) {
        const questions = getQuestions();
        const data = questions.find(q => q._id === id);
        return data ? new Question(data) : null;
    }

    async save() {
        const questions = getQuestions();
        const contextIndex = questions.findIndex(q => q._id === this._id);

        const plainObject = { ...this };

        if (contextIndex >= 0) {
            questions[contextIndex] = plainObject;
        } else {
            questions.push(plainObject);
        }

        saveQuestions(questions);
        return this;
    }
}

module.exports = Question;
