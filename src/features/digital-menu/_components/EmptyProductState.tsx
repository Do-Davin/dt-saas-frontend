import React from "react";

export interface EmptyProductStateProps {
  title?: string;
  message?: string;
  /** Optional custom icon (React node). If omitted, a default SVG is shown. */
  icon?: React.ReactNode;
  /** Additional className for outer container */
  className?: string;
}

export const EmptyProductState: React.FC<EmptyProductStateProps> = ({
  title = "No products found",
  message = "Try another search or category.",
  icon,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 sm:p-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
        {icon ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-10 h-10 text-gray-400 dark:text-gray-500"
          >
            <path
              d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3H8v4h8V3z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 13h8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {message && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
};

export default EmptyProductState;