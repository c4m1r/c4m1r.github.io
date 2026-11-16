"use client";

import { Trash2, File, FileText, Image as ImageIcon, Music, AlertCircle } from "lucide-react";
import { useState } from "react";

const deletedFiles = [
  { id: 1, name: "old_portfolio_v1.html", type: "document", date: "10/12/2023", size: "12 KB", icon: FileText },
  { id: 2, name: "Linkin_Park_Numb.mp3", type: "audio", date: "05/04/2008", size: "4.2 MB", icon: Music },
  { id: 3, name: "funny_cat_meme.jpg", type: "image", date: "11/22/2012", size: "845 KB", icon: ImageIcon },
  { id: 4, name: "setup_wizard_error.log", type: "document", date: "01/15/2015", size: "2 KB", icon: FileText },
  { id: 5, name: "New Folder (3)", type: "folder", date: "08/30/2020", size: "0 KB", icon: File },
];

export default function RecycleBin() {
  const [files, setFiles] = useState(deletedFiles);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const emptyBin = () => {
    setFiles([]);
    setSelectedId(null);
  };

  return (
    <div className="w-full h-full bg-[#020203] text-[#EDEDEF] flex flex-col font-sans selection:bg-[#5E6AD2]/30 relative overflow-hidden">
      
      {/* Cinematic Ambient Light Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[400px] h-[400px] bg-[#5E6AD2]/10 rounded-full blur-[80px] top-0 left-0 mix-blend-screen" />
        <div className="absolute w-[500px] h-[500px] bg-[#0a0a0f]/80 rounded-full blur-[100px] bottom-0 right-0 mix-blend-multiply" />
      </div>

      {/* Glassmorphism Header */}
      <div className="relative z-10 px-6 py-4 bg-white/[0.02] border-b border-white/[0.08] backdrop-blur-[20px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-[#5E6AD2]/20 text-[#5E6AD2] border border-[#5E6AD2]/30 shadow-[0_0_15px_rgba(94,106,210,0.3)]">
            <Trash2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recycle Bin</h2>
            <div className="text-xs text-[#8A8F98] font-medium">{files.length} items</div>
          </div>
        </div>
        
        <button 
          onClick={emptyBin}
          disabled={files.length === 0}
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed border border-white/[0.1] rounded-lg transition-all text-sm font-semibold text-white flex items-center gap-2"
        >
          <AlertCircle size={16} className={files.length > 0 ? "text-red-400" : "text-[#8A8F98]"} />
          Empty Bin
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto relative z-10">
        
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#8A8F98] space-y-4">
            <Trash2 size={48} className="opacity-20" />
            <p className="text-lg font-medium">The recycle bin is empty.</p>
          </div>
        ) : (
          <div className="bg-[#050506]/80 rounded-2xl border border-white/[0.05] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
            
            {/* Table Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
              <div className="w-1/2 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider">Name</div>
              <div className="w-1/4 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider">Date Deleted</div>
              <div className="w-1/4 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider text-right">Size</div>
            </div>

            {/* File List */}
            <div className="divide-y divide-white/[0.02]">
              {files.map(file => {
                const Icon = file.icon;
                const isSelected = selectedId === file.id;
                return (
                  <div 
                    key={file.id}
                    onClick={() => setSelectedId(file.id)}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-all ${
                      isSelected ? 'bg-[#5E6AD2]/10 border-l-2 border-[#5E6AD2]' : 'hover:bg-white/[0.02] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="w-1/2 flex items-center gap-3">
                      <Icon size={18} className={isSelected ? 'text-[#5E6AD2]' : 'text-[#8A8F98]'} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#EDEDEF]'}`}>
                        {file.name}
                      </span>
                    </div>
                    <div className="w-1/4 text-sm text-[#8A8F98]">{file.date}</div>
                    <div className="w-1/4 text-sm text-[#8A8F98] text-right">{file.size}</div>
                  </div>
                )
              })}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
