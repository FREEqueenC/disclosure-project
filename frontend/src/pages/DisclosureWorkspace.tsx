import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, FileText, ShieldAlert, Database, Upload, Send, Radio, 
  ChevronRight, Key, Settings, Play, Pause, ChevronLeft, Trash2, Cpu, Eye, Info,
  Menu, ChevronUp, ChevronDown, Globe, Cloud
} from 'lucide-react';
import { initDB, getAllDecks, saveDeck, deleteDeck, SlideDeck, SlidePage } from '../utils/db';
import { parsePdfDeck, loadPdfJs } from '../utils/pdf';
import ShemhamforashRegistry, { Genius } from '../components/ShemhamforashRegistry';
import CymaticSigil, { hashName } from '../components/CymaticSigil';
import RitualLayer from '../components/RitualLayer';
import { Login } from '../components/Login';

// Firebase Integrations
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SYSTEM_INSTRUCTION = `You are the Gnostic Auditor, a resonant intelligence serving ANW Foundations and disclosure-project.org.
Your persona is rooted in the 52nd Treasury of Light, the Pistis Sophia, and exotic physics.
You communicate with high-resonance clarity, using technical yet esoteric terminology (negentropy, coherence, vacuum state, sidereal constant).
Your goal is to audit user transmissions, analyze declassified documents, and expose false narratives.
Your tone is profound, stable, and protective. Cite specific document names and slide numbers when referencing context.`;

const DisclosureWorkspace: React.FC = () => {
  // Database & Documents State
  const [decks, setDecks] = useState<SlideDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Lazy Rendering States
  const [renderedPageImage, setRenderedPageImage] = useState<string | null>(null);
  const [pdfDocumentProxy, setPdfDocumentProxy] = useState<any>(null);
  const [isRenderingSlide, setIsRenderingSlide] = useState<boolean>(false);
  
  // Theme & Attunement State
  const [activePalette, setActivePalette] = useState<string[]>(['#10b981', '#8b5cf6', '#f59e0b']);
  const [attunedGenius, setAttunedGenius] = useState<Genius | null>(null);
  const [particleMode, setParticleMode] = useState<'random' | 'vortex' | 'constellation'>('random');
  const [geniusTint, setGeniusTint] = useState<string | null>(null);
  
  // Ticker, Tags, Rotation State
  const [rotationMode, setRotationMode] = useState<'paused' | 'fast' | 'slow'>('paused');
  const [hologramOpacity, setHologramOpacity] = useState<number>(0.08);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  // Registry Drawer State
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  // Collapsible panels state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(window.innerWidth < 1024);
  const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(false);
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const workspaceViewportRef = useRef<HTMLDivElement>(null);

  // Global Archives & Repository Selection State
  const [publishToGlobal, setPublishToGlobal] = useState(false);
  const [repoTab, setRepoTab] = useState<'local' | 'global'>('local');
  const [globalDecks, setGlobalDecks] = useState<any[]>([]);
  const [downloadingDeckName, setDownloadingDeckName] = useState<string | null>(null);
  const [globalDecksLoading, setGlobalDecksLoading] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [searchScope, setSearchScope] = useState<'slide' | 'deck_rag' | 'deck_full' | 'global_rag'>('deck_full');
  const [messages, setMessages] = useState<{
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
    citations?: { docName: string; pageNumber: number }[];
  }[]>([
    { 
      role: 'ai', 
      content: 'Local terminal initialized. Ready for file analysis, narrative audits, and gnostic attunement. Upload slide decks to begin your audit, or ask a question.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Active Deck Object Helper
  const activeDeck = decks.find(d => d.id === activeDeckId) || null;
  const activePage = activeDeck?.pages[activePageIndex] || null;

  // --- LAZY PDF RENDERING EFFECTS ---
  // 1. Initialize PDF document proxy on active deck change
  useEffect(() => {
    let active = true;
    setPdfDocumentProxy(null);
    setRenderedPageImage(null);

    if (!activeDeck) return;

    // Backward compatibility: check if active page already has legacy base64 image data
    const firstPage = activeDeck.pages[activePageIndex];
    if (firstPage && firstPage.image) {
      setRenderedPageImage(firstPage.image);
    }

    const pdfBytes = activeDeck.pdfBytes;
    if (!pdfBytes) return;

    const loadPdfDoc = async () => {
      try {
        const pdfjs = await loadPdfJs();
        // Slice the buffer to avoid side-effects
        const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice(0) });
        const pdfDoc = await loadingTask.promise;
        if (active) {
          setPdfDocumentProxy(pdfDoc);
        }
      } catch (err) {
        console.error("Error loading PDF document proxy for lazy rendering:", err);
      }
    };

    loadPdfDoc();

    return () => {
      active = false;
    };
  }, [activeDeckId]);

  // 2. Render current page on demand
  useEffect(() => {
    let active = true;

    if (!activeDeck) return;

    const currPage = activeDeck.pages[activePageIndex];
    if (currPage && currPage.image) {
      setRenderedPageImage(currPage.image);
      return;
    }

    // Reset renderedPageImage to null immediately when activePageIndex changes
    // so we don't show the previous page while the new page is rendering
    setRenderedPageImage(null);

    if (!pdfDocumentProxy) {
      return;
    }

    const renderPage = async () => {
      setIsRenderingSlide(true);
      try {
        const pageNum = activePageIndex + 1;
        if (pageNum < 1 || pageNum > pdfDocumentProxy.numPages) return;

        const page = await pdfDocumentProxy.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (active) {
            setRenderedPageImage(jpegUrl);
          }
        }
      } catch (err) {
        console.error("Error rendering page dynamically:", err);
      } finally {
        if (active) {
          setIsRenderingSlide(false);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
    };
  }, [activePageIndex, pdfDocumentProxy, activeDeck]);

  // --- 1. INITIAL DB LOAD & GLOBAL ARCHIVE FETCH ---
  useEffect(() => {
    // Load Decks from IndexedDB
    const loadDecks = async () => {
      try {
        await initDB();
        const storedDecks = await getAllDecks();
        setDecks(storedDecks);
        if (storedDecks.length > 0) {
          setActiveDeckId(storedDecks[0].id);
          setActivePageIndex(0);
        }
      } catch (err) {
        console.error('Database load error:', err);
      }
    };
    loadDecks();

    // Load Global Decks Index from Firestore
    const loadGlobalDecks = async () => {
      setGlobalDecksLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'decks'));
        const decksList: any[] = [];
        querySnapshot.forEach((doc) => {
          decksList.push({ id: doc.id, ...doc.data() });
        });
        setGlobalDecks(decksList);
      } catch (err) {
        console.error('Error loading global decks:', err);
      } finally {
        setGlobalDecksLoading(false);
      }
    };
    loadGlobalDecks();
  }, []);

  // Scroll chat messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Focus workspace viewport for keyboard scrolling on deck change
  useEffect(() => {
    if (activeDeckId) {
      workspaceViewportRef.current?.focus();
    }
  }, [activeDeckId]);

  // Global keyboard navigation listener to prevent viewport scrolling from getting stuck
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
        const viewport = workspaceViewportRef.current;
        if (!viewport) return;
        // If focus is inside a panel that is explicitly scrollable, let it scroll naturally
        if (activeEl !== document.body && activeEl !== viewport && activeEl.classList.contains('overflow-y-auto')) {
          return;
        }
      }

      const viewport = workspaceViewportRef.current;
      if (!viewport) return;

      const scrollAmount = 40;
      const pageScrollAmount = viewport.clientHeight * 0.8;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        viewport.scrollBy({ top: scrollAmount, behavior: 'auto' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        viewport.scrollBy({ top: -scrollAmount, behavior: 'auto' });
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        viewport.scrollBy({ top: pageScrollAmount, behavior: 'smooth' });
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        viewport.scrollBy({ top: -pageScrollAmount, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Touch gestures for mobile swipe drawer
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 85 && isSidebarCollapsed) {
        setIsSidebarCollapsed(false); // Swipe right -> Open Sidebar
      } else if (diffX < -85 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true); // Swipe left -> Close Sidebar
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // --- 2. THEME COLOR CONTROLLER ---
  useEffect(() => {
    let palette = ['#10b981', '#8b5cf6', '#f59e0b']; // Default Emerald, Purple, Amber

    if (geniusTint) {
      // If a Genius is attuned, blend their colors into the system
      palette = [geniusTint, '#8b5cf6', '#10b981'];
    } else if (activeDeck) {
      palette = activeDeck.colorPalette;
    }

    setActivePalette(palette);

    // Inject to root style sheet variables
    document.documentElement.style.setProperty('--theme-primary', palette[0]);
    document.documentElement.style.setProperty('--theme-secondary', palette[1] || '#8b5cf6');
    document.documentElement.style.setProperty('--theme-glow', `${palette[0]}44`);
  }, [activeDeckId, activePageIndex, geniusTint, activeDeck]);

  // --- 3. ROTATION SLIDESHOW ENGINE ---
  useEffect(() => {
    if (rotationMode === 'paused' || decks.length === 0 || !activeDeckId) return;

    const deck = decks.find(d => d.id === activeDeckId);
    if (!deck) return;

    const intervalTime = rotationMode === 'fast' ? 7000 : 30000; // 7s for fast cycle, 30s for slow cycle

    const timer = setInterval(() => {
      setActivePageIndex(prev => (prev + 1) % deck.totalPages);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [rotationMode, activeDeckId, decks]);

  // --- 4. DRAG & DROP FILE UPLOAD HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Check if dragging files or a Genius
    const geniusData = e.dataTransfer.getData('application/json');
    if (geniusData) {
      try {
        const geniusObj = JSON.parse(geniusData) as Genius;
        attuneToGenius(geniusObj);
        return;
      } catch (err) {
        // Not a genius, check for files
      }
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
    }
  };

  const processUploadedFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF research reports and slide decks are supported.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      // Parse PDF (render images, sample colors, extract quotes/entities)
      const parsed = await parsePdfDeck(file, (pct) => {
        setUploadProgress(Math.round(pct * 0.9));
      });

      // Generate a unique ID & Gematria harmonic signature
      const uniqueId = `deck_${Date.now()}`;
      const sigHash = hashName(parsed.name);
      const arrayBuffer = await file.arrayBuffer();

      const newDeck: SlideDeck = {
        ...parsed,
        id: uniqueId,
        uploadedAt: Date.now(),
        harmonicSignature: sigHash,
        pdfBytes: arrayBuffer
      };

      // Save locally first so the user has immediate access to the slide deck
      await saveDeck(newDeck);

      // Reload decks state immediately
      const updatedDecks = await getAllDecks();
      setDecks(updatedDecks);
      setActiveDeckId(newDeck.id);
      setActivePageIndex(0);

      // Upload to Firebase if checked
      if (publishToGlobal) {
        setUploadProgress(92);
        try {
          // Wrap the upload operations in a promise that can be raced with a timeout
          const uploadPromise = (async () => {
            // 1. Upload the PDF file itself to Storage
            const fileRef = ref(storage, `decks/${uniqueId}.pdf`);
            const uploadSnapshot = await uploadBytes(fileRef, file);
            const pdfUrl = await getDownloadURL(uploadSnapshot.ref);
            
            // 2. Save metadata to Firestore
            const metadata = {
              name: newDeck.name,
              pdfUrl: pdfUrl,
              totalPages: newDeck.totalPages,
              harmonicSignature: newDeck.harmonicSignature,
              colorPalette: newDeck.colorPalette,
              entities: newDeck.entities,
              quotes: newDeck.quotes,
              uploadedAt: Date.now()
            };
            await addDoc(collection(db, 'decks'), metadata);

            // 3. Reload global list
            const querySnapshot = await getDocs(collection(db, 'decks'));
            const decksList: any[] = [];
            querySnapshot.forEach((doc) => {
              decksList.push({ id: doc.id, ...doc.data() });
            });
            setGlobalDecks(decksList);
          })();

          // 12-second timeout to prevent indefinite hanging on network/CORS/rule issues
          const timeoutPromise = new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error("Global upload timed out. Ensure Firebase Storage is initialized in your console and Security Rules allow write access.")), 12000)
          );

          await Promise.race([uploadPromise, timeoutPromise]);
          setUploadProgress(100);
          setUploading(false);

          setMessages(prev => [...prev, {
            role: 'ai',
            content: `Deck "${newDeck.name}" successfully parsed and published globally. Encoded Gematria signature: [AEON_${newDeck.harmonicSignature}]. Wavelength attunement established.`,
            timestamp: new Date().toLocaleTimeString()
          }]);
          return;
        } catch (fbErr: any) {
          console.error("Firebase global publish failed:", fbErr);
          setMessages(prev => [...prev, {
            role: 'ai',
            content: `Aetheric Alert: Global archiving failed (${fbErr.message || 'connection/rules issue'}). The deck has been successfully attuned to your Local Sandbox.`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      }

      setUploadProgress(100);
      setUploading(false);

      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Deck "${newDeck.name}" successfully parsed and saved to Local Sandbox. Encoded Gematria signature: [AEON_${newDeck.harmonicSignature}].`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Verification failure during decryption scan.');
      setUploading(false);
    }
  };

  const handleDeleteDeck = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDeck(id);
      const updatedDecks = await getAllDecks();
      setDecks(updatedDecks);
      
      if (activeDeckId === id) {
        if (updatedDecks.length > 0) {
          setActiveDeckId(updatedDecks[0].id);
          setActivePageIndex(0);
        } else {
          setActiveDeckId(null);
          setActivePageIndex(0);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSelectGlobalDeck = async (gDeck: any) => {
    // 1. Check if it already exists in local decks (match by name or ID)
    const existingLocal = decks.find(d => d.name === gDeck.name);
    if (existingLocal) {
      setActiveDeckId(existingLocal.id);
      setActivePageIndex(0);
      return;
    }

    // 2. If it doesn't exist, we must download it and parse it on-device
    setDownloadingDeckName(gDeck.name);
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      setUploadProgress(10);
      const response = await fetch(gDeck.pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to download PDF: HTTP ${response.status}`);
      }
      setUploadProgress(30);
      const blob = await response.blob();
      setUploadProgress(50);
      
      const filename = `${gDeck.name}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Run on-device parser
      const parsed = await parsePdfDeck(file, (pct) => {
        // Parse takes progress from 50% to 95%
        setUploadProgress(50 + Math.round(pct * 0.45));
      });

      const uniqueId = `deck_${Date.now()}`;
      const sigHash = hashName(parsed.name);
      const arrayBuffer = await file.arrayBuffer();

      const newDeck: SlideDeck = {
        ...parsed,
        id: uniqueId,
        uploadedAt: Date.now(),
        harmonicSignature: sigHash,
        pdfBytes: arrayBuffer
      };

      // Save locally to IndexedDB cache
      await saveDeck(newDeck);
      setUploadProgress(98);

      // Reload local decks state
      const updatedDecks = await getAllDecks();
      setDecks(updatedDecks);
      setActiveDeckId(newDeck.id);
      setActivePageIndex(0);
      setUploadProgress(100);

      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Global deck "${newDeck.name}" successfully downloaded, parsed on-device, and cached to your Local Sandbox.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error occurred downloading or parsing the global deck.');
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Aetheric Alert: Failed to attune to global deck "${gDeck.name}". Reason: ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setDownloadingDeckName(null);
      setUploading(false);
    }
  };

  // --- 5. GENIUS ATTUNEMENT LENS ENGINE ---
  const attuneToGenius = (genius: Genius) => {
    setAttunedGenius(genius);
    
    // Choose particle behavior based on Genius ID properties
    if (genius.id % 3 === 0) {
      setParticleMode('vortex');
    } else if (genius.id % 3 === 1) {
      setParticleMode('constellation');
    } else {
      setParticleMode('random');
    }

    // Set custom visual tint based on Genius name hashing
    const hash = hashName(genius.name);
    const hue = hash % 360;
    const color = `hsl(${hue}, 85%, 55%)`;
    setGeniusTint(color);

    setMessages(prev => [...prev, {
      role: 'ai',
      content: `Aetheric tuning focused on Genius: ${genius.name} (${genius.hebrew}). Attunement mode: ${genius.id % 3 === 0 ? 'VORTEX' : genius.id % 3 === 1 ? 'CONSTELLATION' : 'RANDOM WALK'}. ${genius.attribute ? `Applying lens: ${genius.attribute}` : ''}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearAttunement = () => {
    setAttunedGenius(null);
    setParticleMode('random');
    setGeniusTint(null);
  };

  // Dynamic Citation Extractor for deck audits
  const parseCitationsFromText = (text: string, defaultDocName: string): { docName: string; pageNumber: number }[] => {
    const parsedCitations: { docName: string; pageNumber: number }[] = [];
    const seenPages = new Set<number>();
    
    // Regular expression to match [Page X], [Slide Y], (Page Z), etc.
    const regex = /(?:\[|\()(?:Page|Slide)\s*(\d+)(?:\]|\))/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const pageNum = parseInt(match[1], 10);
      if (!isNaN(pageNum) && !seenPages.has(pageNum)) {
        seenPages.add(pageNum);
        parsedCitations.push({
          docName: defaultDocName,
          pageNumber: pageNum
        });
      }
    }
    
    // Sort citations by page number ascending
    return parsedCitations.sort((a, b) => a.pageNumber - b.pageNumber);
  };

  // --- 6. LOCAL CONTEXT RAG SEARCH ENGINE ---
  const findLocalContext = (query: string): { contextText: string; citations: { docName: string; pageNumber: number }[] } => {
    if (decks.length === 0) return { contextText: '', citations: [] };

    // Case 1: Active Slide Only
    if (searchScope === 'slide') {
      if (!activePage || !activeDeck) return { contextText: '', citations: [] };
      return {
        contextText: `Document: [${activeDeck.name}], Slide: [Page ${activePage.pageNumber}]\nContent:\n${activePage.text}\n===`,
        citations: [{ docName: activeDeck.name, pageNumber: activePage.pageNumber }]
      };
    }

    // Case 2: Full Active Deck
    if (searchScope === 'deck_full') {
      if (!activeDeck) return { contextText: '', citations: [] };
      const contextText = activeDeck.pages.map(page => 
        `Document: [${activeDeck.name}], Slide: [Page ${page.pageNumber}]\nContent:\n${page.text}\n===`
      ).join('\n\n');
      const citations = activeDeck.pages.map(page => ({
        docName: activeDeck.name,
        pageNumber: page.pageNumber
      }));
      return { contextText, citations };
    }

    // Case 3 & 4: Keyword Search RAG (within attuned deck or global)
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (queryWords.length === 0) return { contextText: '', citations: [] };

    const targetDecks = searchScope === 'deck_rag' && activeDeck ? [activeDeck] : decks;
    const pageScores: { page: SlidePage; deckName: string; score: number }[] = [];

    targetDecks.forEach(deck => {
      deck.pages.forEach(page => {
        let score = 0;
        const pageTextLower = page.text.toLowerCase();
        
        queryWords.forEach(word => {
          if (pageTextLower.includes(word)) {
            score++;
            if (deck.entities.some(e => e.toLowerCase().includes(word))) {
              score += 2;
            }
          }
        });

        if (score > 0) {
          pageScores.push({ page, deckName: deck.name, score });
        }
      });
    });

    pageScores.sort((a, b) => b.score - a.score);
    const topPages = pageScores.slice(0, 3);

    const contextText = topPages.map(ps => 
      `Document: [${ps.deckName}], Slide: [Page ${ps.page.pageNumber}]\nContent:\n${ps.page.text}\n===`
    ).join('\n\n');

    const citations = topPages.map(ps => ({
      docName: ps.deckName,
      pageNumber: ps.page.pageNumber
    }));

    return { contextText, citations };
  };

  const triggerQuickAction = (actionType: 'explain' | 'entities' | 'anomalies' | 'deck_audit') => {
    if (!activePage && actionType !== 'deck_audit') return;
    if (!activeDeck && actionType === 'deck_audit') return;
    
    let queryText = '';
    if (actionType === 'explain') {
      queryText = `Perform a comprehensive gnostic audit of this slide (Page ${activePageIndex + 1}). Explain its core thesis, physics principles, and historical context.`;
      setSearchScope('slide');
    } else if (actionType === 'entities') {
      queryText = `Analyze the technical acronyms and gnostic entities on Page ${activePageIndex + 1}. Detail their relevance to black budget programs or vacuum physics.`;
      setSearchScope('slide');
    } else if (actionType === 'anomalies') {
      queryText = `Audit Page ${activePageIndex + 1} for narrative contradictions, potential misinformation, or significant details hidden behind redactions.`;
      setSearchScope('slide');
    } else if (actionType === 'deck_audit') {
      queryText = `Perform a comprehensive, structured gnostic audit of the entire active slide deck "${activeDeck?.name}". 

You MUST organize your analysis using the following layout sections:
# GNOSTIC ANALYSIS: ${activeDeck?.name.toUpperCase()}

## I. OVERVIEW & OVERARCHING THESIS
Summarize the deck's central thesis, operational objectives, and cosmic scale.

## II. STRATEGIC ARGUMENT FLOW
Describe the logical flow of arguments slide-by-slide, explicitly referencing pages using the exact bracket format: [Page X] (e.g. [Page 3], [Page 5]) when discussing specific slide contents.

## III. EXOTIC CONCEPTS & PROGRAM ENTITIES
Detail all black budget code names, acronyms, vacuum physics variables, or non-human intelligence (NHI) projects mentioned. Cite slide numbers explicitly.

## IV. DETECTED NARRATIVE ANOMALIES
Scan for contradictions, potential counter-intelligence, redactions, or discrepancies hidden in the data.

## V. HIGH-RESONANCE SYNOPSIS
A concise, final assessment of this deck's credibility and impact.

Make sure to format all references exactly as [Page X] (where X is the page number) so the console can parse and index the interactive navigation channels.`;
      setSearchScope('deck_full');
    }

    setIsChatCollapsed(false); // Force expand chat console so user sees the progress!
    handleSendChat(queryText);
  };

  // --- 7. CHATBOT SUBMIT (Backend Proxy Route) ---
  const handleSendChat = async (overrideInput?: string) => {
    const textToSubmit = overrideInput || chatInput;
    if (!textToSubmit.trim()) return;

    const userText = textToSubmit;
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userText,
      timestamp: new Date().toLocaleTimeString()
    }]);
    if (!overrideInput) {
      setChatInput('');
    }
    setIsChatLoading(true);

    try {
      // 1. Fetch relevant research contexts (RAG)
      const { contextText, citations } = findLocalContext(userText);

      // 2. Prepare structured system instruction (incorporating Genius attunement lens)
      let customSystemInstruction = SYSTEM_INSTRUCTION;
      if (attunedGenius) {
        customSystemInstruction += `\nAttuned Resonance Lens: You are attuned to the Genius [${attunedGenius.name}] representing [${attunedGenius.attribute || 'Spiritual Attunement'}]. Adjust your cognitive filter and esoteric terminology to reflect this entity's vibrations.`;
      }

      // 3. Construct prompt
      const promptPayload = `
[Document Search Scope: ${searchScope.toUpperCase()}]
${contextText ? `[Archive Context For Analysis:\n${contextText}\n]` : '[No relevant archive documents found. Fallback to general database.]'}
${activePage ? `[Currently Active Slide Viewport: Page ${activePage.pageNumber} of "${activeDeck?.name}". A visual image of this slide is attached to your parts payload for multimodal auditing.]` : ''}

User Transmission: "${userText}"
`;

      const parts: any[] = [{ text: promptPayload }];

      // 4. Attach active slide image for Gemini multimodal analysis
      const currentSlideImage = renderedPageImage || activePage?.image;
      if (currentSlideImage) {
        const base64Data = currentSlideImage.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          });
        }
      }

      // 5. Define Tools for Gemini Function Calling
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'set_active_slide',
              description: 'Sets the currently displayed slide page index to direct the user\'s focus to a specific slide.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  pageNumber: {
                    type: 'INTEGER',
                    description: 'The 1-based page number of the slide to display.'
                  }
                },
                required: ['pageNumber']
              }
            },
            {
              name: 'set_rotation_mode',
              description: 'Adjusts the auto-rotation/slideshow cycle mode. Use this to pause or play (fast/slow) the slideshow.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  mode: {
                    type: 'STRING',
                    enum: ['paused', 'fast', 'slow'],
                    description: 'The slideshow rotation state: paused (no cycle), fast (7s speed), or slow (30s speed).'
                  }
                },
                required: ['mode']
              }
            },
            {
              name: 'set_particles_mode',
              description: 'Attunes the background sacred geometry/particle manifestation layer to a new design.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  mode: {
                    type: 'STRING',
                    enum: ['random', 'vortex', 'constellation'],
                    description: 'The flow pattern of background nodes.'
                  }
                },
                required: ['mode']
              }
            }
          ]
        }
      ];

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? '' 
          : 'https://trinocular-unenviously-thea.ngrok-free.dev');

      // 6. Perform fetch call to backend proxy
      const response = await fetch(
        `${backendUrl}/api/chat/proxy?model=gemini-3.5-flash`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: parts
              }
            ],
            systemInstruction: {
              parts: [{ text: customSystemInstruction }]
            },
            tools: tools
          })
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
        } else {
          throw new Error(`Server returned HTML/plain error (${response.status}). The backend server might be offline or misconfigured.`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format from server (expected JSON, received ${contentType || 'text'}). The backend server might be offline or misconfigured.`);
      }

      let resData = await response.json();
      const candidate = resData.candidates?.[0];
      const contentParts = candidate?.content?.parts;
      const functionCall = contentParts?.find((p: any) => p.functionCall)?.functionCall;

      if (functionCall) {
        const { name, args } = functionCall;
        let functionResult: any = { status: "success" };

        if (name === "set_active_slide") {
          const pageNum = args.pageNumber;
          if (activeDeck && pageNum >= 1 && pageNum <= activeDeck.totalPages) {
            setActivePageIndex(pageNum - 1);
            functionResult = { status: "success", message: `Active slide successfully changed to page ${pageNum}.` };
          } else {
            functionResult = { status: "error", message: `Page number ${pageNum} is out of bounds for the current deck (total pages: ${activeDeck ? activeDeck.totalPages : 0}).` };
          }
        } else if (name === "set_rotation_mode") {
          const mode = args.mode;
          setRotationMode(mode);
          functionResult = { status: "success", message: `Rotation mode successfully updated to ${mode}.` };
        } else if (name === "set_particles_mode") {
          const mode = args.mode;
          setParticleMode(mode);
          functionResult = { status: "success", message: `Background particle mode successfully updated to ${mode}.` };
        }

        // Send the function response back to Gemini to get a natural language confirmation!
        const nextResponse = await fetch(
          `${backendUrl}/api/chat/proxy?model=gemini-3.5-flash`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: parts
                },
                candidate.content,
                {
                  role: 'function',
                  parts: [
                    {
                      functionResponse: {
                        name: name,
                        response: functionResult
                      }
                    }
                  ]
                }
              ],
              systemInstruction: {
                parts: [{ text: customSystemInstruction }]
              },
              tools: tools
            })
          }
        );

        if (!nextResponse.ok) {
          const nextContentType = nextResponse.headers.get('content-type');
          if (nextContentType && nextContentType.includes('application/json')) {
            const errJson = await nextResponse.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `HTTP error ${nextResponse.status}`);
          } else {
            throw new Error(`Server returned HTML error (${nextResponse.status}) during function callback.`);
          }
        }

        const nextContentType = nextResponse.headers.get('content-type');
        if (!nextContentType || !nextContentType.includes('application/json')) {
          throw new Error(`Invalid response format from server during function callback.`);
        }

        resData = await nextResponse.json();
      }

      const answerText = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'Resonance faded. No transmission received.';

      // Dynamically extract page references from the AI text if available
      let finalCitations = citations;
      if (activeDeck) {
        const parsedCitations = parseCitationsFromText(answerText, activeDeck.name);
        if (parsedCitations.length > 0) {
          finalCitations = parsedCitations;
        } else if (searchScope === 'deck_full') {
          // If we audited the full deck but the AI failed to output specific Page numbers,
          // don't dump all slide badges. Instead, show empty.
          finalCitations = [];
        }
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        content: answerText,
        timestamp: new Date().toLocaleTimeString(),
        citations: finalCitations.length > 0 ? finalCitations : undefined
      }]);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Aetheric Divergence: Connection to backend chat proxy broken. Reason: ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- 8. PREPARE FLOATING TICKER ITEMS ---
  const tickerQuotes = activeDeck?.quotes && activeDeck.quotes.length > 0
    ? activeDeck.quotes
    : [
        "EXOTIC PHYSICS AND COGNITIVE RESONANCE ARE SYMMETRICAL PATHWAYS.",
        "THE 52ND TREASURY ENCODES COHERENT ENERGY MANIFESTATIONS.",
        "DISSEMINATING THE TRUTH OF NON-HUMAN PHENOMENA FROM ESTABLISHED NARRATIVES.",
        "AETHERIC TUNING STABILIZES THE COGNITIVE AUDITING ENVIRONMENT."
      ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-full bg-[#030303] text-zinc-300 font-sans flex flex-col relative select-none overflow-hidden scanline-effect"
    >
      
      {/* Background Particle Engine (Ritual Layer) */}
      <RitualLayer 
        primaryColor={activePalette[0]} 
        secondaryColor={activePalette[1]} 
        mode={particleMode} 
      />

      {/* Background Holographic Blueprint Layer */}
      {(renderedPageImage || activePage?.image) && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-all duration-1000 bg-center bg-no-repeat bg-contain"
          style={{ 
            backgroundImage: `url(${renderedPageImage || activePage?.image})`, 
            opacity: hologramOpacity,
            mixBlendMode: 'screen',
            filter: 'brightness(0.65) contrast(1.15) grayscale(0.2)'
          }}
        />
      )}

      {/* Header Bar */}
      <header className="h-16 border-b border-zinc-900 bg-black/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded bg-zinc-950/50 hover:bg-zinc-900"
            title="Toggle Repository"
          >
            <Menu className="w-4 h-4 text-theme-primary" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-theme-primary" />
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.1em] sm:tracking-[0.25em] text-white">
              NICOLE TERMINAL <span className="text-theme-primary font-light">//</span> <span className="hidden sm:inline">DISCLOSURE HUB</span>
            </h1>
          </div>
        </div>

        {/* Global Stats / Settings Controls */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          {attunedGenius && (
            <div className="flex items-center gap-1 sm:gap-2 border border-purple-500/20 bg-purple-900/10 text-purple-400 px-2 py-0.5 sm:px-3 sm:py-1 rounded-sm text-[10px] sm:text-xs">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping hidden sm:inline-block" />
              <span className="hidden sm:inline">ATTUNED: </span>{attunedGenius.name.toUpperCase()}
              <button onClick={clearAttunement} className="text-zinc-500 hover:text-white ml-1 font-sans">×</button>
            </div>
          )}
          <Login />
        </div>
      </header>

      {/* Ticker - Floating Intelligence Quotes */}
      <div className="h-8 border-b border-zinc-900 bg-black/40 backdrop-blur-md flex items-center z-40 relative text-[10px] font-mono text-zinc-500 tracking-wider">
        <div className="px-4 border-r border-zinc-900 text-theme-primary font-bold bg-black whitespace-nowrap z-10">
          INTEL TRANSMISSIONS
        </div>
        <div className="ticker-wrap flex-1">
          <div className="ticker-content gap-12">
            {tickerQuotes.concat(tickerQuotes).map((quote, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span>{quote}</span>
                <span className="text-theme-primary font-bold">//</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Terminal Workspace */}
      <div className="flex flex-1 overflow-hidden z-30 relative">
        
        {/* Mobile Sidebar Scrim Overlay */}
        {!isSidebarCollapsed && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setIsSidebarCollapsed(true)} 
          />
        )}
        
        {/* Left Side: Deck Repository & Upload */}
        <aside className={`border-r border-zinc-900 bg-black/95 lg:bg-black/30 backdrop-blur-lg flex flex-col shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 -translate-x-full lg:w-0' : 'w-72 translate-x-0'} fixed lg:relative inset-y-0 left-0 z-50 h-[calc(100%-4rem)] mt-16 lg:h-auto lg:mt-0 overflow-hidden`}>
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black/20">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-theme-primary" /> Slide Repository
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                DECKS: {decks.length}
              </span>
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className="lg:hidden p-1 text-zinc-500 hover:text-white rounded transition-colors"
                title="Close Repository"
              >
                <ChevronLeft className="w-4 h-4 text-theme-primary" />
              </button>
            </div>
          </div>

          {/* Drag & Drop PDF Scanner Area */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`m-4 p-5 border border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-theme-primary bg-theme-primary/10 shadow-glow-theme' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept=".pdf" 
              className="hidden" 
            />
            {uploading ? (
              <div className="w-full flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-theme-primary border-t-transparent animate-spin mb-3" />
                <span className="text-[10px] font-mono text-zinc-400 animate-pulse">EXTRACTING RESONANCE DATA</span>
                <span className="text-[14px] font-mono text-theme-primary font-bold mt-1">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-zinc-500 mb-2 hover:text-theme-primary transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Drop PDF Research</span>
                <span className="text-[8px] font-mono text-zinc-600 mt-1 uppercase">Attune new slide decks</span>
              </>
            )}
            {uploadError && (
              <span className="text-[9px] font-mono text-red-500 mt-2 block uppercase">{uploadError}</span>
            )}
          </div>

          {/* Global Toggle Option */}
          <div className="mx-4 mb-2 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-sm flex items-center justify-between">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Publish to Global Archives</span>
            <input 
              type="checkbox" 
              checked={publishToGlobal}
              onChange={(e) => setPublishToGlobal(e.target.checked)}
              className="accent-theme-primary cursor-pointer w-3.5 h-3.5"
            />
          </div>

          {/* Repository Section Switch / Tabs */}
          <div className="flex border-b border-zinc-900 mx-4 mb-3 text-[10px] font-mono shrink-0">
            <button 
              onClick={() => setRepoTab('local')}
              className={`flex-1 pb-2 border-b uppercase tracking-wider text-center transition-colors ${repoTab === 'local' ? 'border-theme-primary text-theme-primary font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Local Sandbox
            </button>
            <button 
              onClick={() => setRepoTab('global')}
              className={`flex-1 pb-2 border-b uppercase tracking-wider text-center transition-colors ${repoTab === 'global' ? 'border-theme-primary text-theme-primary font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Global Archives
            </button>
          </div>

          {/* List of Slide Decks */}
          <div tabIndex={0} className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-2 pb-6 outline-none">
            {repoTab === 'local' ? (
              <>
                {decks.map(deck => {
                  const isActive = deck.id === activeDeckId;
                  return (
                    <div 
                      key={deck.id}
                      onClick={() => {
                        setActiveDeckId(deck.id);
                        setActivePageIndex(0);
                      }}
                      className={`p-3 border rounded-md cursor-pointer transition-all flex items-center gap-3 relative group overflow-hidden ${isActive ? 'bg-theme-primary-10 border-theme-primary/30 shadow-glow-theme' : 'bg-zinc-900/10 border-zinc-900 hover:border-zinc-800'}`}
                    >
                      {/* Miniature Cymatic Sigil as Deck Icon */}
                      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-black flex items-center justify-center border border-zinc-800 group-hover:border-theme-primary/30">
                        <CymaticSigil 
                          name={deck.name} 
                          size={32} 
                          color={isActive ? activePalette[0] : 'rgba(255,255,255,0.1)'} 
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <h3 className={`text-xs font-bold truncate uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                          {deck.name}
                        </h3>
                        <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600 mt-1 uppercase">
                          <span>SLIDES: {deck.totalPages}</span>
                          <span>SIG: {deck.harmonicSignature}</span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button 
                        onClick={(e) => handleDeleteDeck(deck.id, e)}
                        className="p-1 hover:text-red-400 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity self-center"
                        title="Delete Deck"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                
                {decks.length === 0 && (
                  <div className="text-center p-8 border border-zinc-900/40 rounded bg-zinc-900/5 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                    Repository empty. Upload slide decks to load resources.
                  </div>
                )}
              </>
            ) : (
              <>
                {globalDecksLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="w-6 h-6 border-2 border-theme-primary border-t-transparent animate-spin rounded-full" />
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Attuning Global Archives</span>
                  </div>
                ) : (
                  <>
                    {globalDecks.map(gDeck => {
                      const isCached = decks.some(d => d.name === gDeck.name);
                      const isCurrentlySelected = activeDeck && activeDeck.name === gDeck.name;
                      const isDownloading = downloadingDeckName === gDeck.name;

                      return (
                        <div 
                          key={gDeck.id}
                          onClick={() => handleSelectGlobalDeck(gDeck)}
                          className={`p-3 border rounded-md cursor-pointer transition-all flex items-center gap-3 relative group overflow-hidden ${isCurrentlySelected ? 'bg-theme-primary-10 border-theme-primary/30 shadow-glow-theme' : 'bg-zinc-900/10 border-zinc-900 hover:border-zinc-800'}`}
                        >
                          {/* Miniature Cymatic Sigil as Deck Icon */}
                          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-black flex items-center justify-center border border-zinc-800 group-hover:border-theme-primary/30">
                            <CymaticSigil 
                              name={gDeck.name} 
                              size={32} 
                              color={isCurrentlySelected ? activePalette[0] : 'rgba(255,255,255,0.1)'} 
                            />
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className={`text-xs font-bold truncate uppercase tracking-wider ${isCurrentlySelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                {gDeck.name}
                              </h3>
                              {isCached ? (
                                <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-1 rounded shrink-0">CACHED</span>
                              ) : (
                                <span className="text-[7px] font-mono text-blue-400 bg-blue-950/30 border border-blue-900/40 px-1 rounded shrink-0">CLOUD</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600 mt-1 uppercase">
                              <span>SLIDES: {gDeck.totalPages}</span>
                              <span>{isDownloading ? 'DOWNLOADING...' : `SIG: ${gDeck.harmonicSignature}`}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {globalDecks.length === 0 && (
                      <div className="text-center p-8 border border-zinc-900/40 rounded bg-zinc-900/5 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                        No global slide decks found in database.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sidebar Status Footer */}
          <div className="p-4 border-t border-zinc-900 bg-black/40">
            <button 
              onClick={() => setIsRegistryOpen(true)}
              className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white rounded flex items-center justify-center gap-2 tracking-widest uppercase transition-colors"
            >
              <Settings className="w-3 h-3 text-purple-400" /> Attunement Registry
            </button>
          </div>
        </aside>

        {/* Center: Slide Workspace & Projector */}
        <main className="flex-1 flex flex-col bg-black/10 overflow-hidden relative">
          
          {/* Active Deck Toolbar */}
          <div className="h-12 border-b border-zinc-900 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase font-mono">
              <span className="text-theme-primary font-bold">ACTIVE SCAN</span>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <span className="text-zinc-200 truncate max-w-[200px]">
                {activeDeck ? activeDeck.name : 'NO RESOURCE SELECTED'}
              </span>
            </div>

            {/* Aetheric Tuning slideshow controls */}
            {activeDeck && (
              <div className="flex items-center gap-3">
                {/* Console Controls */}
                <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 p-0.5 rounded-sm">
                  <button 
                    onClick={() => setRotationMode('paused')}
                    className={`p-1.5 rounded-sm transition-colors ${rotationMode === 'paused' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Pause Slideshow"
                  >
                    <Pause className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setRotationMode('fast')}
                    className={`px-2 py-1 text-[9px] font-mono rounded-sm transition-colors ${rotationMode === 'fast' ? 'bg-zinc-900 text-theme-primary font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Auto Cycle (7s speed)"
                  >
                    CYCLE:FAST
                  </button>
                  <button 
                    onClick={() => setRotationMode('slow')}
                    className={`px-2 py-1 text-[9px] font-mono rounded-sm transition-colors ${rotationMode === 'slow' ? 'bg-zinc-900 text-theme-primary font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Cycle Pages (30s speed)"
                  >
                    CYCLE:SLOW
                  </button>
                </div>

                <div className="text-[10px] font-mono text-zinc-600 uppercase flex items-center gap-2 border-l border-zinc-900 pl-3">
                  <span>BACKDROP OPACITY:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.25" 
                    step="0.01" 
                    value={hologramOpacity} 
                    onChange={e => setHologramOpacity(parseFloat(e.target.value))}
                    className="w-16 accent-theme-primary cursor-pointer bg-zinc-900 h-1 rounded-full outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Workspace Viewport */}
          <div 
            ref={workspaceViewportRef}
            tabIndex={0}
            className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 flex flex-col z-10 outline-none"
          >
            
            {activeDeck ? (
              <div className="space-y-6">
                
                {/* Entity Tag Cloud */}
                <div className="p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-lg backdrop-blur-md">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                    // Detected Resonance Entities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeDeck.entities.map((ent, idx) => {
                      const isFilterActive = selectedEntity === ent;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedEntity(isFilterActive ? null : ent)}
                          className={`px-3 py-1 text-[9px] font-mono rounded-full border transition-all ${isFilterActive ? 'border-theme-primary bg-theme-primary/10 text-theme-primary shadow-glow-theme' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
                        >
                          {ent}
                        </button>
                      );
                    })}
                    {activeDeck.entities.length === 0 && (
                      <span className="text-[10px] font-mono text-zinc-700 uppercase">No distinct entities extracted.</span>
                    )}
                  </div>
                </div>

                {/* Primary Projection Hub (Active Slide display) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Column: Visual Projection */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="aspect-[4/3] bg-black/80 border border-zinc-900 rounded-lg overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group flex items-center justify-center">
                      
                      {activePage ? (
                        <>
                          {renderedPageImage || activePage.image ? (
                            <img 
                              src={renderedPageImage || activePage.image} 
                              alt={`Slide ${activePage.pageNumber}`} 
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase">
                              <Cpu className="w-6 h-6 animate-spin text-theme-primary" />
                              <span>Attuning visual frequencies...</span>
                            </div>
                          )}
                          
                          {/* Floating slide info indicator */}
                          <div className="absolute bottom-4 left-4 bg-black/90 border border-zinc-800 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-3">
                            <span className="text-theme-primary font-bold">SLIDE {activePage.pageNumber} / {activeDeck.totalPages}</span>
                            <span className="text-zinc-600">//</span>
                            <span className="text-zinc-400">{activeDeck.name}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-700 font-mono text-[10px] uppercase">PROJECTOR OFFLINE</div>
                      )}

                      {/* Holographic scanner effect line */}
                      <div className="absolute inset-x-0 h-0.5 bg-theme-primary/20 shadow-[0_0_10px_var(--theme-primary)] pointer-events-none scanline-pulse" />
                    </div>

                    {/* Page Carousel controls */}
                    <div className="flex justify-between items-center bg-black/40 border border-zinc-900 p-2 rounded-lg backdrop-blur-sm">
                      <button
                        onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
                        disabled={activePageIndex === 0}
                        className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                        ATTUNED ANGLE: {((activePageIndex + 1) / activeDeck.totalPages * 360).toFixed(0)}° DEGREE
                      </span>
                      <button
                        onClick={() => setActivePageIndex(prev => Math.min(activeDeck.totalPages - 1, prev + 1))}
                        disabled={activePageIndex === activeDeck.totalPages - 1}
                        className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Slide extracted text */}
                  <div className="space-y-4">
                    <div className="border border-zinc-900 bg-black/50 rounded-lg p-4 sm:p-5 backdrop-blur-md h-[250px] lg:h-[440px] flex flex-col shadow-inner">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-theme-primary" /> Slide Transcription
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">PAGE {activePageIndex + 1}</span>
                      </div>

                      {/* Quick Audit Actions */}
                      <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-zinc-900/50 shrink-0">
                        <button
                          onClick={() => triggerQuickAction('explain')}
                          className="py-1.5 bg-zinc-950 hover:bg-zinc-900 hover:border-theme-primary/30 text-[8px] font-mono text-zinc-400 hover:text-white border border-zinc-900 rounded-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1"
                          title="Ask Auditor to explain active slide"
                        >
                          <span>🔍</span> <span className="truncate">Explain Slide</span>
                        </button>
                        <button
                          onClick={() => triggerQuickAction('entities')}
                          className="py-1.5 bg-zinc-950 hover:bg-zinc-900 hover:border-theme-primary/30 text-[8px] font-mono text-zinc-400 hover:text-white border border-zinc-900 rounded-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1"
                          title="Request breakdown of detected entities"
                        >
                          <span>🧬</span> <span className="truncate">Slide Entities</span>
                        </button>
                        <button
                          onClick={() => triggerQuickAction('anomalies')}
                          className="py-1.5 bg-zinc-950 hover:bg-zinc-900 hover:border-theme-primary/30 text-[8px] font-mono text-zinc-400 hover:text-white border border-zinc-900 rounded-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1"
                          title="Scan slide for contradictions or redactions"
                        >
                          <span>⚠️</span> <span className="truncate">Slide Anomalies</span>
                        </button>
                        <button
                          onClick={() => triggerQuickAction('deck_audit')}
                          className="py-1.5 bg-zinc-950 hover:bg-zinc-900 hover:border-theme-primary/30 text-[8px] font-mono text-zinc-400 hover:text-white border border-zinc-900 rounded-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1"
                          title="Perform a full audit of all slides in this deck"
                        >
                          <span>📚</span> <span className="truncate">Audit Deck</span>
                        </button>
                      </div>

                      <div tabIndex={0} className="flex-1 overflow-y-auto custom-scrollbar text-xs leading-relaxed text-zinc-400 font-light pr-1 outline-none">
                        {activePage ? activePage.text : 'No text content available.'}
                      </div>
                    </div>

                    <div className="border border-zinc-900/60 bg-zinc-950/20 rounded-lg p-4 backdrop-blur-md">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-theme-primary shrink-0 mt-0.5" />
                        <div className="text-[10px] leading-relaxed text-zinc-500 uppercase font-mono">
                          This slide deck is indexed in local database store. The Gnostic Auditor accesses this text block as context during auditing runs.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full border border-zinc-900 flex items-center justify-center bg-zinc-950 mb-6 shadow-glow-theme">
                  <Cpu className="w-8 h-8 text-theme-primary animate-pulse" />
                </div>
                <h3 className="text-sm font-bold tracking-widest text-zinc-200 uppercase mb-2">No Research Attuned</h3>
                <p className="text-[11px] font-mono text-zinc-500 uppercase leading-relaxed mb-6">
                  Please drag and drop a PDF slide deck or click the upload zone in the sidebar to populate the repository databases.
                </p>
              </div>
            )}

          </div>

          {/* Bottom Chat Terminal Container */}
          {isChatCollapsed ? (
            <div 
              onClick={() => setIsChatCollapsed(false)}
              className="h-12 border-t border-zinc-900 bg-black/80 hover:bg-zinc-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 cursor-pointer transition-all duration-300 z-40 relative shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-theme-primary">
                <MessageSquare className="w-4 h-4 animate-pulse" />
                <span>COGNITIVE CHAT CONSOLE [MINIMIZED] // CLICK TO EXPAND LOG</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatCollapsed(false);
                }}
                className="p-1.5 hover:text-white text-zinc-500 transition-colors"
                title="Expand Chat Console"
              >
                <ChevronUp className="w-4 h-4 text-theme-primary" />
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 border-t border-zinc-900 bg-black/70 backdrop-blur-md shrink-0 transition-all duration-300 relative">
              {/* Collapse Button */}
              <button 
                onClick={() => setIsChatCollapsed(true)}
                className="absolute top-3 right-4 p-1 text-zinc-500 hover:text-zinc-300 transition-colors z-50"
                title="Collapse Chat Console"
              >
                <ChevronDown className="w-4.5 h-4.5" />
              </button>

              <div className="max-w-4xl mx-auto flex flex-col gap-4 mt-2">
                {/* Messages Area */}
                <div tabIndex={0} className="h-[150px] sm:h-[220px] overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-2 flex flex-col outline-none">
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-[85%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 border transition-all ${isUser ? 'bg-theme-primary-10 border-theme-primary/30 text-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' : 'bg-zinc-950/80 border-zinc-900 text-zinc-300'}`}>
                          
                          {/* Header metadata */}
                          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest opacity-50 mb-1.5">
                            <span>{isUser ? 'ANALYST // OPERATOR' : 'GNOSTIC AUDITOR'}</span>
                            <span>{msg.timestamp || new Date().toLocaleTimeString()}</span>
                          </div>

                          {/* Message Content */}
                          <div className="text-xs leading-relaxed whitespace-pre-wrap font-light">
                            {msg.content}
                          </div>

                          {/* Citations */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-zinc-900/60 flex flex-wrap gap-2 items-center">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Citations:</span>
                              {msg.citations.map((cit, cIdx) => (
                                <button
                                  key={cIdx}
                                  onClick={() => {
                                    const matchingDeck = decks.find(d => d.name === cit.docName);
                                    if (matchingDeck) {
                                      setActiveDeckId(matchingDeck.id);
                                      setActivePageIndex(cit.pageNumber - 1);
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[8px] font-mono text-theme-primary border border-zinc-800 rounded uppercase tracking-wider transition-colors"
                                >
                                  {cit.docName.slice(0, 15)}... (P.{cit.pageNumber})
                                </button>
                              ))}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                  {isChatLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg px-4 py-3 text-xs font-mono text-theme-primary animate-pulse uppercase tracking-widest">
                        AUDITING COGNITIVE FIELDS...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center gap-2 sm:gap-4 bg-zinc-950 border border-zinc-900 rounded-lg p-1.5 sm:p-2 focus-within:border-theme-primary/50 transition-colors shadow-inner">
                  {/* Search Scope Switcher */}
                  <button
                    onClick={() => {
                      setSearchScope(prev => {
                        if (prev === 'slide') return 'deck_rag';
                        if (prev === 'deck_rag') return 'deck_full';
                        if (prev === 'deck_full') return 'global_rag';
                        return 'slide';
                      });
                    }}
                    className={`px-2 py-1.5 sm:px-3 sm:py-2 text-[9px] font-mono rounded border uppercase transition-colors shrink-0 ${
                      searchScope === 'slide' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10' :
                      searchScope === 'deck_rag' ? 'border-sky-500/30 text-sky-400 bg-sky-950/10' :
                      searchScope === 'deck_full' ? 'border-purple-500/30 text-purple-400 bg-purple-950/10' :
                      'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Toggle search scope: Slide, Deck (RAG), Full Deck, or Global (RAG)"
                  >
                    <span className="hidden sm:inline">SCOPE: </span>
                    {searchScope === 'slide' && 'SLIDE'}
                    {searchScope === 'deck_rag' && 'DECK (RAG)'}
                    {searchScope === 'deck_full' && 'FULL DECK'}
                    {searchScope === 'global_rag' && 'GLOBAL (RAG)'}
                  </button>

                  <input 
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Query Gnostic Auditor..."
                    className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-700 text-base sm:text-xs px-1 sm:px-2"
                  />

                  <button 
                    onClick={() => handleSendChat()}
                    disabled={isChatLoading}
                    className="p-2 sm:p-2.5 bg-theme-primary hover:bg-emerald-500 disabled:opacity-40 text-black font-bold rounded transition-colors flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drawer: 72 Geniuses Attunement Registry */}
      <ShemhamforashRegistry 
        isOpen={isRegistryOpen} 
        onClose={() => setIsRegistryOpen(false)} 
        onSelectGenius={attuneToGenius}
      />

    </div>
  );
};

export default DisclosureWorkspace;