# Setup Guide

This guide will walk you through setting up the Wedding Photo Share application from scratch.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm or yarn package manager
- A Cloudinary account (free tier is sufficient)
- A text editor (VS Code recommended)

## Step 1: Clone and Install

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wedding-photo-share.git
cd wedding-photo-share
```

2. Install dependencies:
```bash
npm install
```

## Step 2: Cloudinary Configuration

### Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com) and sign up for a free account
2. Verify your email address
3. Log in to your Cloudinary dashboard

### Set Up Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `wedding_photos`)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: Enter `wedding-photos` (optional, for organization)
   - **Allowed formats**: jpg, png, gif, webp
   - **Max file size**: 10MB (or your preference)
5. Click **Save**

### Get Your Credentials

1. Go to the Cloudinary Dashboard home
2. Find your **Cloud Name** (displayed prominently)
3. Copy the cloud name and preset name for later use

## Step 3: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` in your editor and configure:

```env
# REQUIRED: Cloudinary Settings
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here

# Optional: Only needed for delete functionality
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Event Details (Customize these!)
VITE_EVENT_NAME=John & Jane's Wedding
VITE_EVENT_DATE=2024-06-15
VITE_EVENT_LOCATION=The Grand Ballroom, Chicago

# Security
VITE_ADMIN_PASSWORD=choose_a_strong_password

# App Configuration
VITE_APP_URL=http://localhost:3000
VITE_MAX_FILE_SIZE=10485760  # 10MB in bytes
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
VITE_MAX_UPLOADS_PER_SESSION=20
```

## Step 4: Run Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:3000`

## Step 5: Test the Application

### Test Upload Functionality
1. Navigate to `http://localhost:3000/upload`
2. Enter a test name
3. Try uploading an image
4. Verify it uploads successfully

### Test Admin Panel
1. Navigate to `http://localhost:3000/admin`
2. Enter your admin password
3. Verify you can see uploaded photos
4. Test download functionality

### Generate QR Code
```bash
npm run generate-qr
```

This creates a QR code in the `qr-codes/` directory

## Step 6: Customization

### Update Event Details

Edit `.env` file with your actual event information:
- Event name
- Date
- Location

### Customize Styling

1. Edit `tailwind.config.js` to change colors:
```javascript
colors: {
  primary: {
    // Change these to match your wedding theme
    500: '#your-color',
    600: '#darker-shade',
  }
}
```

2. Update fonts in `index.html`:
```html
<!-- Add your preferred Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" rel="stylesheet">
```

### Add Branding

1. Replace `public/favicon.ico` with your icon
2. Update title in `index.html`
3. Add logo images if needed

## Troubleshooting

### Common Issues

**Upload fails with network error**
- Check Cloudinary credentials in `.env`
- Ensure upload preset is set to "unsigned"
- Verify internet connection

**Admin password not working**
- Check `.env` file for correct password
- Restart development server after changing `.env`

**Images not displaying**
- Verify Cloudinary cloud name is correct
- Check browser console for errors
- Ensure Cloudinary account is active

**QR code generation fails**
- Ensure Node.js is properly installed
- Check that qrcode package is installed
- Verify write permissions for qr-codes directory

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the `.env` configuration
3. Ensure all dependencies are installed
4. Check Cloudinary dashboard for usage/errors
5. Open an issue on GitHub with error details

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for advanced customization
- Test thoroughly with different devices and browsers
- Set up monitoring for production use