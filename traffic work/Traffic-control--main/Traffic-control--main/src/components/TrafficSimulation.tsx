import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { RoadDirection } from "./RoadDirection";
import { EmergencyButton } from "./EmergencyButton";
import { UserInfoPanel } from "./UserInfoPanel";

interface Car {
  id: string;
  position: number;
}

interface DirectionState {
  count: number;
  speed: number;
  cars: Car[];
}

interface TrafficState {
  north: DirectionState;
  south: DirectionState;
  east: DirectionState;
  west: DirectionState;
}

const MAX_CARS = 50;
const NS_MAX_SPEED = 60;
const NS_MIN_SPEED = 30;
const EW_MAX_SPEED = 50;
const EW_MIN_SPEED = 25;
const NS_INTERVAL_MS = 60000; // 60 seconds
const EW_INTERVAL_MS = 70000; // 70 seconds

// Helper: generate cars capped at max 10 for rendering
const generateCars = (count: number, prefix: string): Car[] =>
  Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    id: `${prefix}-${Math.random().toString(36).slice(2, 9)}`,
    position: i * 10,
  }));

export const TrafficSimulation = () => {
  // Phase states control traffic speed levels: 'high' or 'low'
  const [nsPhase, setNsPhase] = useState<"high" | "low">("high");
  const [ewPhase, setEwPhase] = useState<"high" | "low">("high");

  // Emergency mode toggle and countdown timer state (seconds)
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(0);

  // User’s chosen direction to observe
  const [userDirection, setUserDirection] = useState<
    "north" | "south" | "east" | "west"
  >("north");

  // Traffic data including vehicle count, speed, and cars details per direction
  const [traffic, setTraffic] = useState<TrafficState>({
    north: { count: MAX_CARS, speed: NS_MAX_SPEED, cars: [] },
    south: { count: MAX_CARS, speed: NS_MAX_SPEED, cars: [] },
    east: { count: MAX_CARS, speed: EW_MAX_SPEED, cars: [] },
    west: { count: MAX_CARS, speed: EW_MAX_SPEED, cars: [] },
  });

  // Initialize car lists on mount
  useEffect(() => {
    setTraffic((prev) => ({
      north: { ...prev.north, cars: generateCars(prev.north.count, "car-n") },
      south: { ...prev.south, cars: generateCars(prev.south.count, "car-s") },
      east: { ...prev.east, cars: generateCars(prev.east.count, "car-e") },
      west: { ...prev.west, cars: generateCars(prev.west.count, "car-w") },
    }));
  }, []);

  // Activate emergency mode: stop traffic & start 15-sec countdown
  const activateEmergency = useCallback(() => {
    if (emergencyMode) return;

    setEmergencyMode(true);
    setEmergencyCountdown(15);

    setTraffic((prev) => ({
      north: { ...prev.north, speed: 0, cars: [] },
      south: { ...prev.south, speed: 0, cars: [] },
      east: { ...prev.east, speed: 0, cars: [] },
      west: { ...prev.west, speed: 0, cars: [] },
    }));

    console.log("🚨 EMERGENCY MODE ACTIVATED - All traffic stopped!");
  }, [emergencyMode]);

  // Emergency countdown effect - resumes normal traffic after timer ends
  useEffect(() => {
    if (!emergencyMode) return;

    if (emergencyCountdown <= 0) {
      setEmergencyMode(false);
      console.log("✅ Emergency mode ended - Traffic resuming");

      // Resume traffic with current phase speeds & regenerate cars
      setTraffic((prev) => ({
        north: {
          ...prev.north,
          speed: nsPhase === "high" ? NS_MAX_SPEED : NS_MIN_SPEED,
          cars: generateCars(MAX_CARS, "car-n"),
        },
        south: {
          ...prev.south,
          speed: nsPhase === "high" ? NS_MAX_SPEED : NS_MIN_SPEED,
          cars: generateCars(MAX_CARS, "car-s"),
        },
        east: {
          ...prev.east,
          speed: ewPhase === "high" ? EW_MAX_SPEED : EW_MIN_SPEED,
          cars: generateCars(MAX_CARS, "car-e"),
        },
        west: {
          ...prev.west,
          speed: ewPhase === "high" ? EW_MAX_SPEED : EW_MIN_SPEED,
          cars: generateCars(MAX_CARS, "car-w"),
        },
      }));

      return;
    }

    const timer = setInterval(() => {
      setEmergencyCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [emergencyCountdown, emergencyMode, nsPhase, ewPhase]);

  // Update North/South phase and corresponding traffic speeds
  useEffect(() => {
    if (emergencyMode) return;

    const interval = setInterval(() => {
      setNsPhase((prev) => {
        const newPhase = prev === "high" ? "low" : "high";
        const newSpeed = newPhase === "high" ? NS_MAX_SPEED : NS_MIN_SPEED;

        setTraffic((prevTraffic) => ({
          ...prevTraffic,
          north: {
            ...prevTraffic.north,
            speed: newSpeed,
            cars: generateCars(MAX_CARS, "car-n"),
          },
          south: {
            ...prevTraffic.south,
            speed: newSpeed,
            cars: generateCars(MAX_CARS, "car-s"),
          },
        }));

        console.log(`North/South phase: ${newPhase}, speed: ${newSpeed} km/h`);
        return newPhase;
      });
    }, NS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [emergencyMode]);

  // Update East/West phase and corresponding traffic speeds
  useEffect(() => {
    if (emergencyMode) return;

    const interval = setInterval(() => {
      setEwPhase((prev) => {
        const newPhase = prev === "high" ? "low" : "high";
        const newSpeed = newPhase === "high" ? EW_MAX_SPEED : EW_MIN_SPEED;

        setTraffic((prevTraffic) => ({
          ...prevTraffic,
          east: {
            ...prevTraffic.east,
            speed: newSpeed,
            cars: generateCars(MAX_CARS, "car-e"),
          },
          west: {
            ...prevTraffic.west,
            speed: newSpeed,
            cars: generateCars(MAX_CARS, "car-w"),
          },
        }));

        console.log(`East/West phase: ${newPhase}, speed: ${newSpeed} km/h`);
        return newPhase;
      });
    }, EW_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [emergencyMode]);

  // Simulated WebSocket connection lifecycle
  useEffect(() => {
    // Simulate a WebSocket connection object
    const ws = {
      send: (data: string) => console.log("WebSocket send:", data),
      close: () => console.log("WebSocket closed"),
    };

    console.log("WebSocket connected (simulated)");

    // Initial speed update message
    ws.send(
      JSON.stringify({
        type: "speed_update",
        speeds: {
          north: NS_MAX_SPEED,
          south: NS_MAX_SPEED,
          east: EW_MAX_SPEED,
          west: EW_MAX_SPEED,
        },
      })
    );

    return () => {
      ws.close();
    };
  }, []);

  const currentUserSpeed = traffic[userDirection].speed;

  return (
    <main className="min-h-screen bg-background p-8 relative">
      {/* Emergency mode toggle button */}
      <EmergencyButton
        onActivate={activateEmergency}
        isActive={emergencyMode}
        countdown={emergencyCountdown}
      />

      {/* Info panel showing current direction and speed */}
      <UserInfoPanel
        direction={userDirection}
        speed={currentUserSpeed}
        onDirectionChange={setUserDirection}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <section className="text-center space-y-2" aria-label="Traffic phase info">
          <h1 className="text-4xl font-bold text-foreground">Traffic Simulation</h1>
          <p className="text-muted-foreground">
            Real-time traffic flow visualization with dynamic speed control
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Card className="px-6 py-3 bg-card" aria-label="North-South phase info">
              <p className="text-sm text-muted-foreground">
                N/S Phase:{" "}
                <span className="text-primary font-bold">
                  {nsPhase === "high" ? "High Speed" : "Low Speed"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {nsPhase === "high" ? `${NS_MAX_SPEED} km/h for 60s` : `${NS_MIN_SPEED} km/h for 60s`}
              </p>
            </Card>

            <Card className="px-6 py-3 bg-card" aria-label="East-West phase info">
              <p className="text-sm text-muted-foreground">
                E/W Phase:{" "}
                <span className="text-secondary font-bold">
                  {ewPhase === "high" ? "High Speed" : "Low Speed"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ewPhase === "high" ? `${EW_MAX_SPEED} km/h for 70s` : `${EW_MIN_SPEED} km/h for 70s`}
              </p>
            </Card>
          </div>
        </section>

        <section
          className="relative w-full aspect-square max-w-4xl mx-auto"
          aria-label="4-way intersection traffic simulation"
          role="region"
        >
          {/* Intersection box */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-traffic-intersection rounded-lg shadow-2xl z-10 border-4 border-traffic-roadLine" />

          {/* Each road direction */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1/2">
            <RoadDirection
              direction="north"
              count={traffic.north.count}
              speed={traffic.north.speed}
              cars={traffic.north.cars}
            />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1/2">
            <RoadDirection
              direction="south"
              count={traffic.south.count}
              speed={traffic.south.speed}
              cars={traffic.south.cars}
            />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-32 w-1/2">
            <RoadDirection
              direction="east"
              count={traffic.east.count}
              speed={traffic.east.speed}
              cars={traffic.east.cars}
            />
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-32 w-1/2">
            <RoadDirection
              direction="west"
              count={traffic.west.count}
              speed={traffic.west.speed}
              cars={traffic.west.cars}
            />
          </div>
        </section>

        <section className="text-center" aria-label="WebSocket connection status">
          <Card className="inline-block px-6 py-4 bg-card">
            <p className="text-xs text-muted-foreground mb-2">WebSocket Status</p>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-foreground">Connected (Simulated)</span>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
};
