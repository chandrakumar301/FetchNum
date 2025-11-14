import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VehicleGroupData {
    direction: string;
    currentSpeed: number;
    distanceTraveled: number;
    timeElapsed: number;
    hasReached: boolean;
    estimatedTimeToReach: number;
}

interface DirectionData {
    firstGroup: VehicleGroupData;
    secondGroup: VehicleGroupData;
    maxSpeed: number;
}

interface TrafficData {
    [key: string]: DirectionData;
}

export const TrafficSimulationDisplay = () => {
    const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:3001');

        websocket.onmessage = (event) => {
            setTrafficData(JSON.parse(event.data));
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    const getProgressColor = (hasReached: boolean, speed: number, maxSpeed: number) => {
        if (hasReached) return "bg-green-500";
        if (speed > maxSpeed / 2) return "bg-yellow-500";
        return "bg-blue-500";
    };

    const VehicleGroupDisplay = ({ group, maxSpeed }: { group: VehicleGroupData; maxSpeed: number }) => (
        <div className="mb-2 last:mb-0">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">
                    {group.hasReached ? "Reached!" : `${Math.round(group.distanceTraveled * 1000)}m / 1.5km`}
                </span>
                <span className="text-sm font-medium">{Math.round(group.currentSpeed)} km/h</span>
            </div>
            <Progress
                value={(group.distanceTraveled / 1.5) * 100}
                className={getProgressColor(group.hasReached, group.currentSpeed, maxSpeed)}
            />
            <div className="text-xs text-gray-500 mt-1">
                Time: {group.timeElapsed.toFixed(1)}s
                {!group.hasReached && ` (Est. ${Math.round(group.estimatedTimeToReach)}s remaining)`}
            </div>
        </div>
    );

    const DirectionCard = ({ direction, data }: { direction: string; data: DirectionData }) => (
        <Card className="p-4">
            <h3 className="text-lg font-bold mb-3">{direction}</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2">First Group</h4>
                    <VehicleGroupDisplay group={data.firstGroup} maxSpeed={data.maxSpeed} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold mb-2">Second Group</h4>
                    <VehicleGroupDisplay group={data.secondGroup} maxSpeed={data.maxSpeed} />
                </div>
            </div>
        </Card>
    );

    if (!trafficData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg">Connecting to traffic simulation...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Traffic Simulation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(trafficData).map(([direction, data]) => (
                    <DirectionCard key={direction} direction={direction} data={data} />
                ))}
            </div>
        </div>
    );
};