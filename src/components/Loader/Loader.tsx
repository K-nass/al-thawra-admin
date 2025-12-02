interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function Loader({ text, size = 'md', fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const dotSize = sizeClasses[size];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className={`${dotSize} bg-primary rounded-full animate-bounce`}></div>
        <div className={`${dotSize} bg-primary rounded-full animate-bounce [animation-delay:0.2s]`}></div>
        <div className={`${dotSize} bg-primary rounded-full animate-bounce [animation-delay:0.4s]`}></div>
      </div>
      {text && (
        <p className="text-slate-600 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}
