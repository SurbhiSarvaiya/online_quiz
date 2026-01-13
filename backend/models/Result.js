const fs = require('fs');
const path = require('path');
const Exam = require('./Exam'); // Need this to simulate populate

const dataPath = path.join(__dirname, '../data/results.json');

const getResults = () => {
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

const saveResults = (results) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(results, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing results file:", err);
    }
};

class Result {
    constructor(data) {
        this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.studentId = data.studentId;
        this.examId = data.examId;
        this.score = data.score;
        this.totalQuestions = data.totalQuestions;
        this.correctAnswers = data.correctAnswers;
        this.incorrectAnswers = data.incorrectAnswers;
        this.notAttempted = data.notAttempted;
        this.status = data.status;
        this.studentAnswers = data.studentAnswers;
        this.attemptedAt = data.attemptedAt || new Date();
    }

    static async find(query = {}) {
        let results = getResults();

        // Basic filtering
        const keys = Object.keys(query);
        if (keys.length > 0) {
            results = results.filter(r => {
                return keys.every(key => r[key] == query[key]);
            });
        }

        const instances = results.map(r => new Result(r));

        // Mock Mongoose populate
        instances.populate = async function (field, select) {
            if (field === 'examId') {
                for (let result of this) {
                    const exam = await Exam.findById(result.examId);
                    if (exam) {
                        result.examId = { _id: exam._id, title: exam.title };
                    }
                }
            }
            return this;
        };

        return instances;
    }

    async save() {
        const results = getResults();
        const contextIndex = results.findIndex(r => r._id === this._id);

        const plainObject = { ...this };

        if (contextIndex >= 0) {
            results[contextIndex] = plainObject;
        } else {
            results.push(plainObject);
        }

        saveResults(results);
        return this;
    }
}

module.exports = Result;
