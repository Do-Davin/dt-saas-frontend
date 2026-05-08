import { SearchX } from "lucide-react";

const DEFAULT_TITLE = "No products found";
const DEFAULT_MESSAGE = "Try another search or category.";

export interface EmptyProductStateProps {
  title?: string;
  message?: string;
}

export const EmptyProductState = ({
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
}: EmptyProductStateProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center p-6 sm:p-8"
      role="status"
      aria-live="polite"
    >
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
        <SearchX
          className="w-10 h-10 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {message}
      </p>
    </div>
  );
};

export default EmptyProductState;