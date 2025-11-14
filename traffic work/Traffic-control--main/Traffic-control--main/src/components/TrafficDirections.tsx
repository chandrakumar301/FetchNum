import { Card } from "@/components/ui/card";

interface DirectionBoxProps {
    direction: "North" | "South" | "East" | "West";
    status: "Stop" | "Go" | "Caution";
    speed: number; // Speed in km/h
    maxSpeed: number; // Maximum allowed speed
}

const DirectionBox = ({ direction, status, speed, maxSpeed }: DirectionBoxProps) => {
    const getDirectionBaseColor = () => {
        switch (direction) {
            case "North":
                return "from-blue-600 to-blue-800";
            case "South":
                return "from-purple-600 to-purple-800";
            case "East":
                return "from-emerald-600 to-emerald-800";
            case "West":
                return "from-amber-600 to-amber-800";
            default:
                return "from-gray-600 to-gray-800";
        }
    };

    const getStatusOverlay = () => {
        switch (status) {
            case "Stop":
                return "bg-red-500/50";
            case "Go":
                return "bg-green-500/50";
            case "Caution":
                return "bg-yellow-500/50";
            default:
                return "bg-gray-500/50";
        }
    };

    const getSpeedColor = () => {
        if (speed === 0) return "text-white/80";
        if (speed > maxSpeed) return "text-red-100 font-bold";
        if (speed >= maxSpeed * 0.8) return "text-amber-100";
        return "text-emerald-100";
    };

    return (
        <Card className={`bg-gradient-to-br ${getDirectionBaseColor()} overflow-hidden relative text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl`}>
            <div className={`absolute inset-0 ${getStatusOverlay()} transition-colors duration-300`} />
            <div className="aspect-square p-4 flex flex-col items-center justify-center relative z-10">
                <h3 className="text-2xl font-bold mb-2 text-white/90">{direction}</h3>
                <p className="text-lg font-semibold mb-2 text-white/85">{status}</p>
                <div className="text-center">
                    <p className={`text-xl ${getSpeedColor()}`}>
                        {speed} <span className="text-sm">km/h</span>
                    </p>
                    <p className="text-xs text-white/70">
                        Max: {maxSpeed} km/h
                    </p>
                </div>
            </div>
        </Card>
    );
};

export const TrafficDirections = () => {
    return (
        <div className="w-full max-w-lg mx-auto p-4">
            <div className="grid grid-cols-2 gap-4">
                <DirectionBox
                    direction="North"
                    status="Stop"
                    speed={0}
                    maxSpeed={60}
                />
                <DirectionBox
                    direction="East"
                    status="Go"
                    speed={45}
                    maxSpeed={60}
                />
                <DirectionBox
                    direction="West"
                    status="Go"
                    speed={52}
                    maxSpeed={60}
                />
                <DirectionBox
                    direction="South"
                    status="Stop"
                    speed={0}
                    maxSpeed={60}
                />
            </div>
        </div>
    );
};