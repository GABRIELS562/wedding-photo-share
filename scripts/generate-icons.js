const fs = require('fs')
const path = require('path')

// Wedding-themed SVG icon template
const createWeddingIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf8f5"/>
      <stop offset="100%" style="stop-color:#d4af37"/>
    </linearGradient>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d4b5a0"/>
      <stop offset="100%" style="stop-color:#9caf88"/>
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 8}" fill="url(#bgGradient)" stroke="#d4af37" stroke-width="${Math.max(2, size/64)}"/>

  <!-- Wedding rings -->
  <g transform="translate(${size/2}, ${size*0.42})">
    <circle cx="${-size*0.06}" cy="0" r="${size*0.08}" fill="none" stroke="#d4af37" stroke-width="${Math.max(2, size/48)}"/>
    <circle cx="${size*0.06}" cy="0" r="${size*0.08}" fill="none" stroke="#d4af37" stroke-width="${Math.max(2, size/48)}"/>
    <circle cx="${-size*0.06}" cy="0" r="${size*0.04}" fill="#d4af37" opacity="0.3"/>
    <circle cx="${size*0.06}" cy="0" r="${size*0.04}" fill="#d4af37" opacity="0.3"/>
  </g>

  <!-- Heart -->
  <g transform="translate(${size/2}, ${size*0.625})">
    <path d="M0,${size*0.04} C${-size*0.04},0 ${-size*0.08},0 ${-size*0.08},${size*0.04} C${-size*0.08},${size*0.08} 0,${size*0.125} 0,${size*0.125} C0,${size*0.125} ${size*0.08},${size*0.08} ${size*0.08},${size*0.04} C${size*0.08},0 ${size*0.04},0 0,${size*0.04} Z"
          fill="url(#heartGradient)" opacity="0.8"/>
  </g>

  <!-- Decorative dots -->
  <circle cx="${size*0.25}" cy="${size*0.25}" r="${Math.max(1, size*0.015)}" fill="#d4af37" opacity="0.6"/>
  <circle cx="${size*0.75}" cy="${size*0.25}" r="${Math.max(1, size*0.015)}" fill="#d4af37" opacity="0.6"/>
  <circle cx="${size*0.25}" cy="${size*0.75}" r="${Math.max(1, size*0.015)}" fill="#d4af37" opacity="0.6"/>
  <circle cx="${size*0.75}" cy="${size*0.75}" r="${Math.max(1, size*0.015)}" fill="#d4af37" opacity="0.6"/>
</svg>`

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Generate all icon sizes
iconSizes.forEach(size => {
  const svgContent = createWeddingIcon(size)
  const filename = `icon-${size}.svg`
  const filepath = path.join(iconsDir, filename)

  fs.writeFileSync(filepath, svgContent)
  console.log(`✨ Generated ${filename}`)
})

// Create additional PWA icons
const additionalIcons = {
  'upload-shortcut.svg': createWeddingIcon(192).replace('Wedding rings', 'Upload icon').replace(
    /<g transform="translate\([^>]*\)">[\s\S]*?<\/g>/,
    `<g transform="translate(${192/2}, ${192*0.42})">
      <path d="M${-192*0.08},${192*0.04} L0,${-192*0.04} L${192*0.08},${192*0.04} M0,${-192*0.04} L0,${192*0.08}"
            stroke="#d4af37" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>`
  ),
  'gallery-shortcut.svg': createWeddingIcon(192).replace('Wedding rings', 'Gallery icon').replace(
    /<g transform="translate\([^>]*\)">[\s\S]*?<\/g>/,
    `<g transform="translate(${192/2}, ${192*0.42})">
      <rect x="${-192*0.08}" y="${-192*0.06}" width="${192*0.06}" height="${192*0.06}"
            fill="none" stroke="#d4af37" stroke-width="4" rx="2"/>
      <rect x="${-192*0.02}" y="${-192*0.06}" width="${192*0.06}" height="${192*0.06}"
            fill="none" stroke="#d4af37" stroke-width="4" rx="2"/>
      <rect x="${192*0.04}" y="${-192*0.06}" width="${192*0.06}" height="${192*0.06}"
            fill="none" stroke="#d4af37" stroke-width="4" rx="2"/>
    </g>`
  ),
  'badge.svg': createWeddingIcon(96),
}

Object.entries(additionalIcons).forEach(([filename, content]) => {
  const filepath = path.join(iconsDir, filename)
  fs.writeFileSync(filepath, content)
  console.log(`✨ Generated ${filename}`)
})

console.log(`\n🎉 Generated ${iconSizes.length + Object.keys(additionalIcons).length} PWA icons!`)
console.log('📍 Icons saved to: public/icons/')