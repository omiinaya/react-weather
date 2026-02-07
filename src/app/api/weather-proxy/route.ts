import { NextRequest, NextResponse } from 'next/server';

const WEATHER_GOV_BASE_URL = 'https://api.weather.gov';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
  }

  try {
    const url = `${WEATHER_GOV_BASE_URL}${path}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'react-weather-app',
        'Accept': 'application/geo+json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Weather.gov API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather.gov proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from weather.gov' },
      { status: 500 }
    );
  }
}
