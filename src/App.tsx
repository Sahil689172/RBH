import { Hero } from './components/Hero';
import { HeroNav } from './components/HeroNav';
import { HomeBelowFold } from './components/HomeBelowFold';

export default function App() {
  return (
    <div
      className="min-h-screen bg-[#050505] tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <HeroNav />
      <Hero />
      <HomeBelowFold />
    </div>
  );
}
