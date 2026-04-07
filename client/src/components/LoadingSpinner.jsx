export default function LoadingSpinner({ size = 'lg' }) {
  const sz = size === 'lg' ? 'w-12 h-12' : 'w-6 h-6';
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className={`${sz} relative`}>
        <div className={`${sz} rounded-full border-4 border-primary-500/20`} />
        <div className={`${sz} rounded-full border-4 border-t-primary-500 animate-spin absolute top-0 left-0`} />
      </div>
    </div>
  );
}
