/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import JSZip from 'jszip';

export interface EpubMetadata {
  title: string;
  creator: string;
  description?: string;
  publisher?: string;
  language?: string;
  date?: string;
  rights?: string;
  coverUrl?: string;
  totalWords: number;
  readingTimeMin: number;
}

export interface EpubTocItem {
  id: string;
  title: string;
  href: string;
  chapterIndex: number;
}

export interface EpubChapter {
  id: string;
  title: string;
  href: string;
  contentHtml: string;
  rawText: string;
  wordCount: number;
}

export interface EpubBook {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  toc: EpubTocItem[];
  isEpub: boolean;
}

/**
 * Normalizes a relative path inside a zip archive
 */
function resolvePath(baseDir: string, relativePath: string): string {
  // If absolute path or no base dir
  const cleanRelative = relativePath.replace(/^[\/\\]+/, '');
  if (!baseDir) return cleanRelative;

  const stack = baseDir.split(/[\/\\]/).filter(Boolean);
  const parts = cleanRelative.split(/[\/\\]/).filter(Boolean);

  for (const part of parts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

/**
 * Parses an EPUB ArrayBuffer or Blob into a structured EpubBook object
 */
export async function parseEpub(data: ArrayBuffer | Uint8Array | Blob | string): Promise<EpubBook> {
  try {
    let zip: JSZip;
    if (typeof data === 'string') {
      // If a string was passed, check if it's plain text/markdown
      return createFallbackBookFromText(data, 'Document');
    }

    zip = await JSZip.loadAsync(data);

    // 1. Locate the OPF package file from META-INF/container.xml
    let opfPath = '';
    const containerFile = zip.file('META-INF/container.xml') || zip.file('meta-inf/container.xml');
    
    if (containerFile) {
      const containerXml = await containerFile.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(containerXml, 'text/xml');
      const rootfile = doc.querySelector('rootfile');
      if (rootfile && rootfile.getAttribute('full-path')) {
        opfPath = rootfile.getAttribute('full-path')!;
      }
    }

    // Fallback search for any .opf file in the zip
    if (!opfPath) {
      const opfEntries = zip.file(/\.opf$/i);
      if (opfEntries.length > 0) {
        opfPath = opfEntries[0].name;
      }
    }

    if (!opfPath) {
      // Could not find OPF - try extracting all html/xhtml/txt files in the zip
      return await extractGenericZipBook(zip);
    }

    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    const opfFile = zip.file(opfPath);

    if (!opfFile) {
      return await extractGenericZipBook(zip);
    }

    const opfText = await opfFile.async('text');
    const parser = new DOMParser();
    const opfDoc = parser.parseFromString(opfText, 'text/xml');

    // 2. Parse Metadata
    const titleEl = opfDoc.querySelector('title, dc\\:title');
    const creatorEl = opfDoc.querySelector('creator, dc\\:creator');
    const descEl = opfDoc.querySelector('description, dc\\:description');
    const pubEl = opfDoc.querySelector('publisher, dc\\:publisher');
    const langEl = opfDoc.querySelector('language, dc\\:language');
    const dateEl = opfDoc.querySelector('date, dc\\:date');
    const rightsEl = opfDoc.querySelector('rights, dc\\:rights');

    const title = titleEl?.textContent?.trim() || 'Untitled E-Book';
    const creator = creatorEl?.textContent?.trim() || 'Unknown Author';
    const description = descEl?.textContent?.trim() || '';
    const publisher = pubEl?.textContent?.trim() || '';
    const language = langEl?.textContent?.trim() || 'en';
    const date = dateEl?.textContent?.trim() || '';
    const rights = rightsEl?.textContent?.trim() || '';

    // 3. Parse Manifest (Map item IDs to resolved paths and media types)
    const manifestItems = new Map<string, { href: string; fullPath: string; mediaType: string; properties?: string }>();
    const itemElements = Array.from(opfDoc.querySelectorAll('manifest > item'));

    let coverId = '';
    const metaCover = opfDoc.querySelector('meta[name="cover"]');
    if (metaCover) {
      coverId = metaCover.getAttribute('content') || '';
    }

    for (const item of itemElements) {
      const id = item.getAttribute('id') || '';
      const href = item.getAttribute('href') || '';
      const mediaType = item.getAttribute('media-type') || '';
      const properties = item.getAttribute('properties') || '';

      const fullPath = resolvePath(opfDir, href);
      manifestItems.set(id, { href, fullPath, mediaType, properties });

      if (properties.includes('cover-image') || id.toLowerCase().includes('cover-image') || id === 'cover') {
        coverId = id;
      }
    }

    // 4. Extract Cover Image Data URL if available
    let coverUrl: string | undefined;
    if (coverId && manifestItems.has(coverId)) {
      const coverItem = manifestItems.get(coverId)!;
      const coverZipFile = zip.file(coverItem.fullPath) || zip.file(new RegExp(coverItem.href + '$', 'i'))[0];
      if (coverZipFile) {
        const coverBase64 = await coverZipFile.async('base64');
        const mime = coverItem.mediaType || 'image/jpeg';
        coverUrl = `data:${mime};base64,${coverBase64}`;
      }
    }

    if (!coverUrl) {
      // Look for any image file with "cover" in its name
      const coverImgEntries = zip.file(/cover.*\.(jpg|jpeg|png|webp|gif)/i);
      if (coverImgEntries.length > 0) {
        const coverZipFile = coverImgEntries[0];
        const coverBase64 = await coverZipFile.async('base64');
        const ext = coverZipFile.name.split('.').pop()?.toLowerCase() || 'jpeg';
        coverUrl = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${coverBase64}`;
      }
    }

    // 5. Parse Spine (Reading order)
    const itemRefs = Array.from(opfDoc.querySelectorAll('spine > itemref'));
    const spineIdRefs: string[] = itemRefs.map(ref => ref.getAttribute('idref') || '').filter(Boolean);

    // 6. Parse Table of Contents (NCX or EPUB3 Nav)
    const tocList: EpubTocItem[] = [];
    const ncxId = opfDoc.querySelector('spine')?.getAttribute('toc') || 'ncx';
    let ncxPath = '';
    if (manifestItems.has(ncxId)) {
      ncxPath = manifestItems.get(ncxId)!.fullPath;
    } else {
      const ncxFile = zip.file(/\.ncx$/i)[0];
      if (ncxFile) ncxPath = ncxFile.name;
    }

    if (ncxPath && zip.file(ncxPath)) {
      try {
        const ncxXml = await zip.file(ncxPath)!.async('text');
        const ncxDoc = parser.parseFromString(ncxXml, 'text/xml');
        const navPoints = Array.from(ncxDoc.querySelectorAll('navPoint'));

        navPoints.forEach((np, idx) => {
          const navLabel = np.querySelector('navLabel > text')?.textContent?.trim() || `Section ${idx + 1}`;
          const src = np.querySelector('content')?.getAttribute('src') || '';
          const cleanSrc = src.split('#')[0];
          const fullSrcPath = resolvePath(opfDir, cleanSrc);

          // Find chapter index in spine
          let chIdx = 0;
          for (let i = 0; i < spineIdRefs.length; i++) {
            const item = manifestItems.get(spineIdRefs[i]);
            if (item && (item.fullPath === fullSrcPath || item.href === cleanSrc || item.href.endsWith(cleanSrc))) {
              chIdx = i;
              break;
            }
          }

          tocList.push({
            id: np.getAttribute('id') || `toc-${idx}`,
            title: navLabel,
            href: src,
            chapterIndex: chIdx
          });
        });
      } catch (err) {
        console.warn('Could not parse NCX TOC:', err);
      }
    }

    // Also check for EPUB 3 Nav Document (<item properties="nav" ...>)
    if (tocList.length === 0) {
      let navPath = '';
      for (const [, item] of manifestItems.entries()) {
        if (item.properties?.includes('nav') || item.href.toLowerCase().includes('nav.xhtml') || item.href.toLowerCase().includes('toc.xhtml')) {
          navPath = item.fullPath;
          break;
        }
      }

      if (navPath && zip.file(navPath)) {
        try {
          const navXml = await zip.file(navPath)!.async('text');
          const navDoc = parser.parseFromString(navXml, 'text/html');
          const navLinks = Array.from(navDoc.querySelectorAll('nav[epub\\:type="toc"] a, nav#toc a, nav.toc a, nav a'));
          navLinks.forEach((a, idx) => {
            const navLabel = a.textContent?.trim() || `Section ${idx + 1}`;
            const src = a.getAttribute('href') || '';
            const cleanSrc = src.split('#')[0];
            const fullSrcPath = resolvePath(opfDir, cleanSrc);

            let chIdx = 0;
            for (let i = 0; i < spineIdRefs.length; i++) {
              const item = manifestItems.get(spineIdRefs[i]);
              if (item && (item.fullPath === fullSrcPath || item.href === cleanSrc || item.href.endsWith(cleanSrc))) {
                chIdx = i;
                break;
              }
            }

            tocList.push({
              id: `nav-toc-${idx}`,
              title: navLabel,
              href: src,
              chapterIndex: chIdx
            });
          });
        } catch (err) {
          console.warn('Could not parse EPUB3 Nav TOC:', err);
        }
      }
    }

    // 7. Extract and render each Chapter in spine order
    const chapters: EpubChapter[] = [];
    let totalWords = 0;

    for (let i = 0; i < spineIdRefs.length; i++) {
      const idref = spineIdRefs[i];
      const manifestItem = manifestItems.get(idref);
      if (!manifestItem) continue;

      const chapterZipFile = zip.file(manifestItem.fullPath) || zip.file(new RegExp(manifestItem.href + '$', 'i'))[0];
      if (!chapterZipFile) continue;

      const rawChapterXml = await chapterZipFile.async('text');
      const chapterDir = manifestItem.fullPath.includes('/')
        ? manifestItem.fullPath.substring(0, manifestItem.fullPath.lastIndexOf('/') + 1)
        : '';

      // Parse XHTML chapter
      const chapterDoc = parser.parseFromString(rawChapterXml, 'text/html');

      // Replace embedded images with base64 Data URLs so they render reliably
      const imgElements = Array.from(chapterDoc.querySelectorAll('img, image'));
      for (const img of imgElements) {
        const srcAttr = img.getAttribute('src') || img.getAttribute('xlink:href') || '';
        if (srcAttr && !srcAttr.startsWith('data:') && !srcAttr.startsWith('http')) {
          const imgPath = resolvePath(chapterDir, srcAttr);
          const imgZipFile = zip.file(imgPath) || zip.file(new RegExp(srcAttr.replace(/^\.\//, '') + '$', 'i'))[0];
          if (imgZipFile) {
            try {
              const imgBase64 = await imgZipFile.async('base64');
              const ext = imgZipFile.name.split('.').pop()?.toLowerCase() || 'jpeg';
              const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
              const dataUrl = `data:${mime};base64,${imgBase64}`;
              if (img.tagName.toLowerCase() === 'image') {
                img.setAttribute('xlink:href', dataUrl);
              } else {
                img.setAttribute('src', dataUrl);
              }
            } catch (_) {}
          }
        }
        // Responsive image constraints
        if (img.tagName.toLowerCase() === 'img') {
          img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 1.25rem auto; border-radius: 0.5rem;');
        }
      }

      // Determine Chapter Title
      let chapterTitle = '';
      // 1. Check if TOC has this chapter
      const matchedToc = tocList.find(t => t.chapterIndex === i);
      if (matchedToc) {
        chapterTitle = matchedToc.title;
      }
      if (!chapterTitle) {
        const h1 = chapterDoc.querySelector('h1, h2, h3, title');
        if (h1 && h1.textContent?.trim()) {
          chapterTitle = h1.textContent.trim();
        }
      }
      if (!chapterTitle) {
        chapterTitle = `Chapter ${i + 1}`;
      }

      // Clean and sanitize body content
      const bodyEl = chapterDoc.body || chapterDoc.documentElement;
      
      // Strip script, iframe, object, embed, and style tags that can break layout
      bodyEl.querySelectorAll('script, iframe, object, embed, meta, link').forEach(el => el.remove());

      // Sanitize inline styles on the body or container elements that restrict full page scroll
      bodyEl.removeAttribute('style');
      bodyEl.querySelectorAll('*').forEach(el => {
        const style = el.getAttribute('style');
        if (style && (style.includes('height:') || style.includes('overflow:') || style.includes('position: fixed') || style.includes('position: absolute'))) {
          const cleaned = style
            .replace(/height\s*:\s*[^;]+;?/gi, '')
            .replace(/overflow\s*:\s*[^;]+;?/gi, '')
            .replace(/position\s*:\s*(fixed|absolute);?/gi, '');
          el.setAttribute('style', cleaned);
        }
      });

      const contentHtml = bodyEl.innerHTML;
      const rawText = bodyEl.textContent || '';
      const words = rawText.trim().split(/\s+/).filter(Boolean).length;
      totalWords += words;

      chapters.push({
        id: idref,
        title: chapterTitle,
        href: manifestItem.href,
        contentHtml,
        rawText,
        wordCount: words
      });
    }

    // If TOC is empty, build from chapters
    if (tocList.length === 0 && chapters.length > 0) {
      chapters.forEach((ch, idx) => {
        tocList.push({
          id: `toc-${idx}`,
          title: ch.title,
          href: ch.href,
          chapterIndex: idx
        });
      });
    }

    const readingTimeMin = Math.max(1, Math.ceil(totalWords / 220));

    return {
      metadata: {
        title,
        creator,
        description,
        publisher,
        language,
        date,
        rights,
        coverUrl,
        totalWords,
        readingTimeMin
      },
      chapters,
      toc: tocList,
      isEpub: true
    };
  } catch (error: any) {
    console.warn('Error during EPUB parsing:', error);
    // Fallback to text parsing
    if (typeof data === 'string') {
      return createFallbackBookFromText(data, 'Document');
    }
    throw error;
  }
}

/**
 * Extracts a book from generic zip files containing HTML or text documents
 */
async function extractGenericZipBook(zip: JSZip): Promise<EpubBook> {
  const htmlFiles = zip.file(/\.(html|xhtml|htm|txt|md)$/i);
  const chapters: EpubChapter[] = [];
  let totalWords = 0;

  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const text = await file.async('text');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    totalWords += words;

    chapters.push({
      id: `file-${i}`,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      href: file.name,
      contentHtml: `<div class="p-4">${text}</div>`,
      rawText: text,
      wordCount: words
    });
  }

  const readingTimeMin = Math.max(1, Math.ceil(totalWords / 220));

  return {
    metadata: {
      title: 'Archived Document Collection',
      creator: 'Local Storage',
      totalWords,
      readingTimeMin
    },
    chapters,
    toc: chapters.map((c, i) => ({ id: c.id, title: c.title, href: c.href, chapterIndex: i })),
    isEpub: false
  };
}

/**
 * Creates an EpubBook structure from plain text or Markdown fallback
 */
export function createFallbackBookFromText(text: string, title: string = 'Document'): EpubBook {
  if (!text) {
    return {
      metadata: {
        title,
        creator: 'Unknown Author',
        totalWords: 0,
        readingTimeMin: 1
      },
      chapters: [{
        id: 'empty',
        title: 'Empty Document',
        href: '#',
        contentHtml: '<p class="text-slate-400 italic">No content available.</p>',
        rawText: '',
        wordCount: 0
      }],
      toc: [{ id: 'toc-0', title: 'Empty Document', href: '#', chapterIndex: 0 }],
      isEpub: false
    };
  }

  // Split by markdown headings or Chapter headers
  const lines = text.split('\n');
  const chapterChunks: { title: string; lines: string[] }[] = [];
  let currentTitle = 'Introduction';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') || trimmed.match(/^chapter\s+\d+/i) || trimmed.match(/^part\s+\d+/i)) {
      if (currentLines.length > 0) {
        chapterChunks.push({ title: currentTitle, lines: currentLines });
        currentLines = [];
      }
      currentTitle = trimmed.replace(/^#+\s*/, '') || `Chapter ${chapterChunks.length + 1}`;
    }
    currentLines.push(line);
  }

  if (currentLines.length > 0) {
    chapterChunks.push({ title: currentTitle, lines: currentLines });
  }

  if (chapterChunks.length === 0) {
    chapterChunks.push({ title: 'Full Document', lines });
  }

  let totalWords = 0;
  const chapters: EpubChapter[] = chapterChunks.map((chunk, idx) => {
    const raw = chunk.lines.join('\n');
    const words = raw.trim().split(/\s+/).filter(Boolean).length;
    totalWords += words;

    const formattedHtml = chunk.lines
      .map(l => {
        if (!l.trim()) return '<div class="h-4"></div>';
        if (l.startsWith('# ')) return `<h1 class="text-2xl font-bold mb-4 mt-6">${l.substring(2)}</h1>`;
        if (l.startsWith('## ')) return `<h2 class="text-xl font-bold mb-3 mt-5">${l.substring(3)}</h2>`;
        if (l.startsWith('### ')) return `<h3 class="text-lg font-semibold mb-2 mt-4">${l.substring(4)}</h3>`;
        if (l.startsWith('> ')) return `<blockquote class="border-l-4 border-indigo-500 pl-4 italic my-3 text-slate-300">${l.substring(2)}</blockquote>`;
        return `<p class="mb-3 leading-relaxed">${l}</p>`;
      })
      .join('\n');

    return {
      id: `chunk-${idx}`,
      title: chunk.title,
      href: `#chunk-${idx}`,
      contentHtml: formattedHtml,
      rawText: raw,
      wordCount: words
    };
  });

  const readingTimeMin = Math.max(1, Math.ceil(totalWords / 220));

  return {
    metadata: {
      title,
      creator: 'Local Document',
      totalWords,
      readingTimeMin
    },
    chapters,
    toc: chapters.map((c, i) => ({ id: c.id, title: c.title, href: c.href, chapterIndex: i })),
    isEpub: false
  };
}
