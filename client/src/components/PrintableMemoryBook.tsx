import React from 'react';
import { Memory, Milestone, Partner } from '../types';
import { Printer, Heart, Sparkles, X } from 'lucide-react';

interface PrintableMemoryBookProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  milestones: Milestone[];
  partner1: Partner | null;
  partner2: Partner | null;
}

export const PrintableMemoryBook: React.FC<PrintableMemoryBookProps> = ({
  isOpen,
  onClose,
  memories,
  milestones,
  partner1,
  partner2
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md p-4 sm:p-8 flex justify-center">
      <div className="relative max-w-3xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-2xl my-auto text-stone-800 print:p-0 print:shadow-none print:m-0">
        {/* Screen Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b pb-4 mb-8 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="text-rose-500" size={20} />
            <h3 className="font-bold text-stone-800">Our Keepsake Couple Memory Book</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Book Cover Header */}
        <div className="text-center border-b-2 border-rose-200 pb-8 mb-8">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center text-3xl mb-3">
            <Heart size={32} className="fill-rose-500" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-title text-stone-900 mb-2">
            {partner1?.name || 'Partner 1'} & {partner2?.name || 'Partner 2'}
          </h1>
          <p className="text-stone-500 text-sm italic">
            "A lifetime of laughter, adventures, and endless love."
          </p>
          <div className="mt-4 inline-block px-4 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
            Our Story & Memories Album
          </div>
        </div>

        {/* Milestones Chapter */}
        <div className="mb-10">
          <h2 className="text-xl font-bold font-serif-title text-rose-700 mb-4 border-b border-rose-100 pb-2">
            Chapter 1: The Milestones & Journey
          </h2>
          <div className="space-y-4">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-4 p-3 bg-stone-50 rounded-xl">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-sm text-stone-900">{m.title}</h4>
                    <span className="text-xs text-rose-600 font-mono">{m.date}</span>
                  </div>
                  {m.description && <p className="text-xs text-stone-600 mt-1">{m.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Polaroid Memory Album */}
        <div>
          <h2 className="text-xl font-bold font-serif-title text-rose-700 mb-4 border-b border-rose-100 pb-2">
            Chapter 2: Cherished Moments & Photos
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {memories.map((mem) => (
              <div key={mem.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="aspect-4/3 overflow-hidden rounded-lg mb-2">
                  <img src={mem.imageUrl} alt={mem.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-sm text-stone-800 line-clamp-1">{mem.title}</h4>
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{mem.description}</p>
                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2">
                  <span>{mem.date}</span>
                  <span>{mem.location || mem.chapter}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-stone-200 text-center text-xs text-stone-400">
          Generated with love by Cozy Couple Hub &bull; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
