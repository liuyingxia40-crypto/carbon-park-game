import { useState } from 'react';

export function InfoRail() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="info-rail">
      <button
        type="button"
        className="info-rail__tab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        INFO
      </button>
      {open && (
        <div className="info-rail__panel">
          <h3 className="info-rail__title">城市信息</h3>
          <ul className="info-rail__list">
            <li>查看街区热力与交通</li>
            <li>政策与建设任务</li>
            <li>历史收支记录</li>
          </ul>
        </div>
      )}
    </aside>
  );
}
