'use client';
import { useState } from 'react';

export default function Home() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jd }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">面试雷达（测试版）</h1>
      <textarea className="w-full border p-2" rows={5} placeholder="粘贴简历" value={resume} onChange={e => setResume(e.target.value)} />
      <textarea className="w-full border p-2" rows={5} placeholder="粘贴 JD" value={jd} onChange={e => setJd(e.target.value)} />
      <button className="bg-black text-white px-4 py-2" onClick={analyze} disabled={loading}>
        {loading ? '分析中...' : '开始分析'}
      </button>
      {result && <pre className="bg-gray-100 text-black p-4 overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}