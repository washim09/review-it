import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Riviewit – Genuine Reviews from Real Users'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '40px',
              fontWeight: 'bold',
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #A78BFA, #C4B5FD)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Riviewit
          </span>
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#CBD5E1',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Genuine, Unsponsored Reviews from Real Users
        </div>
        <div
          style={{
            fontSize: '20px',
            color: '#94A3B8',
            marginTop: '20px',
          }}
        >
          riviewit.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
