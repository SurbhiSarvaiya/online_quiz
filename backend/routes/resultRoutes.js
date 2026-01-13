const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { protect } = require('../middleware/authMiddleware');

// @desc    Submit exam and calculate result
// @route   POST /api/results
// @access  Private
router.post('/', protect, async (req, res) => {
    const { examId, studentAnswers } = req.body; // studentAnswers: [{ questionId, selectedOption }]

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questions = await Question.find({ examId });

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let notAttemptedCount = 0;
    const processedAnswers = [];

    questions.forEach(question => {
        const answer = studentAnswers.find(a => a.questionId.toString() === question._id.toString());

        if (answer) {
            if (answer.selectedOption === question.correctAnswer) {
                score += question.marks;
                correctCount++;
                processedAnswers.push({
                    questionId: question._id,
                    selectedOption: answer.selectedOption,
                    isCorrect: true
                });
            } else {
                incorrectCount++;
                processedAnswers.push({
                    questionId: question._id,
                    selectedOption: answer.selectedOption,
                    isCorrect: false
                });
            }
        } else {
            notAttemptedCount++;
            processedAnswers.push({
                questionId: question._id,
                selectedOption: null, // Not attempted
                isCorrect: false
            });
        }
    });

    const percentage = (score / exam.totalMarks) * 100;
    const status = score >= exam.passingMarks ? 'Pass' : 'Fail';

    const result = new Result({
        studentId: req.user._id,
        examId,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        notAttempted: notAttemptedCount,
        status,
        studentAnswers: processedAnswers
    });

    await result.save();
    res.status(201).json(result);
});

// @desc    Get student results
// @route   GET /api/results/myresults
// @access  Private
router.get('/myresults', protect, async (req, res) => {
    const results = await Result.find({ studentId: req.user._id });
    if (results.populate) {
        await results.populate('examId', 'title');
    }
    res.json(results);
});

module.exports = router;
