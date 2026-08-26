import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CheckCircle2, AlertCircle, X, Save, UploadCloud, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { getR2Config, saveR2Config, isR2Configured, saveAllDataToR2, loadAllDataFromR2, R2Config } from '../services/r2Storage';
import { coupleStore } from '../services/store';
import { useLoveToast } from '../context/LoveToastContext';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';

export const CloudflareR2Modal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { showLoveWarning, showLoveSuccess } = useLoveToast();
  const { playSparkle } = useSound();

  const [accountId, setAccountId] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [publicDomain, setPublicDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getR2Config();
      if (cfg) {
        setAccountId(cfg.accountId || '');
        setAccessKeyId(cfg.accessKeyId || '');
        setSecretAccessKey(cfg.secretAccessKey || '');
        setBucketName(cfg.bucketName || '');
        setPublicDomain(cfg.publicDomain || '');
      }
      setIsConnected(isR2Configured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId.trim() || !accessKeyId.trim() || !secretAccessKey.trim() || !bucketName.trim()) {
      showLoveWarning('Please fill in Account ID, Access Key, Secret, and Bucket Name, my love! ☁️', '🥺');
      return;
    }

    setIsSaving(true);
    const newConfig: R2Config = {
      accountId: accountId.trim(),
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
      bucketName: bucketName.trim(),
      publicDomain: publicDomain.trim()
    };

    saveR2Config(newConfig);
    setIsConnected(true);

    // Perform an initial sync of all current data
    const success = await saveAllDataToR2((coupleStore as any).data);
    setIsSaving(false);

    if (success) {
      playSparkle();
      confetti({ particleCount: 50, spread: 60 });
      showLoveSuccess('Connected to Cloudflare R2! All 7 features and images are syncing safely ✨', '☁️');
      onClose();
    } else {
      showLoveWarning('Saved configuration! Please verify bucket CORS or access keys if sync failed.');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const success = await saveAllDataToR2((coupleStore as any).data);
    setIsSyncing(false);

    if (success) {
      playSparkle();
      confetti({ particleCount: 50, spread: 60 });
      showLoveSuccess('All memories, doors, nicknames, and stories synced to Cloudflare R2! 🚀', '☁️');
    } else {
      showLoveWarning('Sync encountered an issue. Please verify your R2 credentials! 🥺');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-200 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner">
            <Cloud size={28} className="text-orange-500" />
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-extrabold uppercase tracking-wider mb-2">
            Cloudflare R2 Object Storage
          </div>
          <h3 className="text-2xl font-bold text-stone-900 font-serif-title">
            Cloudflare R2 Sync ☁️
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
            Zero-cost, fast permanent cloud storage for all 7 features, polaroid memories, and profile avatars.
          </p>
        </div>

        {/* Status Pill */}
        <div
          className={`p-3.5 rounded-2xl mb-5 flex items-center justify-between border ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-stone-50 border-stone-200 text-stone-600'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {isConnected ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-stone-400" />
            )}
            <span>{isConnected ? 'Cloudflare R2 Active & Connected' : 'Cloudflare R2 Not Configured'}</span>
          </div>

          {isConnected && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveConfig} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Account ID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="e.g. 8b3f4..."
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Bucket Name
              </label>
              <input
                type="text"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                placeholder="e.g. our-universe"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              R2 Access Key ID
            </label>
            <input
              type="text"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="e.g. 74d82..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              R2 Secret Access Key
            </label>
            <input
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="e.g. 91a82f..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Public Bucket URL / R2.dev Domain (Optional)
            </label>
            <input
              type="url"
              value={publicDomain}
              onChange={(e) => setPublicDomain(e.target.value)}
              placeholder="e.g. https://pub-xxxx.r2.dev or custom cdn"
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-[11px] text-stone-500 leading-relaxed space-y-1">
            <div className="font-bold text-stone-700 flex items-center gap-1">
              <ShieldCheck size={14} className="text-orange-500" />
              How to get Cloudflare R2 Credentials:
            </div>
            <p>
              1. In your Cloudflare Dashboard, go to <strong>R2</strong> &gt; <strong>Create Bucket</strong> (e.g. <code>our-universe</code>).
            </p>
            <p>
              2. Click <strong>Manage R2 API Tokens</strong> &gt; <strong>Create API Token</strong> (Permissions: <em>Object Read & Write</em>).
            </p>
            <p>
              3. Copy your Account ID, Access Key ID, and Secret Access Key here.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-md shadow-orange-200 transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <Save size={16} /> Save & Connect Cloudflare R2
          </button>
        </form>
      </motion.div>
    </div>
  );
};
