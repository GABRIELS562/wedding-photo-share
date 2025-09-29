import React from 'react'
import { motion } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  PinterestShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  PinterestIcon,
  EmailIcon
} from 'react-share'
import { Photo } from '../../types'

interface SocialShareModalProps {
  photo: Photo
  onClose: () => void
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ photo, onClose }) => {
  const [copied, setCopied] = React.useState(false)

  const shareUrl = window.location.origin + `/photo/${photo.id}`
  const shareTitle = `Wedding Photo by ${photo.uploaderName || 'Guest'}`
  const shareDescription = photo.message || 'Check out this beautiful wedding photo!'

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Share Photo
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary-500 hover:text-secondary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Photo Preview */}
        <div className="mb-6">
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.uploaderName}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <FacebookShareButton url={shareUrl} quote={shareDescription}>
            <div className="flex flex-col items-center space-y-1">
              <FacebookIcon size={48} round />
              <span className="text-xs text-secondary-600">Facebook</span>
            </div>
          </FacebookShareButton>

          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <div className="flex flex-col items-center space-y-1">
              <TwitterIcon size={48} round />
              <span className="text-xs text-secondary-600">Twitter</span>
            </div>
          </TwitterShareButton>

          <WhatsappShareButton url={shareUrl} title={shareTitle}>
            <div className="flex flex-col items-center space-y-1">
              <WhatsappIcon size={48} round />
              <span className="text-xs text-secondary-600">WhatsApp</span>
            </div>
          </WhatsappShareButton>

          <PinterestShareButton
            url={shareUrl}
            media={photo.url}
            description={shareDescription}
          >
            <div className="flex flex-col items-center space-y-1">
              <PinterestIcon size={48} round />
              <span className="text-xs text-secondary-600">Pinterest</span>
            </div>
          </PinterestShareButton>

          <EmailShareButton url={shareUrl} subject={shareTitle} body={shareDescription}>
            <div className="flex flex-col items-center space-y-1">
              <EmailIcon size={48} round />
              <span className="text-xs text-secondary-600">Email</span>
            </div>
          </EmailShareButton>
        </div>

        {/* Copy Link */}
        <div className="bg-secondary-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-secondary-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-2">Link copied to clipboard!</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SocialShareModal