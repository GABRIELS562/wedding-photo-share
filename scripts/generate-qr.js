#!/usr/bin/env node

const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const generateQRCode = async () => {
  const args = process.argv.slice(2)

  // Default configuration
  const config = {
    url: process.env.VITE_APP_URL || 'http://localhost:3000/upload',
    outputDir: path.join(process.cwd(), 'qr-codes'),
    fileName: 'wedding-photo-upload.png',
    size: 500,
    margin: 2,
  }

  // Parse command line arguments
  args.forEach((arg, index) => {
    if (arg === '--url' && args[index + 1]) {
      config.url = args[index + 1]
    }
    if (arg === '--output' && args[index + 1]) {
      config.fileName = args[index + 1]
    }
    if (arg === '--size' && args[index + 1]) {
      config.size = parseInt(args[index + 1], 10)
    }
  })

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true })
  }

  const outputPath = path.join(config.outputDir, config.fileName)

  try {
    // Generate QR code with custom styling
    await QRCode.toFile(outputPath, config.url, {
      width: config.size,
      margin: config.margin,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    console.log('✅ QR Code generated successfully!')
    console.log(`📍 Location: ${outputPath}`)
    console.log(`🔗 URL: ${config.url}`)
    console.log(`📏 Size: ${config.size}x${config.size}px`)

    // Also generate a data URL version for web display
    const dataUrl = await QRCode.toDataURL(config.url, {
      width: config.size,
      margin: config.margin,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Save data URL to a JSON file for easy integration
    const jsonPath = path.join(config.outputDir, 'qr-data.json')
    fs.writeFileSync(jsonPath, JSON.stringify({
      url: config.url,
      dataUrl,
      imagePath: outputPath,
      generatedAt: new Date().toISOString(),
    }, null, 2))

    console.log(`📋 JSON data saved to: ${jsonPath}`)

    // Generate HTML preview
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Photo Upload QR Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .qr-code {
            margin: 20px auto;
            border: 5px solid #f0f0f0;
            border-radius: 10px;
            display: inline-block;
            padding: 20px;
            background: white;
        }
        .url {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            word-break: break-all;
            color: #333;
            font-family: monospace;
            font-size: 14px;
        }
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background: #f0f4f8;
            border-radius: 10px;
            color: #333;
        }
        .instructions h2 {
            margin-top: 0;
            color: #667eea;
            font-size: 20px;
        }
        .instructions ol {
            text-align: left;
            color: #666;
            line-height: 1.8;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            .instructions {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Wedding Photo Share</h1>
        <p>Scan this QR code to upload your photos!</p>
        <div class="qr-code">
            <img src="${config.fileName}" alt="QR Code" style="max-width: 100%; height: auto;">
        </div>
        <div class="url">
            ${config.url}
        </div>
        <div class="instructions">
            <h2>How to Use</h2>
            <ol>
                <li>Open your phone's camera app</li>
                <li>Point it at the QR code above</li>
                <li>Tap the notification that appears</li>
                <li>Upload your photos to share the memories!</li>
            </ol>
        </div>
    </div>
</body>
</html>
    `

    const htmlPath = path.join(config.outputDir, 'qr-preview.html')
    fs.writeFileSync(htmlPath, htmlContent)
    console.log(`🌐 HTML preview saved to: ${htmlPath}`)

  } catch (error) {
    console.error('❌ Error generating QR code:', error.message)
    process.exit(1)
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Wedding Photo Share - QR Code Generator

Usage: npm run generate-qr [options]

Options:
  --url <url>       The URL to encode in the QR code
                    Default: http://localhost:3000/upload

  --output <file>   The output filename
                    Default: wedding-photo-upload.png

  --size <pixels>   The size of the QR code in pixels
                    Default: 500

  --help, -h        Show this help message

Examples:
  npm run generate-qr
  npm run generate-qr --url https://mysite.com/upload
  npm run generate-qr --url https://mysite.com/upload --size 800
  npm run generate-qr --output custom-qr.png
  `)
  process.exit(0)
}

// Run the generator
generateQRCode()