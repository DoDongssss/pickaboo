import { supabase } from "./supabase"

export const BUCKETS = {
  COFFEE_SHOP_IMAGES: "coffee-shop-images",
  FEEDBACK_PHOTOS: "feedback-photos",
} as const

export async function uploadCoffeeShopImage(
  shopId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${ext}`
  const path = `${shopId}/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKETS.COFFEE_SHOP_IMAGES)
    .upload(path, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from(BUCKETS.COFFEE_SHOP_IMAGES)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadFeedbackPhoto(
  token: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${ext}`
  const path = `${token}/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKETS.FEEDBACK_PHOTOS)
    .upload(path, file, { upsert: false })

  if (error) throw error

  return path // private bucket — return path, not public URL
}

export async function deleteCoffeeShopImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKETS.COFFEE_SHOP_IMAGES)
    .remove([path])

  if (error) throw error
}