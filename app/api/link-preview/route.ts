import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch URL')
    }

    const html = await response.text()

    // Simple regex-based extraction (for production, use a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                      html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)

    const title = titleMatch ? titleMatch[1] : null
    const image = imageMatch ? imageMatch[1] : null

    return NextResponse.json({
      title: title || '',
      image: image || null,
    })
  } catch (error: any) {
    console.error('Link preview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch link preview', message: error.message },
      { status: 500 }
    )
  }
}

