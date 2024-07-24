import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:ve-bg-background group-[.toaster]:ve-text-foreground" +
            " group-[.toaster]:ve-border-border group-[.toaster]:ve-shadow-lg",
          description: "group-[.toast]:ve-text-muted-foreground",
          actionButton:
            "group-[.toast]:ve-bg-primary group-[.toast]:ve-text-primary-foreground",
          cancelButton:
            "group-[.toast]:ve-bg-muted group-[.toast]:ve-text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
