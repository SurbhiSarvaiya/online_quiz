import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import { toast } from 'react-toastify';

const ExamPortal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/exams/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setExam(data);
                    setQuestions(data.questions);
                    setTimeLeft(data.duration * 60);
                } else {
                    toast.error('Failed to load exam');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (loading) return; // Wait for exam to load
        if (timeLeft === null) return; // Safety check

        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading]);

    // Anti-cheat: Warn on tab switch
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                toast.warning("Warning: Leaving the exam tab is not allowed!");
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    const handleOptionSelect = (option) => {
        const currentQ = questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQ._id]: option
        }));
    };

    const handleSubmit = async () => {
        // Convert answers object to array
        const studentAnswers = Object.keys(answers).map(qId => ({
            questionId: qId,
            selectedOption: answers[qId]
        }));

        try {
            const res = await fetch('/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    examId: id,
                    studentAnswers
                })
            });
            const data = await res.json();
            if (res.ok) {
                navigate(`/result/${data._id}`);
                toast.success('Exam Submitted Successfully');
            } else {
                toast.error('Submission failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting exam');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Exam...</div>;
    if (!exam) return <div className="p-10 text-center">Exam not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800">{exam.title}</h2>
                <div className="flex items-center space-x-4">
                    <Timer initialTime={timeLeft} />
                    <button
                        onClick={handleSubmit}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
                    >
                        Submit Exam
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Question Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <QuestionCard
                        question={questions[currentQuestionIndex]}
                        selectedOption={answers[questions[currentQuestionIndex]._id]}
                        onOptionSelect={handleOptionSelect}
                        questionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                    />

                    <div className="flex justify-between mt-6">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className={`px-6 py-2 rounded ${currentQuestionIndex === 0 ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                            Previous
                        </button>
                        <button
                            disabled={currentQuestionIndex === questions.length - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className={`px-6 py-2 rounded ${currentQuestionIndex === questions.length - 1 ? 'bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Question Palette Sidebar */}
                <div className="w-80 bg-white border-l overflow-y-auto p-4 hidden md:block">
                    <h3 className="text-lg font-semibold mb-4">Question Palette</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((q, idx) => {
                            const isAnswered = !!answers[q._id];
                            const isCurrent = idx === currentQuestionIndex;
                            return (
                                <button
                                    key={q._id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-medium transition ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                                        } ${isAnswered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 space-y-2">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Attempted</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Not Attempted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPortal;
