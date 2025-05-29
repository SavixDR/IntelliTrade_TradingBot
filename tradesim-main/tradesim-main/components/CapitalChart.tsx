"use client";

import { useStore } from "@/lib/store";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function CapitalChart() {
	const { capitalHistory } = useStore();

	if (capitalHistory.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">No capital history yet.</p>
		);
	}

	const parsedData = capitalHistory.map((entry) => ({
		...entry,
		date: new Date(entry.date).toISOString(), // ensure it's in full ISO string
	}));

	return (
		<div className="w-full h-64 mt-6">
			<h3 className="text-lg font-semibold mb-2 text-center">
				Capital Progression
			</h3>
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<LineChart
					data={parsedData}
					margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="date"
						tickFormatter={(date) => format(new Date(date), "MMM dd, HH:mm")}
					/>
					<YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
					<Tooltip
						labelFormatter={(label) => format(new Date(label), "PPPp")}
						formatter={(value: number) => `$${value.toFixed(2)}`}
					/>
					<Line
						type="monotone"
						dataKey="capital"
						stroke="#4F46E5"
						strokeWidth={2}
						dot={{ r: 3 }}
						activeDot={{ r: 5 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
