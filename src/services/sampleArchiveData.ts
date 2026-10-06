/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Real in-memory binary generators for Sample VHD, ISO, TAR.GZ, and ZIP archives
 */

import JSZip from 'jszip';
import * as fflate from 'fflate';
import { getSampleStandardPdfBuffer } from './samplePdfData';

/**
 * Generates a valid Microsoft VHD (Virtual Hard Disk) Fixed image
 * with a genuine MBR partition table and a mounted FAT16 volume
 * containing real files (README.TXT, CONFIG.SYS, DATA.CSV, SCRIPT.PY, LOGO.SVG).
 */
export function generateSampleVhdBuffer(): ArrayBuffer {
  // 512KB Virtual Hard Disk (1024 sectors of 512 bytes) + 512-byte VHD footer = 524,800 bytes
  const NUM_SECTORS = 1024;
  const SECTOR_SIZE = 512;
  const DISK_SIZE = NUM_SECTORS * SECTOR_SIZE;
  const TOTAL_SIZE = DISK_SIZE + 512; // Data + 512-byte footer

  const buffer = new ArrayBuffer(TOTAL_SIZE);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // 1. Write MBR at Sector 0 (LBA 0)
  // Partition 1 at LBA 1, 1020 sectors long, Type 0x06 (FAT16)
  const PARTITION_START_LBA = 1;
  const PARTITION_SECTORS = 1020;

  // Boot signature at offset 510
  bytes[510] = 0x55;
  bytes[511] = 0xaa;

  // Partition entry 1 at offset 446 (0x1BE)
  bytes[446] = 0x80; // Bootable / Active
  bytes[446 + 1] = 0x01; // Starting Head
  bytes[446 + 2] = 0x01; // Starting Sector
  bytes[446 + 3] = 0x00; // Starting Cylinder
  bytes[446 + 4] = 0x06; // Type: FAT16
  bytes[446 + 5] = 0x03; // Ending Head (4 heads: 0..3)
  bytes[446 + 6] = 0x10; // Ending Sector (16 sectors)
  bytes[446 + 7] = 0x0f; // Ending Cylinder (16 cylinders: 0..15)
  view.setUint32(446 + 8, PARTITION_START_LBA, true); // Starting LBA = 1
  view.setUint32(446 + 12, PARTITION_SECTORS, true); // Total Sectors = 1020

  // 2. Write FAT16 Boot Sector at Partition Start (LBA 1 = offset 512)
  const bootOffset = PARTITION_START_LBA * SECTOR_SIZE;
  // Jump instruction
  bytes[bootOffset] = 0xeb;
  bytes[bootOffset + 1] = 0x3c;
  bytes[bootOffset + 2] = 0x90;
  // OEM Name: "MSDOS5.0"
  const oem = 'MSDOS5.0';
  for (let i = 0; i < oem.length; i++) bytes[bootOffset + 3 + i] = oem.charCodeAt(i);

  view.setUint16(bootOffset + 11, SECTOR_SIZE, true); // Bytes per sector: 512
  bytes[bootOffset + 13] = 2; // Sectors per cluster: 2 (1024 bytes per cluster)
  view.setUint16(bootOffset + 14, 1, true); // Reserved sectors: 1
  bytes[bootOffset + 16] = 2; // Number of FATs: 2
  view.setUint16(bootOffset + 17, 64, true); // Root entries count: 64
  view.setUint16(bootOffset + 19, PARTITION_SECTORS, true); // Total sectors: 1020
  bytes[bootOffset + 21] = 0xf8; // Media descriptor: Hard Disk
  view.setUint16(bootOffset + 22, 4, true); // Sectors per FAT: 4 (supports 1024 clusters)
  view.setUint16(bootOffset + 24, 16, true); // Sectors per track: 16
  view.setUint16(bootOffset + 26, 4, true); // Number of heads: 4
  view.setUint32(bootOffset + 28, PARTITION_START_LBA, true); // Hidden sectors: 1
  // Boot signature for partition boot sector
  bytes[bootOffset + 510] = 0x55;
  bytes[bootOffset + 511] = 0xaa;

  // FAT Tables:
  // Reserved = 1 sector (LBA 1), FAT 1 at LBA 2 (offset 1024, 4 sectors), FAT 2 at LBA 6 (offset 3072, 4 sectors)
  const fat1Offset = (PARTITION_START_LBA + 1) * SECTOR_SIZE;
  const fat2Offset = (PARTITION_START_LBA + 1 + 4) * SECTOR_SIZE;

  // FAT16 initial entries (Media 0xFFF8, End-of-chain 0xFFFF)
  view.setUint16(fat1Offset, 0xfff8, true);
  view.setUint16(fat1Offset + 2, 0xffff, true);
  view.setUint16(fat2Offset, 0xfff8, true);
  view.setUint16(fat2Offset + 2, 0xffff, true);

  // Root Directory:
  // Starts after FATs: LBA 1 + 1 (reserved) + 2*4 (FATs) = LBA 10 (offset 5120)
  // Root dir entries = 64 * 32 bytes = 2048 bytes (4 sectors, LBA 10..13)
  const rootDirOffset = (PARTITION_START_LBA + 1 + 8) * SECTOR_SIZE;
  // Data clusters start after Root Directory = LBA 14 (offset 7168)
  const dataStartOffset = rootDirOffset + 64 * 32;

  // PDF Bytes
  const samplePdfData = new Uint8Array(getSampleStandardPdfBuffer());

  // SVG Vector Image
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320" width="100%" height="100%">
  <defs>
    <linearGradient id="vhdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="500" height="320" rx="20" fill="#0b0f19"/>
  <rect x="20" y="20" width="460" height="280" rx="14" fill="#131c31" stroke="#25355a" stroke-width="2"/>
  <circle cx="250" cy="120" r="56" fill="url(#vhdGrad)"/>
  <path d="M225 120 L242 138 L275 102" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="250" y="215" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">OmniView VHD In-Memory Mount</text>
  <text x="250" y="245" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Direct Vector Graphic Preview · 100% Client-Side</text>
  <text x="250" y="270" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">Developer: Suhail Akhtar (https://suhail.top)</text>
</svg>`;

  // Binary Kernel Mock
  const sampleBin = new Uint8Array([
    0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x00, 0x3e, 0x00, 0x01, 0x00, 0x00, 0x00, 0x78, 0x10, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);

  // Sample files across ALL major categories to place into the FAT16 volume:
  const files: Array<{ name: string; ext: string; data: Uint8Array }> = [
    {
      name: 'MANUAL  ',
      ext: 'PDF',
      data: samplePdfData
    },
    {
      name: 'LOGO    ',
      ext: 'SVG',
      data: new TextEncoder().encode(sampleSvg)
    },
    {
      name: 'README  ',
      ext: 'TXT',
      data: new TextEncoder().encode(`OmniView Virtual Hard Disk (VHD) Mount Test
============================================
Developer: Suhail Akhtar (https://suhail.top)

This virtual disk image has been parsed and mounted 100% locally in client memory.
Format: Microsoft VHD Fixed Hard Disk Image
Partition: FAT16 Master Volume
No external extraction or virtualization software required!
`)
    },
    {
      name: 'DOCS    ',
      ext: 'MD ',
      data: new TextEncoder().encode(`# OmniView Virtual Hard Disk Architecture

This VHD disk image demonstrates client-side filesystem traversal and direct in-memory previewing for **all file formats**.

### Features
* **Zero Disk Extraction**: Reads sectors and FAT cluster chains in memory.
* **Full Multi-Format Previews**: PDFs, Images, Markdown, Code, JSON, HTML, CSV, Logs, and Binary inspection.
* **Developer**: [Suhail Akhtar](https://suhail.top)
`)
    },
    {
      name: 'CONFIG  ',
      ext: 'JSO',
      data: new TextEncoder().encode(JSON.stringify({
        diskName: 'system_disk_c.vhd',
        filesystem: 'FAT16',
        directPreview: true,
        clusterSize: 1024,
        sectorSize: 512,
        developer: 'Suhail Akhtar (https://suhail.top)',
        status: 'mounted_in_ram'
      }, null, 2))
    },
    {
      name: 'INDEX   ',
      ext: 'HTM',
      data: new TextEncoder().encode(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OmniView VHD Portal</title>
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: sans-serif; padding: 2rem; }
    h1 { color: #38bdf8; }
    .badge { background: #1e293b; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>OmniView Virtual Hard Disk Web Service</h1>
  <p>Served directly from in-memory FAT16 cluster chains.</p>
  <span class="badge">Created by Suhail Akhtar</span>
</body>
</html>`)
    },
    {
      name: 'METRICS ',
      ext: 'CSV',
      data: new TextEncoder().encode(`Timestamp,Sector_Read,Cluster_Alloc,Disk_IOPS,Status
2026-10-06T00:00:00Z,512,Cluster_2,12500,ACTIVE
2026-10-06T00:01:00Z,1024,Cluster_3,14200,ACTIVE
2026-10-06T00:02:00Z,2048,Cluster_4,16800,HEALTHY
`)
    },
    {
      name: 'SERVER  ',
      ext: 'LOG',
      data: new TextEncoder().encode(`[2026-10-06T00:00:01Z] [INFO] VHD controller booted successfully
[2026-10-06T00:00:02Z] [INFO] FAT16 volume mounted (Partition 1)
[2026-10-06T00:00:03Z] [SUCCESS] All files mounted in memory without extraction
[2026-10-06T00:00:04Z] [INFO] Developer: Suhail Akhtar (https://suhail.top)
`)
    },
    {
      name: 'SCRIPT  ',
      ext: 'PY ',
      data: new TextEncoder().encode(`# Python script running inside VHD
def inspect_vhd():
    print("VHD Virtual Drive successfully inspected by OmniView!")
    return {"status": "ok", "developer": "Suhail Akhtar"}

if __name__ == "__main__":
    inspect_vhd()
`)
    },
    {
      name: 'CONFIG  ',
      ext: 'SYS',
      data: new TextEncoder().encode(`[OmniView_VHD_Config]
DEVICE=VHD_DRIVER.SYS /PORT:3000
BUFFERS=32,0
FILES=128
LASTDRIVE=Z
SECURITY=STRICT_LOCAL_IN_MEMORY
AUTHOR=Suhail Akhtar (https://suhail.top)
`)
    },
    {
      name: 'KERNEL  ',
      ext: 'BIN',
      data: sampleBin
    }
  ];

  // Write files to FAT directory and data clusters with multi-cluster chaining
  let dirIdx = 0;
  let currentCluster = 2;

  for (const f of files) {
    const entryOffset = rootDirOffset + dirIdx * 32;
    // Filename (8 bytes) + Extension (3 bytes)
    for (let i = 0; i < 8; i++) bytes[entryOffset + i] = f.name.charCodeAt(i) || 0x20;
    for (let i = 0; i < 3; i++) bytes[entryOffset + 8 + i] = f.ext.charCodeAt(i) || 0x20;
    bytes[entryOffset + 11] = 0x20; // Archive attribute

    // Starting cluster (offset 26, uint16)
    view.setUint16(entryOffset + 26, currentCluster, true);
    view.setUint32(entryOffset + 28, f.data.length, true); // File size

    // Write file data across cluster chain
    const clusterCount = Math.max(1, Math.ceil(f.data.length / (2 * SECTOR_SIZE)));
    for (let c = 0; c < clusterCount; c++) {
      const clusterId = currentCluster + c;
      const nextCluster = c === clusterCount - 1 ? 0xffff : clusterId + 1;

      // Link FAT 1 and FAT 2
      view.setUint16(fat1Offset + clusterId * 2, nextCluster, true);
      view.setUint16(fat2Offset + clusterId * 2, nextCluster, true);

      // Write 1024-byte chunk
      const chunk = f.data.subarray(c * 1024, (c + 1) * 1024);
      const clusterDataOffset = dataStartOffset + (clusterId - 2) * (2 * SECTOR_SIZE);
      if (clusterDataOffset + chunk.length <= DISK_SIZE) {
        bytes.set(chunk, clusterDataOffset);
      }
    }

    currentCluster += clusterCount;
    dirIdx++;
  }

  // 3. Write 512-byte VHD Footer at DISK_SIZE (offset 524,288)
  const footerOffset = DISK_SIZE;

  // Cookie: "conectix"
  const cookie = 'conectix';
  for (let i = 0; i < cookie.length; i++) bytes[footerOffset + i] = cookie.charCodeAt(i);

  view.setUint32(footerOffset + 8, 0x00000002, false); // Features: 0x00000002
  view.setUint32(footerOffset + 12, 0x00010000, false); // Version: 1.0 (0x00010000)
  view.setBigUint64(footerOffset + 16, 0xffffffffffffffffn, false); // Data Offset: 0xFFFFFFFFFFFFFFFF (Fixed Disk)

  // Timestamp: seconds since Jan 1, 2000 UTC
  const nowSec = Math.floor(Date.now() / 1000) - 946684800;
  view.setUint32(footerOffset + 24, nowSec, false);

  // Creator App: "win "
  bytes[footerOffset + 28] = 0x77; // 'w'
  bytes[footerOffset + 29] = 0x69; // 'i'
  bytes[footerOffset + 30] = 0x6e; // 'n'
  bytes[footerOffset + 31] = 0x20; // ' '

  view.setUint32(footerOffset + 32, 0x00060001, false); // Creator Version: 6.1

  // Creator Host OS: "Wi2k" (Windows)
  bytes[footerOffset + 36] = 0x57; // 'W'
  bytes[footerOffset + 37] = 0x69; // 'i'
  bytes[footerOffset + 38] = 0x32; // '2'
  bytes[footerOffset + 39] = 0x6b; // 'k'

  // Original & Current Size: 524,288 bytes (512 KB)
  view.setBigUint64(footerOffset + 40, BigInt(DISK_SIZE), false);
  view.setBigUint64(footerOffset + 48, BigInt(DISK_SIZE), false);

  // Disk Geometry: 16 cylinders, 4 heads, 16 sectors per track (16 * 4 * 16 = 1024 sectors)
  view.setUint16(footerOffset + 56, 16, false); // Cylinders: 16
  bytes[footerOffset + 58] = 4; // Heads: 4
  bytes[footerOffset + 59] = 16; // Sectors per track: 16

  view.setUint32(footerOffset + 60, 2, false); // Disk Type: 2 (Fixed Hard Disk)

  // Unique ID (UUID): e.g. 7f4a8b1c-92e3-4d56-8a7b-0c1d2e3f4a5b
  for (let i = 0; i < 16; i++) {
    bytes[footerOffset + 68 + i] = (i * 17 + 42) & 0xff;
  }

  // Saved state: 0
  bytes[footerOffset + 84] = 0;

  // Calculate one's complement checksum (bytes 0..511 with checksum field zeroed)
  let chksum = 0;
  for (let i = 0; i < 512; i++) {
    if (i < 64 || i >= 68) {
      chksum += bytes[footerOffset + i];
    }
  }
  view.setUint32(footerOffset + 64, ~chksum >>> 0, false);

  return buffer;
}

/**
 * Generates a valid POSIX TAR.GZ archive buffer with folders,
 * source files, and documents.
 */
export function generateSampleTarGzBuffer(): ArrayBuffer {
  // We'll create uncompressed TAR blocks using ustar specification, then gzip it
  const files = [
    {
      name: 'release_manifest.json',
      content: JSON.stringify(
        {
          project: 'OmniView File Studio',
          version: '4.2.0',
          archiveEngine: 'Universal Decompression & Direct Preview',
          author: 'Suhail Akhtar (https://suhail.top)',
          supportedFormats: ['vhd', 'iso', 'tar', 'gz', 'bz2', '7z', 'rar', 'zip', 'cab', 'deb', 'cpio']
        },
        null,
        2
      )
    },
    {
      name: 'scripts/deploy_sandbox.sh',
      content: `#!/usr/bin/env bash
# OmniView Offline Deployment Script
echo "Starting local client-side previewer sandbox..."
echo "Developer: Suhail Akhtar (https://suhail.top)"
echo "Verified 100% In-Memory Archive Unpack."
exit 0
`
    },
    {
      name: 'docs/ARCHITECTURE.md',
      content: `# Universal Archive Architecture in OmniView

## Direct Previews Without Extraction
Users can view images, code, database schemas, and text documents directly inside archives and virtual disks:
- **No temporary disk storage**: Everything reads safely in browser RAM.
- **Lazy byte streaming**: Extracted only when previewed or exported.
- **Deep drilldown**: Open extracted files in new workspace tabs.
`
    },
    {
      name: 'config/settings.ini',
      content: `[ArchiveViewer]
enable_in_memory_preview=true
max_file_cache_mb=256
render_svg_images=true
developer=Suhail Akhtar
`
    }
  ];

  // Build raw TAR blocks
  const blocks: Uint8Array[] = [];

  for (const f of files) {
    const data = new TextEncoder().encode(f.content);
    const header = new Uint8Array(512);

    // Filename
    for (let i = 0; i < f.name.length && i < 100; i++) header[i] = f.name.charCodeAt(i);

    // Mode: 0000644 \0
    writeOctal(header, 100, 8, 0o644);
    // UID / GID: 0001000 \0
    writeOctal(header, 108, 8, 1000);
    writeOctal(header, 116, 8, 1000);
    // Size: octal
    writeOctal(header, 124, 12, data.length);
    // Mtime: octal
    writeOctal(header, 136, 12, Math.floor(Date.now() / 1000));

    // Typeflag: '0' (regular file)
    header[156] = 0x30;

    // Magic: "ustar\0"
    const magic = 'ustar\x00';
    for (let i = 0; i < 6; i++) header[257 + i] = magic.charCodeAt(i);
    // Version: "00"
    header[263] = 0x30;
    header[264] = 0x30;

    // Checksum: calculate sum of all bytes with checksum field filled with spaces (0x20)
    for (let i = 148; i < 156; i++) header[i] = 0x20;
    let chk = 0;
    for (let i = 0; i < 512; i++) chk += header[i];
    writeOctal(header, 148, 7, chk);
    header[155] = 0x20;

    blocks.push(header);

    // Data blocks padded to 512
    const dataPaddedLen = Math.ceil(data.length / 512) * 512;
    const dataBlock = new Uint8Array(dataPaddedLen);
    dataBlock.set(data);
    blocks.push(dataBlock);
  }

  // End of TAR: two 512-byte zero blocks
  blocks.push(new Uint8Array(512));
  blocks.push(new Uint8Array(512));

  // Combine into single TAR
  const totalTarLen = blocks.reduce((acc, b) => acc + b.length, 0);
  const tarBytes = new Uint8Array(totalTarLen);
  let cur = 0;
  for (const b of blocks) {
    tarBytes.set(b, cur);
    cur += b.length;
  }

  // GZIP compress via fflate
  const gzipped = fflate.gzipSync(tarBytes);
  return gzipped.buffer;
}

/**
 * Generates a valid ISO-9660 Disc Image buffer with PVD and files
 */
export function generateSampleIsoBuffer(): ArrayBuffer {
  const SECTOR_SIZE = 2048;
  const NUM_SECTORS = 32; // 64 KB total
  const buffer = new ArrayBuffer(NUM_SECTORS * SECTOR_SIZE);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // Sector 16 = Primary Volume Descriptor (PVD)
  const pvdOffset = 16 * SECTOR_SIZE;
  bytes[pvdOffset] = 1; // PVD Type
  // ID: "CD001"
  const cdId = 'CD001';
  for (let i = 0; i < 5; i++) bytes[pvdOffset + 1 + i] = cdId.charCodeAt(i);
  bytes[pvdOffset + 6] = 1; // Version

  // System ID & Volume ID
  const volId = 'OMNIVIEW_DISC';
  for (let i = 0; i < volId.length; i++) bytes[pvdOffset + 40 + i] = volId.charCodeAt(i);

  // Volume Space Size: 32 sectors (both LE and BE)
  view.setUint32(pvdOffset + 80, NUM_SECTORS, true);
  view.setUint32(pvdOffset + 84, NUM_SECTORS, false);

  // Logical Block Size: 2048
  view.setUint16(pvdOffset + 128, SECTOR_SIZE, true);
  view.setUint16(pvdOffset + 130, SECTOR_SIZE, false);

  // Root Directory Record at PVD offset 156
  const rootRecOffset = pvdOffset + 156;
  bytes[rootRecOffset] = 34; // Record length
  view.setUint32(rootRecOffset + 2, 20, true); // Root dir at LBA 20
  view.setUint32(rootRecOffset + 6, 20, false);
  view.setUint32(rootRecOffset + 10, SECTOR_SIZE, true); // Length: 2048
  view.setUint32(rootRecOffset + 14, SECTOR_SIZE, false);
  bytes[rootRecOffset + 25] = 0x02; // Directory flag
  bytes[rootRecOffset + 32] = 1; // Name length
  bytes[rootRecOffset + 33] = 0; // Root identifier

  // Root Directory contents at LBA 20
  const dirOffset = 20 * SECTOR_SIZE;
  let dirCur = dirOffset;

  // File 1: AUTORUN.INF at LBA 22
  const file1Content = new TextEncoder().encode(`[autorun]
open=STARTUP.EXE
icon=LOGO.ICO
label=OmniView Optical Disc
`);
  const file1Lba = 22;
  bytes.set(file1Content, file1Lba * SECTOR_SIZE);

  // Write directory record for AUTORUN.INF
  const rec1Len = 33 + 13; // 46 bytes
  bytes[dirCur] = rec1Len;
  view.setUint32(dirCur + 2, file1Lba, true);
  view.setUint32(dirCur + 6, file1Lba, false);
  view.setUint32(dirCur + 10, file1Content.length, true);
  view.setUint32(dirCur + 14, file1Content.length, false);
  bytes[dirCur + 25] = 0x00; // Regular file
  const f1Name = 'AUTORUN.INF;1';
  bytes[dirCur + 32] = f1Name.length;
  for (let i = 0; i < f1Name.length; i++) bytes[dirCur + 33 + i] = f1Name.charCodeAt(i);
  dirCur += rec1Len + (rec1Len % 2);

  // File 2: README.TXT at LBA 23
  const file2Content = new TextEncoder().encode(`OmniView ISO-9660 Disc Image Explorer
======================================
Developer: Suhail Akhtar (https://suhail.top)

Optical media directly mounted inside OmniView.
Features:
- Joliet & Standard ISO 9660 Directory Traversal
- In-memory instant file extraction and preview
`);
  const file2Lba = 23;
  bytes.set(file2Content, file2Lba * SECTOR_SIZE);

  const rec2Len = 33 + 12; // 45 bytes
  bytes[dirCur] = rec2Len;
  view.setUint32(dirCur + 2, file2Lba, true);
  view.setUint32(dirCur + 6, file2Lba, false);
  view.setUint32(dirCur + 10, file2Content.length, true);
  view.setUint32(dirCur + 14, file2Content.length, false);
  bytes[dirCur + 25] = 0x00;
  const f2Name = 'README.TXT;1';
  bytes[dirCur + 32] = f2Name.length;
  for (let i = 0; i < f2Name.length; i++) bytes[dirCur + 33 + i] = f2Name.charCodeAt(i);

  return buffer;
}

/**
 * Generates a sample multi-format ZIP archive with documents, code, images, and data synchronously
 */
export function generateSampleZipBufferSync(): ArrayBuffer {
  const samplePdfBytes = new Uint8Array(getSampleStandardPdfBuffer());
  const files: Record<string, Uint8Array> = {
    'documents/project_specification.pdf': samplePdfBytes,
    'workspace_notes.md': fflate.strToU8(`# OmniView Archive Inspection Notes
Developer: **Suhail Akhtar** ([suhail.top](https://suhail.top))

This file was extracted in-memory from a ZIP container without needing manual disk extraction!

## Verified Features:
- Direct PDF preview using embedded PDF.js canvas engine
- Markdown formatting & rich syntax highlighting
- One-click copy, save, and promote to full workspace tab
- Multi-format archive navigation (ZIP, VHD, ISO, TAR, etc.)
`),
    'src/calculator.ts': fflate.strToU8(`// TypeScript Code inside Archive
export function calculateChecksum(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data[i]) & 0xFFFFFFFF;
  }
  return sum;
}
`),
    'data/sales_report.csv': fflate.strToU8(`Region,Quarter,Revenue,Target,Growth
North,Q1,450000,400000,+12.5%
South,Q1,380000,390000,-2.5%
East,Q1,620000,550000,+12.7%
West,Q1,510000,480000,+6.2%
`),
    'assets/brand_badge.svg': fflate.strToU8(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#4F46E5"/>
  <circle cx="50" cy="50" r="28" fill="#FFFFFF" fill-opacity="0.2"/>
  <path d="M35 50 L45 60 L65 40" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`)
  };

  const zipped = fflate.zipSync(files);
  return zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength) as ArrayBuffer;
}

/**
 * Generates a valid, complete Microsoft PowerPoint (.pptx) presentation
 * with PresentationML XML, Theme color scheme, Master layout, and 3 rich slides
 */
export function generateSamplePptxBufferSync(): ArrayBuffer {
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/notesSlides/notesSlide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>
</Types>`),

    '_rels/.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`),

    'ppt/_rels/presentation.xml.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
</Relationships>`),

    'ppt/presentation.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId3"/>
    <p:sldId id="257" r:id="rId4"/>
    <p:sldId id="258" r:id="rId5"/>
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500" type="screen16x9"/>
</p:presentation>`),

    'ppt/theme/theme1.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="OmniView Theme">
  <a:themeElements>
    <a:clrScheme name="OmniView Colors">
      <a:dk1><a:sysClr val="windowText" lastClr="0F172A"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1E293B"/></a:dk2>
      <a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="2563EB"/></a:accent1>
      <a:accent2><a:srgbClr val="059669"/></a:accent2>
      <a:accent3><a:srgbClr val="D97706"/></a:accent3>
      <a:accent4><a:srgbClr val="DC2626"/></a:accent4>
      <a:accent5><a:srgbClr val="7C3AED"/></a:accent5>
      <a:accent6><a:srgbClr val="0891B2"/></a:accent6>
      <a:hlink><a:srgbClr val="2563EB"/></a:hlink>
      <a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="OmniView Typography">
      <a:majorFont><a:latin typeface="Inter, Segoe UI, system-ui"/></a:majorFont>
      <a:minorFont><a:latin typeface="Inter, Segoe UI, system-ui"/></a:minorFont>
    </a:fontScheme>
  </a:themeElements>
</a:theme>`),

    'ppt/slideMasters/slideMaster1.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`),

    'ppt/slideMasters/_rels/slideMaster1.xml.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`),

    'ppt/slideLayouts/slideLayout1.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="title">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sldLayout>`),

    'ppt/slideLayouts/_rels/slideLayout1.xml.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`),

    // Slide 1: Title & Hero Card
    'ppt/slides/slide1.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="F8FAFC"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>

      <!-- Decorative Title Card Container -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title Box"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="731520" y="1028700"/><a:ext cx="7680960" cy="3086100"/></a:xfrm>
          <a:prstGeom prst="roundRect"/>
          <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln>
          <a:effectLst>
            <a:outerShdw blurRad="100000" dist="40000" dir="5400000"><a:srgbClr val="0F172A"/></a:outerShdw>
          </a:effectLst>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="ctr"/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr sz="3600" b="1"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>OmniView Universal Presentation Engine</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr sz="1800" i="1"><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:rPr>
              <a:t>Next-Generation In-Browser Slide Studio</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr sz="1400"><a:solidFill><a:srgbClr val="64748B"/></a:solidFill></a:rPr>
              <a:t>Developed by Suhail Akhtar (https://suhail.top)</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`),

    'ppt/slides/_rels/slide1.xml.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide1.xml"/>
</Relationships>`),

    'ppt/notesSlides/notesSlide1.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp><p:txBody><a:p><a:t>Welcome to the opening slide of OmniView. Explain zero-latency client-side processing to attendees.</a:t></a:p></p:txBody></p:sp>
    </p:spTree>
  </p:cSld>
</p:notes>`),

    // Slide 2: Core Features & Architecture (3 Columns)
    'ppt/slides/slide2.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>

      <!-- Slide Title -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="731520" y="411480"/><a:ext cx="7680960" cy="720000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="2800" b="1"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Architecture & Universal Format Support</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Column Card 1 -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Card 1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="731520" y="1337310"/><a:ext cx="2377440" cy="3291840"/></a:xfrm>
          <a:prstGeom prst="roundRect"/>
          <a:solidFill><a:srgbClr val="F1F5F9"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="t"/>
          <a:p>
            <a:r><a:rPr sz="1800" b="1"><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:rPr><a:t>1. Universal Parser</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• PPTX / PPSX / POTX XML</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Legacy PPT 97-2003 OLE2</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• OpenDocument ODP</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Keynote Archives</a:t></a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Column Card 2 -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="Card 2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="3383280" y="1337310"/><a:ext cx="2377440" cy="3291840"/></a:xfrm>
          <a:prstGeom prst="roundRect"/>
          <a:solidFill><a:srgbClr val="F1F5F9"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="t"/>
          <a:p>
            <a:r><a:rPr sz="1800" b="1"><a:solidFill><a:srgbClr val="059669"/></a:solidFill></a:rPr><a:t>2. Interactive Studio</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Slide Navigator Sidebar</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Grid Sorter View</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Fullscreen Presenter (F)</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Speaker Notes Drawer (N)</a:t></a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Column Card 3 -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="Card 3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="6035040" y="1337310"/><a:ext cx="2377440" cy="3291840"/></a:xfrm>
          <a:prstGeom prst="roundRect"/>
          <a:solidFill><a:srgbClr val="F1F5F9"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="t"/>
          <a:p>
            <a:r><a:rPr sz="1800" b="1"><a:solidFill><a:srgbClr val="D97706"/></a:solidFill></a:rPr><a:t>3. Privacy & Speed</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• 100% In-Memory Parsing</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Zero Cloud Uploads</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• One-click Markdown Export</a:t></a:r>
          </a:p>
          <a:p>
            <a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="334155"/></a:solidFill></a:rPr><a:t>• Full Offline PWA Ready</a:t></a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`),

    'ppt/slides/_rels/slide2.xml.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`),

    // Slide 3: Financial Metrics Table
    'ppt/slides/slide3.xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>

      <!-- Slide Title -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="731520" y="411480"/><a:ext cx="7680960" cy="720000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="2800" b="1"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Quarterly Strategy Metrics & Growth</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Table Graphic Frame -->
      <p:graphicFrame>
        <p:nvGraphicFramePr><p:cNvPr id="3" name="Table 1"/><p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr>
        <p:xfrm><a:off x="731520" y="1337310"/><a:ext cx="7680960" cy="3086100"/></a:xfrm>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">
            <a:tbl>
              <a:tblPr/>
              <a:tblGrid>
                <a:gridCol w="1920240"/>
                <a:gridCol w="1920240"/>
                <a:gridCol w="1920240"/>
                <a:gridCol w="1920240"/>
              </a:tblGrid>
              <!-- Row 1: Header -->
              <a:tr h="600000">
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1500" b="1"/><a:t>Metric</a:t></a:r></a:p></a:txBody><a:tcPr><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:tcPr></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1500" b="1"/><a:t>Q1 Target</a:t></a:r></a:p></a:txBody><a:tcPr><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:tcPr></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1500" b="1"/><a:t>Q1 Actual</a:t></a:r></a:p></a:txBody><a:tcPr><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:tcPr></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1500" b="1"/><a:t>Growth YoY</a:t></a:r></a:p></a:txBody><a:tcPr><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:tcPr></a:tc>
              </a:tr>
              <!-- Row 2 -->
              <a:tr h="500000">
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>Active Users</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>250,000</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>312,400</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300" b="1"/><a:t>+24.9%</a:t></a:r></a:p></a:txBody></a:tc>
              </a:tr>
              <!-- Row 3 -->
              <a:tr h="500000">
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>Files Processed</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>1,000,000</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>1,450,200</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300" b="1"/><a:t>+45.0%</a:t></a:r></a:p></a:txBody></a:tc>
              </a:tr>
              <!-- Row 4 -->
              <a:tr h="500000">
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>Privacy Score</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>100%</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300"/><a:t>100%</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:bodyPr/><a:p><a:r><a:rPr sz="1300" b="1"/><a:t>Zero Leaks</a:t></a:r></a:p></a:txBody></a:tc>
              </a:tr>
            </a:tbl>
          </a:graphicData>
        </a:graphic>
      </p:graphicFrame>
    </p:spTree>
  </p:cSld>
</p:sld>`),

    'ppt/slides/_rels/slide3.xml.rels': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`)
  };

  const zipped = fflate.zipSync(files);
  return zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength) as ArrayBuffer;
}

/**
 * Generates a sample multi-format ZIP archive with documents, code, images, and data
 */
export async function generateSampleZipBuffer(): Promise<ArrayBuffer> {
  return generateSampleZipBufferSync();
}

function writeOctal(bytes: Uint8Array, offset: number, length: number, value: number) {
  const str = value.toString(8).padStart(length - 1, '0');
  for (let i = 0; i < length - 1; i++) {
    bytes[offset + i] = str.charCodeAt(i);
  }
  bytes[offset + length - 1] = 0; // null terminator
}
