export interface Country {
	cca2: string;
	name: { common: string; official: string };
	flags: { png: string; svg: string };
	capital?: string[];
	currencies?: Record<string, { name: string; symbol: string }>;
	region?: string;
}
