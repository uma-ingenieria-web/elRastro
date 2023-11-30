"use client"

function FilterPill({ filter }: { filter: string }) {
  return (
    <button
      type="button"
      className="flex items-center text-white bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm pl-5 pr-3 py-2.5 mr-2 mb-2 dark:bg-blue-600  dark:focus:ring-blue-800"
      disabled
    >
      <span className="mr-2">{filter}</span>
      <button className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-8.414l3.293 3.293a1 1 0 11-1.414 1.414L10 11.414l-2.879 2.879a1 1 0 01-1.414-1.414L8.586 10 5.707 7.121a1 1 0 111.414-1.414L10 8.586l2.879-2.879a1 1 0 111.414 1.414L11.414 10z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </button>
  );
}

export default FilterPill;
