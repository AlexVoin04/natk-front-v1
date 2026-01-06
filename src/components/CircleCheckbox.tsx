export const CircleCheckbox = ({
  checked,
  onChange,
  className = '',
}: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => (
  <label className={`relative inline-flex items-center ${className} cursor-pointer`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span
      className={`
        w-6 h-6 rounded-full border flex items-center justify-center
        transition-colors
        ${checked ? 'bg-[#4B67F5] border-[#4B67F5]' : 'bg-white border-gray-300'}
      `}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </span>
  </label>
);
