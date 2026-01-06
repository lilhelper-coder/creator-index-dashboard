import { ActivityFeed } from "./ActivityFeed";
import { MetricsCards } from "./MetricsCards";
import { CEPIDistribution } from "./CEPIDistribution";
import { GlobalHeatmap } from "./GlobalHeatmap";

export function MissionControl() {
	return (
		<div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-6 lg:p-8">
			{/* Header */}
			<header className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Creator Index</h1>
						<p className="text-slate-400 text-sm mt-1">Mission Control Dashboard</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
							<span className="text-slate-400 text-sm">Live</span>
						</div>
						<div className="text-slate-500 text-xs font-mono">
							{new Date().toLocaleDateString("en-US", {
								weekday: "short",
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</div>
					</div>
				</div>
			</header>

			{/* Metrics Row */}
			<section className="mb-6">
				<MetricsCards />
			</section>

			{/* Main Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Activity Feed */}
				<div className="lg:col-span-1 order-2 lg:order-1">
					<ActivityFeed />
				</div>

				{/* Middle Column - Map */}
				<div className="lg:col-span-1 order-1 lg:order-2">
					<GlobalHeatmap />
				</div>

				{/* Right Column - CEPI Distribution */}
				<div className="lg:col-span-1 order-3">
					<CEPIDistribution />
				</div>
			</div>

			{/* Footer */}
			<footer className="mt-8 pt-4 border-t border-slate-800">
				<div className="flex items-center justify-between text-slate-500 text-xs">
					<div>Creator Index v1.0 - The Nielsen of the Creator Economy</div>
					<div className="flex items-center gap-4">
						<span>Updates every 30s</span>
						<a href="https://creatorindex.co" className="text-blue-400 hover:text-blue-300">
							creatorindex.co
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

export { ActivityFeed } from "./ActivityFeed";
export { MetricsCards } from "./MetricsCards";
export { CEPIDistribution } from "./CEPIDistribution";
export { GlobalHeatmap } from "./GlobalHeatmap";

export default MissionControl;
