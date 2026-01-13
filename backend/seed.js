const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');

const seedData = async () => {
    try {
        console.log('Starting Seed Process...');

        // 1. Create Admin User
        console.log('Creating Admin User...');
        const adminData = {
            name: 'Admin User',
            mobile: 'admin123', // Using this as the "ID" for login as per frontend likely
            password: 'password123',
            role: 'admin'
        };
        // Check if admin already exists to avoid duplicates (optional, but good practice)
        // Since our findOne is basic, we might just indiscriminately create or check manually.
        // For simplicity in this "reset/setup" task, we'll just create a new one distinct by mobile.
        // Actually, User.create handles the file reading/writing.

        // We'll try to find first to avoid duplicate error if unique check existed (it doesn't really in our simple model but let's be safe)
        // Our user model currently doesn't enforce unique mobile in the file-based logic explicitly other than finding.
        // But let's just create it.
        const adminUser = await User.create(adminData);
        console.log(`Admin Created: Mobile: ${adminUser.mobile}, Password: ${adminData.password}`);

        // 2. Create an Exam
        console.log('Creating Sample Exam...');
        const examData = {
            title: 'General Knowledge Quiz',
            duration: 15, // minutes
            totalMarks: 10,
            passingMarks: 4,
            createdBy: adminUser._id,
            isActive: true
        };
        const exam = new Exam(examData);
        await exam.save();
        console.log(`Exam Created: ${exam.title}`);

        // 3. Create Questions
        console.log('Adding Questions...');
        const questionsData = [
            {
                text: 'What is the capital of France?',
                options: ['Berlin', 'Madrid', 'Paris', 'Lisbon'],
                correctAnswer: 'Paris',
                marks: 2
            },
            {
                text: 'Which planet is known as the Red Planet?',
                options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 'Mars',
                marks: 2
            },
            {
                text: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: '4',
                marks: 2
            },
            {
                text: 'Who wrote "Hamlet"?',
                options: ['Charles Dickens', 'J.K. Rowling', 'William Shakespeare', 'Mark Twain'],
                correctAnswer: 'William Shakespeare',
                marks: 2
            },
            {
                text: 'What is the largest ocean on Earth?',
                options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
                correctAnswer: 'Pacific',
                marks: 2
            }
        ];

        for (const qData of questionsData) {
            const question = new Question({
                ...qData,
                examId: exam._id
            });
            const savedQuestion = await question.save();
            exam.questions.push(savedQuestion._id);
        }

        // Update exam with question IDs
        await exam.save();
        console.log(`Added ${questionsData.length} questions to the exam.`);

        console.log('Seed Process Completed Successfully!');
        console.log('------------------------------------------------');
        console.log('Admin Credentials:');
        console.log(`Mobile (Login ID): ${adminData.mobile}`);
        console.log(`Password: ${adminData.password}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Seed Error:', error);
    }
};

seedData();
