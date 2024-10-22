import { readFile, writeFile } from "fs/promises";
import { join } from "path";

async function patchManifest(source: string) {
	const buffer = await readFile(source);
	const manifestV3 = JSON.parse(buffer.toString("utf-8"));

	const distChrome = join(process.cwd(), "dist");
	manifestV3.web_accessible_resources[0].use_dynamic_url = false;
	await writeFile(
		join(distChrome, "manifest.json"),
		JSON.stringify(manifestV3),
	);
}

patchManifest(join(process.cwd(), "dist/manifest.json")).catch((err) => {
	console.error(err);
});
