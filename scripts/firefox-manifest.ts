import { readFile, cp, writeFile } from 'fs/promises';
import { join } from 'path';

async function patchManifest(source: string) {
    const buffer = await readFile(source);
    const manifestV3 = JSON.parse(buffer.toString('utf-8'));
    const manifestV2 = JSON.parse((await readFile(join(process.cwd(), 'manifest-v2.json'))).toString('utf-8'));

    const distFirefox = join(process.cwd(), 'dist-firefox');
    const distChrome = join(process.cwd(), 'dist');

    await cp(distChrome, distFirefox, { recursive: true });

    await writeFile(join(distFirefox, 'manifest.json'), JSON.stringify({
        ...manifestV2,
        content_scripts: manifestV3.content_scripts
    }));
}

patchManifest(join(process.cwd(), 'dist/manifest.json')).catch((err) => {
    console.error(err);
});