# Document Validation Tool

A Next.js application for validating documents against a master sheet. Built with Firebase for storage and authentication.

## Features

- Upload and manage master sheets (CSV/JSON)
- Upload multiple documents for validation
- Real-time document validation against master sheet
- Validation history with detailed results
- Export validation results to CSV
- Dropbox integration (coming soon)

## Tech Stack

- Next.js 14
- Material-UI
- Firebase (Firestore, Storage)
- Papa Parse (CSV parsing)

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd document-validation-tool
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/components` - Reusable UI components
- `/pages` - Next.js pages and API routes
- `/lib` - Utility functions and Firebase configuration
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 