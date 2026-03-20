import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function PageSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-20 w-full"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats/Cards Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="space-y-4 mt-8">
        <Skeleton className="h-10 w-48 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-8 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
