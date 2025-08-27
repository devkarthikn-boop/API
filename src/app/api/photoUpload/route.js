import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // limit to your web app origin in prod
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

cloudinary.config({
  cloud_name: "dxestxhi7",
  api_key: "683152633927512",
  api_secret:"VW_Crc7hRMRmmqw-ny-2ldHw5z8",
});

export async function POST(request) {
  try {
    const body = await request.json();
    const fileStr = body.data; // expects data URL: data:image/jpeg;base64,...

    if (!fileStr || typeof fileStr !== "string") {
      return new NextResponse(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "users",
      resource_type: "image",
    });

    return new NextResponse(JSON.stringify({ url: uploadResponse.secure_url }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return new NextResponse(
      JSON.stringify({ error: "Upload failed", details: error?.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
