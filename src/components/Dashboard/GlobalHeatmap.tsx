import { useState, useEffect, useMemo, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { supabase } from "../../config/supabase";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// 10-language market hubs with coordinates
const MARKET_HUBS = [
	{ id: "na", name: "North America", coords: [-100, 40] as [number, number], region: "EN-NA" },
	{ id: "uk", name: "UK/ANZ", coords: [0, 52] as [number, number], region: "EN-UK" },
	{ id: "eu", name: "Europe", coords: [10, 50] as [number, number], region: "DE/FR" },
	{ id: "cn", name: "China", coords: [105, 35] as [number, number], region: "ZH" },
	{ id: "jp", name: "Japan", coords: [138, 36] as [number, number], region: "JA" },
	{ id: "kr", name: "Korea", coords: [127, 37] as [number, number], region: "KO" },
	{ id: "sa", name: "South Asia", coords: [78, 22] as [number, number], region: "HI" },
	{ id: "latam", name: "LATAM", coords: [-60, -15] as [number, number], region: "ES/PT" },
	{ id: "mena", name: "MENA", coords: [45, 25] as [number, number], region: "AR" },
	{ id: "sea", name: "Southeast Asia", coords: [110, 5] as [number, number], region: "SEA" },
];

// Keywords to detect region mentions
const REGION_KEYWORDS: Record<string, string[]> = {
	na: ["usa", "united states", "america", "canada", "north america", "mrbeast", "youtube"],
	uk: ["uk", "united kingdom", "britain", "australia", "new zealand", "anz"],
	eu: ["germany", "france", "europe", "european", "ibai", "rubius"],
	cn: ["china", "chinese", "bilibili", "douyin", "weibo", "li ziqi"],
	jp: ["japan", "japanese", "hikakin", "vtuber", "anime"],
	kr: ["korea", "korean", "kpop", "blackpink"],
	sa: ["india", "indian", "hindi", "pakistan", "bollywood"],
	latam: ["brazil", "mexico", "spanish", "portuguese", "latin", "fernanfloo"],
	mena: ["arabic", "arab", "saudi", "uae", "dubai", "egypt"],
	sea: ["indonesia", "philippines", "vietnam", "thai", "singapore"],
};

interface ActivityGlow {
	[key: string]: number;
}

export function GlobalHeatmap() {
	const [activityGlow, setActivityGlow] = useState<ActivityGlow>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function analyzeActivity() {
			try {
				// Get activities from last 24 hours
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);

				const { data } = await supabase
					.from("agent_activity")
					.select("task, notes, created_at")
					.gte("created_at", yesterday.toISOString());

				// Analyze text for region mentions
				const glow: ActivityGlow = {};
				MARKET_HUBS.forEach((hub) => {
					glow[hub.id] = 0.3; // Base glow
				});

				data?.forEach((activity) => {
					const text = `${activity.task} ${activity.notes || ""}`.toLowerCase();

					Object.entries(REGION_KEYWORDS).forEach(([region, keywords]) => {
						keywords.forEach((keyword) => {
							if (text.includes(keyword)) {
								glow[region] = Math.min(1, (glow[region] || 0.3) + 0.15);
							}
						});
					});
				});

				setActivityGlow(glow);
			} catch (err) {
				console.error("Error analyzing activity:", err);
			} finally {
				setLoading(false);
			}
		}

		analyzeActivity();
		const interval = setInterval(analyzeActivity, 60000);
		return () => clearInterval(interval);
	}, []);

	// Color scale function
	const getGlowColor = useCallback((intensity: number): string => {
		if (intensity >= 0.9) return "#EF4444"; // Red (high)
		if (intensity >= 0.7) return "#F59E0B"; // Orange
		if (intensity >= 0.5) return "#10B981"; // Green
		if (intensity >= 0.3) return "#06B6D4"; // Cyan
		return "#3B82F6"; // Blue (low)
	}, []);

	const markers = useMemo(() => {
		return MARKET_HUBS.map((hub) => ({
			...hub,
			intensity: activityGlow[hub.id] || 0.3,
			color: getGlowColor(activityGlow[hub.id] || 0.3),
		}));
	}, [activityGlow, getGlowColor]);

	return (
		<div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-slate-50 font-semibold text-sm tracking-wide">GLOBAL ACTIVITY</h3>
				<div className="flex items-center gap-2">
					<span className="text-slate-500 text-xs">Activity:</span>
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 rounded-full bg-blue-500" />
						<span className="text-slate-500 text-xs">Low</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 rounded-full bg-red-500" />
						<span className="text-slate-500 text-xs">High</span>
					</div>
				</div>
			</div>

			<div className="relative aspect-[2/1] min-h-[200px]">
				{loading ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-slate-500 text-sm">Loading map...</div>
					</div>
				) : (
					<ComposableMap
						projectionConfig={{
							rotate: [-10, 0, 0],
							scale: 147,
						}}
						style={{ width: "100%", height: "100%" }}
					>
						<Geographies geography={GEO_URL}>
							{({ geographies }) =>
								geographies.map((geo) => (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										fill="#334155"
										stroke="#475569"
										strokeWidth={0.5}
										style={{
											default: { outline: "none" },
											hover: { outline: "none", fill: "#475569" },
											pressed: { outline: "none" },
										}}
									/>
								))
							}
						</Geographies>

						{/* Market hub markers with glow */}
						{markers.map((marker) => (
							<Marker key={marker.id} coordinates={marker.coords}>
								{/* Outer glow */}
								<circle r={20 * marker.intensity} fill={marker.color} opacity={0.2} className="animate-pulse" />
								{/* Middle glow */}
								<circle r={12 * marker.intensity} fill={marker.color} opacity={0.4} />
								{/* Center dot */}
								<circle r={4} fill={marker.color} />
								{/* Label */}
								<text
									textAnchor="middle"
									y={-15}
									style={{
										fontFamily: "Inter, system-ui, sans-serif",
										fontSize: "8px",
										fill: "#94A3B8",
									}}
								>
									{marker.region}
								</text>
							</Marker>
						))}
					</ComposableMap>
				)}
			</div>

			{/* Market activity list */}
			<div className="mt-4 pt-4 border-t border-slate-700">
				<div className="grid grid-cols-5 gap-2">
					{markers.slice(0, 5).map((marker) => (
						<div key={marker.id} className="text-center">
							<div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: marker.color }} />
							<div className="text-slate-400 text-xs truncate">{marker.region}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default GlobalHeatmap;
