# Billium – Modern Invoice & Receipt Generator

Billium is a **modern, step‑by‑step invoice and receipt generator** built with React, Vite, Tailwind CSS, shadcn‑ui, and Radix UI.

It helps freelancers, small businesses, and teams:

- Create **beautiful branded invoices** with multiple templates
- Generate **thermal-style receipts** with several layouts
- Get a **guided wizard experience** so invoice creation is quick and error‑free
- Export everything as **pixel-perfect PDFs** that exactly match the on-screen preview

> This is an open source project – if you find it useful, please consider starring the repo:  
> [`https://github.com/UpendraAkki/Billium`](https://github.com/UpendraAkki/Billium)

---

## Video Demo

Check out a full walkthrough of Billium’s features on YouTube:  
[![Billium Invoice & Receipt Generator – Demo Video](https://img.youtube.com/vi/sH4i0WOgipQ/0.jpg)](https://youtu.be/sH4i0WOgipQ)

[Watch on YouTube](https://youtu.be/sH4i0WOgipQ)



---

## Features

- **Step-by-step invoice wizard**
  - 5 clear steps: **Business → Client → Invoice → Design → Preview**
  - Animated step transitions and progress tracking
  - Auto-save to `localStorage` so you don’t lose work

- **Rich invoice editor**
  - Company details (name, phone, email, website, address, GST/Tax IDs via templates)
  - Client “Bill To” and “Ship To” sections with “Same as Bill To” toggle
  - Dynamic line items (add/remove), with quantity × amount → total
  - Automatic subtotal, tax amount, and grand total
  - Currency support: **INR (₹)** and **USD ($)**

- **Multiple invoice templates**
  - 9+ invoice templates (`Template1`–`Template9`)
  - Each template respects:
    - Brand colors (primary, secondary, accent)
    - Font family (Inter, Arial, Helvetica, Times, Georgia, Roboto, etc.)
    - Logo position (left / center / right)
    - Currency formatting
  - Live preview plus exact-match PDF via `html2canvas` + `jsPDF`

- **Receipt generator**
  - Separate **Receipt** page with its own form
  - 4 thermal-style receipt templates (`Receipt1`–`Receipt4`)
  - Company info, GST number generator, cashier name
  - Items, tax, totals, custom notes and footer suggestions
  - Optimized PDF generation for receipt size

- **Branding & customization**
  - Color pickers + hex inputs for primary/secondary/accent colors
  - Font selection and logo placement
  - Logo upload with inline preview and “remove” option
  - Notes and “suggested notes/footer” buttons for quick text

- **Polished UX**
  - Gradient background with glassmorphism cards
  - Keyboard-friendly inputs and consistent spacing
  - Sticky header with common actions:
    - Reset form
    - Load sample data
    - Switch to Receipt page
    - **“Star on GitHub”** call-to-action

---

## Tech Stack

- **Frontend**
  - [React 18](https://react.dev/)
  - [Vite](https://vitejs.dev/)
  - [React Router](https://reactrouter.com/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) + Radix UI primitives
  - [Framer Motion](https://www.framer.com/motion/) for transitions

- **PDF & rendering**
  - [`html2canvas`](https://github.com/niklasvh/html2canvas)
  - [`jsPDF`](https://github.com/parallax/jsPDF)

- **Forms & utilities**
  - Custom floating-label inputs
  - `Intl.NumberFormat` for currency formatting
  - Local storage for invoice and receipt persistence

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ recommended  
- **npm** (or another package manager like pnpm / bun if you adapt commands)

### Install

```bash
git clone https://github.com/UpendraAkki/Billium.git
cd Billium
npm install
```

### Run locally

```bash
npm run dev
```

By default the app runs at something like:

- `http://localhost:8080/` (see your terminal output for the exact port)

---

## Usage Overview

### Invoice flow (main page)

1. **Business**
   - Fill in your company details and optionally upload a logo.
2. **Client**
   - Pick currency (INR/USD).
   - Enter “Bill To” details and optionally “Ship To” (or mark “Same as Bill To”).
3. **Invoice**
   - Set invoice number and dates.
   - Add line items: name, quantity, rate, description.
   - Adjust tax percentage and review calculated totals.
4. **Design**
   - Tune brand colors, font family, and logo position.
   - Add notes, or click “Suggest” to auto-fill a nice footer message.
5. **Preview**
   - Choose from the available invoice templates.
   - See a live preview that matches the final PDF.
   - Click **Download PDF** to export.

You can also:

- Click **Sample** in the header to prefill demo data.
- Click **Reset** to clear everything and start fresh.
- Use the **Receipt** button to switch to the receipt generator.

### Receipt flow

On the `/receipt` page:

1. Fill **Your Company**, **Bill To**, invoice number/date, and cashier name.
2. Add items, set tax %, and review totals.
3. Choose one of the **Receipt1–Receipt4** themes.
4. Customize notes and footer (or refresh with suggested text).
5. Preview updates live and click **Download Receipt PDF**.

---

## Project Structure (high level)

- `src/pages/Index.jsx` – main invoice wizard (5-step flow)
- `src/pages/TemplatePage.jsx` – dedicated full-page invoice template preview & PDF
- `src/pages/ReceiptPage.jsx` – receipt generator UI and preview
- `src/components/templates/` – all invoice and receipt templates
  - `BaseTemplate.jsx`, `BaseTemplate2.jsx`
  - `Template1.jsx` … `Template9.jsx`
  - `Receipt1.jsx` … `Receipt4.jsx`
- `src/utils/pdfGenerator.js` – invoice PDF generation (exact-match preview)
- `src/utils/receiptPDFGenerator.js` – receipt PDF generation
- `src/utils/templateRegistry.js` – mapping template numbers to components
- `src/components/ItemDetails.jsx`, `BillToSection.jsx`, `BrandingSection.jsx`, etc.

---

## Contributing

Contributions are welcome!

1. **Star** the repo on GitHub if you like the project.  
2. Fork the repository.
3. Create a feature branch:
   ```bash
   git checkout -b feature/my-improvement
   ```
4. Make your changes and run the app locally.
5. Open a pull request with a clear description and screenshots if it’s a UI change.

Please keep the UX clean and consistent with the existing modern design.

---

## License

This project is open source. See the repository for licensing details or add a license file if you intend to use it commercially or in other projects.

And again – if Billium helps you, a ⭐ on  
[`https://github.com/UpendraAkki/Billium`](https://github.com/UpendraAkki/Billium) is very much appreciated!
