import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (text: string) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-8 w-full max-w-lg mx-auto animate-fade-in-up">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 to-rose-200 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-2 flex items-center shadow-sm border border-pink-50">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="익명으로 짧은 후기를 남겨보세요! (예: 여기 분위기 짱!)"
                    className="flex-grow bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 font-jua text-lg px-4 py-2 outline-none"
                    maxLength={30}
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="ml-2 bg-rose-400 hover:bg-rose-500 text-white p-2.5 rounded-xl transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed shadow-md shadow-rose-100 flex-shrink-0"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className="text-center text-xs text-rose-300 mt-2 font-medium">
            * 작성된 후기는 배경에 랜덤하게 나타납니다 💕
        </p>
    </form>
  );
};

export default ReviewForm;