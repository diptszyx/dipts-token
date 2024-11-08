import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as any;
    const tokenData = JSON.parse(formData.get('tokenData') as string);

    // Upload image
    const imageFormData = new FormData();
    imageFormData.append('file', file);
    
    const imageResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      imageFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        },
      }
    );
    const imageUri = `https://gateway.pinata.cloud/ipfs/${imageResponse.data.IpfsHash}`;

    // Create and upload metadata
    const metadata = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: tokenData.description,
      image: imageUri,
    };

    const metadataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        },
      }
    );
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`;

    return NextResponse.json({ imageUri, metadataUri });
  } catch (error) {
    console.error("Error in token upload:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
