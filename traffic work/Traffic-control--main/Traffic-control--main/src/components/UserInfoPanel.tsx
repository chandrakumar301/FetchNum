import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface UserInfoPanelProps {
  direction: "north" | "south" | "east" | "west";
  speed: number;
  onDirectionChange: (dir: "north" | "south" | "east" | "west") => void;
}

const directionEmojis: Record<UserInfoPanelProps["direction"], string> = {
  north: "⬆️",
  south: "⬇️",
  east: "➡️",
  west: "⬅️",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const UserInfoPanel = ({
  direction,
  speed,
  onDirectionChange,
}: UserInfoPanelProps) => {
  return (
    <Card
      className="fixed bottom-4 right-4 z-50 p-5 bg-card/95 backdrop-blur-sm shadow-2xl max-w-xs"
      aria-label="User info panel"
      role="region"
    >
      <div className="space-y-6">
        {/* Position Display */}
        <section aria-labelledby="position-label" className="text-center">
          <p
            id="position-label"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
          >
            Your Position
          </p>
          <div className="flex items-center justify-center gap-4">
            <span
              className="text-4xl"
              role="img"
              aria-label={`${capitalize(direction)} arrow`}
            >
              {directionEmojis[direction]}
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground capitalize">
                {direction}
              </p>
              <p className="text-sm text-muted-foreground">Direction</p>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Speed Display */}
        <section aria-labelledby="speed-label" className="text-center">
          <p
            id="speed-label"
            className="text-3xl font-bold text-primary"
            aria-live="polite"
          >
            {speed}
          </p>
          <p className="text-xs text-muted-foreground">km/h - Current Speed</p>
        </section>

        <hr className="border-border" />

        {/* Direction Switch Buttons */}
        <section aria-labelledby="switch-label">
          <p
            id="switch-label"
            className="text-xs text-muted-foreground text-center mb-2"
          >
            Switch Direction:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(directionEmojis) as UserInfoPanelProps["direction"][]).map(
              (dir) => (
                <Button
                  key={dir}
                  onClick={() => onDirectionChange(dir)}
                  variant={direction === dir ? "default" : "outline"}
                  size="sm"
                  className={clsx(
                    "text-xs flex items-center justify-center gap-1",
                    "focus-visible:ring ring-primary ring-offset-1",
                    "hover:bg-primary/10 active:bg-primary/20"
                  )}
                  aria-pressed={direction === dir}
                  aria-label={`Switch direction to ${capitalize(dir)}`}
                >
                  <span aria-hidden="true">{directionEmojis[dir]}</span>{" "}
                  {capitalize(dir)}
                </Button>
              )
            )}
          </div>
        </section>
      </div>
    </Card>
  );
};
