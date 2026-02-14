import { NextRequest, NextResponse } from 'next/server';

const WEATHER_GOV_BASE_URL = 'https://api.weather.gov';

// Valid Weather.gov API path patterns
const VALID_PATH_PATTERN = /^\/points\/[-\d.]+,[-\d.]+\/|stations\/([A-Za-z0-9]+)\/observations\/latest|\/gridpoints\/([A-Z]{3})\/\d+,\d+\/(forecast|hourlyforecast)$/;
const ALLOWED_API_PATHS = ['points', 'gridpoints', 'stations'];

// Validate and sanitize the path parameter to prevent SSRF
function validatePath(path: string): { isValid: boolean; sanitizedPath: string } {
  // Remove any null bytes or control characters
  const sanitized = path.replace(/[\x00-\x1F\x7F]/g, '');

  // Prevent path traversal attacks
  if (sanitized.includes('..') || sanitized.includes('//')) {
    return { isValid: false, sanitizedPath: sanitized };
  }

  // Only allow specific API endpoints
  const pathParts = sanitized.split('/').filter(Boolean);
  if (pathParts.length === 0) {
    return { isValid: false, sanitizedPath: sanitized };
  }

  // Check if the first path part is allowed
  const apiType = pathParts[0];
  if (!ALLOWED_API_PATHS.includes(apiType)) {
    return { isValid: false, sanitizedPath: sanitized };
  }

  // Validate against pattern
  if (!VALID_PATH_PATTERN.test(sanitized)) {
    return { isValid: false, sanitizedPath: sanitized };
  }

  return { isValid: true, sanitizedPath: sanitized };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawPath = searchParams.get('path');

  if (!rawPath) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
  }

  const { isValid, sanitizedPath } = validatePath(rawPath);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid path parameter' }, { status: 403 });
  }

  try {
    const url = `${WEATHER_GOV_BASE_URL}${sanitizedPath}`;

    // Set up request timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'react-weather-app/1.0',
        'Accept': 'application/geo+json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Weather.gov API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Log error for monitoring but don't expose details to client
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('abort')) {
      return NextResponse.json(
        { error: 'Request timeout', status: 504 },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch from weather.gov' },
      { status: 500 }
    );
  }
}
