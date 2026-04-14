'use client';
interface Contact { name: string; messages: number; activeDays: number; score: number; topInteractions: { name: string; count: number }[]; }
interface Props { contacts: Contact[]; onSelect: (c: Contact) => void; selected: Contact | null; }
export default function NetworkGraph({ contacts, onSelect, selected }: Props) {
  const color = (s: number) => s >= 70 ? '#1D9E75' : s >= 40 ? '#7F77DD' : '#888780';
  return (
    <div style={{ width: '100%', height: '100%', background: '#0f0f0f', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', padding: 20, gap: 10, overflow: 'auto' }}>
      {contacts.map(c => (
        <div key={c.name} onClick={() => onSelect(c)} style={{ padding: '8px 12px', borderRadius: 8, background: selected && selected.name === c.name ? '#1a1a1a' : '#111', border: '1px solid ' + color(c.score), cursor: 'pointer', fontSize: 12, color: '#fff' }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.name.split(' ')[0]}</div>
          <div style={{ color: color(c.score), fontSize: 11 }}>{c.score}</div>
        </div>
      ))}
    </div>
  );
}
