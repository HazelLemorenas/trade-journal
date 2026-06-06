import { supabase } from './supabase'

export async function uploadScreenshots(tradeId, userId, screenshots) {
  const uploads = []

  for (const [stage, file] of Object.entries(screenshots)) {
    if (!file) continue

    const ext = file.name.split('.').pop()
    const filePath = `${userId}/${tradeId}/${stage}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(filePath, file)

    if (uploadError) {
      console.error(`Failed to upload ${stage} screenshot:`, uploadError.message)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('trade-screenshots')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase.from('trade_screenshots').insert({
      trade_id: tradeId,
      user_id: userId,
      stage,
      storage_path: filePath,
      public_url: publicUrl,
      file_name: file.name,
    })

    if (!insertError) {
      uploads.push({ stage, publicUrl })
    }
  }

  return uploads
}