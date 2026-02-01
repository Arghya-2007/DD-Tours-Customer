import { Compass } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh] gap-4">
      {/* Spinning Compass */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Compass
          size={64}
          className="text-primary animate-[spin_3s_linear_infinite]"
          strokeWidth={1.5}
        />
      </div>

      {/* Loading Text */}
      <p className="text-gray-400 font-header tracking-widest uppercase text-sm animate-pulse">
        Locating DD Tours...
      </p>
    </div>
  );
};

export default Loader;
