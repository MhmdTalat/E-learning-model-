# Gemini AI Chatbot Integration

This E-learning platform includes a floating AI chatbot powered by **Google's Gemini API (FREE tier)**.

## Features

✅ **Floating Widget** - Appears as a chat button in the bottom-right corner  
✅ **Multi-purpose Assistant** - Answers questions about the platform  
✅ **Conversation History** - Maintains context across messages  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Free Tier** - Uses Google's generous free Gemini API tier

## Setup Instructions

### Step 1: Get a Free Gemini API Key

1. Visit **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Click **"Create API Key"** → **"Create API key in new project"**
3. Copy the generated API key

### Step 2: Add to Environment Variables

1. Open `.env` file in your project root (create if doesn't exist)
2. Add the following line:

   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

   Replace `your_api_key_here` with the key from Step 1.

3. Save the file

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test the Chatbot

- Look for the chat icon in the **bottom-right corner** of any page
- Click it to open the chatbot
- Type a question and press Enter or click Send

## Example Questions

- "How do I assign a course to an instructor?"
- "What's the difference between students and enrollments?"
- "How do I change my password?"
- "Tell me about the dashboard features"
- "How do I add a new course?"

## API Limits (Free Tier)

Google's Gemini API free tier includes:

- **60 requests per minute** - Plenty for a single user
- No payment required
- Limited to text only
- See [pricing page](https://ai.google.dev/pricing) for current limits

## Troubleshooting

### Chatbot doesn't appear?

- Check that `VITE_GEMINI_API_KEY` is set in `.env`
- Restart the development server
- Check browser console for errors

### "Chatbot is not configured" message?

- Verify the API key is correctly set in `.env`
- Restart dev server and reload page

### API errors?

- Check if your API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Verify you have internet connection
- Check rate limits haven't been exceeded

## Files Modified

- **`src/components/ChatBot.tsx`** - Floating chatbot widget component
- **`src/lib/gemini.ts`** - Gemini API integration service
- **`src/App.tsx`** - Added ChatBot to app-wide routes
- **`.env.example`** - Added Gemini API key documentation

## Customization

To customize the chatbot behavior, edit `src/lib/gemini.ts`:

```typescript
const systemPrompt = `You are a helpful assistant for an E-learning platform...`;
```

Change the `systemPrompt` to modify the chatbot's personality and knowledge base.

## Privacy & Security

- API key should only be in `.env` (never commit to git)
- `.env` file is already in `.gitignore`
- Conversations are not stored (each message is independent)
- All requests go directly to Google's Gemini API

## Support

For issues with:

- **Gemini API**: Visit [Google AI Help](https://support.google.com/cloud)
- **Chatbot Implementation**: Check this file or the code comments

---

**Enjoy your AI-powered E-learning assistant! 🤖**
