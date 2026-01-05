import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Text, Title } from "@/ui/typography";
import { rgbAlpha } from "@/utils/theme";
import { useState, useEffect } from "react";
import BannerCard from "./banner-card";
import { getMetrics, getTopCreators, getRecentActivity, type Creator, type AgentActivity, type DashboardMetrics } from "@/services/creatorIndexService";

function formatFollowers(num: number): string {
	if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
	if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
	return num.toString();
}

function getPlatformColor(platform: string): string {
	const colors: Record<string, string> = {
		youtube: "#FF0000",
		twitch: "#9146FF",
		tiktok: "#000000",
		bilibili: "#00A1D6",
		instagram: "#E4405F",
	};
	return colors[platform] || "#3b82f6";
}

function getPlatformIcon(platform: string): string {
	const icons: Record<string, string> = {
		youtube: "mdi:youtube",
		twitch: "mdi:twitch",
		tiktok: "ic:baseline-tiktok",
		bilibili: "simple-icons:bilibili",
		instagram: "mdi:instagram",
	};
	return icons[platform] || "mdi:account";
}

export default function Workbench() {
	const [metrics, setMetrics] = useState<DashboardMetrics>({ total_creators: 0, active_blockers: 0, total_employees: 0, platforms: {} });
	const [topCreators, setTopCreators] = useState<Creator[]>([]);
	const [recentActivity, setRecentActivity] = useState<AgentActivity[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("All Activity");

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const [metricsData, creatorsData, activityData] = await Promise.all([
					getMetrics(),
					getTopCreators(10),
					getRecentActivity(10)
				]);
				setMetrics(metricsData);
				setTopCreators(creatorsData);
				setRecentActivity(activityData);
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const quickStats = [
		{
			icon: "mdi:account-group",
			label: "Total Creators",
			value: metrics.total_creators.toString(),
			percent: 0,
			color: "#3b82f6",
			chart: [12, 18, 14, 16, 12, 10, 14, 18, 16, 14, 12, metrics.total_creators > 50 ? 20 : 10],
		},
		{
			icon: "mdi:youtube",
			label: "YouTube",
			value: (metrics.platforms.youtube || 0).toString(),
			percent: 0,
			color: "#FF0000",
			chart: [8, 12, 10, 14, 18, 16, 14, 12, 10, 14, 18, 16],
		},
		{
			icon: "mdi:twitch",
			label: "Twitch",
			value: (metrics.platforms.twitch || 0).toString(),
			percent: 0,
			color: "#9146FF",
			chart: [10, 14, 12, 16, 18, 14, 12, 10, 14, 18, 16, 12],
		},
		{
			icon: "simple-icons:bilibili",
			label: "Bilibili",
			value: (metrics.platforms.bilibili || 0).toString(),
			percent: 0,
			color: "#00A1D6",
			chart: [16, 14, 12, 10, 14, 18, 16, 12, 10, 14, 18, 16],
		},
	];

	const platformDonutOptions = useChart({
		labels: Object.keys(metrics.platforms),
		legend: { show: false },
		dataLabels: { enabled: false },
		plotOptions: { pie: { donut: { size: "70%" } } },
		colors: Object.keys(metrics.platforms).map(p => getPlatformColor(p)),
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Text variant="body2">Loading Creator Index data...</Text>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<BannerCard />

			{/* Top Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{quickStats.map((stat) => (
					<Card key={stat.label} className="flex flex-col justify-between h-full">
						<CardContent className="flex flex-col gap-2 p-4">
							<div className="flex items-center gap-2">
								<div className="rounded-lg p-2" style={{ background: rgbAlpha(stat.color, 0.1) }}>
									<Icon icon={stat.icon} size={24} color={stat.color} />
								</div>
								<Text variant="body2" className="font-semibold">
									{stat.label}
								</Text>
							</div>
							<div className="flex items-center gap-2 mt-2">
								<Title as="h3" className="text-2xl font-bold">
									{stat.value}
								</Title>
								{stat.percent !== 0 && (
									<span className={`text-xs flex items-center gap-1 font-bold ${stat.percent > 0 ? "text-green-500" : "text-red-500"}`}>
										<Icon icon={stat.percent > 0 ? "mdi:arrow-up" : "mdi:arrow-down"} size={16} />
										{Math.abs(stat.percent)}%
									</span>
								)}
							</div>
							<div className="w-full h-10 mt-2">
								<Chart
									type="bar"
									height={40}
									options={useChart({
										chart: { sparkline: { enabled: true } },
										colors: [stat.color],
										grid: { show: false },
										yaxis: { show: false },
										tooltip: { enabled: false },
									})}
									series={[{ data: stat.chart }]}
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Top Creators + Platform Distribution */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<Card className="lg:col-span-2">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<Text variant="body2" className="font-semibold">
								Top Creators by Followers
							</Text>
							<span className="text-sm text-gray-500">{topCreators.length} creators</span>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="py-2 text-left">Creator</th>
										<th className="py-2 text-left">Platform</th>
										<th className="py-2 text-right">Followers</th>
										<th className="py-2 text-right">Category</th>
									</tr>
								</thead>
								<tbody>
									{topCreators.map((creator, idx) => (
										<tr key={creator.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
											<td className="py-3">
												<div className="flex items-center gap-2">
													<span className="text-gray-400 w-6">{idx + 1}.</span>
													<div>
														<div className="font-semibold">{creator.display_name}</div>
														<div className="text-xs text-gray-500">@{creator.username}</div>
													</div>
												</div>
											</td>
											<td className="py-3">
												<div className="flex items-center gap-2">
													<Icon icon={getPlatformIcon(creator.platform)} size={16} color={getPlatformColor(creator.platform)} />
													<span className="capitalize">{creator.platform}</span>
												</div>
											</td>
											<td className="py-3 text-right font-bold">
												{formatFollowers(creator.followers)}
											</td>
											<td className="py-3 text-right text-gray-500">
												{creator.category || "N/A"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				<Card className="flex flex-col p-6">
					<Text variant="body2" className="font-semibold mb-4">
						Platform Distribution
					</Text>
					<div className="flex-1 flex flex-col items-center justify-center">
						{Object.keys(metrics.platforms).length > 0 ? (
							<>
								<Chart
									type="donut"
									height={180}
									options={platformDonutOptions}
									series={Object.values(metrics.platforms)}
								/>
								<div className="w-full mt-4">
									{Object.entries(metrics.platforms).map(([platform, count]) => (
										<div key={platform} className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<Icon icon={getPlatformIcon(platform)} size={16} color={getPlatformColor(platform)} />
												<Text variant="body2" className="capitalize">{platform}</Text>
											</div>
											<span className="font-bold">{count}</span>
										</div>
									))}
								</div>
							</>
						) : (
							<Text variant="body2" className="text-gray-500">No platform data</Text>
						)}
					</div>
				</Card>
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 gap-4">
				<Card className="flex flex-col p-6">
					<div className="flex items-center gap-4 mb-4">
						<Text variant="body2" className="font-semibold">
							Recent AI Agent Activity
						</Text>
						<div className="flex gap-2">
							{["All Activity", "Completed", "In Progress"].map((tab) => (
								<Button
									key={tab}
									size="sm"
									variant={activeTab === tab ? "default" : "ghost"}
									onClick={() => setActiveTab(tab)}
								>
									{tab}
								</Button>
							))}
						</div>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b">
									<th className="py-2 text-left">Agent</th>
									<th className="py-2 text-left">Task</th>
									<th className="py-2 text-left">Status</th>
									<th className="py-2 text-left">Time</th>
								</tr>
							</thead>
							<tbody>
								{recentActivity
									.filter(a => activeTab === "All Activity" ||
										(activeTab === "Completed" && a.status === "completed") ||
										(activeTab === "In Progress" && a.status === "in_progress"))
									.map((activity) => (
									<tr key={activity.id} className="border-b last:border-0">
										<td className="py-3">
											<div className="flex items-center gap-2">
												<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
													<Icon icon="mdi:robot" size={16} color="#3b82f6" />
												</div>
												<span className="font-semibold">{activity.agent_name}</span>
											</div>
										</td>
										<td className="py-3">
											<div>
												<div className="font-medium">{activity.task}</div>
												{activity.notes && (
													<div className="text-xs text-gray-500 truncate max-w-md">{activity.notes}</div>
												)}
											</div>
										</td>
										<td className="py-3">
											<span className={`px-2 py-1 rounded-full text-xs font-bold ${
												activity.status === "completed" ? "bg-green-100 text-green-700" :
												activity.status === "in_progress" ? "bg-blue-100 text-blue-700" :
												"bg-gray-100 text-gray-700"
											}`}>
												{activity.status}
											</span>
										</td>
										<td className="py-3 text-gray-500">
											{new Date(activity.created_at).toLocaleString()}
										</td>
									</tr>
								))}
								{recentActivity.length === 0 && (
									<tr>
										<td colSpan={4} className="py-8 text-center text-gray-500">
											No recent activity
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</Card>
			</div>

			{/* Project Status */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<Card className="lg:col-span-2 flex flex-col gap-4 p-6">
					<Text variant="body2" className="font-semibold mb-2">
						Creator Index Progress
					</Text>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<Text variant="body2">Total Creators</Text>
							<Title as="h3" className="text-xl font-bold">
								{metrics.total_creators}
							</Title>
						</div>
						<div>
							<Text variant="body2">AI Employees</Text>
							<Title as="h3" className="text-xl font-bold">
								{metrics.total_employees}
							</Title>
						</div>
						<div>
							<Text variant="body2">Target</Text>
							<Title as="h3" className="text-xl font-bold">
								100 Creators
							</Title>
						</div>
					</div>
					<div className="mt-4">
						<div className="flex items-center justify-between mb-2">
							<Text variant="body2">Progress to 100 Creators</Text>
							<span className="text-xs font-bold text-blue-500">{Math.min(100, metrics.total_creators)}%</span>
						</div>
						<Progress value={Math.min(100, metrics.total_creators)} />
					</div>
				</Card>
				<Card className="flex flex-col gap-4 p-6 items-center justify-center">
					<Text variant="body2" className="font-semibold mb-2">
						Creator Index
					</Text>
					<div className="text-center">
						<Title as="h2" className="text-4xl font-bold text-blue-600">
							{metrics.total_creators}
						</Title>
						<Text variant="body2" className="text-gray-500">Creators Indexed</Text>
					</div>
					<Button className="w-full mt-4" size="sm">
						<Icon icon="mdi:plus" size={18} /> Add Creator
					</Button>
				</Card>
			</div>
		</div>
	);
}
