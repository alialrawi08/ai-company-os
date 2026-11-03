# ARASCO — Personal Intelligence System

ARASCO is a responsive personal AI workspace designed for Windows desktop browsers and iPhone browsers. This first implementation includes:

- A responsive command-center dashboard.
- A chat interface powered by the OpenAI API.
- Browser speech-to-text where supported.
- Browser text-to-speech playback.
- A server-side API route so the OpenAI API key is never exposed to the client.
- A safety boundary: this version does not control the computer or perform external actions.

## Run locally

1. Install dependencies with `npm install`.
2. Create `.env.local` in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000/arasco](http://localhost:3000/arasco).

## Voice support

Speech recognition depends on browser support and microphone permission. If speech recognition is unavailable, text chat remains available. Text-to-speech uses the browser's speech synthesis engine.

## Next milestones

1. Persistent memory with user-controlled retention.
2. Secure sign-in and encrypted user settings.
3. A permissioned desktop companion for approved local actions.
4. A mobile-friendly installable PWA experience.
5. A tool/agent layer with explicit approvals, audit history, and revocation controls.

Do not store API keys in client-side code or commit `.env.local`.
