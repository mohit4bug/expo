import { vol } from 'memfs';

import { ExportedMetadata, FullAssetDump } from '../types';
import { getFullAssetDump, getFullAssetDumpHashSet } from '../verifyNativeAssets';

const metadata: ExportedMetadata = {
  fileMetadata: {
    ios: {
      bundle: 'bundle.hbc',
      assets: [
        {
          path: 'assets/a7643581b54e5c60b852c5d827e629dc',
          ext: 'jpg',
        },
      ],
    },
    android: {
      bundle: 'bundle.hbc',
      assets: [
        {
          path: 'assets/a7643581b54e5c60b852c5d827e629dc',
          ext: 'jpg',
        },
      ],
    },
  },
};
const assetMap: FullAssetDump = new Map(
  Object.entries({
    '1052d6ca3993ae24a932304560a4c8b4': {
      files: ['Abel_400Regular.ttf'],
      hash: '1052d6ca3993ae24a932304560a4c8b4',
      name: 'Abel_400Regular',
      type: 'ttf',
      fileHashes: ['1052d6ca3993ae24a932304560a4c8b4'],
    },
    '6c6f1942f05d08b0a89b3720a8d2aecd': {
      files: ['HankenGrotesk_300Light.ttf'],
      hash: '6c6f1942f05d08b0a89b3720a8d2aecd',
      name: 'HankenGrotesk_300Light',
      type: 'ttf',
      fileHashes: ['6c6f1942f05d08b0a89b3720a8d2aecd'],
    },
    c0869ee4a51820ceef252798829c4c76: {
      files: ['dougheadshot.jpg'],
      hash: 'c0869ee4a51820ceef252798829c4c76',
      name: 'dougheadshot',
      type: 'jpg',
      fileHashes: ['c0869ee4a51820ceef252798829c4c76'],
    },
    a7643581b54e5c60b852c5d827e629dc: {
      files: ['coffee-prep.jpg'],
      hash: 'a7643581b54e5c60b852c5d827e629dc',
      name: 'coffee-prep',
      type: 'jpg',
      fileHashes: ['a7643581b54e5c60b852c5d827e629dc'],
    },
  })
);

describe(getFullAssetDump, () => {
  it(`throws if assetmap is missing`, () => {
    vol.fromJSON(
      {
        'dist/metadata.json': JSON.stringify(metadata),
      },
      '/'
    );
    expect(() => getFullAssetDump('/dist')).toThrow(
      'The export bundle chosen does not contain assetmap.json. Please generate the bundle with "npx expo export --dump-assetmap"'
    );
  });

  it(`returns full asset map and set`, () => {
    vol.fromJSON(
      {
        'dist/assetmap.json': JSON.stringify(Object.fromEntries(assetMap)),
      },
      '/'
    );
    const result = getFullAssetDump('/dist');
    expect(result.get('c0869ee4a51820ceef252798829c4c76')?.name).toEqual('dougheadshot');
  });
});
describe(getFullAssetDumpHashSet, () => {
  it('Converts full asset map to set', () => {
    const result = getFullAssetDumpHashSet(assetMap);
    expect(result.size).toEqual(4);
  });
});
