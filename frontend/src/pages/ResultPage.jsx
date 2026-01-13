import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ResultPage = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // Since there's no direct "get result by id" route for just any result,
                // we assume /myresults returns valid data, OR we update backend to fetch single result.
                // Uh oh, I didn't make a "Get Single Result" route in backend.
                // I made `GET /myresults` which returns ALL.
                // I should probably fix that or just filter client side for MVP.
                // Let's filter client side from `myresults` for now to save backend rewrite time, 
                // OR add a quick route.
                // Actually, let's just fetch all and find the one.

                const res = await fetch('/api/results/myresults', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const found = data.find(r => r._id === id);
                    setResult(found);
                }
            } catch (err) { console.error(err); }
        };
        fetchResult();
    }, [id]);

    if (!result) return <div className="p-10 text-center">Loading Result...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white text-center">Exam Result</h2>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 uppercase tracking-wide text-sm font-semibold">Total Score</p>
                        <p className="text-5xl font-extrabold text-gray-900 mt-2">{result.score}</p>
                        <p className={`mt-2 text-lg font-medium ${result.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                            Status: {result.status}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <span className="block text-sm text-green-700 font-medium">Correct Answers</span>
                            <span className="block text-2xl font-bold text-green-900">{result.correctAnswers}</span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <span className="block text-sm text-red-700 font-medium">Incorrect Answers</span>
                            <span className="block text-2xl font-bold text-red-900">{result.incorrectAnswers}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="block text-sm text-gray-700 font-medium">Unattempted</span>
                            <span className="block text-2xl font-bold text-gray-900">{result.notAttempted}</span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <span className="block text-sm text-blue-700 font-medium">Total Questions</span>
                            <span className="block text-2xl font-bold text-blue-900">{result.totalQuestions}</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Analysis</h3>
                    <div className="space-y-4">
                        {result.studentAnswers.map((ans, idx) => (
                            <div key={idx} className={`border-l-4 p-4 text-left ${ans.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                <p className="text-gray-700 font-medium">Question ID: {ans.questionId}</p>
                                <div className="mt-2 text-sm">
                                    <p>Your Answer: <span className="font-semibold">{ans.selectedOption || 'Not Attempted'}</span></p>
                                    <p className="text-gray-500">(Check exam review for full question text - *Not Implemented in MVP*)</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
