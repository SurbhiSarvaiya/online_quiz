const QuestionCard = ({ question, selectedOption, onOptionSelect, questionIndex, totalQuestions }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Question {questionIndex + 1} of {totalQuestions}</span>
                <span className="text-sm font-semibold text-indigo-600">Marks: {question.marks}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">{question.text}</h3>

            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <label
                        key={idx}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${selectedOption === option
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            type="radio"
                            name="question-option"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            checked={selectedOption === option}
                            onChange={() => onOptionSelect(option)}
                        />
                        <span className="ml-3 text-gray-700">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
