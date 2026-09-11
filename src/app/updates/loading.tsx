import { ListSkeleton } from "@/components/list-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="pt-10 sm:pt-14">
        <div className="h-3 w-24 animate-pulse rounded bg-sunken" />
        <div className="mt-4 h-9 w-56 animate-pulse rounded bg-sunken" />
        <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-sunken" />
      </div>
      <div className="mt-10">
        <ListSkeleton />
      </div>
    </div>
  );
}
