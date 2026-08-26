import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CheckCircle2, AlertCircle, X, Save, Copy } from 'lucide-react';
import { getStoredFirebaseConfig, saveFirebaseConfig, isFirebaseConnected } from '../services/firebase';
import { useLoveToast } from '../context/LoveToastContext';
import { FirebaseConfig } from '../types';

export const FirebaseSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const currentConfig = getStoredFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');
  const [databaseURL, setDatabaseURL] = useState(currentConfig?.databaseURL || '');

  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  const handleParseJson = () => {
    if (!jsonInput.trim()) return;
    try {
      let clean = jsonInput.trim();
      if (clean.includes('firebaseConfig =')) {
        clean = clean.split('firebaseConfig =')[1];
      }
      if (clean.endsWith(';')) {
        clean = clean.slice(0, -1);
      }
      const parsed = Function(`return ${clean}`)();
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      if (parsed.databaseURL) setDatabaseURL(parsed.databaseURL);
      setJsonInput('');
      showLoveSuccess('Firebase config parsed like magic! ✨', '🚀');
    } catch (e) {
      showLoveWarning('Could not read this Firebase config format, my love! 🥺');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      showLoveWarning('API Key and Project ID are required to connect, darling! ☁️', '🥺');
      return;
    }

    const newConfig: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      databaseURL: databaseURL.trim() || undefined
    };

    saveFirebaseConfig(newConfig);
  };

  const connected = isFirebaseConnected();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 my-auto text-stone-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl shadow-inner ${connected ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            <Cloud size={22} />
          </div>
          <h3 className="text-2xl font-bold font-serif-title">
            Firebase Cloud Sync & Storage ☁️
          </h3>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold">
            {connected ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Cloud Real-Time Database Active
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertCircle size={13} /> Using Instant Local Storage (Paste Firebase config to connect Cloud)
              </span>
            )}
          </div>
        </div>

        {/* Fast Paste JSON snippet */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 mb-4">
          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
            Fast Setup: Paste Firebase Config Object
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste { apiKey: '...', projectId: '...' }"
              className="flex-1 p-2 text-xs rounded-xl border border-stone-200 bg-white"
            />
            <button
              type="button"
              onClick={handlePasteJson}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition"
            >
              Parse
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Sender ID</label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save & Connect Cloud
          </button>
        </form>
      </motion.div>
    </div>
  );
};
