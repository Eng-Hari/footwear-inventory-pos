🥿 Footwear Inventory & POS System

A full offline inventory and billing system designed specifically for footwear shops. Built with React, Tailwind CSS, Node.js, and SQLite, this system handles everything from stock management to billing — offline, plug-and-play, and unbreakable.

🌟 Features
Inventory Management

Manage footwear stock with Article Number, Size, Color, and Category.

Add, remove, and update stock manually.

Low stock alerts for timely replenishment.

Supports MRP and purchase price tracking.

Billing & POS

Fast and responsive billing interface.

Cart management, including discounts and GST calculation.

Undo last sale option to fix billing mistakes.

Printable invoices for customer receipts.

Reports & History

Daily, monthly, yearly sales reports.

Purchase and sales history with timestamps.

Stock reports including low-stock items.

Export and backup SQLite database manually or automatically.

Advanced & Robust

100% offline — no internet required.

Electron-ready for desktop deployment.

Crash recovery with logs and write-ahead transactions.

Barcode scanner support (optional).

Settings page to customize invoice templates, GST, and discounts.

💻 Tech Stack
Layer	Technology
Frontend	React, Tailwind CSS
Backend	Node.js, Express
Database	SQLite (ACID-safe)
Extras	Electron (optional), Printable Receipts, Local Backups
⚡ Why This System?

Designed specifically for footwear shops, with features like article numbers, color, size tracking, and category management.

Fully offline and plug-and-play, no login or server dependency.

Easy to use, even for non-technical shopkeepers.

Keeps your inventory safe and your sales accurate.

🚀 Quick Start

Clone the repository

git clone https://github.com/your-username/footwear-inventory-pos.git
cd footwear-inventory-pos


Install backend dependencies

cd backend
npm install
npm start


Install frontend dependencies

cd ../frontend
npm install
npm run dev


Open the app in your browser:

http://localhost:5174


Start managing your footwear inventory & sales offline!

📝 Screenshots


Home dashboard with billing and stock overview


Manage products by article, size, and color


View daily, monthly, and yearly sales reports

💡 Future Improvements

Full barcode scanner integration.

Multi-store support.

Advanced analytics and charts for sales trends.

Optional cloud sync for backup and multi-device access.

🔖 License

This project is open-source and available under the MIT License.
