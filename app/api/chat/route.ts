import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const client = new Anthropic();

function search(chunks: any[], question: string, topK = 15) {
  const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  return chunks
    .map(chunk => {
      const text = chunk.text.toLowerCase();
      const score = words.reduce((acc, word) => {
        const count = (text.match(new RegExp(word, 'g')) || []).length;
        return acc + count;
      }, 0);
      return { ...chunk, score };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function POST(req: NextRequest) {
  const { question, contacts } = await req.json();

  const chunksPath = path.join(process.cwd(), 'public', 'chunks.json');
  const chunks = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));

  const profilesPath = path.join(process.cwd(), 'public', 'profiles.json');
  const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

  const relevant = search(chunks, question);

  const profilesContext = profiles.map((p: any) => 
    `${p.name}: ville=${p.ville || '?'}, pays=${p.pays || '?'}, profession=${p.profession || '?'}, relation=${p.relation || '?'}, personnalité=${p.personnalite || '?'}, enfants=${p.enfants || 'aucun'}, faits=${p.faits_cles || '?'}`
  ).join('\n');

  const chunksContext = relevant.length > 0
    ? relevant.map(c => `[${c.date}]\n${c.text}`).join('\n\n---\n\n')
    : 'Aucun passage pertinent trouvé.';

  const statsContext = contacts
    .map((c: any) => `${c.name}: score ${c.score}, ${c.messages} msgs, dernier contact ${c.lastMessage}`)
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Tu es Village, l'assistant personnel de Mickael Miro qui connaît parfaitement son réseau social.

Profils déduits de chaque contact :
${profilesContext}

Stats d'activité :
${statsContext}

Passages pertinents des conversations :
${chunksContext}

Question de Mickael : ${question}

Réponds comme un ami proche, de façon concise et naturelle. 2-4 phrases max. Pas de markdown, pas de titres, pas de listes.`
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return NextResponse.json({ answer: text });
}