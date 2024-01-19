import fs from 'fs';
import glob from 'glob';
import path from 'path';

import {
  BuildManifest,
  ExportedMetadata,
  ExportedMetadataAsset,
  FullAssetDump,
  Platform,
} from './types';
import { CommandError } from '../utils/errors';

const debug = require('debug')('expo:verify-native-assets') as typeof console.log;

export function getMissingAssets(
  buildPath: string,
  exportPath: string,
  platform: Platform,
  projectRoot: string
) {
  const buildManifestHashSet = getBuildManifestHashSet(
    getBuildManifest(buildPath, platform, projectRoot)
  );

  const fullAssetMap = getFullAssetDump(exportPath);
  const fullAssetSet = getFullAssetDumpHashSet(getFullAssetDump(exportPath));

  const exportedAssetSet = getExportedMetadataHashSet(getExportedMetadata(exportPath), platform);

  debug(`Assets in build: ${JSON.stringify([...buildManifestHashSet], null, 2)}`);
  debug(`Assets in exported bundle: ${JSON.stringify([...exportedAssetSet], null, 2)}`);
  debug(`All assets resolved by Metro: ${JSON.stringify([...fullAssetSet], null, 2)}`);

  const buildAssetsPlusExportedAssets = new Set(buildManifestHashSet);
  exportedAssetSet.forEach((hash) => buildAssetsPlusExportedAssets.add(hash));

  const missingAssets: {
    hash: string;
    path: string;
  }[] = [];

  fullAssetSet.forEach((hash) => {
    if (!buildAssetsPlusExportedAssets.has(hash)) {
      const asset = fullAssetMap.get(hash);
      console.warn(`  Missing asset: hash = ${hash}, file = ${asset?.files[0] ?? ''}`);
      missingAssets.push({
        hash,
        path: asset?.files[0] ?? '',
      });
    }
  });

  return missingAssets;
}

export function getBuildManifest(buildPath: string, platform: Platform, projectRoot: string) {
  let realBuildPath = buildPath;
  if (buildPath === projectRoot) {
    switch (platform) {
      case 'android':
        realBuildPath = path.resolve(projectRoot, 'android', 'app', 'build');
        break;
      default:
        realBuildPath = path.resolve(projectRoot, 'ios', 'build');
        break;
    }
    realBuildPath = path.resolve(projectRoot, platform);
  }
  const buildManifestPaths = glob.sync(`${realBuildPath}/**/app.manifest`);
  if (buildManifestPaths.length === 0) {
    throw new CommandError(`No app.manifest found in build path`);
  }
  const buildManifestPath = buildManifestPaths[0];
  debug(`Build manifest found at ${buildManifestPath}`);
  const buildManifestString = fs.readFileSync(buildManifestPaths[0], { encoding: 'utf-8' });
  const buildManifest: BuildManifest = JSON.parse(buildManifestString);
  return buildManifest;
}

export function getBuildManifestHashSet(buildManifest: BuildManifest) {
  return new Set((buildManifest.assets ?? []).map((asset) => asset.packagerHash));
}

export function getFullAssetDump(exportPath: string) {
  const assetMapPath = path.resolve(exportPath, 'assetmap.json');
  if (!fs.existsSync(assetMapPath)) {
    throw new CommandError(
      `The export bundle chosen does not contain assetmap.json. Please generate the bundle with "npx expo export --dump-assetmap"`
    );
  }
  const assetMapString = fs.readFileSync(assetMapPath, { encoding: 'utf-8' });
  const assetMap: FullAssetDump = new Map(Object.entries(JSON.parse(assetMapString)));
  return assetMap;
}

export function getFullAssetDumpHashSet(assetMap: FullAssetDump) {
  const assetSet = new Set<string>();
  assetMap.forEach((_asset, hash) => {
    assetSet.add(hash);
  });
  return assetSet;
}

export function getExportedMetadata(exportPath: string) {
  const metadataPath = path.resolve(exportPath, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    throw new CommandError(
      `The export bundle chosen does not contain metadata.json. Please generate the bundle with "npx expo export --dump-assetmap"`
    );
  }
  const metadataString = fs.readFileSync(metadataPath, { encoding: 'utf-8' });
  const metadata: ExportedMetadata = JSON.parse(metadataString);
  return metadata;
}

export function getExportedMetadataHashSet(metadata: ExportedMetadata, platform: Platform) {
  const fileMetadata =
    platform === 'android' ? metadata.fileMetadata.android : metadata.fileMetadata.ios;
  if (!fileMetadata) {
    throw new CommandError(`Exported bundle was not exported for platform ${platform}`);
  }
  const assets: ExportedMetadataAsset[] = fileMetadata?.assets ?? [];
  const assetSet = new Set<string>();
  assets.forEach((asset) => {
    assetSet.add(asset.path.substring(7, asset.path.length));
  });
  return assetSet;
}
