type ComingSoonCardProps = {
  title: string;
  description: string;
};

export const ComingSoonCard = ({ title, description }: ComingSoonCardProps) => (
  <div className="flex h-[520px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center shadow-inner">
    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Planned</p>
    <h3 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h3>
    <p className="mt-3 max-w-xl text-sm text-slate-500">{description}</p>
  </div>
);
