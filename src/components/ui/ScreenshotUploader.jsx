import { useState, useRef } from 'react'
import { Upload, X, ZoomIn } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function ScreenshotUploader({ stage, tradeId, onUpload }) {
  const { user } = useAuthStore()
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    if (!tradeId) {
      onUpload({ file, stage, preview: URL.createObjectURL(file) })
      return
    }

    // Upload to Supabase Storage
    setUploading(true)
    const filePath = `${user.id}/${tradeId}/${stage}-${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(filePath, file)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(filePath)

      await supabase.from('trade_screenshots').insert({
        trade_id: tradeId,
        user_id: user.id,
        stage,
        storage_path: filePath,
        public_url: publicUrl,
        file_name: file.name,
      })

      onUpload({ stage, publicUrl, storagePath: filePath })
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload({ stage, publicUrl: null, storagePath: null })
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-400 capitalize font-medium">{stage} Entry</p>

        {preview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
            <img src={preview} alt={stage} className="w-full h-40 object-cover" />
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
            {uploading && <p className="text-[#22C55E] text-xs">Uploading...</p>}
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
            src={preview}
            alt="zoomed"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}