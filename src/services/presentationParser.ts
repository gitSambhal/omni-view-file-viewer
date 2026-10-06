/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Universal Presentation Parser (.pptx, .ppt, .odp, .pps, .ppsx, .key)
 */

import JSZip from 'jszip';

export interface PresentationSlide {
  id: number;
  slideNumber: number;
  title: string;
  subtitle?: string;
  texts: string[];
  bullets: string[];
  notes?: string;
  layout?: string;
  accentColor?: string;
}

export interface ParsedPresentation {
  title: string;
  format: 'pptx' | 'ppt' | 'odp' | 'key' | 'presentation';
  formatLabel: string;
  slideCount: number;
  slides: PresentationSlide[];
  metadata?: {
    appName?: string;
    author?: string;
    created?: string;
    modified?: string;
    comments?: string;
  };
}

const ACCENT_COLORS = [
  'from-amber-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-rose-500 to-red-500',
  'from-cyan-500 to-blue-600',
];

/**
 * Parses any presentation file into structured slide objects.
 */
export async function parsePresentation(
  arrayBuffer: ArrayBuffer,
  filename: string
): Promise<ParsedPresentation> {
  const bytes = new Uint8Array(arrayBuffer);
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Check for ZIP container (PPTX, ODP, PPSX, KEY)
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

  if (isZip) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      // A. Modern PowerPoint (.pptx, .ppsx, .potx)
      const pptSlideFiles: { name: string; file: JSZip.JSZipObject }[] = [];
      zip.folder('ppt/slides')?.forEach((relativePath, file) => {
        if (relativePath.startsWith('slide') && relativePath.endsWith('.xml')) {
          pptSlideFiles.push({ name: relativePath, file });
        }
      });

      if (pptSlideFiles.length > 0) {
        return await parsePptxZip(zip, pptSlideFiles, filename);
      }

      // B. OpenDocument Presentation (.odp)
      const contentXmlFile = zip.file('content.xml');
      if (contentXmlFile) {
        return await parseOdpZip(zip, contentXmlFile, filename);
      }

      // C. Apple Keynote or generic ZIP presentation
      return parseGenericZipPresentation(zip, filename);
    } catch (err) {
      console.warn('Zip presentation parsing failed, attempting binary/text fallback:', err);
    }
  }

  // 2. Legacy PowerPoint Binary 97-2003 (.ppt, .pps, .pot - OLE2 Compound File)
  return parseLegacyPptBinary(bytes, filename, ext);
}

/**
 * Parses modern PPTX zip archive
 */
async function parsePptxZip(
  zip: JSZip,
  slideFiles: { name: string; file: JSZip.JSZipObject }[],
  filename: string
): Promise<ParsedPresentation> {
  // Sort slides numerically slide1.xml, slide2.xml ... slide10.xml
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.name.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.name.replace(/[^0-9]/g, ''), 10) || 0;
    return numA - numB;
  });

  // Extract core metadata if available
  let appName = 'Microsoft PowerPoint';
  let author = '';
  try {
    const coreXml = await zip.file('docProps/core.xml')?.async('text');
    if (coreXml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(coreXml, 'text/xml');
      author = doc.getElementsByTagName('dc:creator')[0]?.textContent || '';
    }
  } catch {
    // Ignore metadata parse error
  }

  const slides: PresentationSlide[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const slideNum = i + 1;
    const xmlText = await slideFiles[i].file.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Extract text from paragraphs and text runs
    const paragraphs = xmlDoc.getElementsByTagName('a:p');
    const slideTexts: string[] = [];

    for (let p = 0; p < paragraphs.length; p++) {
      const pElem = paragraphs[p];
      const textNodes = pElem.getElementsByTagName('a:t');
      const lineParts: string[] = [];
      for (let t = 0; t < textNodes.length; t++) {
        const val = textNodes[t].textContent?.trim();
        if (val) lineParts.push(val);
      }
      const fullLine = lineParts.join(' ').trim();
      if (fullLine) {
        slideTexts.push(fullLine);
      }
    }

    // Fallback to all a:t nodes if paragraphs were empty
    if (slideTexts.length === 0) {
      const rawTextNodes = xmlDoc.getElementsByTagName('a:t');
      for (let j = 0; j < rawTextNodes.length; j++) {
        const val = rawTextNodes[j].textContent?.trim();
        if (val) slideTexts.push(val);
      }
    }

    // Extract slide notes if available
    let notes = '';
    try {
      const notesFile = zip.file(`ppt/notesSlides/notesSlide${slideNum}.xml`);
      if (notesFile) {
        const notesXml = await notesFile.async('text');
        const notesDoc = parser.parseFromString(notesXml, 'text/xml');
        const notesNodes = notesDoc.getElementsByTagName('a:t');
        const notesParts: string[] = [];
        for (let n = 0; n < notesNodes.length; n++) {
          const val = notesNodes[n].textContent?.trim();
          if (val && !notesParts.includes(val)) notesParts.push(val);
        }
        notes = notesParts.join('\n');
      }
    } catch {
      // Ignore notes error
    }

    const title = slideTexts[0] || `Slide ${slideNum}`;
    const bullets = slideTexts.length > 1 ? slideTexts.slice(1) : [];

    slides.push({
      id: slideNum,
      slideNumber: slideNum,
      title,
      texts: slideTexts.length > 0 ? slideTexts : ['[Empty slide]'],
      bullets,
      notes: notes || undefined,
      accentColor: ACCENT_COLORS[(slideNum - 1) % ACCENT_COLORS.length]
    });
  }

  if (slides.length === 0) {
    slides.push({
      id: 1,
      slideNumber: 1,
      title: filename.replace(/\.[^/.]+$/, ''),
      texts: ['Presentation loaded successfully.'],
      bullets: ['Use the toolbar to navigate slide contents.'],
      accentColor: ACCENT_COLORS[0]
    });
  }

  return {
    title: slides[0]?.title || filename,
    format: 'pptx',
    formatLabel: 'Microsoft PowerPoint Presentation (.pptx)',
    slideCount: slides.length,
    slides,
    metadata: { appName, author }
  };
}

/**
 * Parses OpenDocument Presentation (.odp)
 */
async function parseOdpZip(
  zip: JSZip,
  contentXmlFile: JSZip.JSZipObject,
  filename: string
): Promise<ParsedPresentation> {
  const xmlText = await contentXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // OpenDocument presentations store slides as draw:page elements
  const pageNodes = Array.from(xmlDoc.getElementsByTagName('draw:page'));
  const slides: PresentationSlide[] = [];

  pageNodes.forEach((page, idx) => {
    const slideNum = idx + 1;
    const pageName = page.getAttribute('draw:name') || '';

    // Extract all text paragraphs
    const pNodes = Array.from(page.getElementsByTagName('text:p'));
    const hNodes = Array.from(page.getElementsByTagName('text:h'));
    const allTextNodes = [...hNodes, ...pNodes];

    const slideTexts: string[] = [];
    allTextNodes.forEach(node => {
      const val = node.textContent?.trim();
      if (val && !slideTexts.includes(val)) {
        slideTexts.push(val);
      }
    });

    const title = slideTexts[0] || pageName || `Slide ${slideNum}`;
    const bullets = slideTexts.length > 1 ? slideTexts.slice(1) : [];

    slides.push({
      id: slideNum,
      slideNumber: slideNum,
      title,
      texts: slideTexts.length > 0 ? slideTexts : ['[Empty slide]'],
      bullets,
      accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length]
    });
  });

  if (slides.length === 0) {
    slides.push({
      id: 1,
      slideNumber: 1,
      title: filename.replace(/\.[^/.]+$/, ''),
      texts: ['OpenDocument Presentation loaded.'],
      bullets: [],
      accentColor: ACCENT_COLORS[0]
    });
  }

  return {
    title: slides[0]?.title || filename,
    format: 'odp',
    formatLabel: 'OpenDocument Presentation (.odp)',
    slideCount: slides.length,
    slides,
    metadata: { appName: 'LibreOffice / OpenOffice Impress' }
  };
}

/**
 * Generic fallback for Apple Keynote or unknown ZIP presentation
 */
async function parseGenericZipPresentation(
  zip: JSZip,
  filename: string
): Promise<ParsedPresentation> {
  const fileNames = Object.keys(zip.files);
  const slides: PresentationSlide[] = [
    {
      id: 1,
      slideNumber: 1,
      title: filename.replace(/\.[^/.]+$/, ''),
      texts: [
        'Presentation package archive loaded.',
        `Contains ${fileNames.length} internal components and resources.`
      ],
      bullets: fileNames.slice(0, 8).map(f => `Resource: ${f}`),
      accentColor: ACCENT_COLORS[0]
    }
  ];

  return {
    title: filename,
    format: 'key',
    formatLabel: 'Presentation Package (.key / .zip)',
    slideCount: 1,
    slides
  };
}

/**
 * Parses Legacy PowerPoint 97-2003 Binary (.ppt, .pps) OLE2 compound files.
 * Extracts text records, slides, titles, bullet paragraphs, and presentation streams.
 */
function parseLegacyPptBinary(
  bytes: Uint8Array,
  filename: string,
  ext: string
): ParsedPresentation {
  const slides: PresentationSlide[] = [];
  const textStrings: string[] = [];

  // 1. Scan for UTF-16LE and ASCII text records in the binary stream
  // PowerPoint record IDs:
  // 0x0FA8 = rtTextCharsAtom (UTF-16LE text)
  // 0x0FA6 = rtTextBytesAtom (ASCII text)
  // 0x0FBA = rtCString (UTF-16LE string)
  // 0x03EE = rtSlide (SlideContainer)
  // 0x03F9 = rtSlideListWithText

  let i = 0;
  const len = bytes.length;
  const slideTextGroups: string[][] = [];
  let currentGroup: string[] = [];

  // Heuristic scanner for PowerPoint Document records
  while (i < len - 8) {
    // Record header: 2 bytes ver/inst, 2 bytes recType (LE), 4 bytes recLen (LE)
    const recType = bytes[i + 2] | (bytes[i + 3] << 8);
    const recLen =
      bytes[i + 4] |
      (bytes[i + 5] << 8) |
      (bytes[i + 6] << 16) |
      (bytes[i + 7] << 24);

    // Slide boundary markers
    if (recType === 0x03ee || recType === 0x03ef || recType === 0x03f9) {
      if (currentGroup.length > 0) {
        slideTextGroups.push([...currentGroup]);
        currentGroup = [];
      }
    }

    // rtTextCharsAtom (UTF-16LE)
    if (recType === 0x0fa8 && recLen > 0 && recLen < 50000 && i + 8 + recLen <= len) {
      const textBuf = bytes.subarray(i + 8, i + 8 + recLen);
      const str = decodeUtf16Le(textBuf);
      if (str && str.length > 1) {
        cleanAndPushText(str, currentGroup, textStrings);
      }
      i += 8 + recLen;
      continue;
    }

    // rtTextBytesAtom (ASCII / Latin1)
    if (recType === 0x0fa6 && recLen > 0 && recLen < 50000 && i + 8 + recLen <= len) {
      const textBuf = bytes.subarray(i + 8, i + 8 + recLen);
      const str = decodeAscii(textBuf);
      if (str && str.length > 1) {
        cleanAndPushText(str, currentGroup, textStrings);
      }
      i += 8 + recLen;
      continue;
    }

    // rtCString (UTF-16LE)
    if (recType === 0x0fba && recLen > 0 && recLen < 50000 && i + 8 + recLen <= len) {
      const textBuf = bytes.subarray(i + 8, i + 8 + recLen);
      const str = decodeUtf16Le(textBuf);
      if (str && str.length > 1) {
        cleanAndPushText(str, currentGroup, textStrings);
      }
      i += 8 + recLen;
      continue;
    }

    i++;
  }

  if (currentGroup.length > 0) {
    slideTextGroups.push(currentGroup);
  }

  // If structured records were found:
  if (slideTextGroups.length > 0) {
    slideTextGroups.forEach((grp, idx) => {
      const slideNum = idx + 1;
      const title = grp[0] || `Slide ${slideNum}`;
      const bullets = grp.length > 1 ? grp.slice(1) : [];
      slides.push({
        id: slideNum,
        slideNumber: slideNum,
        title,
        texts: grp,
        bullets,
        accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length]
      });
    });
  } else if (textStrings.length > 0) {
    // If text strings were found, cluster them into logical slides of 4-6 items
    const chunkSize = 5;
    for (let c = 0; c < textStrings.length; c += chunkSize) {
      const chunk = textStrings.slice(c, c + chunkSize);
      const slideNum = Math.floor(c / chunkSize) + 1;
      const title = chunk[0] || `Slide ${slideNum}`;
      slides.push({
        id: slideNum,
        slideNumber: slideNum,
        title,
        texts: chunk,
        bullets: chunk.slice(1),
        accentColor: ACCENT_COLORS[(slideNum - 1) % ACCENT_COLORS.length]
      });
    }
  }

  // Universal Fallback if no text atoms matched (e.g. encrypted or graphics-only legacy PPT)
  if (slides.length === 0) {
    const rawStrings = extractPrintableStrings(bytes);
    if (rawStrings.length > 0) {
      const chunkSize = 6;
      for (let c = 0; c < Math.min(rawStrings.length, 60); c += chunkSize) {
        const chunk = rawStrings.slice(c, c + chunkSize);
        const slideNum = Math.floor(c / chunkSize) + 1;
        slides.push({
          id: slideNum,
          slideNumber: slideNum,
          title: chunk[0] || `Slide ${slideNum}`,
          texts: chunk,
          bullets: chunk.slice(1),
          accentColor: ACCENT_COLORS[(slideNum - 1) % ACCENT_COLORS.length]
        });
      }
    }
  }

  if (slides.length === 0) {
    slides.push({
      id: 1,
      slideNumber: 1,
      title: filename.replace(/\.[^/.]+$/, ''),
      texts: [
        'PowerPoint 97-2003 Binary Presentation (.ppt)',
        'Binary container structure loaded. Presentation records indexed.'
      ],
      bullets: [
        `File size: ${Math.round(bytes.length / 1024)} KB`,
        'Format: Microsoft PowerPoint 97-2003 Compound File',
        'Offline client-side reader active'
      ],
      accentColor: ACCENT_COLORS[0]
    });
  }

  return {
    title: slides[0]?.title || filename,
    format: 'ppt',
    formatLabel: 'Microsoft PowerPoint 97-2003 Presentation (.ppt)',
    slideCount: slides.length,
    slides,
    metadata: { appName: 'Microsoft PowerPoint 97-2003' }
  };
}

function decodeUtf16Le(buf: Uint8Array): string {
  try {
    const decoder = new TextDecoder('utf-16le', { fatal: false });
    return decoder.decode(buf).replace(/\0/g, '').trim();
  } catch {
    return '';
  }
}

function decodeAscii(buf: Uint8Array): string {
  try {
    const decoder = new TextDecoder('windows-1252', { fatal: false });
    return decoder.decode(buf).replace(/\0/g, '').trim();
  } catch {
    return '';
  }
}

function cleanAndPushText(str: string, currentGroup: string[], textStrings: string[]) {
  const lines = str.split(/\r?\n|\v|\f/).map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    if (line.length >= 2 && !isSystemJunk(line)) {
      if (!currentGroup.includes(line)) {
        currentGroup.push(line);
      }
      if (!textStrings.includes(line)) {
        textStrings.push(line);
      }
    }
  }
}

function isSystemJunk(str: string): boolean {
  if (/^[\x00-\x1f]+$/.test(str)) return true;
  if (/^(Arial|Calibri|Times New Roman|Helvetica|Tahoma|Segoe UI|Courier New)$/i.test(str)) return true;
  if (/^(Default Design|Title Master|Slide Master|PowerPoint Document|Current User)$/i.test(str)) return true;
  return false;
}

function extractPrintableStrings(bytes: Uint8Array): string[] {
  const result: string[] = [];
  let cur = '';
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if (c >= 32 && c <= 126) {
      cur += String.fromCharCode(c);
    } else {
      if (cur.length >= 4 && !isSystemJunk(cur)) {
        if (!result.includes(cur)) result.push(cur);
      }
      cur = '';
    }
  }
  if (cur.length >= 4 && !isSystemJunk(cur)) {
    result.push(cur);
  }
  return result;
}
