'use client';
import { useEffect, useState } from 'react';
import NetworkGraph from '@/app/components/NetworkGraph';
interface Contact {
  name: string; messages: number; activeDays: number; score: number;
  lastMessage: string; favoriteHour: number;
  topInteractions: { name: string; count: number }[];
}
export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'graph'|'list'|'chat'>('list');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{role:string,text:string}[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { fetch('/contacts.json').then(r=>r.json()).then(setContacts); }, []);
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const scoreColor = (s: number) => s >= 70 ? '#1D9E75' : s >= 40 ? '#7F77DD' : '#888780';
  const askVillage = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, contacts })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Erreur, reessaie.' }]);
    }
    setLoading(false);
  };
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', background: '#0f0f0f', minHeight: '100vh', color: '#fff' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}><span style={{ color: '#7F77DD' }}>V</span>illage</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher..." style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
        <div style={{ display: 'flex', border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
          {(['list','graph','chat'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', fontSize: 12, background: view===v ? '#7F77DD' : 'transparent', color: view===v ? '#fff' : '#888', border: 'none', cursor: 'pointer' }}>
              {v==='list' ? 'Liste' : v==='graph' ? 'Graphe' : 'Chat'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: view==='list' ? 16 : 0 }}>
          {view==='chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20 }}>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
                {messages.length===0 && (
                  <div style={{ color: '#444', fontSize: 13, marginTop: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
                    <div>Pose une question sur ton reseau</div>
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                      {['Qui sont mes contacts les plus proches ?','Qui est le hub de mon reseau ?','Qui pourrait m introduire dans la mode ?'].map(q => (
                        <button key={q} onClick={() => setQuestion(q)} style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 20, color: '#888', fontSize: 12, cursor: 'pointer' }}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.6, background: m.role==='user' ? '#7F77DD' : '#1a1a1a', color: '#fff' }}>{m.text}</div>
                  </div>
                ))}
                {loading && <div style={{ color: '#444', fontSize: 13 }}>Village reflechit...</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key==='Enter' && askVillage()} placeholder="Pose une question sur ton reseau..." style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
                <button onClick={askVillage} disabled={loading} style={{ padding: '10px 20px', background: '#7F77DD', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>Envoyer</button>
              </div>
            </div>
          )}
          {view==='list' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: '#555', textAlign: 'left', borderBottom: '1px solid #222' }}>
                  <th style={{ padding: '8px 12px' }}>Contact</th>
                  <th style={{ padding: '8px 12px' }}>Messages</th>
                  <th style={{ padding: '8px 12px' }}>Jours actifs</th>
                  <th style={{ padding: '8px 12px' }}>Dernier msg</th>
                  <th style={{ padding: '8px 12px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.name} onClick={() => setSelected(c)} style={{ borderBottom: '1px solid #1a1a1a', cursor: 'pointer', background: selected?.name===c.name ? '#1a1a1a' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '10px 12px', color: '#888' }}>{c.messages.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: '#888' }}>{c.activeDays}</td>
                    <td style={{ padding: '10px 12px', color: '#888' }}>{c.lastMessage}</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ color: scoreColor(c.score), fontWeight: 600 }}>{c.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {view==='graph' && <NetworkGraph contacts={filtered} onSelect={setSelected} selected={selected} />}
        </div>
        {selected && view!=='chat' && (
          <div style={{ width: 260, borderLeft: '1px solid #222', padding: 16, background: '#111', overflowY: 'auto' }}>
            <button onClick={() => setSelected(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>x</button>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(selected.score), marginBottom: 12 }}>{selected.score}<span style={{ fontSize: 12, color: '#555', fontWeight: 400 }}>/100</span></div>
            {[['Messages',selected.messages.toLocaleString()],['Jours actifs',String(selected.activeDays)],['Dernier message',selected.lastMessage],['Heure favorite',selected.favoriteHour+'h']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a1a', fontSize: 12 }}>
                <span style={{ color: '#555' }}>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Top interactions</div>
            {selected.topInteractions.map(t => (
              <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                <span>{t.name}</span><span style={{ color: '#555' }}>{t.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
