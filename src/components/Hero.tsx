import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <main className="hero">
      <div className="hero__bg">
        {/* 애니메이션 요소들 */}
        <span className="orb orb--left" />
        <span className="orb orb--right" />
        <span className="ring ring--left" />
      </div>

      <section className="hero__content">
        <div className="hero__text-group">
          <p className="hero__eyebrow">내가</p>
          <h1 className="hero__title">PRIMITIVE</h1>
          <p className="hero__subtitle">에 들어가면 어떨까?</p>
        </div>
        
        <p className="hero__desc">PRIMITIVE와 어떤 역할과 잘 어울리는지 테스트를 통해 확인해보세요!</p>

        <div className="hero__actions">
          <Link className="cta" to="/question">START</Link>
          <div className="hero__links">
            <Link to="https://primitive.kr/" target="_blank">PRIMITIVE는 무슨 동아리일까?</Link>
            <span className="divider">|</span>
            <Link to="https://forms.gle/8aDB9L7XTZRxrhDv6" target="_blank">PRIMITIVE 입부 신청하기</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Hero;