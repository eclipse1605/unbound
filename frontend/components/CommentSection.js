import { useState, useEffect } from 'react';
import { formatAddress, formatDate } from '../utils/format';
import { setupNetwork } from '../utils/ethereum';
import { fetchCommentsForSpark, createComment, likeComment, unlikeComment } from '../utils/comments';

export default function CommentSection({ sparkId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    loadComments();

    const getUserAccount = async () => {
      if (window.ethereum) {
        try {
          await setupNetwork();
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setUserAddress(accounts[0]);
        } catch (error) {
          console.error("Failed to get user account:", error);
        }
      }
    };
    
    getUserAccount();
  }, [sparkId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedComments = await fetchCommentsForSpark(sparkId);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setCommentLoading(true);
      setError('');
      
      await createComment(sparkId, newComment);
      setNewComment('');

      await loadComments();
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. " + (err.message || String(err)));
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentLike = async (commentId, isLiked) => {
    try {
      if (isLiked) {
        await unlikeComment(commentId);
      } else {
        await likeComment(commentId);
      }

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: !isLiked,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Error toggling comment like:", err);
      setError(`Failed to ${isLiked ? 'unlike' : 'like'} comment.`);
    }
  };

  const renderComment = (comment) => {
    return (
      <div key={comment.id} className="border-l-2 border-gray-700 pl-4 mb-4">
        <div className="flex items-center mb-1">
          <div className="text-sm font-medium text-white">@{formatAddress(comment.author)}</div>
          <div className="ml-2 text-xs text-gray-400">{formatDate(comment.timestamp)}</div>
        </div>
        
        <div className="text-white mb-2">{comment.content}</div>
        
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <button 
            onClick={() => handleCommentLike(comment.id, comment.liked)}
            className={`flex items-center mr-4 ${comment.liked ? 'text-[#9B7CFA]' : 'hover:text-[#9B7CFA]'}`}
          >
            <svg xmlns="http:
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{comment.likes}</span>
          </button>
          
          <button 
            onClick={() => {
              
              setComments(prevComments => 
                prevComments.map(c => ({
                  ...c,
                  showReplyForm: c.id === comment.id ? !c.showReplyForm : false
                }))
              );
            }}
            className="flex items-center hover:text-[#9B7CFA]"
          >
            <svg xmlns="http:
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Reply</span>
          </button>
        </div>
        
        {}
        {comment.showReplyForm && (
          <div className="mb-4">
            <textarea
              className="w-full bg-[#3A3A3A] p-2 text-white rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#9B7CFA]"
              rows="2"
              placeholder="Write a reply..."
              value={comment.replyText || ''}
              onChange={(e) => {
                setComments(prevComments => 
                  prevComments.map(c => {
                    if (c.id === comment.id) {
                      return { ...c, replyText: e.target.value };
                    }
                    return c;
                  })
                );
              }}
            />
            <div className="flex justify-end mt-2">
              <button
                className="bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white px-3 py-1 rounded mr-2"
                onClick={() => {
                  setComments(prevComments => 
                    prevComments.map(c => ({
                      ...c,
                      showReplyForm: false
                    }))
                  );
                }}
              >
                Cancel
              </button>
              <button
                className="bg-[#9B7CFA] hover:bg-[#8b6be0] text-white px-3 py-1 rounded"
                onClick={async () => {
                  if (!comment.replyText?.trim()) return;
                  
                  try {
                    setError('');

                    await createComment(sparkId, comment.replyText, comment.id);

                    setComments(prevComments => 
                      prevComments.map(c => ({
                        ...c,
                        showReplyForm: false,
                        replyText: ''
                      }))
                    );
                    
                    await loadComments();
                  } catch (err) {
                    console.error("Error posting reply:", err);
                    setError("Failed to post reply. " + (err.message || String(err)));
                  }
                }}
              >
                Reply
              </button>
            </div>
          </div>
        )}
        
        {}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 ml-4">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Comments</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http:
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {}
      <div className="mb-6">
        <textarea
          className="w-full bg-[#3A3A3A] p-3 text-white rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#9B7CFA]"
          rows="3"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            className="bg-[#9B7CFA] hover:bg-[#8b6be0] text-white px-4 py-2 rounded-lg"
            onClick={postComment}
            disabled={commentLoading || !newComment.trim()}
          >
            {commentLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http:
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              'Post Comment'
            )}
          </button>
        </div>
      </div>
      
      {}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-200 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.filter(comment => !comment.parentId).map(renderComment)}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
} 