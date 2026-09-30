'use client';
import { useState } from 'react';

type Result = {
  score: number;
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  resume_suggestions: { original: string; suggestion: string; reason: string }[];
  interview_questions: { question: string; why: string; followups: string[] }[];
  risk_flags: string[];
};

export default function Home() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    if (!resume || !jd) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '分析失败');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6 min-h-screen bg-gray-50 text-gray-900">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🎯 面试雷达</h1>
        <p className="text-gray-500">粘贴简历和JD，AI帮你分析匹配度、改简历、出面试题。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          className="w-full border p-3 rounded h-48 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="在这里粘贴你的简历..."
          value={resume}
          onChange={e => setResume(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded h-48 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="在这里粘贴目标岗位的 JD..."
          value={jd}
          onChange={e => setJd(e.target.value)}
        />
      </div>

      <button
        className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        onClick={analyze}
        disabled={loading || !resume || !jd}
      >
        {loading ? '⏳ AI 分析中...' : '开始分析'}
      </button>

      {error && <div className="text-red-500 text-center bg-red-50 p-3 rounded">{error}</div>}

      {result && (
        <div className="space-y-6 mt-8">
          {/* 分数卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border">
            <div className={`text-6xl font-black ${getScoreColor(result.score)}`}>
              {result.score}
            </div>
            <div className="text-gray-400 mt-1">匹配分（满分100）</div>
            <p className="mt-3 text-gray-700 font-medium">{result.summary}</p>
          </div>

          {/* 关键词 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="font-bold mb-3 text-lg">🔑 关键词分析</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">✅ 命中的关键词</div>
              <div className="flex flex-wrap gap-2">
                {result.matched_keywords.map((k, i) => (
                  <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{k}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">❌ 缺失的关键词</div>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map((k, i) => (
                  <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">{k}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 简历修改建议 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="font-bold mb-4 text-lg">✍️ 简历修改建议</h2>
            {result.resume_suggestions.map((s, i) => (
              <div key={i} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded mb-3">
                <div className="text-gray-400 line-through text-sm mb-1">{s.original}</div>
                <div className="text-blue-800 font-medium">{s.suggestion}</div>
                <div className="text-sm text-gray-500 mt-2">💡 {s.reason}</div>
              </div>
            ))}
          </div>

          {/* 面试题 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="font-bold mb-4 text-lg">🎤 可能被问到的问题</h2>
            {result.interview_questions.map((q, i) => (
              <div key={i} className="border rounded-lg p-4 mb-3">
                <div className="font-bold text-gray-800">{i + 1}. {q.question}</div>
                <div className="text-sm text-gray-500 mt-1">🎯 为什么问：{q.why}</div>
                <ul className="list-disc ml-5 mt-2 text-sm text-gray-600">
                  {q.followups.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* 风险点 */}
          {result.risk_flags?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="font-bold mb-3 text-lg text-red-600">⚠️ 风险提示</h2>
              <ul className="list-disc ml-5 text-gray-700">
                {result.risk_flags.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}