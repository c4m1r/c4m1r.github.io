"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, X, RotateCw, Home, Search, Loader2, Star, Printer, Settings, Shield, ChevronDown, Monitor } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

export default function InternetExplorer() {
  const [url, setUrl] = useState("https://www.google.com");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string>("## Welcome to Internet Explorer 8\n\nType a search query in the search box on the top right, or enter a URL in the address bar to ask the Gemini AI assistant.");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const searchVal = query.trim() || url.trim();
    if (!searchVal || searchVal === "https://www.google.com") return;
    
    setIsLoading(true);
    if (!url.startsWith("http")) {
      setUrl(`https://search.gemini.com/q=${encodeURIComponent(searchVal)}`);
    }
    setResults("");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchVal }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      setResults(response.ok ? data.result : `**Error:** ${data.error || "Failed."}`);
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        setResults("**Error:** The request timed out. Please try again.");
      } else {
        setResults(`**Error:** ${(error as Error).message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setUrl("https://www.google.com");
    setQuery("");
    setResults("## Welcome to Internet Explorer 8\n\nType a search query in the search box on the top right, or enter a URL in the address bar to ask the Gemini AI assistant.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#dcebf5', fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' }}>
      
      {/* --- IE8 Toolbar Area --- */}
      <div style={{ background: 'linear-gradient(to bottom, #f2f7fc, #c5d9ed)', borderBottom: '1px solid #99adc2', padding: '4px 6px' }}>
        
        {/* Row 1: Navigation & Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          
          {/* Back / Forward */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {/* Large Back Button */}
            <div 
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #5ea4f3, #22569c)',
                border: '1px solid #143869', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }}
              onClick={() => {}}
            >
              <ArrowLeft size={20} color="#fff" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />
            </div>
            
            {/* Small Forward Button */}
            <div 
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #f2f7fc, #b5c7da)',
                border: '1px solid #8ba4bd', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.5, cursor: 'not-allowed'
              }}
            >
              <ArrowRight size={14} color="#555" />
            </div>
            {/* History Dropdown */}
            <div style={{ padding: '0 2px', cursor: 'pointer', opacity: 0.6 }}><ChevronDown size={12} color="#333" /></div>
          </div>

          {/* Address Bar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', flex: 1, height: '26px', 
              background: '#fff', border: '1px solid #84a2c6', borderRadius: '2px', 
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)', paddingRight: '48px' 
            }}>
              <div style={{ padding: '0 6px', display: 'flex', alignItems: 'center' }}>
                <img src="/win7/Internet Explorer/iexplore_32528.ico" alt="IE" style={{ width: 14, height: 14 }} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isLoading}
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: '12px',
                  background: 'transparent', color: '#000', padding: '0 2px'
                }}
              />
            </div>
            
            {/* Refresh / Stop Buttons inside Address Bar */}
            <div style={{ position: 'absolute', right: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div onClick={isLoading ? undefined : () => handleSearch()} style={{ cursor: 'pointer', padding: '2px' }}>
                <RotateCw size={14} color="#338a2e" />
              </div>
              <div style={{ cursor: 'pointer', padding: '2px' }}>
                <X size={14} color="#cc2929" />
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ width: '220px', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', flex: 1, height: '26px', 
              background: '#fff', border: '1px solid #84a2c6', borderRadius: '2px', 
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Live Search"
                disabled={isLoading}
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: '12px',
                  background: 'transparent', color: '#000', padding: '0 6px'
                }}
              />
              <div style={{ padding: '0 6px', display: 'flex', alignItems: 'center', borderLeft: '1px solid #d9d9d9', cursor: 'pointer' }} onClick={() => handleSearch()}>
                <Search size={14} color="#1a5fa8" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Row 2: Tabs and Command Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 6px', background: 'linear-gradient(to bottom, #f2f7fc, #c5d9ed)', borderBottom: '1px solid #84a2c6' }}>
        
        {/* Favorites button (left of tabs) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', marginBottom: '2px', cursor: 'pointer' }}>
          <Star size={16} color="#d4a017" fill="#facc15" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {/* Active Tab */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            background: '#fff', border: '1px solid #84a2c6', borderBottom: 'none',
            borderRadius: '4px 4px 0 0', padding: '4px 12px 6px 10px',
            width: '180px', position: 'relative', top: '1px', zIndex: 10
          }}>
            <img src="/win7/Internet Explorer/iexplore_32528.ico" alt="IE" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>New Tab</span>
            <X size={12} color="#666" style={{ cursor: 'pointer' }} />
          </div>
          
          {/* New Tab Button */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(to bottom, #e4eff8, #c9dff0)', border: '1px solid #a6c2df', borderBottom: 'none',
            borderRadius: '4px 4px 0 0', width: '28px', height: '24px', cursor: 'pointer'
          }}>
            <div style={{ width: '10px', height: '10px', background: '#84a2c6' }} />
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Command Bar (right side) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '4px', fontSize: '11px', color: '#333' }}>
          <div onClick={handleGoHome} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Home size={14} color="#1a5fa8" /> <ChevronDown size={10} color="#666" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Printer size={14} color="#444" /> <ChevronDown size={10} color="#666" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>Page <ChevronDown size={10} color="#666" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>Safety <ChevronDown size={10} color="#666" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Settings size={14} color="#444" /> Tools <ChevronDown size={10} color="#666" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>? <ChevronDown size={10} color="#666" /></div>
        </div>

      </div>

      {/* Browser content */}
      <div style={{ flex: 1, background: '#fff', overflow: 'auto', padding: '30px', cursor: 'text' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#666' }}>
              <Loader2 size={32} className="animate-spin" color="#1a5fa8" />
              <p>Waiting for Gemini...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif', color: '#333' }}>
              <ReactMarkdown>{results}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: '22px', background: 'linear-gradient(to bottom, #f2f7fc, #d6e5f3)', borderTop: '1px solid #8ba4bd', display: 'flex', alignItems: 'center', padding: '0 8px', justifyContent: 'space-between', fontSize: '11px', color: '#555' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img src="/win7/Internet Explorer/iexplore_32528.ico" alt="" style={{ width: 14, height: 14, opacity: 0.5 }} />
          <span>{isLoading ? "Waiting for response..." : "Done"}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '8px', borderLeft: '1px solid #a6c2df' }}>
            <Monitor size={14} color="#1a5fa8" /> Internet
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '8px', borderLeft: '1px solid #a6c2df' }}>
            100% <ChevronDown size={10} />
          </div>
        </div>
      </div>
      
    </div>
  );
}
