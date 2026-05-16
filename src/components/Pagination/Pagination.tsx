import s from './Pagination.module.css';

interface Props {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  const getRange = () => {
    const delta = 2;
    const range: (number | '…')[] = [];
    let prev = 0;
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        if (prev && i - prev > 1) range.push('…');
        range.push(i);
        prev = i;
      }
    }
    return range;
  };

  return (
    <div className={s.wrap}>
      <button className={s.btn} disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {getRange().map((item, i) =>
        item === '…'
          ? <span key={`e-${i}`} className={s.btn} style={{ border: 'none', background: 'none' }}>…</span>
          : <button
              key={item}
              className={`${s.btn}${page === item ? ' ' + s.active : ''}`}
              onClick={() => onChange(item as number)}
            >{item}</button>
      )}
      <button className={s.btn} disabled={page === pages} onClick={() => onChange(page + 1)}>›</button>
      <span className={s.info}>{total} записей</span>
    </div>
  );
}