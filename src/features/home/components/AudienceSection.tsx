const audiences = [
  ['For developers', 'Turn your engineering skills into earnings'],
  ['For organizations', 'Get focused solutions from capable builders'],
  ['Built for trust', 'Clear challenges and transparent outcomes'],
];

export function AudienceSection() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
        {audiences.map(([title, description]) => (
          <div key={title} className="px-5 py-7 first:pl-0 last:pr-0">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
