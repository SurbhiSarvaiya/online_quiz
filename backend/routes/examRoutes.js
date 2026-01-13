const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { protect, admin } = require('../middleware/authMiddleware');

const multer = require('multer');
const mammoth = require('mammoth');

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to parse text to questions
const parseQuestionsFromText = (text) => {
    const questions = [];
    const blocks = text.split(/Question \d+[:.]/i).filter(b => b.trim()); // Split by "Question 1:", "Question 2:" etc

    // If splitting by number failed, try double newline
    const items = blocks.length > 0 ? blocks : text.split('\n\n').filter(t => t.trim().length > 10);

    items.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 5) return; // Need Q + 4 options + Answer

        // Heuristic parsing
        const qText = lines[0];
        const options = [];
        let correctAnswer = '';
        let marks = 1;

        lines.slice(1).forEach(line => {
            if (line.match(/^[A-D]\)/i) || line.match(/^\d\)/)) {
                // Option line like "A) Paris"
                options.push(line.replace(/^[A-D\d][).]\s*/, ''));
            } else if (line.toLowerCase().startsWith('answer:')) {
                const ansChar = line.split(':')[1].trim().toUpperCase(); // e.g., "B" or "B) Paris"
                // Map A/B/C/D to actual value if possible, or just take the text if it matches
                const index = ansChar.charCodeAt(0) - 65; // A=0, B=1...
                if (index >= 0 && index < options.length) {
                    correctAnswer = options[index];
                } else {
                    // Maybe they wrote the full answer?
                    correctAnswer = lines.find(l => l.includes(ansChar))?.replace(/^[A-D\d][).]\s*/, '') || ansChar;
                }
            } else if (line.toLowerCase().startsWith('marks:')) {
                marks = parseInt(line.split(':')[1].trim()) || 1;
            }
        });

        if (qText && options.length >= 2 && correctAnswer) {
            questions.push({ text: qText, options, correctAnswer, marks });
        }
    });
    return questions;
};

// @desc    Upload questions from Word file
const WordExtractor = require('word-extractor');

// ... (Multer setup existing)

router.post('/:id/upload', protect, admin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        let text = '';
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname.toLowerCase();

        if (originalName.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            text = result.value;
        } else if (originalName.endsWith('.doc') || mimeType === 'application/msword') {
            const extractor = new WordExtractor();
            const extracted = await extractor.extract(req.file.buffer);
            text = extracted.getBody();
        } else {
            // Fallback or assume simple text if needed, but for now strict
            return res.status(400).json({ message: 'Unsupported file format. Please use .doc or .docx' });
        }

        const parsedQuestions = parseQuestionsFromText(text);

        if (parsedQuestions.length === 0) {
            return res.status(400).json({ message: 'No valid questions found. Please check format.' });
        }

        const examId = req.params.id;
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const createdQuestions = [];
        for (const qData of parsedQuestions) {
            const question = new Question({
                ...qData,
                examId
            });
            const savedQ = await question.save();
            exam.questions.push(savedQ._id);
            createdQuestions.push(savedQ);
        }
        await exam.save();

        res.status(201).json({ message: `Successfully added ${createdQuestions.length} questions`, questions: createdQuestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// @desc    Get all active exams
// @route   GET /api/exams
// @access  Private (Student)
router.get('/', protect, async (req, res) => {
    const exams = await Exam.find({ isActive: true }); // select('-questions') removed
    res.json(exams);
});

// @desc    Get single exam with questions (Admin only gets all details, Student gets limited?)
//          Actually, student needs questions when starting exam.
// @route   GET /api/exams/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (exam) {
        // If student, maybe shuffle questions here? For now, just return.
        // We need to population questions.
        const questions = await Question.find({ examId: req.params.id });
        // Shuffle questions logic can be added here
        const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

        res.json({ ...exam.toObject(), questions: shuffledQuestions });
    } else {
        res.status(404).json({ message: 'Exam not found' });
    }
});

// @desc    Create an exam
// @route   POST /api/exams
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { title, duration, totalMarks, passingMarks } = req.body;
    const exam = new Exam({
        title,
        duration,
        totalMarks,
        passingMarks,
        createdBy: req.user._id
    });
    const createdExam = await exam.save();
    res.status(201).json(createdExam);
});

// @desc    Add question to exam
// @route   POST /api/exams/:id/questions
// @access  Private/Admin
router.post('/:id/questions', protect, admin, async (req, res) => {
    const { text, options, correctAnswer, marks } = req.body;
    const examId = req.params.id;

    const question = new Question({
        examId,
        text,
        options,
        correctAnswer,
        marks
    });

    const createdQuestion = await question.save();

    // Add to exam's question list
    const exam = await Exam.findById(examId);
    exam.questions.push(createdQuestion._id);
    await exam.save();

    res.status(201).json(createdQuestion);
});

module.exports = router;
