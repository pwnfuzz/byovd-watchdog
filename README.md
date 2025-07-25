# BYOVDFinder - Kernel Driver Vulnerability Research Dashboard

A cybersecurity-themed React dashboard for tracking kernel driver vulnerabilities against HVCI blocklists.

## 🚀 Features

### Core Functionality
- **Real-time Driver Analysis**: Compare kernel drivers against HVCI blocklists
- **JSON Output**: Generate structured JSON results with timestamps
- **Changelog Tracking**: Maintain historical changes with date-based entries
- **Hash-based Comparison**: Accurate driver identification using SHA256/SHA1/MD5

### Website Features
- **Cybersecurity Theme**: Terminal-style UI with green matrix aesthetic
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Auto-refresh when new data is available
- **Interactive Dashboard**: View allowed/blocked drivers with details
- **Changelog History**: Track all changes over time with detailed breakdowns

## 🛠️ Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.7+ (for the backend scripts)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd BYOVDFinder-main
```

2. **Install website dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The website will be available at `http://localhost:3000`

## 📁 Project Structure

```
BYOVDFinder-main/
├── finder.py                 # Main BYOVDFinder script
├── compare_results.py        # Changelog comparison script
├── package.json             # Website dependencies
├── public/                  # Static assets
│   └── index.html          # Main HTML file
├── src/                     # React source code
│   ├── App.js              # Main React component
│   ├── App.css             # Cybersecurity theme styles
│   ├── index.js            # React entry point
│   └── components/         # React components
│       ├── Dashboard.js    # Main dashboard
│       ├── Changelog.js    # Changelog page
│       └── Navigation.js   # Navigation component
└── README.md               # This file
```

## 🔧 Usage

### Backend Scripts

1. **Generate Results**
```bash
python3 finder.py your_policy.xml --json
```
This creates a timestamped JSON file with the latest scan results.

2. **Compare Results**
```bash
python3 compare_results.py old_results.json new_results.json
```
This updates the changelog with changes between scans.

3. **View Changelog**
```bash
python3 compare_results.py --show-history
```
This displays the changelog history in the terminal.

### Website

1. **Dashboard**: View the latest scan results with summary statistics
2. **Changelog**: Browse historical changes with detailed breakdowns
3. **Real-time Updates**: The website automatically detects new data files

## 🎨 Design Features

### Cybersecurity Theme
- **Terminal Aesthetic**: Green text on black background
- **Matrix Effects**: Glowing borders and scanning animations
- **Monospace Fonts**: JetBrains Mono and Orbitron for authenticity
- **Interactive Elements**: Hover effects and smooth transitions

### Responsive Layout
- **Desktop**: Full dashboard with side-by-side driver lists
- **Mobile**: Stacked layout with touch-friendly controls
- **Tablet**: Optimized grid layouts for medium screens

## 📊 Data Structure

### Results JSON Format
```json
{
  "summary": {
    "total_drivers": 1964,
    "allowed_count": 285,
    "blocked_count": 1679
  },
  "allowed_drivers": [...],
  "blocked_drivers": [...]
}
```

### Changelog JSON Format
```json
[
  {
    "date": "07-07-2025",
    "data": {
      "removed": [...],
      "added": [...],
      "status_changes": [...]
    }
  }
]
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect to GitHub**: Link your repository to Vercel
2. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Environment Variables**: Add any API keys if needed
4. **Deploy**: Vercel will automatically deploy on push

### GitHub Pages
1. **Build the project**: `npm run build`
2. **Push to GitHub**: Include the `build` folder
3. **Enable Pages**: In repository settings, enable GitHub Pages
4. **Set Source**: Choose the `build` folder as source

## 🔄 Data Integration

### Local Development
- Place JSON result files in the `public/data/` directory
- The website will automatically load the latest file
- Update the `Dashboard.js` component to point to your data files

### Production Setup
- Host JSON files on GitHub or a CDN
- Update the fetch URLs in the components
- Set up automatic updates via webhooks or cron jobs

## 🛡️ Security Features

- **Hash Verification**: All drivers identified by cryptographic hashes
- **Timestamp Tracking**: Every change logged with precise timestamps
- **Audit Trail**: Complete history of all driver status changes
- **Secure Display**: No sensitive data exposed in the frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

Apache License 2.0 - See LICENSE file for details

## 👨‍💻 Author

**Nikhil John Thomas (@ghostbyt3)**
- GitHub: [ghostbyt3](https://github.com/ghostbyt3)
- Project: [BYOVDFinder](https://github.com/ghostbyt3/BYOVDFinder)

## 🙏 Acknowledgments

- **Robin (@D4mianWayne)** - Contributor
- **loldrivers.io** - Driver vulnerability database
- **Microsoft** - HVCI documentation and policies

---

**⚠️ Disclaimer**: This tool is for research and educational purposes only. Always follow responsible disclosure practices when working with security vulnerabilities.

