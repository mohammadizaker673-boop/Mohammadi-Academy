import React from 'react';
import { WHATSAPP_NUMBER } from '../constants';

/**
 * Floating WhatsApp button — one tap opens a chat with the academy to book
 * a free trial class or ask about courses. Shown on every page, bottom
 * right, above other content. The message is pre-filled so the visitor
 * only has to press send.
 */
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Assalamu alaikum, I want to book a free trial Quran class.'
);

const WhatsAppButton: React.FC = () => {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp to book a free trial class"
      title="Chat on WhatsApp — book a free trial class"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1eb856] text-white shadow-lg shadow-black/40 flex items-center justify-center transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-current" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 2 6.5L4 29l7.7-2c1.8.9 3.9 1.5 6.3 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22.3c-2 0-3.9-.5-5.5-1.5l-.4-.2-4.6 1.2 1.2-4.4-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7C4.7 9 9.5 4.7 16 4.7S27.3 9 27.3 15.3 22.5 25.3 16 25.3zm6.3-8.2c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7.1-.1.3-.4.4-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.8-1.8-1-2.5-.3-.6-.6-.6-.8-.6h-.7c-.2 0-.5.1-.8.3-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 2-.8 2.2-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.2-.7-.4z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
