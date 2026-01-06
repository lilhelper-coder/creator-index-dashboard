import { useDashboardMetrics } from "../../hooks/useSupabaseRealtime";

interface MetricCardProps {
	label: string;
	value: number;
	icon: string;
	color: string;
	loading?: boolean;
}

function MetricCard({ label, value, icon, color, loading }: MetricCardProps) {
	return (
		<div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col">
			<div className="flex items-center justify-between mb-2">
				<span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</span>
				<span className="text-2xl" role="img" aria-label={label}>
					{icon}
				</span>
			</div>
			<div className="flex items-baseline gap-2">
				{loading ? (
					<div className="h-9 w-20 bg-slate-700 rounded animate-pulse" />
				) : (
					<span className="text-3xl font-bold font-mono" style={{ color }}>
						{value.toLocaleString()}
					</span>
				)}
			</div>
			<div className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-1000"
					style={{
						width: `${Math.min(100, (value / 100) * 100)}%`,
						backgroundColor: color,
						opacity: 0.6,
					}}
				/>
			</div>
		</div>
	);
}

export function MetricsCards() {
	const { metrics, loading } = useDashboardMetrics();

	const cards = [
		{
			label: "Total Creators",
			value: metrics.totalCreators,
			icon: "👥",
			color: "#3B82F6",
		},
		{
			label: "Scored Creators",
			value: metrics.scoredCreators,
			icon: "📊",
			color: "#10B981",
		},
		{
			label: "AI Agents Active",
			value: metrics.activeAgents,
			icon: "🤖",
			color: "#8B5CF6",
		},
		{
			label: "Activities Today",
			value: metrics.activitiesToday,
			icon: "⚡",
			color: "#F59E0B",
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{cards.map((card) => (
				<MetricCard key={card.label} {...card} loading={loading} />
			))}
		</div>
	);
}

export default MetricsCards;
