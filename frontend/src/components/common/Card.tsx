import { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Card = ({ title, children, footer }: CardProps) => {
  return (
    <section className="rounded-3xl border border-white/10 bg-card p-6 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
      </div>
      <div>{children}</div>
      {footer && <div className="mt-6 border-t border-white/10 pt-4">{footer}</div>}
    </section>
  );
};

export default Card;
