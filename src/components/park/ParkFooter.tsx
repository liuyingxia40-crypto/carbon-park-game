import './ParkFooter.css';

export function ParkFooter() {
  return (
    <footer className="park-footer">
      <span className="park-footer__item">
        <strong>鼠标悬浮工厂</strong>：查看可改造区域
      </span>
      <span className="park-footer__sep">|</span>
      <span className="park-footer__item">
        <strong>点击工厂</strong>：打开改造方案
      </span>
      <span className="park-footer__sep">|</span>
      <span className="park-footer__item">
        <strong>完成全部改造</strong>：园区达标
      </span>
    </footer>
  );
}
