import { motion } from 'framer-motion';
import { TextSplit } from '@/components/ui/split-text';

const revealEase = [0.16, 1, 0.3, 1] as const;

export function TrustStatementSection() {
  return (
    <section className="home-trust-section" aria-label="Heritage trust statement">
      <motion.div
        className="home-trust-inner"
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 0.85, ease: revealEase }}
      >
        <TextSplit
          className="home-trust-headline"
          topClassName="text-[#f5e6a8]"
          bottomClassName="text-[#d4af37]"
        >
          65+ Years of Trust
        </TextSplit>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: revealEase, delay: 0.12 }}
        >
          <TextSplit
            className="home-trust-subline"
            topClassName="text-[#e8c96a]"
            bottomClassName="text-[#d4af37]"
          >
            Serving Generations Since 1959
          </TextSplit>
        </motion.div>

        <motion.div
          className="home-trust-line"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: revealEase, delay: 0.22 }}
        />
      </motion.div>
    </section>
  );
}
