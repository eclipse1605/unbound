import React, { useState, useEffect } from 'react';
import { useUnbound } from '../../context/UnboundContext';
import { formatDistanceToNow } from 'date-fns';
import { ethers } from 'ethers';

import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  Reply,
  Delete,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

const Comment = ({ comment, onLike, onUnlike, onReply, onDelete, currentUser, hasLiked }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState([]);
  const { getCommentReplies, shortenAddress, getENSName } = useUnbound();
  const [authorName, setAuthorName] = useState(null);

  useEffect(() => {
    const loadAuthorName = async () => {
      const ensName = await getENSName(comment.author);
      setAuthorName(ensName || shortenAddress(comment.author));
    };
    
    loadAuthorName();
  }, [comment.author, getENSName, shortenAddress]);

  useEffect(() => {
    if (showReplies && replies.length === 0) {
      fetchReplies();
    }
  }, [showReplies]);

  const fetchReplies = async () => {
    try {
      const replyIds = await getCommentReplies(comment.id);
      if (replyIds.length > 0) {
        const repliesData = await Promise.all(replyIds.map(id => getCommentDetails(id)));
        setReplies(repliesData);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      
      setTimeout(fetchReplies, 2000);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={`https:
              alt={authorName} 
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="subtitle2" color="text.secondary">
              {authorName} • {formatDistanceToNow(new Date(Number(comment.timestamp) * 1000), { addSuffix: true })}
            </Typography>
          </Box>
          <Typography variant="body2">
            {comment.content || "[Comment deleted]"}
          </Typography>
        </CardContent>
        <CardActions sx={{ pt: 0 }}>
          <Tooltip title={hasLiked ? "Unlike" : "Like"}>
            <IconButton
              size="small"
              onClick={() => hasLiked ? onUnlike(comment.id) : onLike(comment.id)}
              color={hasLiked ? "primary" : "default"}
            >
              {hasLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {comment.likes}
              </Typography>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reply">
            <IconButton size="small" onClick={() => setShowReplyForm(!showReplyForm)}>
              <Reply fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {replies.length > 0 && (
            <Button 
              startIcon={showReplies ? <ExpandLess /> : <ExpandMore />}
              size="small" 
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? 'Hide replies' : `Show replies (${replies.length})`}
            </Button>
          )}
          
          {currentUser === comment.author && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(comment.id)} sx={{ ml: 'auto' }}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      </Card>
      
      {showReplyForm && (
        <Box sx={{ ml: 4, mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button size="small" onClick={() => setShowReplyForm(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              disabled={!replyContent.trim()} 
              onClick={handleReplySubmit}
            >
              Reply
            </Button>
          </Box>
        </Box>
      )}
      
      {showReplies && replies.length > 0 && (
        <Box sx={{ ml: 4, mt: 1 }}>
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onUnlike={onUnlike}
              onReply={onReply}
              onDelete={onDelete}
              currentUser={currentUser}
              hasLiked={reply.hasLiked}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const CommentSection = ({ contentId, contentType = 'spark' }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const { 
    getCommentsForSpark, 
    getCommentsForRebound,
    getCommentDetails,
    createComment, 
    likeComment, 
    unlikeComment,
    deleteComment,
    hasLikedComment
  } = useUnbound();

  useEffect(() => {
    const getAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Failed to get accounts:", error);
        }
      }
    };
    
    getAddress();
  }, []);

  useEffect(() => {
    if (contentId) {
      loadComments();
    }
  }, [contentId, contentType]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentIds = contentType === 'spark' 
        ? await getCommentsForSpark(contentId)
        : await getCommentsForRebound(contentId);
      
      if (commentIds.length > 0) {
        const commentsWithLikes = await Promise.all(
          commentIds.map(async (id) => {
            const comment = await getCommentDetails(id);
            const hasLiked = await hasLikedComment(id, address);
            return { ...comment, hasLiked };
          })
        );

        const rootComments = commentsWithLikes.filter(comment => comment.parentId.toString() === '0');
        setComments(rootComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      await createComment(contentId, newComment, 0); 
      setNewComment('');
      console.log("Comment posted successfully!");

      setTimeout(loadComments, 2000);
    } catch (error) {
      console.error("Error posting comment:", error);
      console.log("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      setLoading(true);
      await createComment(contentId, content, parentId);
      console.log("Reply posted successfully!");

    } catch (error) {
      console.error("Error posting reply:", error);
      console.log("Failed to post reply");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    try {
      await likeComment(commentId);
      
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, likes: Number(c.likes) + 1, hasLiked: true }
          : c
      ));
    } catch (error) {
      console.error("Error liking comment:", error);
      console.log("Failed to like comment");
    }
  };

  const handleUnlike = async (commentId) => {
    try {
      await unlikeComment(commentId);
      
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, likes: Number(c.likes) - 1, hasLiked: false }
          : c
      ));
    } catch (error) {
      console.error("Error unliking comment:", error);
      console.log("Failed to unlike comment");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, content: "[Comment deleted]" }
          : c
      ));
      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      console.log("Failed to delete comment");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button 
            variant="contained" 
            disabled={!newComment.trim() || loading} 
            onClick={handleCommentSubmit}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {loading && comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">
          Loading comments...
        </Typography>
      ) : comments.length > 0 ? (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onReply={handleReply}
              onDelete={handleDelete}
              currentUser={address}
              hasLiked={comment.hasLiked}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center">
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Box>
  );
};

export default CommentSection; 