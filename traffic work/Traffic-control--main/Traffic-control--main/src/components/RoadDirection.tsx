import { Card } from "@/components/ui/card";
import { useMemo } from "react";

interface Car {
  id: string;
  position: number;
}

interface RoadDirectionProps {
  direction: "north" | "south" | "east" | "west";
  count: number;
  speed: number;
  cars: Car[];
}

// Reworked colors to teal/orange shades
const directionColors = {
  north: "bg-teal-500",
  south: "bg-teal-700",
  east: "bg-orange-500",
  west: "bg-orange-700",
};

const directionGradients = {
  north: "bg-gradient-to-b from-teal-200 via-teal-300 to-teal-400",
  south: "bg-gradient-to-t from-teal-200 via-teal-300 to-teal-400",
  east: "bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400",
  west: "bg-gradient-to-l from-orange-200 via-orange-300 to-orange-400",
};

export const RoadDirection = ({
  direction,
  count,
  speed,
  cars,
}: RoadDirectionProps) => {
  const isVertical = direction === "north" || direction === "south";
  const isReverse = direction === "south" || direction === "east";

  // Map cars positions (numbers) to CSS translate values with a subtle bounce effect
  // Bounce: oscillates position ±2px with current time for natural movement
  const carStyles = useMemo(() => {
    const now = Date.now();
    return cars.map((car) => {
      // Bounce function using sine wave on id hash + time
      const seed = parseInt(car.id.slice(-4), 36) || 0;
      const bounce = Math.sin((now / 300) + seed) * 2; 

      // Calculate translate position based on direction + bounce
      if (isVertical) {
        let translateY = isReverse ? -car.position : car.position;
        translateY += bounce;
        return { id: car.id, style: { transform: `translateX(-50%) translateY(${translateY}px)` } };
      } else {
        let translateX = isReverse ? -car.position : car.position;
        translateX += bounce;
        return { id: car.id, style: { transform: `translateY(-50%) translateX(${translateX}px)` } };
      }
    });
  }, [cars, isVertical, isReverse]);

  // Fake wait time for demo purpose (in seconds)
  const avgWaitTime = useMemo(() => {
    // inversely proportional to speed, plus random noise
    return Math.max(5, Math.round(100 / speed + Math.random() * 3));
  }, [speed]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      {/* Gradient background for road */}
      <div
        className={`absolute inset-0 ${directionGradients[direction]}`}
        aria-hidden="true"
      />

      {/* Road central stripe */}
      <div
        className={`absolute ${isVertical ? "w-2 h-full" : "h-2 w-full"} bg-white opacity-60 rounded-sm`}
        style={{
          top: isVertical ? "0" : "50%",
          left: isVertical ? "50%" : "0",
          transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
        }}
      />

      {/* Cars container relative for absolute cars */}
      <div className="relative w-full h-full">
        {carStyles.map(({ id, style }) => (
          <div
            key={id}
            className={`${directionColors[direction]} shadow-lg shadow-black/30 rounded-full w-7 h-7 ring-2 ring-white ring-opacity-40 animate-pulse`}
            style={{
              position: "absolute",
              top: isVertical ? "50%" : undefined,
              left: isVertical ? undefined : "50%",
              ...style,
            }}
            aria-label="Moving car"
            title={`Car ${id.slice(-4)}`}
          />
        ))}
      </div>

      {/* Counter Card with neumorphic style */}
      <Card
        className={`absolute z-20 p-4 backdrop-blur-md bg-white bg-opacity-30 border border-white border-opacity-30 shadow-xl text-center flex flex-col items-center space-y-1 ${
          direction === "north"
            ? "top-4 left-1/2 -translate-x-1/2"
            : direction === "south"
            ? "bottom-4 left-1/2 -translate-x-1/2"
            : direction === "east"
            ? "right-4 top-1/2 -translate-y-1/2"
            : "left-4 top-1/2 -translate-y-1/2"
        }`}
      >
        <p className="uppercase font-semibold tracking-widest text-gray-800/80 capitalize">
          {direction}
        </p>
        <p className="text-3xl font-extrabold text-gray-900">{count}</p>
        <p className="text-sm text-gray-700 font-medium">cars</p>
        <p className="text-3xl font-extrabold text-primary">{speed}</p>
        <p className="text-sm text-primary font-semibold">km/h</p>
        <hr className="border-t border-white border-opacity-20 w-full my-2" />
        <p className="text-xs text-gray-700 font-medium">
          Avg Wait Time: <span className="font-semibold">{avgWaitTime}s</span>
        </p>
      </Card>
    </div>
  );
};
