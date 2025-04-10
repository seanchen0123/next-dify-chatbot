import React from 'react'
import { Skeleton } from '../ui/skeleton'

const EmptySkeleton = () => {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4">
      <Skeleton className="mb-8 h-20 w-20 rounded-full" />

      <Skeleton className="mb-2 w-[216px] h-8" />

      <Skeleton className="mb-8 w-[272px] h-6" />

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[56px] w-full sm:w-[250px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-6 w-[114px] h-10" />
    </div>
  )
}

export default EmptySkeleton
