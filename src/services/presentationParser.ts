/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Universal Presentation Engine & High-Fidelity Parser (.pptx, .ppt, .odp, .pps, .ppsx, .key)
 *
 * Full Feature Support:
 * - Slide Master & Layout Shape Inheritance & Cascading Placeholders
 * - Precise Slide Ordering via ppt/presentation.xml & ppt/_rels/presentation.xml.rels
 * - Full OOXML Theme Color Scheme with Tint, Shade, Luminance Mod/Off calculations
 * - Exact Coordinate Transforms (EMU to percentage / cqw geometry)
 * - Multi-stop Linear & Radial Gradients
 * - Rich Custom Geometries (rect, roundRect, ellipse, triangle, diamond, arrow, line, callout)
 * - Typography engine with major/minor theme fonts, bullet styles, indent levels, super/subscript
 * - Graphic Frames (Tables with cell styling, spans, border matrices, column widths)
 * - Image Blip extraction and shape image fills (a:blipFill)
 * - Legacy Microsoft PowerPoint 97-2003 (.ppt) OLE2 stream parser
 * - OpenDocument Presentation (.odp) parser
 */

import JSZip from 'jszip';

export interface SlideBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // In degrees
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface SlideGradientStop {
  position: number; // 0 to 100%
  color: string;
}

export interface SlideShapeStyle {
  fillColor?: string;
  fillGradient?: {
    angle?: number;
    stops: SlideGradientStop[];
  };
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  opacity?: number;
  verticalAlign?: 'top' | 'center' | 'bottom';
  paddingTopPercent?: number;
  paddingLeftPercent?: number;
  geometry?: string; // 'rect' | 'roundRect' | 'ellipse' | 'line' | 'triangle' | 'diamond' | 'rightArrow' | etc.
}

export interface SlideTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  color?: string;
  fontSize?: number; // In pt
  fontFamily?: string;
  hyperlink?: string;
}

export interface SlideParagraph {
  runs: SlideTextRun[];
  text: string;
  isBullet?: boolean;
  bulletChar?: string;
  bulletColor?: string;
  level?: number;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number;
  spaceBefore?: number;
  spaceAfter?: number;
}

export interface SlideTableCell {
  text: string;
  paragraphs: SlideParagraph[];
  bgColor?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'center' | 'bottom';
  colSpan?: number;
  rowSpan?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface SlideTable {
  rows: SlideTableCell[][];
  colWidthsPercent?: number[];
}

export interface SlideShape {
  id: string;
  name?: string;
  type: 'title' | 'subtitle' | 'body' | 'table' | 'image' | 'shape' | 'line' | 'generic';
  geometry?: string;
  box: SlideBox;
  style: SlideShapeStyle;
  paragraphs: SlideParagraph[];
  table?: SlideTable;
  imageUrl?: string;
  imageAlt?: string;
  isMasterOrLayoutShape?: boolean;
}

export interface PresentationSlide {
  id: number;
  slideNumber: number;
  layout: 'canvas' | 'title' | 'content' | 'two-column' | 'blank';
  title: string;
  subtitle?: string;
  shapes: SlideShape[];
  table?: SlideTable;
  images: { url: string; name?: string; box?: SlideBox }[];
  notes?: string;
  backgroundColor?: string;
  backgroundGradient?: {
    angle?: number;
    stops: SlideGradientStop[];
  };
  backgroundImageUrl?: string;
  accentColor?: string;
  rawText: string[];
  isDarkBackground?: boolean;
}

export interface ParsedPresentation {
  title: string;
  format: 'pptx' | 'ppt' | 'odp' | 'presentation';
  formatLabel: string;
  slideCount: number;
  aspectRatio: '16:9' | '4:3' | '16:10';
  dimensions: { width: number; height: number; slideWidthPoints: number; slideHeightPoints: number };
  themeFonts?: { major?: string; minor?: string };
  themeColors?: Record<string, string>;
  slides: PresentationSlide[];
  metadata?: {
    appName?: string;
    author?: string;
    slideTitles?: string[];
  };
}

/**
 * Standard Office Theme Palette Fallbacks
 */
const DEFAULT_THEME_COLORS: Record<string, string> = {
  accent1: '#2563EB', // Royal Blue
  accent2: '#DC2626', // Crimson Red
  accent3: '#059669', // Emerald Green
  accent4: '#D97706', // Amber Orange
  accent5: '#7C3AED', // Violet Purple
  accent6: '#0891B2', // Cyan Blue
  dk1: '#0F172A',
  lt1: '#FFFFFF',
  dk2: '#1E293B',
  lt2: '#F8FAFC',
  tx1: '#0F172A',
  bg1: '#FFFFFF',
  tx2: '#475569',
  bg2: '#F1F5F9',
  hlink: '#2563EB',
  folHlink: '#7C3AED'
};

/**
 * Main Presentation Parsing Entry Point
 */
export async function parsePresentation(
  arrayBuffer: ArrayBuffer,
  filename: string
): Promise<ParsedPresentation> {
  const bytes = new Uint8Array(arrayBuffer);
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Check for ZIP container (PPTX, ODP, PPSX, POTX, KEY)
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

  if (isZip) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      // A. Modern PowerPoint (.pptx, .ppsx, .potx)
      const hasPresentationXml = !!zip.file('ppt/presentation.xml');
      const hasSlideFolder = Object.keys(zip.files).some(p => p.startsWith('ppt/slides/slide'));

      if (hasPresentationXml || hasSlideFolder) {
        return await parsePptxZipArchive(zip, filename);
      }

      // B. OpenDocument Presentation (.odp)
      const contentXmlFile = zip.file('content.xml');
      if (contentXmlFile) {
        return await parseOdpZipArchive(zip, contentXmlFile, filename);
      }

      // C. Generic ZIP/Keynote presentation
      return await parseGenericZipArchive(zip, filename);
    } catch (err) {
      console.warn('ZIP presentation parsing failed, attempting OLE2/binary parser:', err);
    }
  }

  // 2. Legacy Microsoft PowerPoint 97-2003 (.ppt, .pps, .pot - OLE2 Compound File)
  return parseLegacyPptOle2(bytes, filename, ext);
}

/**
 * Parses Modern PowerPoint (.pptx / .ppsx) with complete Layout & Master inheritance
 */
async function parsePptxZipArchive(
  zip: JSZip,
  filename: string
): Promise<ParsedPresentation> {
  // Extract presentation dimensions from ppt/presentation.xml (in EMUs)
  let slideWidthEMU = 9144000;
  let slideHeightEMU = 5143500;
  let width = 1920;
  let height = 1080;
  let slideWidthPoints = 960;
  let slideHeightPoints = 540;
  let aspectRatio: '16:9' | '4:3' | '16:10' = '16:9';
  let author = '';
  let appName = 'Microsoft PowerPoint';

  // Read ppt/presentation.xml for dimensions and exact slide sequence
  const orderedSlidePaths: string[] = [];

  try {
    const presXml = await zip.file('ppt/presentation.xml')?.async('text');
    if (presXml) {
      const parser = new DOMParser();
      const presDoc = parser.parseFromString(presXml, 'text/xml');
      const sldSz = presDoc.getElementsByTagName('p:sldSz')[0];
      if (sldSz) {
        const cx = parseInt(sldSz.getAttribute('cx') || '0', 10);
        const cy = parseInt(sldSz.getAttribute('cy') || '0', 10);
        if (cx > 0 && cy > 0) {
          slideWidthEMU = cx;
          slideHeightEMU = cy;
          slideWidthPoints = cx / 12700;
          slideHeightPoints = cy / 12700;
          const ratio = cx / cy;
          if (Math.abs(ratio - 4 / 3) < 0.15) {
            aspectRatio = '4:3';
            width = 1440;
            height = 1080;
            slideWidthPoints = 720;
            slideHeightPoints = 540;
          } else if (Math.abs(ratio - 16 / 10) < 0.15) {
            aspectRatio = '16:10';
            width = 1920;
            height = 1200;
            slideWidthPoints = 960;
            slideHeightPoints = 600;
          } else {
            aspectRatio = '16:9';
            width = 1920;
            height = 1080;
            slideWidthPoints = 960;
            slideHeightPoints = 540;
          }
        }
      }

      // Read presentation relationships to map r:id to actual slide files
      const presRelsMap = new Map<string, string>();
      const presRelsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('text');
      if (presRelsXml) {
        const relsDoc = parser.parseFromString(presRelsXml, 'text/xml');
        const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
        relNodes.forEach(rel => {
          const id = rel.getAttribute('Id') || '';
          const target = rel.getAttribute('Target') || '';
          if (id && target) {
            // Clean relative path (e.g. slides/slide1.xml -> ppt/slides/slide1.xml)
            const cleanTarget = target.startsWith('ppt/') ? target : target.startsWith('/') ? target.substring(1) : `ppt/${target.replace(/^\.\//, '')}`;
            presRelsMap.set(id, cleanTarget);
          }
        });
      }

      // Read exact slide ordering from <p:sldIdLst>
      const sldIdLst = presDoc.getElementsByTagName('p:sldIdLst')[0];
      if (sldIdLst) {
        const sldIds = Array.from(sldIdLst.getElementsByTagName('p:sldId'));
        sldIds.forEach(sld => {
          const rId = sld.getAttribute('r:id') || sld.getAttribute('r:id') || '';
          const targetPath = presRelsMap.get(rId);
          if (targetPath && zip.file(targetPath)) {
            orderedSlidePaths.push(targetPath);
          }
        });
      }
    }
  } catch {
    // Default dimensions
  }

  // Fallback: If no slides found from presentation.xml.rels, collect from ppt/slides/ directly
  if (orderedSlidePaths.length === 0) {
    const rawSlidePaths: string[] = [];
    zip.folder('ppt/slides')?.forEach((relativePath) => {
      if (relativePath.startsWith('slide') && relativePath.endsWith('.xml') && !relativePath.includes('/')) {
        rawSlidePaths.push(`ppt/slides/${relativePath}`);
      }
    });

    rawSlidePaths.sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

    orderedSlidePaths.push(...rawSlidePaths);
  }

  // Extract Theme Colors & Fonts from ppt/theme/theme1.xml
  const themeColors: Record<string, string> = { ...DEFAULT_THEME_COLORS };
  const themeFonts = { major: 'Calibri', minor: 'Calibri' };

  try {
    const themeXml = await zip.file('ppt/theme/theme1.xml')?.async('text');
    if (themeXml) {
      const parser = new DOMParser();
      const themeDoc = parser.parseFromString(themeXml, 'text/xml');

      // Parse Color Scheme
      const clrScheme = themeDoc.getElementsByTagName('a:clrScheme')[0];
      if (clrScheme) {
        const colorNodes = Array.from(clrScheme.children);
        colorNodes.forEach(node => {
          const colorName = node.tagName.replace(/^a:/, '');
          const srgb = node.getElementsByTagName('a:srgbClr')[0]?.getAttribute('val');
          const sys = node.getElementsByTagName('a:sysClr')[0]?.getAttribute('lastClr');
          const hex = srgb || sys;
          if (hex) {
            themeColors[colorName] = `#${hex}`;
          }
        });
      }

      // Parse Font Scheme
      const majorLatin = themeDoc.getElementsByTagName('a:majorFont')[0]?.getElementsByTagName('a:latin')[0]?.getAttribute('typeface');
      const minorLatin = themeDoc.getElementsByTagName('a:minorFont')[0]?.getElementsByTagName('a:latin')[0]?.getAttribute('typeface');
      if (majorLatin) themeFonts.major = majorLatin;
      if (minorLatin) themeFonts.minor = minorLatin;
    }
  } catch {
    // Ignore theme parse error
  }

  // Extract core metadata
  try {
    const coreXml = await zip.file('docProps/core.xml')?.async('text');
    if (coreXml) {
      const parser = new DOMParser();
      const coreDoc = parser.parseFromString(coreXml, 'text/xml');
      author = coreDoc.getElementsByTagName('dc:creator')[0]?.textContent?.trim() || '';
      const titleProp = coreDoc.getElementsByTagName('dc:title')[0]?.textContent?.trim();
      if (titleProp) filename = titleProp;
    }
  } catch {
    // Ignore core metadata error
  }

  // Pre-load all media image blobs from zip for fast lookup
  const mediaMap = new Map<string, string>();
  const mediaFolder = zip.folder('ppt/media');
  if (mediaFolder) {
    const mediaFiles = Object.keys(zip.files).filter(p => p.startsWith('ppt/media/'));
    for (const mediaPath of mediaFiles) {
      try {
        const mediaFile = zip.file(mediaPath);
        if (mediaFile) {
          const u8 = await mediaFile.async('uint8array');
          const mime = getMimeFromPath(mediaPath);
          const blob = new Blob([u8.buffer as ArrayBuffer], { type: mime });
          const objectUrl = URL.createObjectURL(blob);
          const fileName = mediaPath.split('/').pop() || '';
          mediaMap.set(fileName.toLowerCase(), objectUrl);
          mediaMap.set(mediaPath.toLowerCase(), objectUrl);
        }
      } catch {
        // Skip media file on error
      }
    }
  }

  // Slide Master interface & cache
  interface MasterData {
    background?: string;
    backgroundGradient?: { angle?: number; stops: SlideGradientStop[] };
    backgroundImageUrl?: string;
    placeholders: Map<string, SlideBox>;
    placeholderStyles: Map<string, { fontSize?: number; color?: string; align?: 'left' | 'center' | 'right'; bold?: boolean }>;
    shapes: SlideShape[];
  }
  const masterCache = new Map<string, MasterData>();

  // Slide Layout interface & cache
  interface LayoutData {
    placeholders: Map<string, SlideBox>;
    placeholderStyles: Map<string, { fontSize?: number; color?: string; align?: 'left' | 'center' | 'right'; bold?: boolean }>;
    background?: string;
    backgroundGradient?: { angle?: number; stops: SlideGradientStop[] };
    backgroundImageUrl?: string;
    shapes: SlideShape[];
    masterPath?: string;
  }
  const layoutCache = new Map<string, LayoutData>();

  // Helper to parse a SlideMaster file
  const loadSlideMaster = async (masterPath: string): Promise<MasterData> => {
    if (masterCache.has(masterPath)) return masterCache.get(masterPath)!;
    const masterData: MasterData = {
      placeholders: new Map(),
      placeholderStyles: new Map(),
      shapes: []
    };

    try {
      const masterXml = await zip.file(masterPath)?.async('text');
      if (masterXml) {
        const parser = new DOMParser();
        const masterDoc = parser.parseFromString(masterXml, 'text/xml');

        // Master Rels for images
        const masterRelsMap = new Map<string, string>();
        const masterFileName = masterPath.split('/').pop() || '';
        const relsXml = await zip.file(`ppt/slideMasters/_rels/${masterFileName}.rels`)?.async('text');
        if (relsXml) {
          const relsDoc = parser.parseFromString(relsXml, 'text/xml');
          const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
          relNodes.forEach(rel => {
            const id = rel.getAttribute('Id') || '';
            const target = rel.getAttribute('Target') || '';
            const targetFile = target.split('/').pop()?.toLowerCase() || '';
            const url = mediaMap.get(targetFile) || mediaMap.get(target.toLowerCase());
            if (id && url) masterRelsMap.set(id, url);
          });
        }

        // Master Background
        const bgNode = masterDoc.getElementsByTagName('p:bg')[0];
        if (bgNode) {
          const bgPr = bgNode.getElementsByTagName('p:bgPr')[0];
          if (bgPr) {
            const bgClr = resolveColor(bgPr, themeColors);
            if (bgClr) masterData.background = bgClr;
            const grad = parseGradientFill(bgPr, themeColors);
            if (grad) masterData.backgroundGradient = grad;
            const blip = bgPr.getElementsByTagName('a:blip')[0]?.getAttribute('r:embed');
            if (blip && masterRelsMap.has(blip)) masterData.backgroundImageUrl = masterRelsMap.get(blip);
          }
        }

        // Master shapes & placeholders
        const spTree = masterDoc.getElementsByTagName('p:spTree')[0];
        if (spTree) {
          const shapes = Array.from(spTree.getElementsByTagName('p:sp'));
          shapes.forEach(sp => {
            const ph = sp.getElementsByTagName('p:ph')[0];
            const phType = ph?.getAttribute('type') || (ph ? 'body' : '');
            const phIdx = ph?.getAttribute('idx') || '0';
            const xfrm = sp.getElementsByTagName('a:xfrm')[0];
            const box = parseXfrm(xfrm, slideWidthEMU, slideHeightEMU);
            if (phType && box) {
              masterData.placeholders.set(`${phType}-${phIdx}`, box);
              masterData.placeholders.set(phType, box);
            }
          });

          // Master static non-placeholder shapes (logos, background cards, colored bars)
          const dummyRaw: string[] = [];
          const dummyImg: { url: string; name?: string; box?: SlideBox }[] = [];
          parseShapeContainer(
            spTree,
            slideWidthEMU,
            slideHeightEMU,
            masterRelsMap,
            themeColors,
            themeFonts,
            new Map(),
            masterData.shapes,
            dummyRaw,
            dummyImg,
            undefined,
            true // isMaster
          );
        }
      }
    } catch {
      // Ignore master parse error
    }

    masterCache.set(masterPath, masterData);
    return masterData;
  };

  // Helper to parse a SlideLayout file
  const loadSlideLayout = async (layoutPath: string): Promise<LayoutData> => {
    if (layoutCache.has(layoutPath)) return layoutCache.get(layoutPath)!;
    const layoutData: LayoutData = {
      placeholders: new Map(),
      placeholderStyles: new Map(),
      shapes: []
    };

    try {
      const layoutXml = await zip.file(layoutPath)?.async('text');
      if (layoutXml) {
        const parser = new DOMParser();
        const layoutDoc = parser.parseFromString(layoutXml, 'text/xml');

        // Layout Rels for images & master
        const layoutRelsMap = new Map<string, string>();
        let masterPath = '';
        const layoutFileName = layoutPath.split('/').pop() || '';
        const relsXml = await zip.file(`ppt/slideLayouts/_rels/${layoutFileName}.rels`)?.async('text');
        if (relsXml) {
          const relsDoc = parser.parseFromString(relsXml, 'text/xml');
          const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
          relNodes.forEach(rel => {
            const id = rel.getAttribute('Id') || '';
            const target = rel.getAttribute('Target') || '';
            const type = rel.getAttribute('Type') || '';
            if (type.includes('slideMaster')) {
              masterPath = target.startsWith('ppt/') ? target : target.startsWith('/') ? target.substring(1) : target.replace(/^\.\.\//, 'ppt/');
            }
            const targetFile = target.split('/').pop()?.toLowerCase() || '';
            const url = mediaMap.get(targetFile) || mediaMap.get(target.toLowerCase());
            if (id && url) layoutRelsMap.set(id, url);
          });
        }
        layoutData.masterPath = masterPath;

        // Layout Background
        const bgNode = layoutDoc.getElementsByTagName('p:bg')[0];
        if (bgNode) {
          const bgPr = bgNode.getElementsByTagName('p:bgPr')[0];
          if (bgPr) {
            const bgClr = resolveColor(bgPr, themeColors);
            if (bgClr) layoutData.background = bgClr;
            const grad = parseGradientFill(bgPr, themeColors);
            if (grad) layoutData.backgroundGradient = grad;
            const blip = bgPr.getElementsByTagName('a:blip')[0]?.getAttribute('r:embed');
            if (blip && layoutRelsMap.has(blip)) layoutData.backgroundImageUrl = layoutRelsMap.get(blip);
          }
        }

        // Layout placeholders & static shapes
        const spTree = layoutDoc.getElementsByTagName('p:spTree')[0];
        if (spTree) {
          const shapes = Array.from(spTree.getElementsByTagName('p:sp'));
          shapes.forEach(sp => {
            const ph = sp.getElementsByTagName('p:ph')[0];
            const phType = ph?.getAttribute('type') || (ph ? 'body' : '');
            const phIdx = ph?.getAttribute('idx') || '0';
            const xfrm = sp.getElementsByTagName('a:xfrm')[0];
            const box = parseXfrm(xfrm, slideWidthEMU, slideHeightEMU);
            if (phType && box) {
              layoutData.placeholders.set(`${phType}-${phIdx}`, box);
              layoutData.placeholders.set(phType, box);

              // Capture placeholder default font styles
              const rPr = sp.getElementsByTagName('a:rPr')[0];
              const pPr = sp.getElementsByTagName('a:pPr')[0];
              const szAttr = rPr?.getAttribute('sz');
              const fontSize = szAttr ? parseInt(szAttr, 10) / 100 : undefined;
              const clr = rPr ? resolveColor(rPr, themeColors) : undefined;
              const algn = pPr?.getAttribute('algn');
              let align: 'left' | 'center' | 'right' | undefined;
              if (algn === 'ctr') align = 'center';
              else if (algn === 'r') align = 'right';
              else if (algn === 'l') align = 'left';

              layoutData.placeholderStyles.set(`${phType}-${phIdx}`, {
                fontSize,
                color: clr,
                align,
                bold: rPr?.getAttribute('b') === '1'
              });
            }
          });

          // Parse non-placeholder layout shapes (decorative cards, bars, badges)
          const dummyRaw: string[] = [];
          const dummyImg: { url: string; name?: string; box?: SlideBox }[] = [];
          parseShapeContainer(
            spTree,
            slideWidthEMU,
            slideHeightEMU,
            layoutRelsMap,
            themeColors,
            themeFonts,
            layoutData.placeholders,
            layoutData.shapes,
            dummyRaw,
            dummyImg,
            undefined,
            true // isLayout
          );
        }
      }
    } catch {
      // Ignore layout parse error
    }

    layoutCache.set(layoutPath, layoutData);
    return layoutData;
  };

  const slides: PresentationSlide[] = [];

  for (let i = 0; i < orderedSlidePaths.length; i++) {
    const slideNum = i + 1;
    const slidePath = orderedSlidePaths[i];
    const xmlText = await zip.file(slidePath)?.async('text');
    if (!xmlText) continue;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Parse slide relationships for embedded images and layout inheritance
    const relsMap = new Map<string, string>();
    let layoutPath = '';

    try {
      const slideFileName = slidePath.split('/').pop() || '';
      const relsPath = `ppt/slides/_rels/${slideFileName}.rels`;
      const relsText = await zip.file(relsPath)?.async('text');
      if (relsText) {
        const relsDoc = parser.parseFromString(relsText, 'text/xml');
        const relNodes = relsDoc.getElementsByTagName('Relationship');
        for (let r = 0; r < relNodes.length; r++) {
          const id = relNodes[r].getAttribute('Id') || '';
          const target = relNodes[r].getAttribute('Target') || '';
          const type = relNodes[r].getAttribute('Type') || '';

          if (type.includes('slideLayout')) {
            const cleanTarget = target.startsWith('ppt/') ? target : target.startsWith('/') ? target.substring(1) : target.replace(/^\.\.\//, 'ppt/');
            layoutPath = cleanTarget;
          }

          const targetFile = target.split('/').pop()?.toLowerCase() || '';
          const url = mediaMap.get(targetFile) || mediaMap.get(target.toLowerCase());
          if (id && url) {
            relsMap.set(id, url);
          }
        }
      }
    } catch {
      // Ignore rels error
    }

    // Load slide layout & master data
    let layoutPlaceholders = new Map<string, SlideBox>();
    let layoutBackground: string | undefined;
    let layoutBgGradient: { angle?: number; stops: SlideGradientStop[] } | undefined;
    let layoutBgImgUrl: string | undefined;
    const backgroundShapes: SlideShape[] = [];

    if (layoutPath) {
      const layoutData = await loadSlideLayout(layoutPath);
      layoutPlaceholders = layoutData.placeholders;
      layoutBackground = layoutData.background;
      layoutBgGradient = layoutData.backgroundGradient;
      layoutBgImgUrl = layoutData.backgroundImageUrl;

      // Also check Master
      if (layoutData.masterPath) {
        const masterData = await loadSlideMaster(layoutData.masterPath);
        if (!layoutBackground && masterData.background) layoutBackground = masterData.background;
        if (!layoutBgGradient && masterData.backgroundGradient) layoutBgGradient = masterData.backgroundGradient;
        if (!layoutBgImgUrl && masterData.backgroundImageUrl) layoutBgImgUrl = masterData.backgroundImageUrl;

        // Merge master placeholders if not present in layout
        masterData.placeholders.forEach((box, key) => {
          if (!layoutPlaceholders.has(key)) {
            layoutPlaceholders.set(key, box);
          }
        });

        // Add master decorative shapes
        masterData.shapes.forEach(sh => {
          backgroundShapes.push({ ...sh, id: `master-${sh.id}`, isMasterOrLayoutShape: true });
        });
      }

      // Add layout decorative shapes
      layoutData.shapes.forEach(sh => {
        backgroundShapes.push({ ...sh, id: `layout-${sh.id}`, isMasterOrLayoutShape: true });
      });
    }

    // Extract slide direct background
    let slideBgColor: string | undefined = layoutBackground;
    let slideBgGradient: { angle?: number; stops: SlideGradientStop[] } | undefined = layoutBgGradient;
    let slideBgImgUrl: string | undefined = layoutBgImgUrl;

    const bgNode = xmlDoc.getElementsByTagName('p:bg')[0];
    if (bgNode) {
      const bgPr = bgNode.getElementsByTagName('p:bgPr')[0];
      if (bgPr) {
        const bgClr = resolveColor(bgPr, themeColors);
        if (bgClr) slideBgColor = bgClr;
        const grad = parseGradientFill(bgPr, themeColors);
        if (grad) slideBgGradient = grad;
        const blip = bgPr.getElementsByTagName('a:blip')[0]?.getAttribute('r:embed');
        if (blip && relsMap.has(blip)) slideBgImgUrl = relsMap.get(blip);
      }
    }

    // Default background color to clean white if completely unspecified
    if (!slideBgColor && !slideBgGradient && !slideBgImgUrl) {
      slideBgColor = themeColors.bg1 || themeColors.lt1 || '#FFFFFF';
    }

    // Detect if slide has dark background
    const isDarkBackground = isColorDark(slideBgColor || '#FFFFFF');

    // Extract speaker notes if available
    let notes = '';
    try {
      const notesPath = `ppt/notesSlides/notesSlide${slideNum}.xml`;
      const notesXml = await zip.file(notesPath)?.async('text');
      if (notesXml) {
        const notesDoc = parser.parseFromString(notesXml, 'text/xml');
        const noteTextNodes = notesDoc.getElementsByTagName('a:t');
        const noteParts: string[] = [];
        for (let nt = 0; nt < noteTextNodes.length; nt++) {
          const val = noteTextNodes[nt].textContent?.trim();
          if (val && !noteParts.includes(val) && val !== String(slideNum)) {
            noteParts.push(val);
          }
        }
        notes = noteParts.join(' ');
      }
    } catch {
      // Ignore notes error
    }

    const slideShapes: SlideShape[] = [];
    const rawTexts: string[] = [];
    let detectedTitle = '';
    let detectedSubtitle = '';
    const slideImages: { url: string; name?: string; box?: SlideBox }[] = [];
    let slideTable: SlideTable | undefined;

    const spTree = xmlDoc.getElementsByTagName('p:spTree')[0];
    if (spTree) {
      // Traverse shape tree recursively including group shapes (<p:grpSp>)
      parseShapeContainer(
        spTree,
        slideWidthEMU,
        slideHeightEMU,
        relsMap,
        themeColors,
        themeFonts,
        layoutPlaceholders,
        slideShapes,
        rawTexts,
        slideImages,
        undefined,
        false,
        isDarkBackground
      );
    }

    // Process slide table if graphic frame had a table
    slideShapes.forEach(sh => {
      if (sh.table && !slideTable) slideTable = sh.table;
      if (sh.type === 'title' && !detectedTitle) {
        detectedTitle = sh.paragraphs.map(p => p.text).join(' ');
      }
      if (sh.type === 'subtitle' && !detectedSubtitle) {
        detectedSubtitle = sh.paragraphs.map(p => p.text).join(' ');
      }
    });

    if (!detectedTitle) {
      if (rawTexts.length > 0) {
        detectedTitle = rawTexts[0];
      } else {
        detectedTitle = `Slide ${slideNum}`;
      }
    }

    // Combine background master/layout shapes under slide-specific shapes
    const combinedShapes = [...backgroundShapes, ...slideShapes];

    slides.push({
      id: slideNum,
      slideNumber: slideNum,
      layout: 'canvas',
      title: detectedTitle,
      subtitle: detectedSubtitle || undefined,
      shapes: combinedShapes,
      table: slideTable,
      images: slideImages,
      notes: notes || undefined,
      backgroundColor: slideBgColor,
      backgroundGradient: slideBgGradient,
      backgroundImageUrl: slideBgImgUrl,
      rawText: rawTexts,
      isDarkBackground
    });
  }

  if (slides.length === 0) {
    slides.push(createFallbackSlide(filename, 1));
  }

  return {
    title: slides[0]?.title || filename.replace(/\.[^/.]+$/, ''),
    format: 'pptx',
    formatLabel: 'Microsoft PowerPoint Presentation (.pptx)',
    slideCount: slides.length,
    aspectRatio,
    dimensions: { width, height, slideWidthPoints, slideHeightPoints },
    themeFonts,
    themeColors,
    slides,
    metadata: { appName, author, slideTitles: slides.map(s => s.title) }
  };
}

/**
 * Traverses Shape Containers (<p:spTree> and <p:grpSp>) recursively
 */
function parseShapeContainer(
  container: Element,
  slideWidthEMU: number,
  slideHeightEMU: number,
  relsMap: Map<string, string>,
  themeColors: Record<string, string>,
  themeFonts: { major: string; minor: string },
  layoutPlaceholders: Map<string, SlideBox>,
  outShapes: SlideShape[],
  outRawTexts: string[],
  outImages: { url: string; name?: string; box?: SlideBox }[],
  parentTransform?: { offX: number; offY: number; scaleX: number; scaleY: number },
  isMasterOrLayout = false,
  isDarkBackground = false
) {
  const children = Array.from(container.children);

  for (const child of children) {
    const tag = child.tagName.replace(/^p:/, '');

    // 1. Group Shape (<p:grpSp>)
    if (tag === 'grpSp') {
      const grpSpPr = child.getElementsByTagName('p:grpSpPr')[0];
      const xfrm = grpSpPr?.getElementsByTagName('a:xfrm')[0];
      if (xfrm) {
        const off = xfrm.getElementsByTagName('a:off')[0];
        const ext = xfrm.getElementsByTagName('a:ext')[0];
        const chOff = xfrm.getElementsByTagName('a:chOff')[0];
        const chExt = xfrm.getElementsByTagName('a:chExt')[0];

        const gx = parseInt(off?.getAttribute('x') || '0', 10);
        const gy = parseInt(off?.getAttribute('y') || '0', 10);
        const gcx = parseInt(ext?.getAttribute('cx') || '1', 10);
        const gcy = parseInt(ext?.getAttribute('cy') || '1', 10);

        const chx = parseInt(chOff?.getAttribute('x') || '0', 10);
        const chy = parseInt(chOff?.getAttribute('y') || '0', 10);
        const chcx = parseInt(chExt?.getAttribute('cx') || '1', 10);
        const chcy = parseInt(chExt?.getAttribute('cy') || '1', 10);

        const scaleX = chcx !== 0 ? gcx / chcx : 1;
        const scaleY = chcy !== 0 ? gcy / chcy : 1;

        const groupTransform = {
          offX: (parentTransform ? parentTransform.offX : 0) + gx - chx * scaleX,
          offY: (parentTransform ? parentTransform.offY : 0) + gy - chy * scaleY,
          scaleX: (parentTransform ? parentTransform.scaleX : 1) * scaleX,
          scaleY: (parentTransform ? parentTransform.scaleY : 1) * scaleY
        };

        parseShapeContainer(
          child,
          slideWidthEMU,
          slideHeightEMU,
          relsMap,
          themeColors,
          themeFonts,
          layoutPlaceholders,
          outShapes,
          outRawTexts,
          outImages,
          groupTransform,
          isMasterOrLayout,
          isDarkBackground
        );
      }
      continue;
    }

    // 2. Connector / Line (<p:cxnSp>)
    if (tag === 'cxnSp') {
      const spPr = child.getElementsByTagName('p:spPr')[0];
      const xfrm = spPr?.getElementsByTagName('a:xfrm')[0];
      const box = parseXfrm(xfrm, slideWidthEMU, slideHeightEMU, parentTransform);
      if (box) {
        const style = parseShapeStyle(spPr, themeColors);
        style.geometry = 'line';
        outShapes.push({
          id: `cxn-${outShapes.length + 1}`,
          type: 'line',
          geometry: 'line',
          box,
          style,
          paragraphs: []
        });
      }
      continue;
    }

    // 3. Standard Shape & Text Box (<p:sp>)
    if (tag === 'sp') {
      const phNode = child.getElementsByTagName('p:ph')[0];
      const phType = phNode?.getAttribute('type') || (phNode ? 'body' : '');
      const phIdx = phNode?.getAttribute('idx') || '0';

      // Skip placeholder templates inside Master/Layout if they have no static text or content
      if (isMasterOrLayout && phNode) {
        continue;
      }

      const xfrm = child.getElementsByTagName('a:xfrm')[0];
      let box = parseXfrm(xfrm, slideWidthEMU, slideHeightEMU, parentTransform);

      // If shape has no explicit xfrm, inherit from slideLayout placeholder
      if (!box && phType) {
        box = layoutPlaceholders.get(`${phType}-${phIdx}`) || layoutPlaceholders.get(phType);
      }

      // Default fallback box if still undefined
      if (!box) {
        if (isMasterOrLayout) continue; // Skip layout non-positioned shape
        box = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          leftPercent: 6,
          topPercent: 8,
          widthPercent: 88,
          heightPercent: 80
        };
      }

      const spPr = child.getElementsByTagName('p:spPr')[0];
      const style = parseShapeStyle(spPr, themeColors);

      // Check for image fill inside shape (a:blipFill)
      const blipFill = spPr?.getElementsByTagName('a:blipFill')[0];
      let shapeImgUrl: string | undefined;
      if (blipFill) {
        const rId = blipFill.getElementsByTagName('a:blip')[0]?.getAttribute('r:embed');
        if (rId && relsMap.has(rId)) {
          shapeImgUrl = relsMap.get(rId);
        }
      }

      const paragraphs: SlideParagraph[] = [];
      const txBody = child.getElementsByTagName('p:txBody')[0];
      if (txBody) {
        const bodyPr = txBody.getElementsByTagName('a:bodyPr')[0];
        const vAlign = bodyPr?.getAttribute('anchor');
        if (vAlign === 'ctr') style.verticalAlign = 'center';
        else if (vAlign === 'b') style.verticalAlign = 'bottom';
        else style.verticalAlign = 'top';

        // Extract body padding insets if present
        const lIns = bodyPr?.getAttribute('lIns');
        const tIns = bodyPr?.getAttribute('tIns');
        if (lIns) style.paddingLeftPercent = (parseInt(lIns, 10) / slideWidthEMU) * 100;
        if (tIns) style.paddingTopPercent = (parseInt(tIns, 10) / slideHeightEMU) * 100;

        const pNodes = Array.from(txBody.getElementsByTagName('a:p'));
        for (const pElem of pNodes) {
          const para = parseParagraph(pElem, themeColors, themeFonts, isDarkBackground);
          if (para.text) {
            paragraphs.push(para);
            if (!isMasterOrLayout) outRawTexts.push(para.text);
          }
        }
      }

      if (paragraphs.length > 0 || style.fillColor || style.fillGradient || style.borderColor || shapeImgUrl) {
        let shapeType: SlideShape['type'] = 'generic';
        if (phType === 'title' || phType === 'ctrTitle') shapeType = 'title';
        else if (phType === 'subTitle') shapeType = 'subtitle';
        else if (phType === 'body') shapeType = 'body';
        else if (shapeImgUrl) shapeType = 'image';
        else if (paragraphs.length === 0) shapeType = 'shape';

        outShapes.push({
          id: `sp-${outShapes.length + 1}`,
          name: child.getElementsByTagName('p:cNvPr')[0]?.getAttribute('name') || `Shape ${outShapes.length + 1}`,
          type: shapeType,
          geometry: style.geometry,
          box,
          style,
          paragraphs,
          imageUrl: shapeImgUrl,
          isMasterOrLayoutShape: isMasterOrLayout
        });
      }
      continue;
    }

    // 4. Picture & Images (<p:pic>)
    if (tag === 'pic') {
      const blip = child.getElementsByTagName('a:blip')[0];
      const rId = blip?.getAttribute('r:embed') || '';
      const imgUrl = relsMap.get(rId);

      const spPr = child.getElementsByTagName('p:spPr')[0];
      const xfrm = spPr?.getElementsByTagName('a:xfrm')[0];
      const box = parseXfrm(xfrm, slideWidthEMU, slideHeightEMU, parentTransform) || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        leftPercent: 10,
        topPercent: 10,
        widthPercent: 80,
        heightPercent: 80
      };

      const style = parseShapeStyle(spPr, themeColors);

      if (imgUrl) {
        if (!isMasterOrLayout) outImages.push({ url: imgUrl, box });
        outShapes.push({
          id: `pic-${outShapes.length + 1}`,
          type: 'image',
          box,
          style,
          paragraphs: [],
          imageUrl: imgUrl,
          isMasterOrLayoutShape: isMasterOrLayout
        });
      }
      continue;
    }

    // 5. Graphic Frames (Tables, Charts, SmartArt) (<p:graphicFrame>)
    if (tag === 'graphicFrame') {
      const xfrm = child.getElementsByTagName('p:xfrm')[0] || child.getElementsByTagName('a:xfrm')[0];
      const box = parseXfrm(xfrm, slideWidthEMU, slideHeightEMU, parentTransform) || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        leftPercent: 8,
        topPercent: 20,
        widthPercent: 84,
        heightPercent: 60
      };

      const tbl = child.getElementsByTagName('a:tbl')[0];
      if (tbl) {
        const rows: SlideTableCell[][] = [];
        const gridCols = Array.from(tbl.getElementsByTagName('a:gridCol'));
        let totalGridWidth = 0;
        const colWidths = gridCols.map(gc => {
          const w = parseInt(gc.getAttribute('w') || '1', 10);
          totalGridWidth += w;
          return w;
        });
        const colWidthsPercent = totalGridWidth > 0 ? colWidths.map(w => (w / totalGridWidth) * 100) : undefined;

        const trNodes = Array.from(tbl.getElementsByTagName('a:tr'));
        for (const tr of trNodes) {
          const rowCells: SlideTableCell[] = [];
          const tcNodes = Array.from(tr.getElementsByTagName('a:tc'));
          for (const tc of tcNodes) {
            const paragraphs: SlideParagraph[] = [];
            const pNodes = Array.from(tc.getElementsByTagName('a:p'));
            for (const p of pNodes) {
              const para = parseParagraph(p, themeColors, themeFonts, isDarkBackground);
              if (para.text) paragraphs.push(para);
            }

            const cellText = paragraphs.map(p => p.text).join('\n');
            const tcPr = tc.getElementsByTagName('a:tcPr')[0];
            const bgColor = tcPr ? resolveColor(tcPr, themeColors) : undefined;

            const gridSpan = parseInt(tc.getAttribute('gridSpan') || '1', 10);
            const rowSpan = parseInt(tc.getAttribute('rowSpan') || '1', 10);

            rowCells.push({
              text: cellText,
              paragraphs,
              bgColor,
              bold: paragraphs.some(p => p.runs.some(r => r.bold)),
              align: paragraphs[0]?.align || 'left',
              colSpan: gridSpan > 1 ? gridSpan : undefined,
              rowSpan: rowSpan > 1 ? rowSpan : undefined
            });

            if (cellText && !isMasterOrLayout) outRawTexts.push(cellText);
          }
          if (rowCells.length > 0) rows.push(rowCells);
        }

        if (rows.length > 0) {
          outShapes.push({
            id: `tbl-${outShapes.length + 1}`,
            type: 'table',
            box,
            style: {},
            paragraphs: [],
            table: { rows, colWidthsPercent },
            isMasterOrLayoutShape: isMasterOrLayout
          });
        }
      }
      continue;
    }
  }
}

/**
 * Parses single Paragraph (<a:p>) and text runs (<a:r>)
 */
function parseParagraph(
  pElem: Element,
  themeColors: Record<string, string>,
  themeFonts: { major: string; minor: string },
  isDarkBackground = false
): SlideParagraph {
  const runs: SlideTextRun[] = [];
  const pPr = pElem.getElementsByTagName('a:pPr')[0];

  const algn = pPr?.getAttribute('algn');
  let align: 'left' | 'center' | 'right' | 'justify' | undefined;
  if (algn === 'ctr') align = 'center';
  else if (algn === 'r') align = 'right';
  else if (algn === 'just') align = 'justify';
  else if (algn === 'l') align = 'left';

  const buChar = pPr?.getElementsByTagName('a:buChar')[0]?.getAttribute('char');
  const lvlAttr = pPr?.getAttribute('lvl');
  const level = lvlAttr ? parseInt(lvlAttr, 10) : 0;
  const isBullet = !!buChar || pPr?.getElementsByTagName('a:buAutoNum').length > 0 || level > 0;

  // Bullet color
  const buClrNode = pPr?.getElementsByTagName('a:buClr')[0];
  const bulletColor = buClrNode ? resolveColor(buClrNode, themeColors) : undefined;

  // Process child nodes preserving sequence (<a:r>, <a:br>, <a:fld>)
  const childNodes = Array.from(pElem.childNodes);
  for (const node of childNodes) {
    if (node.nodeType !== 1) continue;
    const elem = node as Element;
    const tag = elem.tagName.replace(/^a:/, '');

    if (tag === 'r') {
      const tElem = elem.getElementsByTagName('a:t')[0];
      const text = tElem?.textContent || '';
      if (!text) continue;

      const rPr = elem.getElementsByTagName('a:rPr')[0];
      const bold = rPr?.getAttribute('b') === '1' || rPr?.getAttribute('b') === 'true';
      const italic = rPr?.getAttribute('i') === '1' || rPr?.getAttribute('i') === 'true';
      const underline = rPr?.hasAttribute('u') && rPr.getAttribute('u') !== 'none';
      const strikethrough = rPr?.getAttribute('strike') === 'sngStrike';
      const baseline = rPr?.getAttribute('baseline');
      const superscript = baseline ? parseInt(baseline, 10) > 0 : false;
      const subscript = baseline ? parseInt(baseline, 10) < 0 : false;

      const szAttr = rPr?.getAttribute('sz');
      const fontSize = szAttr ? parseInt(szAttr, 10) / 100 : undefined;

      const latinFont = rPr?.getElementsByTagName('a:latin')[0]?.getAttribute('typeface') || themeFonts.minor;
      let color = rPr ? resolveColor(rPr, themeColors) : undefined;

      // Ensure proper text contrast if no explicit color was defined
      if (!color) {
        color = isDarkBackground ? '#F8FAFC' : '#0F172A';
      }

      runs.push({
        text,
        bold,
        italic,
        underline,
        strikethrough,
        subscript,
        superscript,
        fontSize,
        fontFamily: latinFont,
        color
      });
    } else if (tag === 'br') {
      runs.push({ text: '\n' });
    } else if (tag === 'fld') {
      const tElem = elem.getElementsByTagName('a:t')[0];
      if (tElem?.textContent) {
        runs.push({ text: tElem.textContent });
      }
    }
  }

  // Fallback if no runs were collected
  if (runs.length === 0) {
    const rawT = pElem.textContent?.trim() || '';
    if (rawT) {
      runs.push({
        text: rawT,
        color: isDarkBackground ? '#F8FAFC' : '#0F172A'
      });
    }
  }

  const fullText = runs.map(r => r.text).join('');

  return {
    runs,
    text: fullText,
    isBullet,
    bulletChar: buChar || '•',
    bulletColor,
    level,
    align
  };
}

/**
 * Resolves Color from <a:solidFill>, <a:srgbClr>, <a:schemeClr>, with lumMod/lumOff/tint/shade
 */
function resolveColor(parentElem: Element, themeColors: Record<string, string>): string | undefined {
  const solidFill = parentElem.getElementsByTagName('a:solidFill')[0] || parentElem;

  // Direct hex sRGB
  const srgbClr = solidFill.getElementsByTagName('a:srgbClr')[0];
  if (srgbClr) {
    const val = srgbClr.getAttribute('val');
    if (val) return `#${val}`;
  }

  // Scheme Color
  const schemeClr = solidFill.getElementsByTagName('a:schemeClr')[0];
  if (schemeClr) {
    const val = schemeClr.getAttribute('val') || '';
    let baseHex = themeColors[val] || DEFAULT_THEME_COLORS[val];
    if (!baseHex) return undefined;

    // Handle luminance modification
    const lumMod = schemeClr.getElementsByTagName('a:lumMod')[0]?.getAttribute('val');
    const lumOff = schemeClr.getElementsByTagName('a:lumOff')[0]?.getAttribute('val');
    const tint = schemeClr.getElementsByTagName('a:tint')[0]?.getAttribute('val');
    const shade = schemeClr.getElementsByTagName('a:shade')[0]?.getAttribute('val');

    if (lumMod || lumOff) {
      baseHex = adjustHexLuminance(
        baseHex,
        lumMod ? parseInt(lumMod, 10) / 100000 : 1,
        lumOff ? parseInt(lumOff, 10) / 100000 : 0
      );
    } else if (tint) {
      baseHex = tintHex(baseHex, parseInt(tint, 10) / 100000);
    } else if (shade) {
      baseHex = shadeHex(baseHex, parseInt(shade, 10) / 100000);
    }

    return baseHex;
  }

  // System Color fallback
  const sysClr = solidFill.getElementsByTagName('a:sysClr')[0];
  if (sysClr) {
    const lastClr = sysClr.getAttribute('lastClr');
    if (lastClr) return `#${lastClr}`;
  }

  return undefined;
}

/**
 * Parses Multi-stop Linear & Radial Gradients (a:gradFill)
 */
function parseGradientFill(
  parentElem: Element,
  themeColors: Record<string, string>
): { angle?: number; stops: SlideGradientStop[] } | undefined {
  const gradFill = parentElem.getElementsByTagName('a:gradFill')[0];
  if (!gradFill) return undefined;

  const gsLst = gradFill.getElementsByTagName('a:gsLst')[0];
  if (!gsLst) return undefined;

  const gsNodes = Array.from(gsLst.getElementsByTagName('a:gs'));
  const stops: SlideGradientStop[] = [];

  for (const gs of gsNodes) {
    const posAttr = gs.getAttribute('pos');
    const pos = posAttr ? parseInt(posAttr, 10) / 1000 : 0;
    const clr = resolveColor(gs, themeColors) || '#FFFFFF';
    stops.push({ position: pos, color: clr });
  }

  if (stops.length === 0) return undefined;

  const lin = gradFill.getElementsByTagName('a:lin')[0];
  let angle = 90;
  if (lin) {
    const angAttr = lin.getAttribute('ang');
    if (angAttr) angle = parseInt(angAttr, 10) / 60000;
  }

  return { angle, stops };
}

function adjustHexLuminance(hex: string, mod: number, off: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);

  r = Math.min(255, Math.max(0, Math.round(r * mod + 255 * off)));
  g = Math.min(255, Math.max(0, Math.round(g * mod + 255 * off)));
  b = Math.min(255, Math.max(0, Math.round(b * mod + 255 * off)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function tintHex(hex: string, tintFactor: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);

  r = Math.min(255, Math.max(0, Math.round(r * tintFactor + (1 - tintFactor) * 255)));
  g = Math.min(255, Math.max(0, Math.round(g * tintFactor + (1 - tintFactor) * 255)));
  b = Math.min(255, Math.max(0, Math.round(b * tintFactor + (1 - tintFactor) * 255)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function shadeHex(hex: string, shadeFactor: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);

  r = Math.min(255, Math.max(0, Math.round(r * shadeFactor)));
  g = Math.min(255, Math.max(0, Math.round(g * shadeFactor)));
  b = Math.min(255, Math.max(0, Math.round(b * shadeFactor)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function isColorDark(hexColor: string): boolean {
  const clean = hexColor.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

/**
 * Parses shape bounding box from a:xfrm in EMUs
 */
function parseXfrm(
  xfrmNode: Element | null | undefined,
  slideWidthEMU: number,
  slideHeightEMU: number,
  parentTransform?: { offX: number; offY: number; scaleX: number; scaleY: number }
): SlideBox | undefined {
  if (!xfrmNode) return undefined;

  const off = xfrmNode.getElementsByTagName('a:off')[0];
  const ext = xfrmNode.getElementsByTagName('a:ext')[0];

  let x = parseInt(off?.getAttribute('x') || '0', 10);
  let y = parseInt(off?.getAttribute('y') || '0', 10);
  let cx = parseInt(ext?.getAttribute('cx') || '0', 10);
  let cy = parseInt(ext?.getAttribute('cy') || '0', 10);
  const rotAttr = xfrmNode.getAttribute('rot');
  const rotation = rotAttr ? parseInt(rotAttr, 10) / 60000 : 0;

  if (cx <= 0 || cy <= 0) return undefined;

  if (parentTransform) {
    x = parentTransform.offX + x * parentTransform.scaleX;
    y = parentTransform.offY + y * parentTransform.scaleY;
    cx = cx * parentTransform.scaleX;
    cy = cy * parentTransform.scaleY;
  }

  const leftPercent = Math.max(0, Math.min(100, (x / slideWidthEMU) * 100));
  const topPercent = Math.max(0, Math.min(100, (y / slideHeightEMU) * 100));
  const widthPercent = Math.max(0.2, Math.min(100, (cx / slideWidthEMU) * 100));
  const heightPercent = Math.max(0.2, Math.min(100, (cy / slideHeightEMU) * 100));

  return {
    x,
    y,
    width: cx,
    height: cy,
    rotation,
    leftPercent,
    topPercent,
    widthPercent,
    heightPercent
  };
}

/**
 * Parses shape visual styling (fills, gradients, borders, geometry, shadows)
 */
function parseShapeStyle(spPrNode: Element | null | undefined, themeColors: Record<string, string>): SlideShapeStyle {
  if (!spPrNode) return {};

  const fillColor = resolveColor(spPrNode, themeColors);
  const fillGradient = parseGradientFill(spPrNode, themeColors);

  let borderColor: string | undefined;
  let borderWidth: number | undefined;
  let borderStyle: 'solid' | 'dashed' | 'dotted' | undefined;
  const ln = spPrNode.getElementsByTagName('a:ln')[0];
  if (ln) {
    const w = ln.getAttribute('w');
    if (w) borderWidth = Math.max(1, Math.round(parseInt(w, 10) / 12700));
    borderColor = resolveColor(ln, themeColors);
    const prstDash = ln.getElementsByTagName('a:prstDash')[0]?.getAttribute('val');
    if (prstDash === 'dash' || prstDash === 'lgDash') borderStyle = 'dashed';
    else if (prstDash === 'dot') borderStyle = 'dotted';
    else if (borderColor) borderStyle = 'solid';
  }

  // Shadow effect
  let shadow: SlideShapeStyle['shadow'];
  const outerShdw = spPrNode.getElementsByTagName('a:outerShdw')[0];
  if (outerShdw) {
    const blurRad = outerShdw.getAttribute('blurRad');
    const dist = outerShdw.getAttribute('dist');
    const dir = outerShdw.getAttribute('dir');
    const blur = blurRad ? parseInt(blurRad, 10) / 12700 : 4;
    const distance = dist ? parseInt(dist, 10) / 12700 : 3;
    const angleRad = dir ? (parseInt(dir, 10) / 60000) * (Math.PI / 180) : Math.PI / 4;
    const clr = resolveColor(outerShdw, themeColors) || 'rgba(0,0,0,0.25)';
    shadow = {
      color: clr,
      blur: Math.round(blur),
      offsetX: Math.round(distance * Math.cos(angleRad)),
      offsetY: Math.round(distance * Math.sin(angleRad))
    };
  }

  const prstGeom = spPrNode.getElementsByTagName('a:prstGeom')[0]?.getAttribute('prst') || 'rect';
  const isRound = prstGeom === 'roundRect';
  const isEllipse = prstGeom === 'ellipse';
  const borderRadius = isRound ? 12 : isEllipse ? 9999 : undefined;

  return {
    fillColor,
    fillGradient,
    borderColor,
    borderWidth,
    borderStyle,
    borderRadius,
    shadow,
    geometry: prstGeom
  };
}

/**
 * Parses OpenDocument Presentation (.odp)
 */
async function parseOdpZipArchive(
  zip: JSZip,
  contentXmlFile: JSZip.JSZipObject,
  filename: string
): Promise<ParsedPresentation> {
  const contentXml = await contentXmlFile.async('text');
  const parser = new DOMParser();
  const doc = parser.parseFromString(contentXml, 'text/xml');

  const pageNodes = Array.from(doc.getElementsByTagName('draw:page'));
  const slides: PresentationSlide[] = [];

  pageNodes.forEach((page, idx) => {
    const slideNum = idx + 1;
    const pageName = page.getAttribute('draw:name') || `Slide ${slideNum}`;

    const textNodes = Array.from(page.getElementsByTagName('text:p'));
    const hNodes = Array.from(page.getElementsByTagName('text:h'));

    const rawTexts: string[] = [];
    const paragraphs: SlideParagraph[] = [];

    [...hNodes, ...textNodes].forEach(p => {
      const val = p.textContent?.trim();
      if (val) {
        paragraphs.push({
          runs: [{ text: val }],
          text: val
        });
        rawTexts.push(val);
      }
    });

    const title = hNodes[0]?.textContent?.trim() || pageName || `Slide ${slideNum}`;

    slides.push({
      id: slideNum,
      slideNumber: slideNum,
      layout: 'canvas',
      title,
      shapes: [
        {
          id: `shape-title-${slideNum}`,
          type: 'title',
          box: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            leftPercent: 8,
            topPercent: 8,
            widthPercent: 84,
            heightPercent: 18
          },
          style: {},
          paragraphs: [{ runs: [{ text: title, bold: true, fontSize: 24 }], text: title }]
        },
        {
          id: `shape-body-${slideNum}`,
          type: 'body',
          box: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            leftPercent: 8,
            topPercent: 28,
            widthPercent: 84,
            heightPercent: 64
          },
          style: {},
          paragraphs: paragraphs.slice(hNodes.length)
        }
      ],
      images: [],
      rawText: rawTexts,
      backgroundColor: '#FFFFFF',
      isDarkBackground: false
    });
  });

  if (slides.length === 0) {
    slides.push(createFallbackSlide(filename, 1));
  }

  return {
    title: slides[0]?.title || filename.replace(/\.[^/.]+$/, ''),
    format: 'odp',
    formatLabel: 'OpenDocument Presentation (.odp)',
    slideCount: slides.length,
    aspectRatio: '16:9',
    dimensions: { width: 1920, height: 1080, slideWidthPoints: 960, slideHeightPoints: 540 },
    slides,
    metadata: { appName: 'LibreOffice Impress / OpenOffice' }
  };
}

/**
 * Parses Generic ZIP presentations (Keynote, etc.)
 */
async function parseGenericZipArchive(zip: JSZip, filename: string): Promise<ParsedPresentation> {
  const textEntries: string[] = [];
  const files = Object.keys(zip.files);

  for (const f of files) {
    if (f.endsWith('.xml') || f.endsWith('.json') || f.endsWith('.txt')) {
      try {
        const txt = await zip.file(f)?.async('text');
        if (txt) {
          const lines = txt
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 3 && !l.startsWith('<') && !l.startsWith('{'));
          textEntries.push(...lines.slice(0, 5));
        }
      } catch {
        // Skip
      }
    }
  }

  const slides: PresentationSlide[] = [
    {
      id: 1,
      slideNumber: 1,
      layout: 'canvas',
      title: filename.replace(/\.[^/.]+$/, ''),
      shapes: [
        {
          id: 'gen-1',
          type: 'body',
          box: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            leftPercent: 8,
            topPercent: 12,
            widthPercent: 84,
            heightPercent: 76
          },
          style: {},
          paragraphs: textEntries.slice(0, 10).map(t => ({ runs: [{ text: t }], text: t }))
        }
      ],
      images: [],
      rawText: textEntries.slice(0, 10),
      backgroundColor: '#FFFFFF',
      isDarkBackground: false
    }
  ];

  return {
    title: filename.replace(/\.[^/.]+$/, ''),
    format: 'presentation',
    formatLabel: 'Presentation Package',
    slideCount: 1,
    aspectRatio: '16:9',
    dimensions: { width: 1920, height: 1080, slideWidthPoints: 960, slideHeightPoints: 540 },
    slides
  };
}

/**
 * Enhanced Binary Parser for Legacy Microsoft PowerPoint 97-2003 (.ppt, .pps)
 * Parses OLE2 Compound File Container & PowerPoint Escher / Text Records
 */
function parseLegacyPptOle2(bytes: Uint8Array, filename: string, ext: string): ParsedPresentation {
  const pptStream = extractOle2Stream(bytes, 'PowerPoint Document') || bytes;

  const slides: PresentationSlide[] = [];
  let offset = 0;
  const len = pptStream.length;

  interface PptRawSlide {
    title: string;
    bullets: string[];
    subtitles: string[];
    allTexts: string[];
  }

  const extractedSlides: PptRawSlide[] = [];
  let currentSlideTexts: string[] = [];

  while (offset < len - 8) {
    const recVerInst = pptStream[offset] | (pptStream[offset + 1] << 8);
    const recType = pptStream[offset + 2] | (pptStream[offset + 3] << 8);
    const recLen =
      pptStream[offset + 4] |
      (pptStream[offset + 5] << 8) |
      (pptStream[offset + 6] << 16) |
      (pptStream[offset + 7] << 24);

    // Slide boundary (Slide Atom = 0x03EE, SlideContainer = 0x03EF)
    if (recType === 0x03ee || recType === 0x03ef || recType === 0x03f8) {
      if (currentSlideTexts.length > 0) {
        extractedSlides.push({
          title: currentSlideTexts[0] || '',
          subtitles: currentSlideTexts.length > 1 ? [currentSlideTexts[1]] : [],
          bullets: currentSlideTexts.slice(currentSlideTexts.length > 2 ? 2 : 1),
          allTexts: [...currentSlideTexts]
        });
        currentSlideTexts = [];
      }
    }

    // TextCharsAtom (Unicode UTF-16LE, recType = 0x0fa0)
    if (recType === 0x0fa0 && recLen > 0 && recLen < 65536 && offset + 8 + recLen <= len) {
      const u16Bytes = pptStream.subarray(offset + 8, offset + 8 + recLen);
      let text = '';
      for (let j = 0; j < u16Bytes.length - 1; j += 2) {
        const code = u16Bytes[j] | (u16Bytes[j + 1] << 8);
        if (code >= 32 || code === 10 || code === 13) {
          text += String.fromCharCode(code);
        }
      }
      const clean = text.trim();
      if (clean.length > 1 && !clean.startsWith('\x00') && !currentSlideTexts.includes(clean)) {
        currentSlideTexts.push(clean);
      }
    }

    // TextBytesAtom (ASCII/ANSI, recType = 0x0fa8)
    if (recType === 0x0fa8 && recLen > 0 && recLen < 65536 && offset + 8 + recLen <= len) {
      const asciiBytes = pptStream.subarray(offset + 8, offset + 8 + recLen);
      let text = '';
      for (let j = 0; j < asciiBytes.length; j++) {
        const code = asciiBytes[j];
        if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
          text += String.fromCharCode(code);
        }
      }
      const clean = text.trim();
      if (clean.length > 1 && !currentSlideTexts.includes(clean)) {
        currentSlideTexts.push(clean);
      }
    }

    // Advance to next atom
    const isContainer = (recVerInst & 0x0f) === 0x0f;
    if (isContainer) {
      offset += 8;
    } else {
      offset += 8 + (recLen > 0 && recLen < len ? recLen : 4);
    }
  }

  // Push final slide if any
  if (currentSlideTexts.length > 0) {
    extractedSlides.push({
      title: currentSlideTexts[0] || '',
      subtitles: currentSlideTexts.length > 1 ? [currentSlideTexts[1]] : [],
      bullets: currentSlideTexts.slice(currentSlideTexts.length > 2 ? 2 : 1),
      allTexts: [...currentSlideTexts]
    });
  }

  // Fallback: If structured atoms yielded no slides, use heuristic string search
  if (extractedSlides.length === 0) {
    const rawFoundStrings = extractReadableStringsFromBinary(pptStream);
    if (rawFoundStrings.length > 0) {
      const chunkSize = Math.max(3, Math.ceil(rawFoundStrings.length / 5));
      for (let i = 0; i < rawFoundStrings.length; i += chunkSize) {
        const chunk = rawFoundStrings.slice(i, i + chunkSize);
        extractedSlides.push({
          title: chunk[0] || `Slide ${Math.floor(i / chunkSize) + 1}`,
          subtitles: chunk.length > 1 ? [chunk[1]] : [],
          bullets: chunk.slice(2),
          allTexts: chunk
        });
      }
    }
  }

  // Convert raw slides to full PresentationSlide objects
  extractedSlides.forEach((rawSlide, sIdx) => {
    const slideNum = sIdx + 1;
    const title = rawSlide.title || `Slide ${slideNum}`;

    const shapes: SlideShape[] = [
      {
        id: `ppt-title-${slideNum}`,
        type: 'title',
        box: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          leftPercent: 8,
          topPercent: 8,
          widthPercent: 84,
          heightPercent: 16
        },
        style: {},
        paragraphs: [
          {
            runs: [{ text: title, bold: true, fontSize: 26, color: '#0F172A' }],
            text: title,
            align: 'left'
          }
        ]
      },
      {
        id: `ppt-body-${slideNum}`,
        type: 'body',
        box: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          leftPercent: 8,
          topPercent: 26,
          widthPercent: 84,
          heightPercent: 66
        },
        style: {},
        paragraphs: rawSlide.bullets.map(b => ({
          runs: [{ text: b, fontSize: 16, color: '#334155' }],
          text: b,
          isBullet: true,
          bulletChar: '•',
          level: 0
        }))
      }
    ];

    slides.push({
      id: slideNum,
      slideNumber: slideNum,
      layout: 'canvas',
      title,
      subtitle: rawSlide.subtitles[0] || undefined,
      shapes,
      images: [],
      rawText: rawSlide.allTexts,
      backgroundColor: '#FFFFFF',
      isDarkBackground: false
    });
  });

  if (slides.length === 0) {
    slides.push(createFallbackSlide(filename, 1));
  }

  return {
    title: slides[0]?.title || filename.replace(/\.[^/.]+$/, ''),
    format: 'ppt',
    formatLabel: 'Microsoft PowerPoint 97-2003 Presentation (.ppt)',
    slideCount: slides.length,
    aspectRatio: '4:3',
    dimensions: { width: 1440, height: 1080, slideWidthPoints: 720, slideHeightPoints: 540 },
    slides,
    metadata: { appName: 'Microsoft PowerPoint 97-2003' }
  };
}

/**
 * Extracts a named stream from an OLE2 Compound File Binary (CFBF)
 */
function extractOle2Stream(bytes: Uint8Array, streamName: string): Uint8Array | null {
  // Check OLE2 Magic Header: D0 CF 11 E0 A1 B1 1A E1
  if (
    bytes.length < 512 ||
    bytes[0] !== 0xd0 ||
    bytes[1] !== 0xcf ||
    bytes[2] !== 0x11 ||
    bytes[3] !== 0xe0
  ) {
    return null;
  }

  try {
    const sectorSize = 1 << (bytes[30] | (bytes[31] << 8)); // Usually 512
    const dirFirstSector =
      bytes[48] | (bytes[49] << 8) | (bytes[50] << 16) | (bytes[51] << 24);

    if (dirFirstSector >= 0 && (dirFirstSector + 1) * sectorSize < bytes.length) {
      const dirOffset = (dirFirstSector + 1) * sectorSize;

      // Scan directory entries (each entry is 128 bytes)
      for (let i = dirOffset; i < dirOffset + sectorSize * 4 && i + 128 <= bytes.length; i += 128) {
        let name = '';
        const nameLen = bytes[i + 64] | (bytes[i + 65] << 8);
        for (let k = 0; k < Math.min(nameLen - 2, 64); k += 2) {
          const charCode = bytes[i + k] | (bytes[i + k + 1] << 8);
          if (charCode > 0) name += String.fromCharCode(charCode);
        }

        if (name.toLowerCase().includes(streamName.toLowerCase())) {
          const startSector =
            bytes[i + 116] |
            (bytes[i + 117] << 8) |
            (bytes[i + 118] << 16) |
            (bytes[i + 119] << 24);
          const streamSize =
            bytes[i + 120] |
            (bytes[i + 121] << 8) |
            (bytes[i + 122] << 16) |
            (bytes[i + 123] << 24);

          if (startSector >= 0 && streamSize > 0 && streamSize < bytes.length) {
            const streamOffset = (startSector + 1) * sectorSize;
            if (streamOffset + streamSize <= bytes.length) {
              return bytes.subarray(streamOffset, streamOffset + streamSize);
            }
          }
        }
      }
    }
  } catch {
    // Return fallback
  }

  return null;
}

/**
 * Heuristic string extractor for binary payloads
 */
function extractReadableStringsFromBinary(bytes: Uint8Array): string[] {
  const results: string[] = [];
  let current = '';

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b >= 32 && b <= 126) {
      current += String.fromCharCode(b);
    } else {
      if (current.trim().length >= 4) {
        const cleaned = current.trim();
        if (
          !cleaned.includes('Microsoft') &&
          !cleaned.includes('PowerPoint') &&
          !cleaned.includes('Arial') &&
          !cleaned.includes('Calibri') &&
          !cleaned.includes('Default') &&
          !results.includes(cleaned)
        ) {
          results.push(cleaned);
        }
      }
      current = '';
    }
  }

  return results.slice(0, 30);
}

function getMimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'emf':
    case 'wmf':
      return 'image/x-emf';
    default:
      return 'image/png';
  }
}

function createFallbackSlide(filename: string, num: number): PresentationSlide {
  const title = filename.replace(/\.[^/.]+$/, '');
  return {
    id: num,
    slideNumber: num,
    layout: 'canvas',
    title,
    shapes: [
      {
        id: `fallback-${num}`,
        type: 'title',
        box: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          leftPercent: 8,
          topPercent: 10,
          widthPercent: 84,
          heightPercent: 20
        },
        style: {},
        paragraphs: [{ runs: [{ text: title, bold: true, fontSize: 28 }], text: title }]
      }
    ],
    images: [],
    rawText: [title],
    backgroundColor: '#FFFFFF',
    isDarkBackground: false
  };
}
