import { useEffect, useState, useCallback } from "react";
import { supabase } from "../config/supabase";

export interface AgentActivity {
	id: string;
	agent_name: string;
	task: string;
	status: string;
	notes: string | null;
	started_at: string | null;
	completed_at: string | null;
	created_at: string;
}

export interface DashboardMetrics {
	totalCreators: number;
	scoredCreators: number;
	activeAgents: number;
	activitiesToday: number;
}

export interface CEPIDistribution {
	S: number;
	A: number;
	B: number;
	C: number;
	D: number;
	F: number;
}

// Get agent color based on name
export function getAgentColor(agentName: string): string {
	const name = agentName.toLowerCase();
	if (name.includes("claude")) return "#3B82F6"; // Electric blue
	if (name.includes("chrome")) return "#10B981"; // Green
	if (name.includes("comet")) return "#F59E0B"; // Orange
	if (name.includes("gemini") || name.includes("chatgpt") || name.includes("perplexity")) return "#8B5CF6"; // Purple
	if (name.includes("qwen") || name.includes("deepseek")) return "#EF4444"; // Red
	return "#6B7280"; // Default gray
}

// Format relative time
export function formatRelativeTime(dateStr: string): string {
	const now = new Date();
	const date = new Date(dateStr);
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	if (diffHour < 24) return `${diffHour} hr ago`;
	if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
	return date.toLocaleDateString();
}

// Real-time activity feed hook
export function useActivityFeed(limit: number = 20) {
	const [activities, setActivities] = useState<AgentActivity[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchActivities = useCallback(async () => {
		try {
			const { data, error: fetchError } = await supabase
				.from("agent_activity")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(limit);

			if (fetchError) throw fetchError;
			setActivities(data || []);
			setError(null);
		} catch (err) {
			console.error("Error fetching activities:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch activities");
		} finally {
			setLoading(false);
		}
	}, [limit]);

	useEffect(() => {
		// Initial fetch
		fetchActivities();

		// Subscribe to real-time changes
		const channel = supabase
			.channel("agent_activity_realtime")
			.on("postgres_changes", { event: "*", schema: "public", table: "agent_activity" }, () => {
				fetchActivities();
			})
			.subscribe();

		// Also poll every 30 seconds as backup
		const interval = setInterval(fetchActivities, 30000);

		return () => {
			channel.unsubscribe();
			clearInterval(interval);
		};
	}, [fetchActivities]);

	return { activities, loading, error, refetch: fetchActivities };
}

// Dashboard metrics hook
export function useDashboardMetrics() {
	const [metrics, setMetrics] = useState<DashboardMetrics>({
		totalCreators: 0,
		scoredCreators: 0,
		activeAgents: 0,
		activitiesToday: 0,
	});
	const [loading, setLoading] = useState(true);

	const fetchMetrics = useCallback(async () => {
		try {
			// Fetch all metrics in parallel
			const [creatorsRes, scoredRes, agentsRes, todayRes] = await Promise.all([
				supabase.from("creators").select("id", { count: "exact", head: true }),
				supabase
					.from("creators")
					.select("id", { count: "exact", head: true })
					.not("cepi_score", "is", null)
					.gt("cepi_score", 0),
				supabase.from("agent_status").select("id", { count: "exact", head: true }).eq("status", "active"),
				supabase
					.from("agent_activity")
					.select("id", { count: "exact", head: true })
					.gte("created_at", new Date().toISOString().split("T")[0]),
			]);

			setMetrics({
				totalCreators: creatorsRes.count || 0,
				scoredCreators: scoredRes.count || 0,
				activeAgents: agentsRes.count || 0,
				activitiesToday: todayRes.count || 0,
			});
		} catch (err) {
			console.error("Error fetching metrics:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMetrics();
		const interval = setInterval(fetchMetrics, 30000);
		return () => clearInterval(interval);
	}, [fetchMetrics]);

	return { metrics, loading, refetch: fetchMetrics };
}

// CEPI distribution hook
export function useCEPIDistribution() {
	const [distribution, setDistribution] = useState<CEPIDistribution>({
		S: 0,
		A: 0,
		B: 0,
		C: 0,
		D: 0,
		F: 0,
	});
	const [loading, setLoading] = useState(true);

	const fetchDistribution = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("creators")
				.select("cepi_score")
				.not("cepi_score", "is", null)
				.gt("cepi_score", 0);

			if (error) throw error;

			// Calculate grades from scores
			const grades: CEPIDistribution = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };

			data?.forEach(({ cepi_score }) => {
				if (cepi_score >= 90) grades.S++;
				else if (cepi_score >= 80) grades.A++;
				else if (cepi_score >= 70) grades.B++;
				else if (cepi_score >= 60) grades.C++;
				else if (cepi_score >= 50) grades.D++;
				else grades.F++;
			});

			setDistribution(grades);
		} catch (err) {
			console.error("Error fetching CEPI distribution:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDistribution();
		const interval = setInterval(fetchDistribution, 60000);
		return () => clearInterval(interval);
	}, [fetchDistribution]);

	return { distribution, loading, refetch: fetchDistribution };
}
