import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [exams, setExams] = useState([]);
    const [view, setView] = useState('list'); // list, createExam, addQuestion
    const [selectedExamId, setSelectedExamId] = useState(null);

    // Exam Form State
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [passingMarks, setPassingMarks] = useState('');

    // Question Form State
    const [qText, setQText] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [marks, setMarks] = useState(1);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        const res = await fetch('/api/exams', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setExams(await res.json());
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, duration, totalMarks, passingMarks })
            });
            if (res.ok) {
                toast.success('Exam Created');
                fetchExams();
                setView('list');
                setTitle(''); setDuration(''); setTotalMarks(''); setPassingMarks('');
            } else {
                toast.error('Failed to create exam');
            }
        } catch (err) { console.error(err); }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/exams/${selectedExamId}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    text: qText,
                    options: [option1, option2, option3, option4],
                    correctAnswer,
                    marks
                })
            });
            if (res.ok) {
                toast.success('Question Added');
                // clear form
                setQText(''); setOption1(''); setOption2(''); setOption3(''); setOption4(''); setCorrectAnswer('');
            } else {
                toast.error('Failed to add question');
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
                <button onClick={logout} className="text-red-600">Logout</button>
            </nav>

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {view === 'list' && 'Manage Exams'}
                        {view === 'createExam' && 'Create New Exam'}
                        {view === 'addQuestion' && 'Add Questions'}
                    </h2>
                    {view === 'list' && (
                        <button
                            onClick={() => setView('createExam')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            + Create Exam
                        </button>
                    )}
                    {view !== 'list' && (
                        <button
                            onClick={() => setView('list')}
                            className="text-indigo-600 hover:underline"
                        >
                            Back to List
                        </button>
                    )}
                </div>

                {view === 'list' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {exams.map(exam => (
                                    <tr key={exam._id}>
                                        <td className="px-6 py-4">{exam.title}</td>
                                        <td className="px-6 py-4">{exam.duration} mins</td>
                                        <td className="px-6 py-4">{exam.totalMarks}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => { setSelectedExamId(exam._id); setView('addQuestion'); }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Add Questions
                                            </button>
                                            <button
                                                onClick={() => { setSelectedExamId(exam._id); setView('bulkUpload'); }}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Bulk Upload
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'bulkUpload' && (
                    <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
                        <h3 className="text-xl font-bold mb-4">Upload Questions (Word File)</h3>
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            <strong>Format Instructions:</strong>
                            <p>Use a <b>.docx</b> or <b>.doc</b> file. Format each question like this:</p>
                            <pre className="bg-white p-2 mt-2 border rounded">
                                Question 1: What is the capital of France?
                                A) London
                                B) Paris
                                C) Rome
                                D) Berlin
                                Answer: B
                                Marks: 1
                            </pre>
                            <a
                                href="/sample_questions.docx"
                                download
                                className="mt-2 text-indigo-600 underline cursor-pointer"
                            >
                                Download Sample (.docx)
                            </a>
                        </div>
                        <input
                            type="file"
                            accept=".docx, .doc"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('file', file);

                                try {
                                    const res = await fetch(`/api/exams/${selectedExamId}/upload`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        },
                                        body: formData
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        toast.success(data.message);
                                        setView('list');
                                    } else {
                                        toast.error(data.message);
                                    }
                                } catch (err) {
                                    toast.error('Upload failed');
                                }
                            }}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                )}

                {view === 'createExam' && (
                    <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
                        <form onSubmit={handleCreateExam} className="space-y-4">
                            <input type="text" placeholder="Exam Title" className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} required />
                            <input type="number" placeholder="Duration (minutes)" className="w-full border p-2 rounded" value={duration} onChange={e => setDuration(e.target.value)} required />
                            <input type="number" placeholder="Total Marks" className="w-full border p-2 rounded" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} required />
                            <input type="number" placeholder="Passing Marks" className="w-full border p-2 rounded" value={passingMarks} onChange={e => setPassingMarks(e.target.value)} required />
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Save Exam</button>
                        </form>
                    </div>
                )}

                {view === 'addQuestion' && (
                    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
                        <div className="mb-4 text-sm text-gray-500">Adding questions to Exam ID: {selectedExamId}</div>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            <textarea placeholder="Question Text" className="w-full border p-2 rounded" value={qText} onChange={e => setQText(e.target.value)} required></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Option 1" className="border p-2 rounded" value={option1} onChange={e => setOption1(e.target.value)} required />
                                <input type="text" placeholder="Option 2" className="border p-2 rounded" value={option2} onChange={e => setOption2(e.target.value)} required />
                                <input type="text" placeholder="Option 3" className="border p-2 rounded" value={option3} onChange={e => setOption3(e.target.value)} required />
                                <input type="text" placeholder="Option 4" className="border p-2 rounded" value={option4} onChange={e => setOption4(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select className="border p-2 rounded" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} required>
                                    <option value="">Select Correct Answer</option>
                                    <option value={option1}>{option1}</option>
                                    <option value={option2}>{option2}</option>
                                    <option value={option3}>{option3}</option>
                                    <option value={option4}>{option4}</option>
                                </select>
                                <input type="number" placeholder="Marks" className="border p-2 rounded" value={marks} onChange={e => setMarks(e.target.value)} required />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Add Question</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
