export type ClothingType = 'tops' | 'bottoms' | 'one-pieces';

export interface UploadState {
  modelImage: File | null;
  clothingImage: File | null;
  clothingType: ClothingType;
  result: string | null;
  loading: boolean;
  error: string | null;
}

