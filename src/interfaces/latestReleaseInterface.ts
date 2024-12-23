export interface IGithubLatestRelease {
	tag_name: string,
	name: string,
	assets: IGithubAsset[]
}

interface IGithubAsset {
	url: string,
	name: string,
	browser_download_url: string,
}
