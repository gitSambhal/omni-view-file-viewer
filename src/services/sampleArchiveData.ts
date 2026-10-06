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
  // Let's create a 128KB disk (256 sectors of 512 bytes) + 512-byte VHD footer = 131,584 bytes
  const NUM_SECTORS = 256;
  const SECTOR_SIZE = 512;
  const DISK_SIZE = NUM_SECTORS * SECTOR_SIZE;
  const TOTAL_SIZE = DISK_SIZE + 512; // Data + 512-byte footer

  const buffer = new ArrayBuffer(TOTAL_SIZE);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // 1. Write MBR at Sector 0 (LBA 0)
  // Partition 1 at LBA 1, 250 sectors long, Type 0x06 (FAT16)
  const PARTITION_START_LBA = 1;
  const PARTITION_SECTORS = 250;

  // Boot signature at offset 510
  bytes[510] = 0x55;
  bytes[511] = 0xaa;

  // Partition entry 1 at offset 446 (0x1BE)
  bytes[446] = 0x80; // Bootable / Active
  bytes[446 + 1] = 0x01; // Starting Head
  bytes[446 + 2] = 0x01; // Starting Sector
  bytes[446 + 3] = 0x00; // Starting Cylinder
  bytes[446 + 4] = 0x06; // Type: FAT16
  bytes[446 + 5] = 0x0f; // Ending Head
  bytes[446 + 6] = 0x10; // Ending Sector
  bytes[446 + 7] = 0x00; // Ending Cylinder
  view.setUint32(446 + 8, PARTITION_START_LBA, true); // Starting LBA = 1
  view.setUint32(446 + 12, PARTITION_SECTORS, true); // Total Sectors = 250

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
  view.setUint16(bootOffset + 19, PARTITION_SECTORS, true); // Total sectors: 250
  bytes[bootOffset + 21] = 0xf8; // Media descriptor: Hard Disk
  view.setUint16(bootOffset + 22, 2, true); // Sectors per FAT: 2
  view.setUint16(bootOffset + 24, 16, true); // Sectors per track: 16
  view.setUint16(bootOffset + 26, 4, true); // Number of heads: 4
  view.setUint32(bootOffset + 28, PARTITION_START_LBA, true); // Hidden sectors: 1
  // Boot signature for partition boot sector
  bytes[bootOffset + 510] = 0x55;
  bytes[bootOffset + 511] = 0xaa;

  // FAT Tables:
  // Reserved = 1 sector (LBA 1), so FAT 1 is at LBA 2 (offset 1024), FAT 2 at LBA 4 (offset 2048)
  const fat1Offset = (PARTITION_START_LBA + 1) * SECTOR_SIZE;
  const fat2Offset = (PARTITION_START_LBA + 1 + 2) * SECTOR_SIZE;

  // FAT16 initial entries (Media 0xFFF8, End-of-chain 0xFFFF)
  view.setUint16(fat1Offset, 0xfff8, true);
  view.setUint16(fat1Offset + 2, 0xffff, true);
  view.setUint16(fat2Offset, 0xfff8, true);
  view.setUint16(fat2Offset + 2, 0xffff, true);

  // Root Directory:
  // Starts after FATs: LBA 1 + 1 (reserved) + 2*2 (FATs) = LBA 6 (offset 3072)
  // Root dir entries = 64 * 32 bytes = 2048 bytes (4 sectors, LBA 6..9)
  const rootDirOffset = (PARTITION_START_LBA + 1 + 4) * SECTOR_SIZE;
  // Data clusters start after Root Directory = LBA 10 (offset 5120)
  const dataStartOffset = rootDirOffset + 64 * 32;

  // Sample files to place into the FAT16 volume:
  const files = [
    {
      name: 'README  ',
      ext: 'TXT',
      cluster: 2,
      content: `OmniView Virtual Hard Disk (VHD) Mount Test
============================================
Developer: Suhail Akhtar (https://suhail.top)

This virtual disk image has been parsed and mounted 100% locally in client memory.
Format: Microsoft VHD Fixed Hard Disk Image
Partition: FAT16 Master Volume
No external extraction or virtualization software required!
`
    },
    {
      name: 'CONFIG  ',
      ext: 'SYS',
      cluster: 3,
      content: `[OmniView_VHD_Config]
DEVICE=VHD_DRIVER.SYS /PORT:3000
BUFFERS=32,0
FILES=128
LASTDRIVE=Z
SECURITY=STRICT_LOCAL_IN_MEMORY
AUTHOR=Suhail Akhtar (https://suhail.top)
`
    },
    {
      name: 'METRICS ',
      ext: 'CSV',
      cluster: 4,
      content: `Timestamp,Sector_Read,Cluster_Alloc,Disk_IOPS,Status
2026-10-06T00:00:00Z,512,Cluster_2,12500,ACTIVE
2026-10-06T00:01:00Z,1024,Cluster_3,14200,ACTIVE
2026-10-06T00:02:00Z,2048,Cluster_4,16800,HEALTHY
`
    },
    {
      name: 'SCRIPT  ',
      ext: 'PY ',
      cluster: 5,
      content: `# Python script running inside VHD
def inspect_vhd():
    print("VHD Virtual Drive successfully inspected by OmniView!")
    return {"status": "ok", "developer": "Suhail Akhtar"}

if __name__ == "__main__":
    inspect_vhd()
`
    }
  ];

  // Write files to FAT directory and data clusters
  let dirIdx = 0;
  for (const f of files) {
    const entryOffset = rootDirOffset + dirIdx * 32;
    // Filename (8 bytes) + Extension (3 bytes)
    for (let i = 0; i < 8; i++) bytes[entryOffset + i] = f.name.charCodeAt(i) || 0x20;
    for (let i = 0; i < 3; i++) bytes[entryOffset + 8 + i] = f.ext.charCodeAt(i) || 0x20;
    bytes[entryOffset + 11] = 0x20; // Archive attribute

    // Starting cluster (offset 26, uint16)
    view.setUint16(entryOffset + 26, f.cluster, true);

    const contentBytes = new TextEncoder().encode(f.content);
    view.setUint32(entryOffset + 28, contentBytes.length, true); // File size

    // Mark cluster in FAT table as end of chain (0xFFFF)
    view.setUint16(fat1Offset + f.cluster * 2, 0xffff, true);
    view.setUint16(fat2Offset + f.cluster * 2, 0xffff, true);

    // Write content to data cluster (Cluster N is at dataStartOffset + (N - 2) * 1024)
    const clusterOffset = dataStartOffset + (f.cluster - 2) * (2 * SECTOR_SIZE);
    bytes.set(contentBytes, clusterOffset);

    dirIdx++;
  }

  // 3. Write 512-byte VHD Footer at DISK_SIZE (offset 131,072)
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

  // Original & Current Size: 131,072 bytes (128 KB)
  view.setBigUint64(footerOffset + 40, BigInt(DISK_SIZE), false);
  view.setBigUint64(footerOffset + 48, BigInt(DISK_SIZE), false);

  // Disk Geometry: 4 cylinders, 4 heads, 16 sectors per track (4 * 4 * 16 = 256 sectors)
  view.setUint16(footerOffset + 56, 4, false); // Cylinders: 4
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
