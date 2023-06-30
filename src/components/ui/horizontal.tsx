import { cx } from "class-variance-authority";

const Horizontal = ({
  children,
  className,
  centerV,
  centerH,
}: {
  children: React.ReactNode;
  className?: string;
  centerV?: boolean;
  centerH?: boolean;
}) => {
  return (
    <div
      className={cx(
        "flex flex-row",
        { "items-center": centerV },
        { "justify-center": centerH },
        className
      )}
    >
      {children}
    </div>
  );
};
export { Horizontal };
