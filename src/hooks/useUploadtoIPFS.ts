import { useState } from 'react';

interface UploadResult {
  imageUri: string;
  metadataUri: string;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
}

export function useUploadToIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToIPFS = async (
    file: File, 
    metadata: TokenMetadata
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tokenData', JSON.stringify(metadata));

      const response = await fetch('/api/token/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadToIPFS, isUploading, error };
}