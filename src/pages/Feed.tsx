import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants, TargetAndTransition } from 'framer-motion';
import { usePosts } from '../hooks/usePosts';
import { FaThumbsUp, FaHeart, FaLightbulb, FaThumbsDown, FaLaugh, FaSurprise, FaComment, FaShare, FaPaperPlane, FaFeather, FaEdit, FaCheck, FaTimes, FaTrash, FaLink, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import type { PostReactions, Post, Comment } from '../types/post.types';
import clsx from "clsx";
import { formatTimeAgo } from "../utils/dateUtils";
import { reactionColors, reactionIcons, type ReactionType } from "../types/post.types";
import React from 'react';
import type { IconType } from 'react-icons';
import { commentService } from '../api/commentService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReactionBar } from '../components/ReactionBar';
import { useAuthStore } from '../store/authStore';
import { postService } from '../api/postService';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ReactionCounter } from '../components/ReactionCounter';

// Configuración de animaciones
const animations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
} as const;

const hoverAnimation: TargetAndTransition = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1]
  }
};

interface CommentState {
  [postId: string]: Comment[];
}

const Feed = () => {
  const { posts, loading, error, pagination, loadPosts } = usePosts();
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [selectedReactions, setSelectedReactions] = useState<Record<string, keyof PostReactions | null>>({});
  const [magicalParticles, setMagicalParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentState>({});
  const [loadingComments, setLoadingComments] = useState<{ [postId: string]: boolean }>({});
  const [filter, setFilter] = useState<'all' | 'user'>('all');
  const [page, setPage] = useState(1);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});

  const { user } = useAuthStore();
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.userId.email === user?.email);

  // Efecto para partículas mágicas
  useEffect(() => {
    const interval = setInterval(() => {
      setMagicalParticles(prev => [
        ...prev.slice(-15),
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Cargar posts cuando cambia la página o el usuario
  useEffect(() => {
    loadPosts(page);
  }, [page, user?.email]);

  // Cargar comentarios iniciales para todos los posts
  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach(post => {
        loadComments(post._id);
      });
    }
  }, [posts]);

  const handleReaction = (postId: string, reactionType: keyof PostReactions) => {
    setSelectedReactions(prev => ({
      ...prev,
      [postId]: prev[postId] === reactionType ? null : reactionType
    }));
    setShowReactions(null);
  };

  const renderReactionIcon = (type: keyof PostReactions) => {
    const Icon = reactionIcons[type];
    return <Icon className="h-5 w-5" />;
  };

  // Función para cargar comentarios actualizada
  const loadComments = async (postId: string) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await commentService.getComments('post', postId);
      setComments(prev => ({ ...prev, [postId]: response.data.comments }));
      setCommentCounts(prev => ({ ...prev, [postId]: response.data.comments.length }));
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      toast.error('No se pudieron cargar los comentarios');
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Función para manejar la creación de comentarios actualizada
  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setCommentError(null);
    
    try {
      await commentService.createComment({
        parentType: 'post',
        parentId: postId,
        text: commentText.trim()
      });

      setCommentText('');
      toast.success('¡Comentario publicado!');
      
      // Recargar los comentarios del post
      await loadComments(postId);
      // Actualizar el contador
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    } catch (error: any) {
      console.error('Error al crear comentario:', error);
      const errorMessage = error.response?.data?.message || 'Error al publicar el comentario';
      setCommentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (postId: string) => {
    try {
      setIsSubmittingEdit(true);
      await postService.updatePost(postId, {
        text: editText,
        tags: editTags
      });
      
      // Recargar los posts para mostrar los cambios
      await loadPosts(page);
      
      setEditingPost(null);
      setEditText('');
      setEditTags([]);
      toast.success('Post actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el post:', error);
      toast.error('No se pudo actualizar el post');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const startEditing = (post: Post) => {
    setEditingPost(post._id);
    setEditText(post.text);
    setEditTags(post.tags || []);
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setEditText('');
    setEditTags([]);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      setIsDeletingPost(true);
      await postService.deletePost(postToDelete);
      await loadPosts(page);
      toast.success('Post eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      toast.error('No se pudo eliminar el post');
    } finally {
      setIsDeletingPost(false);
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  const openDeleteConfirm = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const handleShare = async (postId: string, platform: 'copy' | 'twitter' | 'facebook' | 'whatsapp') => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    const postUrl = `${window.location.origin}/post/${postId}`;
    const postText = post.text.length > 100 ? post.text.substring(0, 97) + '...' : post.text;
    const hashtags = post.tags?.join(',') || '';
    
    switch (platform) {
      case 'copy':
        try {
          const textToCopy = `${postText}\n\nVer más en: ${postUrl}`;
          await navigator.clipboard.writeText(textToCopy);
          toast.success('¡Contenido copiado al portapapeles!');
        } catch (error) {
          toast.error('No se pudo copiar el contenido');
        }
        break;
      
      case 'twitter':
        const twitterText = encodeURIComponent(`${postText}\n\n${hashtags ? '#' + hashtags.replace(/,/g, ' #') : ''}`);
        window.open(
          `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(postUrl)}`,
          '_blank'
        );
        break;
      
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(postText)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      
      case 'whatsapp':
        const whatsappText = `${postText}\n\n${hashtags ? '#' + hashtags.replace(/,/g, ' #') + '\n\n' : ''}Ver más en: ${postUrl}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
          '_blank'
        );
        break;
    }
    
    setShowShareMenu(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* Fondo mágico */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-300/60 via-pink-300/50 to-purple-300/40 blur-3xl rounded-full animate-pulse" />
          <div className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/50 via-rose-300/45 to-purple-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-32 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/45 via-pink-300/40 to-rose-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        <div className="flex justify-center items-center min-h-screen relative z-10">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full border-t-2 border-b-2 border-pink-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-t-2 border-b-2 border-pink-400"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-4 rounded-full border-t-2 border-b-2 border-pink-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="w-32 h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* Fondo mágico */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-300/60 via-pink-300/50 to-purple-300/40 blur-3xl rounded-full animate-pulse" />
          <div className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/50 via-rose-300/45 to-purple-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-32 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/45 via-pink-300/40 to-rose-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        <motion.div
          className="flex justify-center items-center min-h-screen relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="text-red-500 text-xl backdrop-blur-lg bg-white/30 px-6 py-4 rounded-xl border border-white/50 shadow-xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            {error}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Fondo mágico */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes principales */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-300/60 via-pink-300/50 to-purple-300/40 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/50 via-rose-300/45 to-purple-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/45 via-pink-300/40 to-rose-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header fijo */}
      <header className="sticky top-0 z-50 px-4 py-12 bg-gradient-to-b from-rose-50 via-rose-50/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Icono circular */}
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg shadow-pink-400/20"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </motion.div>

            {/* Título */}
            <motion.h1 
              className="text-5xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Feed
            </motion.h1>

            {/* Subtítulo */}
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Explora y comparte momentos mágicos
            </motion.p>

            {/* Botones de filtro */}
            <motion.div
              className="flex justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={() => setFilter('all')}
                className={clsx(
                  "px-6 py-2 rounded-full transition-all duration-300",
                  "backdrop-blur-sm border border-white/50",
                  filter === 'all'
                    ? "bg-gradient-to-r from-pink-400/70 to-purple-400/70 text-white shadow-lg shadow-pink-400/20"
                    : "bg-white/20 text-gray-700 hover:bg-white/30"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Todos los posts
              </motion.button>
              {user && (
                <motion.button
                  onClick={() => setFilter('user')}
                  className={clsx(
                    "px-6 py-2 rounded-full transition-all duration-300",
                    "backdrop-blur-sm border border-white/50",
                    filter === 'user'
                      ? "bg-gradient-to-r from-pink-400/70 to-purple-400/70 text-white shadow-lg shadow-pink-400/20"
                      : "bg-white/20 text-gray-700 hover:bg-white/30"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mis posts
                </motion.button>
              )}
            </motion.div>

            {/* Decoración de puntos */}
            <div className="absolute -top-8 left-1/4 w-2 h-2 bg-pink-400 rounded-full opacity-30" />
            <div className="absolute top-12 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-20" />
            <div className="absolute -bottom-4 left-1/3 w-2 h-2 bg-rose-400 rounded-full opacity-25" />
          </motion.div>
        </div>
      </header>

      {/* Contenedor principal */}
      <main className="pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-red-500 text-lg">
                Hubo un error al cargar los posts. Por favor, intenta de nuevo.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              variants={animations.container}
              initial="hidden"
              animate="show"
            >
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {filteredPosts.map((post) => (
                    <motion.article
                      key={post._id}
                      variants={animations.item}
                      className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-lg">
                            {post.userId.email[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-900 font-medium">
                                {post.userId.email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(post.createdAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                              </p>
                            </div>
                            {filter === 'user' && post.userId.email === user?.email && !editingPost && (
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => startEditing(post)}
                                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-pink-600 bg-pink-50/50 hover:bg-pink-100/50 transition-colors border border-pink-200/50"
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                  <span className="text-sm">Editar</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openDeleteConfirm(post._id)}
                                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-red-600 bg-red-50/50 hover:bg-red-100/50 transition-colors border border-red-200/50"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                  <span className="text-sm">Eliminar</span>
                                </motion.button>
                              </div>
                            )}
                          </div>

                          {editingPost === post._id ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="mt-4 bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-inner"
                            >
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="postText" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contenido del post
                                  </label>
                                  <textarea
                                    id="postText"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm rounded-xl resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400/50 text-gray-800 placeholder-gray-500 border border-white/50"
                                    rows={3}
                                    placeholder="¿Qué estás pensando?"
                                  />
                                </div>

                                <div>
                                  <label htmlFor="postTags" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags
                                  </label>
                                  <div className="relative">
                                    <input
                                      id="postTags"
                                      type="text"
                                      value={editTags.join(', ')}
                                      onChange={(e) => setEditTags(e.target.value.split(',').map(tag => tag.trim()))}
                                      placeholder="Separa los tags con comas (ej: noticias, actualización)"
                                      className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-sm rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400/50 text-gray-800 placeholder-gray-500 border border-white/50 pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                      <span className="text-gray-400">#</span>
                                    </div>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Los tags ayudan a categorizar tu post y hacerlo más fácil de encontrar
                                  </p>
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={cancelEditing}
                                    className="px-4 py-2 rounded-xl text-gray-700 bg-gray-200/50 hover:bg-gray-200/70 transition-colors flex items-center space-x-2 border border-gray-200/50"
                                  >
                                    <FaTimes className="h-4 w-4" />
                                    <span>Cancelar</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleEditSubmit(post._id)}
                                    disabled={isSubmittingEdit || !editText.trim()}
                                    className={clsx(
                                      "px-4 py-2 rounded-xl text-white",
                                      "bg-gradient-to-r from-pink-400 to-purple-400",
                                      "shadow-lg transition-all duration-300 flex items-center space-x-2",
                                      "disabled:opacity-50 disabled:cursor-not-allowed",
                                      "border border-pink-300/50"
                                    )}
                                  >
                                    {isSubmittingEdit ? (
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5"
                                      >
                                        <svg className="animate-spin" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                      </motion.div>
                                    ) : (
                                      <>
                                        <FaCheck className="h-4 w-4" />
                                        <span>Guardar cambios</span>
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <>
                              <p className="mt-3 text-gray-800">
                                {post.text}
                              </p>
                              {/* Tags */}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {post.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 text-sm font-medium text-pink-600 bg-pink-50/50 rounded-full"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {/* Sección de reacciones y comentarios */}
                          <div className="mt-4 space-y-3">
                            {/* Mostrar reacciones existentes */}
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                              <ReactionCounter 
                                targetType="post" 
                                targetId={post._id} 
                                size="md" 
                                onReactionChange={() => loadPosts(page)} 
                              />
                            </div>

                            {/* Barra de acciones */}
                            <div className="mt-4 flex items-center gap-4">
                              <ReactionBar
                                targetType="post"
                                targetId={post._id}
                                onReactionChange={() => loadPosts(page)}
                              />

                              <button
                                onClick={() => {
                                  setShowCommentInput(showCommentInput === post._id ? null : post._id);
                                  if (showCommentInput !== post._id) {
                                    loadComments(post._id);
                                  }
                                }}
                                className={clsx(
                                  "flex items-center gap-2 px-4 py-2 rounded-full",
                                  "text-gray-600 hover:text-gray-700",
                                  "transition-all duration-200",
                                  showCommentInput === post._id ? "bg-gray-100/50" : "bg-gray-50/50 hover:bg-gray-100/50",
                                  "font-medium"
                                )}
                              >
                                <FaComment className="h-5 w-5" />
                                <span>Comentarios ({commentCounts[post._id] || post.comments || 0})</span>
                              </button>

                              <button
                                onClick={() => setShowShareMenu(showShareMenu === post._id ? null : post._id)}
                                className={clsx(
                                  "flex items-center gap-2 px-4 py-2 rounded-full",
                                  "text-gray-600 hover:text-gray-700",
                                  "transition-all duration-200",
                                  showShareMenu === post._id ? "bg-gray-100/50" : "bg-gray-50/50 hover:bg-gray-100/50",
                                  "font-medium",
                                  "relative"
                                )}
                              >
                                <FaShare className="h-5 w-5" />
                                <span>Compartir</span>

                                <AnimatePresence>
                                  {showShareMenu === post._id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      className={clsx(
                                        "absolute bottom-full left-0 mb-2",
                                        "flex items-center gap-1 p-2",
                                        "bg-white rounded-xl shadow-lg",
                                        "backdrop-blur-sm bg-white/90"
                                      )}
                                    >
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShare(post._id, 'copy');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Copiar enlace"
                                      >
                                        <FaLink className="h-5 w-5" />
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShare(post._id, 'twitter');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-400"
                                        title="Compartir en Twitter"
                                      >
                                        <FaTwitter className="h-5 w-5" />
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShare(post._id, 'facebook');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                                        title="Compartir en Facebook"
                                      >
                                        <FaFacebook className="h-5 w-5" />
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShare(post._id, 'whatsapp');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-green-500"
                                        title="Compartir en WhatsApp"
                                      >
                                        <FaWhatsapp className="h-5 w-5" />
                                      </motion.button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>

                            {/* Sección de comentarios */}
                            {showCommentInput === post._id && (
                              <div className="mt-4 space-y-4">

                                 {/* Input para nuevo comentario */}
                                 <div className="relative mt-4">
                                  <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    className={clsx(
                                      "w-full px-4 py-3 rounded-2xl",
                                      "bg-white/50 backdrop-blur-sm",
                                      "border border-pink-100",
                                      "placeholder-gray-400",
                                      "focus:outline-none focus:ring-2 focus:ring-pink-200",
                                      "transition-all duration-200",
                                      "resize-none",
                                      "min-h-[100px]"
                                    )}
                                  />
                                  <button
                                    onClick={() => handleCommentSubmit(post._id)}
                                    disabled={isSubmitting || !commentText.trim()}
                                    className={clsx(
                                      "absolute bottom-3 right-3",
                                      "px-4 py-2 rounded-full",
                                      "bg-pink-500 hover:bg-pink-600",
                                      "text-white font-medium",
                                      "transition-all duration-200",
                                      "flex items-center gap-2",
                                      "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                  >
                                    <span>Comentar</span>
                                    <FaPaperPlane className="h-4 w-4" />
                                  </button>
                                </div>
                                {/* Lista de comentarios existentes */}
                                {loadingComments[post._id] ? (
                                  <div className="flex justify-center py-4">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <svg className="w-6 h-6 animate-spin text-pink-500" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                      </svg>
                                    </motion.div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {comments[post._id]?.map((comment) => (
                                      <motion.div
                                        key={comment._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {comment.userId.email[0].toUpperCase()}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm font-medium text-gray-900">
                                                {comment.userId.email}
                                              </p>
                                              <span className="text-xs text-gray-500">•</span>
                                              <p className="text-xs text-gray-500">
                                                {format(new Date(comment.createdAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                              </p>
                                            </div>
                                            <p className="mt-2 text-gray-800 text-sm">
                                              {comment.text}
                                            </p>

                                            {/* Reacciones del comentario */}
                                            <div className="mt-3">
                                              <ReactionCounter 
                                                targetType="comment" 
                                                targetId={comment._id} 
                                                size="sm" 
                                                onReactionChange={() => loadComments(post._id)} 
                                              />
                                            </div>

                                            {/* Botón de reaccionar al comentario */}
                                            <div className="mt-3">
                                              <ReactionBar
                                                targetType="comment"
                                                targetId={comment._id}
                                                onReactionChange={() => loadComments(post._id)}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}

                  {/* Mensaje cuando no hay posts */}
                  {filteredPosts.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <p className="text-gray-500 text-lg">
                        {filter === 'user' 
                          ? (
                            <>
                              <span className="block mb-2 text-xl font-semibold">No has creado ningún post aún</span>
                              <span className="block text-base">
                                ¡Sé el primero en compartir algo increíble!
                              </span>
                            </>
                          )
                          : (
                            <>
                              <span className="block mb-2 text-xl font-semibold">No hay posts para mostrar</span>
                              <span className="block text-base">
                                ¡Sé el primero en crear un post!
                              </span>
                            </>
                          )
                        }
                      </p>
                    </motion.div>
                  )}

                  {/* Paginación */}
                  {filteredPosts.length > 0 && pagination.pages > 1 && (
                    <div className="flex justify-center space-x-2 mt-8">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={clsx(
                            "px-4 py-2 rounded-full transition-all duration-300",
                            "border border-white/50",
                            page === pageNum
                              ? "bg-gradient-to-r from-pink-400/70 to-purple-400/70 text-white shadow-lg shadow-pink-400/20"
                              : "bg-white/30 text-gray-700 hover:bg-white/40"
                          )}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>

   

      {/* Modal de confirmación de eliminación */}
      <Transition show={showDeleteConfirm} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => !isDeletingPost && setShowDeleteConfirm(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  ¿Eliminar post?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este post?
                  </p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeletingPost}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex justify-center px-4 py-2 text-sm font-medium text-white",
                      "bg-red-500 border border-transparent rounded-md hover:bg-red-600",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    onClick={handleDeletePost}
                    disabled={isDeletingPost}
                  >
                    {isDeletingPost ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5"
                      >
                        <svg className="animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </motion.div>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Feed; 