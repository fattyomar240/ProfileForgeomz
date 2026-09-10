import { supabase } from './supabase';

const BUCKET = 'profile-photos';

/**
 * Uploads a profile photo to the profile-photos bucket under the user's own
 * folder. Accepts a File or a data URL string (from the PhotoUpload component).
 * Returns the public URL of the uploaded image, or null on failure.
 */
export async function uploadProfilePhoto(
  userId: string,
  image: File | string
): Promise<string | null> {
  let fileBody: Blob;
  let ext = 'jpg';

  if (typeof image === 'string' && image.startsWith('data:')) {
    // data URL → Blob
    const res = await fetch(image);
    fileBody = await res.blob();
    const mime = fileBody.type;
    if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('gif')) ext = 'gif';
  } else if (image instanceof File) {
    fileBody = image;
    const name = image.name.toLowerCase();
    if (name.endsWith('.png')) ext = 'png';
    else if (name.endsWith('.webp')) ext = 'webp';
    else if (name.endsWith('.gif')) ext = 'gif';
  } else {
    return null;
  }

  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, fileBody, { upsert: true, contentType: fileBody.type });

  if (error) {
    console.error('Photo upload failed', error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
