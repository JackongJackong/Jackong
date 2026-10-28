# LeaveFlow

A responsive GitHub Pages-ready leave request portal for colleagues to submit their leave plans instantly.

## Features
- Employee leave request form
- Leave type, date, and reason tracking
- Business-day calculation
- Manager approval queue
- Leave history table
- Local browser storage for demo data

## Run locally
Open `index.html` directly in a browser, or serve the folder with:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish to GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to the repository settings.
3. Open Pages.
4. Set the source to the root branch or `main` and keep the default folder as `/`.
5. Save.
6. Your site will be available at:

`https://<your-github-username>.github.io/<repository-name>/`

## Notes
This is a front-end prototype designed for demonstration and quick deployment. For production, connect the form to a real backend and database.
