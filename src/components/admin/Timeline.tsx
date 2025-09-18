"use client";

import { format } from "date-fns";

interface TimelineStep {
  emoji: string;
  label: string;
  date: string | null;
}

interface TimelineProps {
  steps: TimelineStep[];
  currentStep: number;
  liveStatus?: number | null;
}

const Timeline: React.FC<TimelineProps> = ({ steps, currentStep, liveStatus }) => {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index, arr) => {
        const statusIdx = liveStatus !== undefined && liveStatus !== null ? liveStatus : currentStep;
        const isActive = index <= statusIdx;

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            {/* Linha de conexão vinda da esquerda */}
            {index > 0 && (
              <div
                className={`absolute top-1/2 left-0 right-1/2 h-1 -translate-y-1/2 ${
                  index <= currentStep ? "bg-pink-600" : "bg-gray-300"
                }`}
                style={{ top: "20px" }}
              />
            )}

            {/* Linha de conexão indo para a direita */}
            {index < arr.length - 1 && (
              <div
                className={`absolute top-1/2 left-1/2 right-0 h-1 -translate-y-1/2 ${
                  index < currentStep ? "bg-pink-600" : "bg-gray-300"
                }`}
                style={{ top: "20px" }}
              />
            )}

            {/* Bolinha */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 text-xl border-2 ${
                isActive
                  ? "bg-pink-600 border-pink-600 text-white"
                  : "bg-gray-200 border-gray-300 text-gray-500"
              }`}
            >
              {step.emoji}
            </div>

            {/* Label */}
            <div className="text-xs mt-2 text-center w-24">
              {step.label}
            </div>

            {/* Hora */}
            <div className="text-[10px] text-gray-500 mt-1">
              {step.date ? format(new Date(step.date), "HH:mm") : "--:--"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
