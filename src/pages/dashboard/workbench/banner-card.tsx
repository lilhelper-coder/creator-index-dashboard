import bgImg from "@/assets/images/background/banner-1.png";
import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Text, Title } from "@/ui/typography";
import type { CSSProperties } from "react";

export default function BannerCard() {
	const bgStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundImage: `url("${bgImg}")`,
		backgroundSize: "100%",
		backgroundPosition: "50%",
		backgroundRepeat: "no-repeat",
		opacity: 0.3,
	};
	return (
		<div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
			<div className="p-6 z-2 relative">
				<div className="grid grid-cols-3 gap-4 items-center">
					<div className="col-span-3 md:col-span-2">
						<div className="flex flex-col gap-2">
							<Title as="h2" className="text-white text-3xl font-bold">
								Creator Index
							</Title>
							<Text className="text-white/90 text-lg">
								The Nielsen of the Creator Economy - Real-time creator analytics powered by AI
							</Text>
							<div className="flex gap-6 mt-4">
								<div className="text-center">
									<div className="text-3xl font-bold text-white">100</div>
									<div className="text-sm text-white/80">Creators</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-white">4</div>
									<div className="text-sm text-white/80">Platforms</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-white">37</div>
									<div className="text-sm text-white/80">AI Agents</div>
								</div>
							</div>
						</div>
					</div>

					<div className="col-span-3 md:col-span-1">
						<div className="w-full flex items-center justify-end gap-2">
							<Button
								variant="outline"
								className="bg-white text-blue-600 hover:bg-gray-100"
								onClick={() => window.open("https://creatorindex.co")}
							>
								<Icon icon="mdi:chart-line" size={20} />
								<span className="ml-2 font-bold">View Rankings</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div style={bgStyle} className="z-1" />
		</div>
	);
}
