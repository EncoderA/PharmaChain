export const Section = ({
  children,
  isFirst = false,
}: {
  children: React.ReactNode;
  isFirst?: boolean;
}) => (
  <>
    {!isFirst && (
      <div className="min-w-full border-t mx-auto border-accent" />
    )}
    <div className={`relative ${isFirst ? "mt-[27px]" : ""} max-w-7xl mx-auto`}>
      <div className="border-l border-r border-accent">{children}</div>
      {!isFirst && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 bg-foreground border border-accent -translate-x-2 -translate-y-1 z-10" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-foreground border border-accent translate-x-2 -translate-y-1 z-10" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-foreground border border-accent -translate-x-2 translate-y-1 z-10" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-foreground border border-accent translate-x-2 translate-y-1 z-10" />
        </>
      )}
    </div>
  </>
);
