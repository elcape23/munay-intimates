export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-primary-default z-[9999]">
      <div className="w-12 h-12 border-4 border-t-transparent border-border-primary-default rounded-full animate-spin" />
    </div>
  );
}
