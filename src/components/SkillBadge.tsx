type SkillBadgeProps = {
  skill: string;
  size?: 'sm' | 'md';
};

export default function SkillBadge({ skill, size = 'md' }: SkillBadgeProps) {
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border border-brand-200 bg-brand-50 font-medium text-brand-700 ${sizes[size]}`}
    >
      {skill}
    </span>
  );
}
