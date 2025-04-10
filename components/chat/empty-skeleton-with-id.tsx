import React from 'react'
import { Skeleton } from '../ui/skeleton'

const EmptySkeletonWithId = () => {
  return (
    <div className="mt-6 h-full w-full flex flex-col justify-between">
      <div className="w-full mx-auto max-w-3xl flex flex-col items-center space-y-4 px-4">
        {[...Array(4)].map((_, i) => {
          if (i % 2 === 0) {
            return <Skeleton key={i} className="h-14 w-1/2 self-end" />
          } else {
            return (
              <div key={i} className="flex w-full items-start space-x-3">
                <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                <Skeleton className="h-24 w-1/2" />
              </div>
            )
          }
        })}
      </div>
      <div className="w-full h-[140px] border-t p-4">
        <div className="w-full h-full max-w-3xl mx-auto">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

export default EmptySkeletonWithId
