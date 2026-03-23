import React from 'react';

const SkeletonProductCard: React.FC = () => {
  return (
    <div className="card-premium animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] bg-white/[0.03]" />

      {/* Info Skeleton */}
      <div className="p-6 space-y-3">
        {/* Category badge */}
        <div className="h-2.5 w-16 bg-white/[0.06] rounded-full" />
        {/* Title */}
        <div className="h-4 w-3/4 bg-white/[0.06] rounded-full" />
        {/* Description */}
        <div className="h-3 w-full bg-white/[0.04] rounded-full" />
        {/* Price row */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-24 bg-white/[0.06] rounded-full" />
          <div className="h-2.5 w-14 bg-white/[0.04] rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;
