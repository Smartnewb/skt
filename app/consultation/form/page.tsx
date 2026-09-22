import { redirect } from 'next/navigation';

// The minimal consultation form now lives directly on /consultation.
export default function ConsultationFormRedirect() {
  redirect('/consultation');
}
