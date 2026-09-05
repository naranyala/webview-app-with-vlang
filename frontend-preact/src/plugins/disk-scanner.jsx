import { useEffect, useRef, useState } from 'preact/hooks';
import {
  advanceAssetScanJob,
  completeAssetScanJob,
  createAssetScanJob,
  MOCK_VOLUMES,
  summarizeAssets
} from '../assets.mjs';
import { backend } from '../backend.js';
import { styles, stylex } from '../stylex.js';

const diskVolumes = [
  {
    id: 'projects',
    name: 'Blender Projects',
    path: '~/projects',
    used: '182 GB',
    total: '1 TB',
    percent: 18
  },
  {
    id: 'samples',
    name: 'Sample Library',
    path: '~/samples',
    used: '96 GB',
    total: '500 GB',
    percent: 19
  },
  {
    id: 'renders',
    name: 'Renders',
    path: '~/renders',
    used: '286 GB',
    total: '1 TB',
    percent: 28
  }
];

const diskFolders = [
  { name: 'Blender scenes', size: '182.4 GB', percent: 83 },
  { name: 'Samples', size: '96.8 GB', percent: 58 },
  { name: 'Renders', size: '74.2 GB', percent: 42 },
  { name: 'References', size: '38.6 GB', percent: 25 }
];

export function DiskScanner() {
  const [selectedVolumeId, setSelectedVolumeId] = useState('projects');
  const [diskScanState, setDiskScanState] = useState('idle');
  const [diskScanProgress, setDiskScanProgress] = useState(0);
  const [scanJob, setScanJob] = useState(null);
  const [nativeVolumes, setNativeVolumes] = useState(null);
  const timerRef = useRef(null);
  const selectedVolume =
    (nativeVolumes || diskVolumes).find(
      (volume) => volume.id === selectedVolumeId
    ) || diskVolumes[0];
  const assetSummary = summarizeAssets(scanJob?.topEntries || []);

  useEffect(() => {
    let active = true;
    backend
      .listVolumes()
      .then((volumes) => {
        if (active && Array.isArray(volumes) && volumes.length > 0) {
          setNativeVolumes(volumes);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

  function startDiskScan() {
    if (diskScanState === 'scanning') return;
    setDiskScanState('scanning');
    setDiskScanProgress(0);
    let job = createAssetScanJob(selectedVolumeId);
    setScanJob(job);
    let progress = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      progress += 20;
      job = advanceAssetScanJob(job, [
        { path: `projects/shot-${progress}.blend`, size: 42000000 },
        { path: `samples/kick-${progress}.wav`, size: 8000000 }
      ]);
      setScanJob({ ...job });
      setDiskScanProgress(progress);
      if (progress >= 100) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setScanJob(completeAssetScanJob(job));
        setDiskScanState('complete');
      }
    }, 140);
  }

  return (
    <section className={stylex.props(styles.toolPage).className}>
      <div className={stylex.props(styles.toolHeading).className}>
        <div>
          <p className={stylex.props(styles.eyebrow).className}>
            Studio assets
          </p>
          <h1 className={stylex.props(styles.headingTitle).className}>
            Asset Scanner
          </h1>
          <p className={stylex.props(styles.headingText).className}>
            Index Blender scenes, samples, and renders without leaving the
            desktop. Native volume enumeration lights up inside the V shell.
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>Local</span>
      </div>

      <div
        className={
          stylex.props(styles.gridTwo, styles.responsiveGrid).className
        }
      >
        <div className={stylex.props(styles.toolPanel).className}>
          <div className={stylex.props(styles.panelHeading).className}>
            <div>
              <span className={stylex.props(styles.panelLabel).className}>
                Target
              </span>
              <h2 className={stylex.props(styles.panelHeadingTitle).className}>
                Volume
              </h2>
            </div>
            <span className={stylex.props(styles.panelStatus).className}>
              {diskScanState === 'complete' ? 'Done' : 'Ready'}
            </span>
          </div>
          <label
            className={stylex.props(styles.selectLabel).className}
            htmlFor="volume-select"
          >
            Volume
          </label>
          <select
            id="volume-select"
            className={stylex.props(styles.select).className}
            value={selectedVolumeId}
            onChange={(event) => setSelectedVolumeId(event.currentTarget.value)}
            disabled={diskScanState === 'scanning'}
          >
            {diskVolumes.map((volume) => (
              <option key={volume.id} value={volume.id}>
                {volume.name} - {volume.path}
              </option>
            ))}
          </select>
          <div className={stylex.props(styles.volumeSummary).className}>
            <div className={stylex.props(styles.volumeCopy).className}>
              <strong>{selectedVolume.used}</strong>
              <span className={stylex.props(styles.mutedSmall).className}>
                of {selectedVolume.total} used
              </span>
            </div>
            <strong>{selectedVolume.percent}%</strong>
          </div>
          <div
            className={stylex.props(styles.progressTrack).className}
            role="img"
            aria-label="Used storage"
          >
            <span
              className={stylex.props(styles.progressFill).className}
              style={`width: ${selectedVolume.percent}%`}
            />
          </div>
          <button
            type="button"
            className={
              stylex.props(styles.primaryButton, styles.responsiveDesktopButton)
                .className
            }
            onClick={startDiskScan}
            disabled={diskScanState === 'scanning'}
          >
            {diskScanState === 'scanning'
              ? `Scanning ${diskScanProgress}%`
              : diskScanState === 'complete'
                ? 'Scan again'
                : 'Start mock scan'}
          </button>
          <p className={stylex.props(styles.panelNote).className}>
            {scanJob
              ? `${scanJob.scannedFiles} indexed · ${assetSummary.blender} Blender · ${assetSummary.audio} audio · ${assetSummary.render} renders`
              : `Targets: ${MOCK_VOLUMES.map((volume) => volume.name).join(' · ')}. Native scan jobs land here next.`}
          </p>
        </div>

        <div className={stylex.props(styles.toolPanel).className}>
          <div className={stylex.props(styles.panelHeading).className}>
            <div>
              <span className={stylex.props(styles.panelLabel).className}>
                Largest
              </span>
              <h2 className={stylex.props(styles.panelHeadingTitle).className}>
                Folders
              </h2>
            </div>
            <span className={stylex.props(styles.mutedSmall).className}>
              never
            </span>
          </div>
          <div className={stylex.props(styles.folderList).className}>
            {diskFolders.map((folder) => (
              <div key={folder.name}>
                <div className={stylex.props(styles.folderCopy).className}>
                  <span>{folder.name}</span>
                  <strong>{folder.size}</strong>
                </div>
                <div className={stylex.props(styles.folderTrack).className}>
                  <span
                    className={stylex.props(styles.folderFill).className}
                    style={`width: ${folder.percent}%`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={stylex.props(styles.footerRow).className}>
            <span>Free space</span>
            <strong>286 GB</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
