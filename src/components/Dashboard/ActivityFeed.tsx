import { useActivityFeed, getAgentColor, formatRelativeTime } from "../../hooks/useSupabaseRealtime";

export function ActivityFeed() {
	const { activities, loading, error } = useActivityFeed(20);

	if (loading) {
		return (
			<div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
				<div className="flex items-center gap-2 mb-4">
					<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
					<h3 className="text-slate-50 font-semibold text-sm tracking-wide">LIVE ACTIVITY</h3>
				</div>
				<div className="space-y-2">
					{["s1", "s2", "s3", "s4", "s5"].map((id) => (
						<div key={id} className="h-8 bg-slate-700/50 rounded animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
				<div className="flex items-center gap-2 mb-4">
					<div className="w-2 h-2 rounded-full bg-red-500" />
					<h3 className="text-slate-50 font-semibold text-sm tracking-wide">ACTIVITY FEED</h3>
				</div>
				<p className="text-red-400 text-sm">Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
					<h3 className="text-slate-50 font-semibold text-sm tracking-wide">LIVE ACTIVITY</h3>
				</div>
				<span className="text-slate-500 text-xs font-mono">{activities.length} events</span>
			</div>

			<div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
				{activities.map((activity, index) => (
					<div
						key={activity.id}
						className={`flex items-center gap-3 py-2 px-2 rounded transition-all duration-300 ${
							index === 0 ? "bg-slate-700/50" : "hover:bg-slate-700/30"
						}`}
					>
						{/* Agent indicator */}
						<div
							className="w-1 h-8 rounded-full flex-shrink-0"
							style={{ backgroundColor: getAgentColor(activity.agent_name) }}
						/>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold truncate" style={{ color: getAgentColor(activity.agent_name) }}>
									{activity.agent_name}
								</span>
								<span className="text-slate-400 text-xs truncate flex-1">{activity.task}</span>
							</div>
							{activity.notes && <p className="text-slate-500 text-xs truncate mt-0.5">{activity.notes}</p>}
						</div>

						{/* Time */}
						<div className="flex-shrink-0 text-right">
							<span className="text-slate-500 text-xs font-mono">{formatRelativeTime(activity.created_at)}</span>
						</div>
					</div>
				))}

				{activities.length === 0 && (
					<div className="flex items-center justify-center h-32 text-slate-500 text-sm">No activity recorded yet</div>
				)}
			</div>

			{/* Ticker-style bottom bar */}
			<div className="mt-4 pt-3 border-t border-slate-700">
				<div className="overflow-hidden">
					<div className="flex items-center gap-4 text-xs animate-marquee whitespace-nowrap">
						{activities.slice(0, 5).map((activity) => (
							<span key={activity.id} className="inline-flex items-center gap-2">
								<span
									className="w-1.5 h-1.5 rounded-full"
									style={{ backgroundColor: getAgentColor(activity.agent_name) }}
								/>
								<span className="text-slate-400">{activity.agent_name}</span>
								<span className="text-slate-500">{activity.task.slice(0, 30)}...</span>
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ActivityFeed;
