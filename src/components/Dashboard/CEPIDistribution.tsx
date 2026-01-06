import { useCEPIDistribution } from "../../hooks/useSupabaseRealtime";

const GRADE_COLORS: Record<string, string> = {
	S: "#FFD700", // Gold
	A: "#3B82F6", // Blue
	B: "#10B981", // Green
	C: "#F59E0B", // Orange
	D: "#EF4444", // Red
	F: "#6B7280", // Gray
};

const GRADE_LABELS: Record<string, string> = {
	S: "S (90-100)",
	A: "A (80-89)",
	B: "B (70-79)",
	C: "C (60-69)",
	D: "D (50-59)",
	F: "F (<50)",
};

export function CEPIDistribution() {
	const { distribution, loading } = useCEPIDistribution();

	const total = Object.values(distribution).reduce((a, b) => a + b, 0);
	const grades = ["S", "A", "B", "C", "D", "F"] as const;

	if (loading) {
		return (
			<div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
				<h3 className="text-slate-50 font-semibold text-sm tracking-wide mb-4">CEPI DISTRIBUTION</h3>
				<div className="space-y-3">
					{["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
						<div key={id} className="h-6 bg-slate-700/50 rounded animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-slate-50 font-semibold text-sm tracking-wide">CEPI DISTRIBUTION</h3>
				<span className="text-slate-500 text-xs font-mono">{total} scored</span>
			</div>

			<div className="space-y-3">
				{grades.map((grade) => {
					const count = distribution[grade];
					const percentage = total > 0 ? (count / total) * 100 : 0;

					return (
						<div key={grade} className="flex items-center gap-3">
							{/* Grade badge */}
							<div
								className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
								style={{
									backgroundColor: `${GRADE_COLORS[grade]}20`,
									color: GRADE_COLORS[grade],
								}}
							>
								{grade}
							</div>

							{/* Progress bar */}
							<div className="flex-1">
								<div className="flex items-center justify-between mb-1">
									<span className="text-slate-400 text-xs">{GRADE_LABELS[grade]}</span>
									<span className="text-slate-300 text-xs font-mono">{count}</span>
								</div>
								<div className="h-2 bg-slate-700 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all duration-500"
										style={{
											width: `${percentage}%`,
											backgroundColor: GRADE_COLORS[grade],
										}}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Summary stats */}
			<div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
				<div className="text-center">
					<div className="text-2xl font-bold text-blue-500 font-mono">{distribution.S + distribution.A}</div>
					<div className="text-slate-500 text-xs">Elite (S+A)</div>
				</div>
				<div className="text-center">
					<div className="text-2xl font-bold text-green-500 font-mono">
						{total > 0 ? Math.round(((distribution.S + distribution.A) / total) * 100) : 0}%
					</div>
					<div className="text-slate-500 text-xs">Top Tier Rate</div>
				</div>
			</div>
		</div>
	);
}

export default CEPIDistribution;
