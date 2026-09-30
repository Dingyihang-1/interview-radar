import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `
你是一个严格的实习面试官。根据简历和JD，只输出JSON，不要任何解释。
评分必须严格：不满足硬性要求直接低于60分。
JSON格式：
{
  "score": 0-100,
  "summary": "一句话总评",
  "matched_keywords": ["命中的关键词"],
  "missing_keywords": ["缺失的关键词"],
  "resume_suggestions": [
    {"original": "原句", "suggestion": "改成什么", "reason": "为什么"}
  ],
  "interview_questions": [
    {"question": "问题", "why": "为什么问", "followups": ["追问1", "追问2"]}
  ],
  "risk_flags": ["风险点，比如经历断层、技能不匹配"]
}
`;

export async function POST(req: Request) {
  try {
    const { resume, jd } = await req.json();

    if (!resume || !jd) {
      return NextResponse.json({ error: '简历和JD不能为空' }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `简历：\n${resume}\n\nJD：\n${jd}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const text = completion.choices[0].message.content || '{}';
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: '分析失败', detail: e.message },
      { status: 500 }
    );
  }
}