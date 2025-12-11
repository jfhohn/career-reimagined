import React, { useState } from 'react';
import { Plus, X, Sparkles, Shuffle } from 'lucide-react';
import { MAX_CAREERS, SUGGESTED_CAREERS } from '../constants';

interface CareerSelectionProps {
  careers: string[];
  setCareers: (careers: string[]) => void;
  onGenerate: () => void;
}

const CareerSelection: React.FC<CareerSelectionProps> = ({ careers, setCareers, onGenerate }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddCareer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    
    if (careers.length >= MAX_CAREERS) return;
    if (careers.includes(inputValue.trim())) {
      setInputValue('');
      return;
    }

    setCareers([...careers, inputValue.trim()]);
    setInputValue('');
  };

  const removeCareer = (careerToRemove: string) => {
    setCareers(careers.filter(c => c !== careerToRemove));
  };

  const handleLucky = () => {
    const shuffled = [...SUGGESTED_CAREERS].sort(() => 0.5 - Math.random());
    setCareers(shuffled.slice(0, 3));
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Choose Your Paths</h2>
        <p className="mt-2 text-slate-600">Enter up to {MAX_CAREERS} careers you'd like to explore.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleAddCareer} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="E.g. Astronaut, CEO, Wizard..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none transition-all"
            disabled={careers.length >= MAX_CAREERS}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || careers.length >= MAX_CAREERS}
            className="p-3 bg-evergreen-900 text-white rounded-xl hover:bg-evergreen-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {careers.map((career) => (
            <span
              key={career}
              className="inline-flex items-center px-4 py-2 rounded-full bg-evergreen-50 text-evergreen-900 border border-evergreen-100 text-sm font-medium animate-pop-in"
            >
              {career}
              <button
                onClick={() => removeCareer(career)}
                className="ml-2 p-0.5 rounded-full hover:bg-evergreen-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {careers.length === 0 && (
            <span className="text-slate-400 text-sm italic py-2">No careers added yet...</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleLucky}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-evergreen-300 hover:text-evergreen-900 hover:bg-evergreen-50 transition-all font-semibold"
        >
          <Shuffle className="w-5 h-5" />
          I'm Feeling Lucky
        </button>
        <button
          onClick={onGenerate}
          disabled={careers.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-evergreen-900 text-white rounded-xl hover:bg-evergreen-800 shadow-lg shadow-evergreen-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          Generate Images
        </button>
      </div>
    </div>
  );
};

export default CareerSelection;
