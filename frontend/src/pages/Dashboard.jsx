import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('exams');

    useEffect(() => {
        fetchExams();
        fetchResults();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await fetch('/api/exams', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setExams(data);
        } catch (err) { console.error(err); }
    };

    const fetchResults = async () => {
        try {
            const res = await fetch('/api/results/myresults', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setResults(data);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">Online Quiz Portal</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.name}</span>
                            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex space-x-4 border-b mb-6">
                    <button
                        className={`pb-2 px-4 ${activeTab === 'exams' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('exams')}
                    >
                        Available Exams
                    </button>
                    <button
                        className={`pb-2 px-4 ${activeTab === 'results' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('results')}
                    >
                        My Results
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'exams' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.length === 0 ? <p>No exams available.</p> : exams.map(exam => (
                            <div key={exam._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
                                <div className="text-gray-600 text-sm mb-4 space-y-1">
                                    <p>Duration: {exam.duration} Minutes</p>
                                    <p>Marks: {exam.totalMarks}</p>
                                    <p>Pass Marks: {exam.passingMarks}</p>
                                </div>
                                <Link
                                    to={`/exam/${exam._id}`}
                                    className="block w-full text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                                >
                                    Start Exam
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map(res => (
                                    <tr key={res._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{res.examId?.title || 'Unknown Exam'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{res.score} / {res.totalQuestions}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(res.attemptedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/result/${res._id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
