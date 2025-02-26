import { NextRequest, NextResponse } from 'next/server';

// Change to your own GTM container ID
const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const GTAG_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

export const dynamic = 'force-dynamic'; // Make sure this isn't cached by Next.js

// This function handles GET requests to /gtag/js
export async function GET(request: NextRequest) {
  try {
    // Extract headers from the incoming request
    const requestHeaders = new Headers();
    
    // Only forward necessary headers to avoid issues
    if (request.headers.has('user-agent')) {
      requestHeaders.set('user-agent', request.headers.get('user-agent')!);
    }
    if (request.headers.has('accept')) {
      requestHeaders.set('accept', request.headers.get('accept')!);
    }
    if (request.headers.has('accept-encoding')) {
      requestHeaders.set('accept-encoding', request.headers.get('accept-encoding')!);
    }
    
    // Get from origin
    const responseFromOrigin = await fetch(GTAG_URL, {
      headers: requestHeaders,
      next: { revalidate: 3600 }, // Cache for 1 hour, adjust as needed
    });
    
    // Check for errors from GTM fetch
    if (!responseFromOrigin.ok) {
      console.error(`Error fetching from GTAG: ${responseFromOrigin.status} ${responseFromOrigin.statusText}`);
      return new NextResponse('Error fetching from GTAG', { status: responseFromOrigin.status });
    }
    
    // Get the response as text instead of streaming to ensure we get the full content
    const responseText = await responseFromOrigin.text();
    
    // Create headers to add to our response
    const headers = new Headers();
    
    // Copy only specific headers we want to keep
    if (responseFromOrigin.headers.has('content-type')) {
      headers.set('content-type', responseFromOrigin.headers.get('content-type')!);
    }
    headers.set('cache-control', 'public, max-age=3600');
    
    // Create a new response with the complete text
    return new NextResponse(responseText, {
      status: responseFromOrigin.status,
      headers
    });
  } catch (error) {
    console.error('Error in GET /gtag/js:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handler for non-GET requests
export async function DELETE(request: NextRequest) {
  return methodNotAllowed(request);
}
export async function POST(request: NextRequest) {
  return methodNotAllowed(request);
}
export async function PUT(request: NextRequest) {
  return methodNotAllowed(request);
}
export async function PATCH(request: NextRequest) {
  return methodNotAllowed(request);
}

// Helper function for handling method not allowed
function methodNotAllowed(request: NextRequest) {
  return new NextResponse(`Method ${request.method} Not Allowed`, {
    status: 405,
    headers: {
      Allow: 'GET',
    },
  });
}
