import { SlidePage, SlideDeck } from './db';

let pdfjsPromise: Promise<any> | null = null;

// Dynamically load PDF.js library and worker from CDN
export const loadPdfJs = (): Promise<any> => {
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      // Configure CDN worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = (err) => {
      pdfjsPromise = null;
      reject(new Error('Failed to load PDF.js CDN script. Check your network connection.'));
    };
    document.head.appendChild(script);
  });

  return pdfjsPromise;
};

// Dominant color sampler using a fast pixel grid traversal
const sampleDominantColors = (canvas: HTMLCanvasElement): string[] => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return ['#10b981', '#8b5cf6', '#f59e0b']; // fallbacks
  
  const w = canvas.width;
  const h = canvas.height;
  
  // Safe read image data
  let imgData: Uint8ClampedArray;
  try {
    imgData = ctx.getImageData(0, 0, w, h).data;
  } catch (e) {
    // If CORS or security error, return static palette
    return ['#10b981', '#8b5cf6', '#f59e0b'];
  }
  
  const colors: {r: number, g: number, b: number, count: number}[] = [];
  // Sample roughly 200 pixels in a grid
  const sampleStep = Math.max(4, Math.floor(Math.sqrt((w * h) / 200)));
  
  for (let y = 0; y < h; y += sampleStep) {
    for (let x = 0; x < w; x += sampleStep) {
      const idx = (y * w + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx+1];
      const b = imgData[idx+2];
      const a = imgData[idx+3];
      
      if (a < 50) continue; // ignore transparent
      
      // Filter out absolute dark backgrounds (<35) and text highlights (>220)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness < 35 || brightness > 220) continue; 
      
      // Cluster colors within distance threshold
      let found = false;
      for (const c of colors) {
        const d = Math.sqrt((c.r - r)**2 + (c.g - g)**2 + (c.b - b)**2);
        if (d < 35) {
          c.count++;
          c.r = Math.round((c.r + r) / 2);
          c.g = Math.round((c.g + g) / 2);
          c.b = Math.round((c.b + b) / 2);
          found = true;
          break;
        }
      }
      if (!found) {
        colors.push({ r, g, b, count: 1 });
      }
    }
  }
  
  // Sort colors by occurrence count
  colors.sort((a, b) => b.count - a.count);
  
  // Format as Hex
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  const hexColors = colors.slice(0, 3).map(c => `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`);
  
  // Ensure we always return at least 3 distinct options
  if (hexColors.length < 1) hexColors.push('#10b981'); // Emerald
  if (hexColors.length < 2) hexColors.push('#8b5cf6'); // Purple
  if (hexColors.length < 3) hexColors.push('#f59e0b'); // Amber
  
  return hexColors;
};

// Auto-extract acronyms and gnostic keywords
const KEYWORDS = [
  'NHI', 'UAP', 'PROPULSION', 'ANTI-GRAVITY', 'AETHER', 
  'LOCKHEED', 'MAJESTIC 12', 'SOPHIA', 'GNOSTIC', 'COHERENCE', 
  'NEGENTROPY', 'SIDEREAL', 'PENTAGON', 'DECLASSIFIED', 'TESLA',
  'ELECTROMAGNETIC', 'VIBRATION', 'GEMATRIA', 'FREQUENCY', 'CHLADNI',
  'RESONANCE', 'GRAVITATIONAL', 'WARP', 'EXOTIC PHYSICS', 'PORTAL'
];

const extractEntities = (text: string): string[] => {
  const found = new Set<string>();
  const upperText = text.toUpperCase();
  
  for (const keyword of KEYWORDS) {
    if (upperText.includes(keyword)) {
      found.add(keyword);
    }
  }
  
  // Acronym finder: words containing 3-6 uppercase letters
  const acronymRegex = /\b[A-Z]{3,6}\b/g;
  const matches = text.match(acronymRegex);
  if (matches) {
    for (const match of matches) {
      if (!['THE', 'AND', 'FOR', 'YOU', 'ARE', 'NOT', 'ITS', 'WITH', 'THIS', 'THAT'].includes(match)) {
        found.add(match);
      }
    }
  }
  
  return Array.from(found).slice(0, 8); // return top 8
};

// Harvest representative sentences to feed intelligence tickers
const extractQuotes = (text: string): string[] => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const cleanSentences = sentences
    .map(s => s.trim().replace(/\s+/g, ' '))
    // Sentences of suitable ticker length
    .filter(s => s.length >= 60 && s.length <= 150 && !s.includes('[') && !s.includes('---'));
  
  return Array.from(new Set(cleanSentences)).slice(0, 10);
};

// Primary parser entrypoint
export const parsePdfDeck = async (
  file: File, 
  progressCallback?: (percent: number) => void
): Promise<Omit<SlideDeck, 'id' | 'uploadedAt' | 'harmonicSignature'>> => {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  // Load PDF document
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  
  const pages: SlidePage[] = [];
  let combinedText = '';
  const allPalettes: string[][] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    
    // 1. Text Harvesting
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    combinedText += ' ' + pageText;
    
    // 2. Page Rendering & Color Sampling (Only on page 1 to extract the deck's theme palette)
    if (i === 1) {
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        // 3. Color Sampling
        const pagePalette = sampleDominantColors(canvas);
        allPalettes.push(pagePalette);
      }
    }
    
    pages.push({
      pageNumber: i,
      text: pageText
    });
    
    if (progressCallback) {
      progressCallback(Math.round((i / totalPages) * 100));
    }
  }
  
  // Aggregate color palettes (use the most frequent colors across pages)
  const colorCount: Record<string, number> = {};
  allPalettes.flat().forEach(color => {
    colorCount[color] = (colorCount[color] || 0) + 1;
  });
  const colorPalette = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
  
  // Fill color palette if lacking
  while (colorPalette.length < 3) {
    colorPalette.push('#10b981');
  }
  
  const entities = extractEntities(combinedText);
  const quotes = extractQuotes(combinedText);
  
  return {
    name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
    totalPages,
    colorPalette,
    entities,
    quotes,
    pages
  };
};
