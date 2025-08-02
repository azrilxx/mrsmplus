import React, { useState, useRef, useEffect } from 'react';

interface QuestionInputProps {
  onSubmit: (question: string, subject?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  autoDetectSubject?: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  isLoading = false,
  placeholder,
  autoDetectSubject = true
}) => {
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<any>(null);

  const placeholders = [
    "Apa soalan hari ini?",
    "Let's explore together!",
    "Curious about something?",
    "Ask me anything about your studies!",
    "What would you like to learn?"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'ms-MY';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [question]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Main Input Container */}
        <div className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 focus-within:border-blue-400 transition-all duration-300">
          {/* Sparkle Effects */}
          {question && (
            <div className="absolute top-2 right-2 pointer-events-none">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder || placeholders[placeholderIndex]}
            disabled={isLoading}
            className={`
              w-full min-h-[120px] max-h-[300px] px-6 py-4 pr-20
              text-gray-800 text-lg resize-none
              bg-transparent border-none outline-none
              placeholder-gray-400 transition-all duration-300
              ${isLoading ? 'opacity-50' : ''}
            `}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />
          
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={startListening}
            disabled={isLoading || isListening}
            className={`
              absolute bottom-4 right-4 w-12 h-12
              bg-blue-500 hover:bg-blue-600 active:bg-blue-700
              text-white rounded-full shadow-lg
              flex items-center justify-center
              transition-all duration-200 transform
              ${isListening ? 'scale-110 bg-red-500 animate-pulse' : 'hover:scale-105'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isListening ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className={`
              px-8 py-4 rounded-xl font-semibold text-lg
              shadow-lg transition-all duration-200 transform
              min-w-[160px] flex items-center justify-center gap-3
              ${
                question.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Ask Question
              </>
            )}
          </button>
        </div>

        {/* Auto Subject Detection Indicator */}
        {autoDetectSubject && question.trim() && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Auto-detecting subject...
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default QuestionInput;