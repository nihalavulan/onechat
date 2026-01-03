'use client'

import CommentBox from './CommentBox'

export default function PostCard({ post }) {
  const { id, content, imageUrl, createdAt, author, comments = [] } = post

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-4">
      {/* Author Info */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
          <span className="text-text-inverse text-sm font-medium">
            {author?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <p className="font-medium text-text-primary text-sm">{author?.email || 'Unknown'}</p>
          <p className="text-xs text-text-muted">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      {content && (
        <p className="text-text-primary mb-3 whitespace-pre-wrap">{content}</p>
      )}

      {/* Post Image */}
      {imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt="Post"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="mb-3 pt-3 border-t border-border">
          <h4 className="text-xs font-medium text-text-secondary mb-2">Comments</h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-text-inverse text-xs font-medium">
                    {comment.author?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xs font-medium text-text-primary">
                      {comment.author?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-text-primary">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Box */}
      <CommentBox postId={id} />
    </div>
  )
}

