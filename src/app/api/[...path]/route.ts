// src/app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

async function handleRequest(request: NextRequest, params: Promise<{ path: string[] }>) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join('/');
  const url = `${BACKEND_URL}/${path}${request.nextUrl.search}`;

  // LOG ĐỂ DEBUG
  console.log(`[PROXY] ${request.method} /api/${path} → ${url}`);

  try {
    // Copy headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Get body if exists
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const text = await request.text();
      body = text || undefined;
    }

    // Forward request to backend
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    // Get response data
    const responseData = await response.text();

    // Create response
    const res = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.headers.set(key, value);
    });

    return res;
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { message: 'Backend connection failed', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(req, context.params);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(req, context.params);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(req, context.params);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(req, context.params);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(req, context.params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}