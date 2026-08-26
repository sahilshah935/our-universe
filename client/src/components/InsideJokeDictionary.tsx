import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Sparkles, Trash2, Volume2, Bookmark, Heart } from 'lucide-react';
import { InsideJokeItem } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import confetti from 'canvas-confetti';

export const InsideJokeDictionary: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop, playPokeSound } = useSound();
  const [jokes, setJokes] = useState<InsideJokeItem[]>(() => coupleStore.getInsideJokes());
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setJokes(coupleStore.getInsideJokes());
    });
    return unsubscribe;
  }, []);

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      showLoveWarning('Please enter the hilarious inside joke word/phrase, my love! 😂', '✨');
      return;
    }
    if (!definition.trim()) {
      showLoveWarning('Please add the funny definition for our dictionary, darling! 📖', '🥺');
      return;
    }
    if (!example.trim()) {
      showLoveWarning('Please write an in-a-sentence example (no context for outsiders)! 🤭', '💖');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addInsideJoke({
      word: word.trim(),
      pronunciation: pronunciation.trim() || undefined,
      partOfSpeech: partOfSpeech.trim() || 'noun',
      definition: definition.trim(),
      example: example.trim(),
      origin: origin.trim() || undefined,
      addedById: currentPartner.id
    });

    playSparkle();
    confetti({ particleCount: 40, spread: 50 });
    showLoveSuccess('Inside joke added to our private dictionary! 😂📖', '🎉');
    setWord('');
    setPronunciation('');
    setDefinition('');
    setExample('');
    setOrigin('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    playHeartPop();
    coupleStore.deleteInsideJoke(id);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen size={13} />
            Our Private Vocabulary
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-800 font-serif-title">
            The Inside-Joke Dictionary 📖
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Couple words & phrases defined formally like a dictionary, with zero context for outsiders.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="py-3 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-200 transition flex items-center gap-2"
        >
          <Plus size={16} /> Define New Word
        </button>
      </div>

      {/* Dictionary Card Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jokes.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -4 }}
            className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-md hover:shadow-xl transition-all relative flex flex-col justify-between"
          >
            <div>
              {/* Header with Pronunciation and Part of Speech */}
              <div className="flex items-baseline justify-between gap-2 border-b border-rose-100 pb-3 mb-4">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif-title">
                    {item.word}
                  </h3>
                  {item.pronunciation && (
                    <span className="text-xs sm:text-sm font-mono text-rose-500/90 font-medium">
                      {item.pronunciation}
                    </span>
                  )}
                  <span className="text-xs italic font-serif text-stone-400">
                    &bull; {item.partOfSpeech}
                  </span>
                </div>

                <button
                  onClick={() => playPokeSound('kiss')}
                  className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                  title="Pronounce"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* Definition */}
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-0.5">
                    1. Official Definition:
                  </span>
                  <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-medium">
                    {item.definition}
                  </p>
                </div>

                {/* Example */}
                <div className="p-3.5 bg-rose-50/50 rounded-2xl border-l-4 border-rose-400">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
                    In a sentence:
                  </span>
                  <p className="text-xs sm:text-sm italic text-stone-700 font-serif leading-relaxed">
                    {item.example}
                  </p>
                </div>

                {/* Origin story if present */}
                {item.origin && (
                  <div className="text-xs text-stone-500 flex items-center gap-1.5 pt-1">
                    <Bookmark size={12} className="text-amber-500 shrink-0" />
                    <span>Origin: {item.origin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-1 font-medium text-rose-500 text-[11px]">
                <Heart size={12} className="fill-rose-500" />
                Entered by {item.addedById === 'partner1' ? 'Sahil' : 'Asmi'}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="hover:text-rose-500 p-1 text-stone-300 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Word Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200"
            >
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 mx-auto mb-2 flex items-center justify-center text-xl shadow-inner">
                  <BookOpen size={22} />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
                  Define Inside Joke Word 📖
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Add a funny or secret term only the two of you understand.
                </p>
              </div>

              <form onSubmit={handleAdd} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">The Word / Term</label>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder="e.g. Supari Mode"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Part of Speech</label>
                    <input
                      type="text"
                      value={partOfSpeech}
                      onChange={(e) => setPartOfSpeech(e.target.value)}
                      placeholder="e.g. noun, verb, state of mind"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Phonetic Pronunciation (Optional)
                  </label>
                  <input
                    type="text"
                    value={pronunciation}
                    onChange={(e) => setPronunciation(e.target.value)}
                    placeholder="e.g. /suːˈpɑː.ri moʊd/"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Formal Definition
                  </label>
                  <textarea
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Describe what it means in precise dictionary style..."
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 resize-none"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Used In A Sentence
                  </label>
                  <input
                    type="text"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder='e.g. "Look at her, full Supari Mode activated."'
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-serif italic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Origin Story (Optional)
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Born when we went out for Boba on a rainy Tuesday"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 transition"
                >
                  Save to Dictionary 📚
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
