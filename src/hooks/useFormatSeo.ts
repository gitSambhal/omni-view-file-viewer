/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Dynamic Document Head & SEO Synchronizer Hook (applet-seo)
 */

import { useEffect } from 'react';
import { getFormatSeo, generateFormatJsonLd, FormatSeoRecord } from '../data/formatSeoData';

interface UseFormatSeoOptions {
  activeFileName?: string | null;
  activeFormatId?: string | null;
  baseCanonicalUrl?: string;
}

export function useFormatSeo({
  activeFileName,
  activeFormatId,
  baseCanonicalUrl = 'https://file.suhail.top'
}: UseFormatSeoOptions) {
  useEffect(() => {
    // Determine target format
    let targetRecord: FormatSeoRecord | null = null;

    if (activeFileName) {
      targetRecord = getFormatSeo(activeFileName);
    } else if (activeFormatId) {
      targetRecord = getFormatSeo(activeFormatId);
    }

    // Default general SEO
    const defaultTitle = 'OmniView File Viewer - Offline & Local File Previewer';
    const defaultDesc =
      '100% offline & local file preview studio with multi-tab workspace, live file sync, dark mode, and support for PDFs, Office docs, code, databases, media & archives.';
    const defaultKeywords =
      'file viewer, offline pdf viewer, docx viewer, excel viewer, code editor, live file sync, json viewer, database viewer, hex viewer, local file previewer, suhail akhtar';

    const title = targetRecord
      ? activeFileName
        ? `${activeFileName} - ${targetRecord.name} | OmniView`
        : targetRecord.title
      : defaultTitle;

    const description = targetRecord ? targetRecord.metaDescription : defaultDesc;
    const keywords = targetRecord ? targetRecord.keywords.join(', ') : defaultKeywords;
    const ogTitle = targetRecord ? targetRecord.ogTitle : defaultTitle;
    const ogDescription = targetRecord ? targetRecord.ogDescription : defaultDesc;

    // Update document title
    document.title = title;

    // Update or create meta tags helper
    const updateMetaTag = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name="')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) element.setAttribute('name', name);
        } else if (selector.startsWith('meta[property="')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) element.setAttribute('property', prop);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[property="og:title"]', 'content', ogTitle);
    updateMetaTag('meta[property="og:description"]', 'content', ogDescription);
    updateMetaTag('meta[name="twitter:title"]', 'content', ogTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', ogDescription);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const currentUrl = targetRecord && activeFormatId
      ? `${baseCanonicalUrl}/?format=${targetRecord.id}`
      : baseCanonicalUrl;
    canonical.setAttribute('href', currentUrl);

    // Injected JSON-LD Schema
    const scriptId = 'omniview-dynamic-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (targetRecord) {
      const jsonLdData = generateFormatJsonLd(targetRecord, currentUrl);
      scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);
    }
  }, [activeFileName, activeFormatId, baseCanonicalUrl]);
}
