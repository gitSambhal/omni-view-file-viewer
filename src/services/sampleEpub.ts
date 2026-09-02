/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import JSZip from 'jszip';

/**
 * Generates an in-memory sample EPUB ArrayBuffer for testing & demo purposes
 */
export async function generateSampleEpubBuffer(): Promise<ArrayBuffer> {
  const zip = new JSZip();

  // 1. mimetype (must be uncompressed according to EPUB spec)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // 3. OEBPS/styles.css
  zip.file(
    'OEBPS/styles.css',
    `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
  line-height: 1.7;
  color: #1e293b;
  margin: 0;
  padding: 1.5rem;
}
h1 { font-size: 2rem; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
h2 { font-size: 1.4rem; color: #334155; margin-top: 1.25rem; margin-bottom: 0.5rem; }
p { margin-bottom: 1.2rem; font-size: 1.05rem; }
blockquote { border-left: 4px solid #3b82f6; margin: 1.5rem 0; padding: 0.75rem 1.25rem; background: #f8fafc; font-style: italic; color: #475569; border-radius: 0 0.5rem 0.5rem 0; }
.badge { display: inline-block; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; }
.callout { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1.25rem; margin: 1.5rem 0; color: #166534; }
.callout-title { font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
pre { background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: ui-monospace, monospace; font-size: 0.9rem; }
code { background: #e2e8f0; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-family: ui-monospace, monospace; font-size: 0.9em; }
`
  );

  // 4. OEBPS/cover.xhtml
  zip.file(
    'OEBPS/cover.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>The Art of Offline Computing</title>
  <link rel="stylesheet" href="styles.css" type="text/css"/>
</head>
<body style="text-align: center; padding: 3rem 1.5rem;">
  <div class="badge">📖 Official E-Book Edition</div>
  <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; border-bottom: none;">The Art of Offline Computing</h1>
  <p style="font-size: 1.25rem; color: #64748b; margin-bottom: 2rem;">A Pragmatic Guide to Local-First Web Architectures</p>
  
  <div style="max-width: 450px; margin: 0 auto; padding: 2rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <p style="font-size: 0.95rem; color: #475569; line-height: 1.6;">
      By <strong>Suhail Akhtar</strong><br/>
      Published by <em>Local-First Press</em><br/>
      Release Version: 1.5.0 • 2026 Edition
    </p>
  </div>

  <p style="margin-top: 2rem; font-size: 0.85rem; color: #94a3b8;">
    © 2026 Suhail Akhtar (https://suhail.top). All rights reserved.
  </p>
</body>
</html>`
  );

  // 5. OEBPS/chapter1.xhtml
  zip.file(
    'OEBPS/chapter1.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Chapter 1: The Local-First Revolution</title>
  <link rel="stylesheet" href="styles.css" type="text/css"/>
</head>
<body>
  <div class="badge">Chapter 1</div>
  <h1>The Local-First Revolution</h1>

  <p>For two decades, the modern software industry pushed every byte of human data into centralized remote cloud servers. While cloud computing unlocked unprecedented collaboration, it simultaneously introduced massive vulnerabilities: network latency, server outages, privacy breaches, vendor lock-in, and unpredictable subscription fees.</p>

  <blockquote>
    "Software should belong to the user who creates it. Your computer is more powerful than ever; it shouldn't need permission from a remote server to open a document."
  </blockquote>

  <h2>The 7 Core Principles of Local Software</h2>
  <p>Local-first computing flips the traditional client-server paradigm by treating the user's browser device as the primary source of truth:</p>

  <div class="callout">
    <div class="callout-title">⚡ The Golden Rule of In-Memory Execution</div>
    <p>Zero network packets should leave the device when inspecting, rendering, or manipulating user files. Everything runs directly in the client sandbox with instantaneous speed.</p>
  </div>

  <ul>
    <li><strong>Zero Latency:</strong> File operations happen at CPU and RAM speeds without spinning server loading indicators.</li>
    <li><strong>Offline Resiliency:</strong> The application works flawlessly in airplanes, remote areas, and disaster zones.</li>
    <li><strong>Uncompromising Privacy:</strong> User confidential documents, certificates, and databases never touch third-party servers.</li>
  </ul>
</body>
</html>`
  );

  // 6. OEBPS/chapter2.xhtml
  zip.file(
    'OEBPS/chapter2.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Chapter 2: Universal Binary & Format Parsing</title>
  <link rel="stylesheet" href="styles.css" type="text/css"/>
</head>
<body>
  <div class="badge">Chapter 2</div>
  <h1>Universal Binary & Format Parsing</h1>

  <p>Modern browser engines equipped with WebAssembly, TypedArrays, and Web Workers are capable of parsing complex binary and container formats that historically required heavy desktop binaries.</p>

  <h2>How Browser File Inspection Works</h2>
  <p>When a user drops an executable (<code>.exe</code>, <code>.dll</code>), spreadsheet (<code>.xlsx</code>), database (<code>.sqlite</code>), or e-book (<code>.epub</code>) into the browser, the file is read as an <code>ArrayBuffer</code> in memory:</p>

  <pre><code>// Pure client-side streaming binary inspector
const buffer = await file.arrayBuffer();
const dataView = new DataView(buffer);

// Check MZ header for PE / DLL files
const magic = dataView.getUint16(0, false);
if (magic === 0x4D5A) {
  console.log("PE Executable Binary detected locally!");
}</code></pre>

  <h2>Container Decompression via JSZip</h2>
  <p>An EPUB document is fundamentally a structured zip package conforming to the IDPF Open Publication Structure (OPS). By inspecting the internal <code>META-INF/container.xml</code>, we resolve the <code>content.opf</code> manifest and stream each chapter smoothly.</p>
</body>
</html>`
  );

  // 7. OEBPS/chapter3.xhtml
  zip.file(
    'OEBPS/chapter3.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Chapter 3: Live Disk Sync & Telemetry</title>
  <link rel="stylesheet" href="styles.css" type="text/css"/>
</head>
<body>
  <div class="badge">Chapter 3</div>
  <h1>Live Disk Sync & Telemetry</h1>

  <p>With the standard <strong>File System Access API</strong>, web applications can establish persistent local file handles that monitor file modification timestamps on disk in real time.</p>

  <blockquote>
    "Live synchronization bridges the speed of local desktop editors with the reactive rendering of modern web interfaces."
  </blockquote>

  <h2>Building the Reactive Watcher Loop</h2>
  <p>When an active tab is registered with a file handle, a background interval checks <code>file.lastModified</code>. If an external compiler or text editor modifies the file, OmniView automatically pulls the fresh bytes and refreshes the view without losing state.</p>

  <div class="callout">
    <div class="callout-title">🔒 Privacy Verification</div>
    <p>All telemetry metrics display 0 bytes uploaded to remote servers. The live sync operates strictly between the local disk and local browser memory.</p>
  </div>
</body>
</html>`
  );

  // 8. OEBPS/chapter4.xhtml
  zip.file(
    'OEBPS/chapter4.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Chapter 4: The Future of Developer Tools</title>
  <link rel="stylesheet" href="styles.css" type="text/css"/>
</head>
<body>
  <div class="badge">Chapter 4</div>
  <h1>The Future of Developer Tools</h1>

  <p>As we enter a new generation of software development, developers demand tools that respect their time, attention, and data ownership. Fast, multi-format previewers like OmniView demonstrate that you no longer need 50 different standalone desktop apps to inspect logs, run SQL queries, preview HTML sandboxes, and read documentation.</p>

  <h2>Author's Note</h2>
  <p>Thank you for exploring this interactive e-book in the OmniView E-Book Reader Studio. You can adjust the font family, font size, color themes, and even listen with the text-to-speech audio reader.</p>

  <p>Crafted with dedication by <strong><a href="https://suhail.top" target="_blank">Suhail Akhtar</a></strong>.</p>
</body>
</html>`
  );

  // 9. OEBPS/toc.ncx (EPUB 2 TOC)
  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:omniview-offline-computing-2026"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>The Art of Offline Computing</text>
  </docTitle>
  <docAuthor>
    <text>Suhail Akhtar</text>
  </docAuthor>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>Cover &amp; Title</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-2" playOrder="2">
      <navLabel><text>Chapter 1: The Local-First Revolution</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-3" playOrder="3">
      <navLabel><text>Chapter 2: Universal Binary &amp; Format Parsing</text></navLabel>
      <content src="chapter2.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-4" playOrder="4">
      <navLabel><text>Chapter 3: Live Disk Sync &amp; Telemetry</text></navLabel>
      <content src="chapter3.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-5" playOrder="5">
      <navLabel><text>Chapter 4: The Future of Developer Tools</text></navLabel>
      <content src="chapter4.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`
  );

  // 10. OEBPS/content.opf
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>The Art of Offline Computing</dc:title>
    <dc:creator>Suhail Akhtar</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="pub-id">urn:uuid:omniview-offline-computing-2026</dc:identifier>
    <dc:publisher>Local-First Press</dc:publisher>
    <dc:date>2026-09-01</dc:date>
    <dc:description>A pragmatic guide to building resilient, 100% offline client-side web applications with zero cloud dependencies.</dc:description>
    <dc:rights>© 2026 Suhail Akhtar (https://suhail.top)</dc:rights>
  </metadata>
  <manifest>
    <item id="style" href="styles.css" media-type="text/css"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch3" href="chapter3.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch4" href="chapter4.xhtml" media-type="application/xhtml+xml"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover"/>
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
    <itemref idref="ch3"/>
    <itemref idref="ch4"/>
  </spine>
</package>`
  );

  return await zip.generateAsync({ type: 'arraybuffer' });
}
