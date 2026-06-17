import './ParkHeader.css';

export function ParkHeader() {
  return (
    <header className="park-header">
      <div className="park-header__brand">
        <span className="park-header__icon" aria-hidden>
          ♻
        </span>
        <div>
          <h1 className="park-header__title">低碳工业园改造计划</h1>
          <p className="park-header__subtitle">帮助高排放园区完成绿色低碳转型</p>
        </div>
      </div>
      <div className="park-header__phase">
        <span className="park-header__phase-label">当前阶段</span>
        <span className="park-header__phase-value">第一阶段：旧厂改造</span>
      </div>
    </header>
  );
}
