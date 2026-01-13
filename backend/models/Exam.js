const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/exams.json');

const getExams = () => {
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

const saveExams = (exams) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(exams, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing exams file:", err);
    }
};

class Exam {
    constructor(data) {
        this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.title = data.title;
        this.duration = data.duration;
        this.totalMarks = data.totalMarks;
        this.passingMarks = data.passingMarks;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.questions = data.questions || [];
        this.createdBy = data.createdBy;
        this.createdAt = data.createdAt || new Date();
    }

    static async find(query = {}) {
        let exams = getExams();
        // Simple filtering
        const keys = Object.keys(query);
        if (keys.length > 0) {
            exams = exams.filter(exam => {
                return keys.every(key => exam[key] === query[key]);
            });
        }

        // Return objects with a .select() method dummy to satisfy route chain
        const enhancedExams = exams.map(e => new Exam(e));
        enhancedExams.select = function () { return this; }; // Mock select
        return enhancedExams;
    }

    static async findById(id) {
        const exams = getExams();
        const data = exams.find(e => e._id === id);
        return data ? new Exam(data) : null;
    }

    async save() {
        const exams = getExams();
        const contextIndex = exams.findIndex(e => e._id === this._id);

        // Strip out internal methods/properties before saving
        const plainObject = { ...this };

        if (contextIndex >= 0) {
            exams[contextIndex] = plainObject;
        } else {
            exams.push(plainObject);
        }

        saveExams(exams);
        return this;
    }

    toObject() {
        return { ...this };
    }
}

module.exports = Exam;
