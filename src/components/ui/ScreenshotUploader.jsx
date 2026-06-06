import { useState, useRef } from 'react'
import { Upload, X, ZoomIn } from 'lucide-react'

export default function ScreenshotUploader({ stage, onFileSelect, previewUrl }) {
  const [zoomed, setZoomed] = useState(false)
  const inputRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    onFileSelect(stage, file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    onFileSelect(stage, null)
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-400 capitalize font-medium">{stage} Entry</p>

        {previewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
            <img src={previewUrl} alt={stage} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setZoomed(true)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-[#EF4444]/80 hover:bg-[#EF4444] text-white p-2 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current.click()}
            className="border-2 border-dashed border-slate-700 hover:border-[#22C55E] rounded-xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer transition group"
          >
            <Upload size={24} className="text-slate-600 group-hover:text-[#22C55E] transition" />
            <p className="text-slate-500 text-sm">Drop or click to upload</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg"
            onClick={() => setZoomed(false)}
          >
            <X size={20} />
          </button>
          <img
            src={previewUrl}
            alt="zoomed"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}