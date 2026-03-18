import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InfoTooltipProps {
  title: string;
  content: string | React.ReactNode;
}

export function InfoTooltip({ title, content }: InfoTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center justify-center p-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-1.5 align-middle touch-manipulation">
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border-2 border-primary/20 glow-primary z-[100] bg-background/95 backdrop-blur-md">
        <div className="space-y-2">
          <h4 className="font-display font-bold leading-none text-primary">{title}</h4>
          <div className="text-sm text-muted-foreground leading-relaxed">{content}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
