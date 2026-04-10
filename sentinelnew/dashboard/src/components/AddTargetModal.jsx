import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Server, Shield, Activity } from 'lucide-react';

export default function AddTargetModal({ isOpen, onClose, onAdd, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      org_id: user.org_id,
      user_id: user.id,
      name: formData.get('name'),
      url: formData.get('url'),
      environment: formData.get('environment'),
    };

    try {
      const res = await fetch('http://localhost:8000/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onAdd();
        onClose();
      } else {
        setError(data.detail || 'Failed to register asset');
      }
    } catch (e) {
      setError('Communication failed: Backend offline');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-24">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="card glass w-full max-w-[500px] relative z-10 shadow-2xl border-primary/20 p-0 overflow-hidden"
      >
        <div className="p-32 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-16">
            <div className="w-40 h-40 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <Server size={20} />
            </div>
            <div>
              <h2 className="title-md !text-lg">Register New Asset</h2>
              <p className="label-caps !text-[9px] opacity-40">Initialize Mission Target Connectivity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-8 hover:bg-white/5 rounded-lg transition-colors text-text-secondary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-32 flex flex-col gap-24">
          {error && (
            <div className="p-12 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-8">
            <label className="label-caps !text-[9px] opacity-40 ml-4">Asset Label</label>
            <div className="relative">
              <input 
                name="name" 
                required 
                className="input-field pl-40" 
                placeholder="e.g. Production API Node" 
              />
              <Shield size={16} className="absolute left-16 top-1/2 -translate-y-1/2 text-primary opacity-30" />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <label className="label-caps !text-[9px] opacity-40 ml-4">Host URL</label>
            <div className="relative">
              <input 
                name="url" 
                required 
                type="url"
                className="input-field pl-40" 
                placeholder="http://localhost:8080" 
              />
              <Globe size={16} className="absolute left-16 top-1/2 -translate-y-1/2 text-primary opacity-30" />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <label className="label-caps !text-[9px] opacity-40 ml-4">Environment Tier</label>
            <div className="relative">
              <select 
                name="environment" 
                required 
                className="input-field pl-40 appearance-none bg-surface"
              >
                <option value="Production Cluster">Production Cluster</option>
                <option value="Staging Matrix">Staging Matrix</option>
                <option value="Development Lab">Development Lab</option>
                <option value="Legacy Infrastructure">Legacy Infrastructure</option>
                <option value="Internal Middleware">Internal Middleware</option>
              </select>
              <Activity size={16} className="absolute left-16 top-1/2 -translate-y-1/2 text-primary opacity-30" />
            </div>
          </div>

          <div className="pt-16 flex gap-12">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">CANCEL</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? "ESTABLISHING..." : "REGISTER ASSET"}
            </button>
          </div>
        </form>

        <div className="p-16 bg-black/40 border-t border-white/5 text-center">
          <p className="text-[10px] text-text-secondary opacity-30 font-bold uppercase tracking-widest">Authorized for administrative enrollment only</p>
        </div>
      </motion.div>
    </div>
  );
}
