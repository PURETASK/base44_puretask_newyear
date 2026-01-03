import React from 'react';

export function SkeletonCleanerCard() {
  return (
    <div className="rounded-xl shadow-lg border-0 h-full flex flex-col animate-pulse bg-gray-100 p-6">
      <div className="h-2 bg-gray-200 rounded-full mb-4 w-1/3"></div>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-20 h-20 bg-gray-300 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-16 bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-24 bg-gray-200 rounded-xl mb-4"></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
    </div>
  );
}

export function SkeletonJobCard() {
  return (
    <div className="rounded-xl shadow-lg border-0 animate-pulse bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded mb-4"></div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-300 rounded flex-1"></div>
      </div>
    </div>
  );
}

export function SkeletonMessageThread() {
  return (
    <div className="p-4 border-b border-slate-200 hover:bg-slate-50 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}