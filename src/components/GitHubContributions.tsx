"use client";

import { useEffect, useState } from "react";

interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionData {
  totalContributions: number;
  weeks: Week[];
}

const levelColors: Record<string, string> = {
  NONE: "bg-zinc-800",
  FIRST_QUARTILE: "bg-green-900",
  SECOND_QUARTILE: "bg-green-700",
  THIRD_QUARTILE: "bg-green-500",
  FOURTH_QUARTILE: "bg-green-400",
};

export default function GitHubContributions() {
  const [data, setData] = useState<ContributionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load contributions");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading contributions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Could not load GitHub activity</div>
      </div>
    );
  }

  if (!data) return null;

  // Only show last 20 weeks to fit nicely
  const recentWeeks = data.weeks.slice(-20);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {recentWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.contributionDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${levelColors[day.contributionLevel] || "bg-zinc-800"}`}
                title={`${day.date}: ${day.contributionCount} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-gray-500 text-sm mt-4">
        {data.totalContributions} contributions in the last year
      </p>
    </div>
  );
}
