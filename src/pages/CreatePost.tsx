import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit3, 
  FiSend, 
  FiHash, 
  FiX, 
  FiPlus,
  FiHeart,
  FiStar,
  FiZap,
  FiFeather,
  FiCamera,
  FiSmile,
  FiTrendingUp,
  FiUsers,
  FiShare2,
  FiEye,
  FiMessageCircle,
  FiCheck,
  FiUser,
  FiAlertTriangle
} from 'react-icons/fi';
import { postService, type CreatePostRequest } from '../services/postService';

interface PostData {
  text: string;
  tags: string[];
}

const SUGGESTED_TAGS = [
  'noticias', 'tendencias', 'moda', 'belleza', 'lifestyle', 'inspiracion', 
  'motivacion', 'amor', 'amistad', 'familia', 'trabajo', 'estudio',
  'viajes', 'comida', 'musica', 'arte', 'fotografia', 'naturaleza',
  'fitness', 'salud', 'tecnologia', 'libros', 'peliculas', 'series'
];

const MAGICAL_EMOJIS = ['✨', '💫', '🌟', '💖', '🌸', '🦋', '🌺', '💝', '🎀', '🌙'];

export default function CreatePost() {
  const [postData, setPostData] = useState<PostData>({ text: '', tags: [] });
  const [isPosting, setIsPosting] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [magicalParticles, setMagicalParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CHARS = 500;
  const MAX_TAGS = 5;

  useEffect(() => {
    setCharCount(postData.text.length);
  }, [postData.text]);

  // Generar partículas mágicas
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setPostData(prev => ({ ...prev, text }));
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !postData.tags.includes(tag.trim().toLowerCase()) && postData.tags.length < MAX_TAGS) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim().toLowerCase()]
      }));
      setCurrentTag('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = postData.text.slice(0, start) + emoji + postData.text.slice(end);
      
      if (newText.length <= MAX_CHARS) {
        setPostData(prev => ({ ...prev, text: newText }));
        
        // Restaurar posición del cursor
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + emoji.length;
            textareaRef.current.selectionEnd = start + emoji.length;
            textareaRef.current.focus();
          }
        }, 0);
      }
    }
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postData.text.trim()) return;

    setIsPosting(true);
    
    const postRequest: CreatePostRequest = {
      text: postData.text,
      tags: postData.tags
    };

    try {
      await postService.createPost(postRequest);
      console.log('Post creado:', postData);
      
      // Mostrar notificación de éxito
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      
      // Reset form
      setPostData({ text: '', tags: [] });
      setIsPosting(false);
    } catch (error) {
      console.error('Error al crear post:', error);
      
      // Mostrar notificación de error
      setErrorMessage(error instanceof Error ? error.message : 'Error al crear el post');
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 4000);
      
      setIsPosting(false);
    }
  };

  const getCharCountColor = () => {
    const percentage = (charCount / MAX_CHARS) * 100;
    if (percentage < 70) return 'text-emerald-500';
    if (percentage < 90) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Fondo mágico mejorado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes principales */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-300/60 via-pink-300/50 to-purple-300/40 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/50 via-rose-300/45 to-purple-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/45 via-pink-300/40 to-rose-300/35 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-32 -right-40 w-96 h-96 bg-gradient-to-br from-rose-400/55 via-pink-400/45 to-purple-400/40 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Partículas mágicas flotantes */}
        <AnimatePresence>
          {magicalParticles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: -100 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            >
              <div className="w-4 h-4 bg-gradient-to-br from-rose-400/80 to-pink-400/80 rounded-full blur-sm shadow-lg shadow-rose-400/50 animate-pulse" />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Efectos de brillo */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <div className="w-2 h-2 bg-gradient-to-br from-rose-400/60 to-pink-400/60 rounded-full blur-sm shadow-lg shadow-rose-400/40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-8 py-12">
        {/* Header Mágico */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-8">
            <motion.div 
              className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/60 relative overflow-hidden"
              animate={{ 
                boxShadow: [
                  "0 25px 50px -12px rgba(244, 114, 182, 0.6)",
                  "0 25px 50px -12px rgba(236, 72, 153, 0.8)",
                  "0 25px 50px -12px rgba(244, 114, 182, 0.6)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <FiFeather className="w-16 h-16 text-white relative z-10" />
              </motion.div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl">
                <FiZap className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            <motion.div 
              className="absolute -inset-6 bg-gradient-to-r from-rose-400/30 via-pink-400/30 to-purple-400/30 blur-2xl rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <motion.h1 
            className="text-7xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Crear Post Mágico
            <motion.div 
              className="absolute -top-4 -right-12"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiStar className="w-10 h-10 text-rose-400/70" />
            </motion.div>
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Comparte tus pensamientos más hermosos con el mundo ✨
          </motion.p>
        </motion.div>

        {/* Formulario Principal */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="backdrop-blur-3xl bg-gradient-to-br from-white/50 via-white/40 to-white/30 border-2 border-white/60 rounded-3xl p-8 shadow-2xl shadow-rose-500/40 relative overflow-hidden">
            {/* Efectos de fondo del formulario */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-rose-400/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              {/* Área de texto principal */}
              <div className="relative">
                <div className="relative group">
                  <textarea
                    ref={textareaRef}
                    value={postData.text}
                    onChange={handleTextChange}
                    placeholder="¿Qué quieres compartir hoy? ✨"
                    className="w-full h-48 p-6 bg-white/30 backdrop-blur-2xl border-2 border-white/50 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-rose-400/50 focus:border-rose-400/70 transition-all duration-500 resize-none text-lg leading-relaxed group-hover:bg-white/40"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  
                  {/* Contador de caracteres */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className={`text-sm font-medium ${getCharCountColor()}`}>
                      {charCount}/{MAX_CHARS}
                    </span>
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-400/20 flex items-center justify-center"
                      animate={{ scale: charCount > MAX_CHARS * 0.9 ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.5, repeat: charCount > MAX_CHARS * 0.9 ? Infinity : 0 }}
                    >
                      <FiEdit3 className="w-4 h-4 text-rose-500" />
                    </motion.div>
                  </div>
                </div>

                {/* Barra de herramientas */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {/* Botón de emojis */}
                    <motion.button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl hover:from-yellow-400/30 hover:to-orange-400/30 transition-all duration-300 group"
                    >
                      <FiSmile className="w-5 h-5 text-yellow-600 group-hover:text-yellow-700" />
                    </motion.button>

                    {/* Botón de cámara (decorativo) */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-xl border border-blue-400/30 rounded-xl hover:from-blue-400/30 hover:to-purple-400/30 transition-all duration-300 group"
                    >
                      <FiCamera className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                    </motion.button>

                    {/* Botón de vista previa */}
                    <motion.button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 backdrop-blur-xl border border-emerald-400/30 rounded-xl hover:from-emerald-400/30 hover:to-teal-400/30 transition-all duration-300 group"
                    >
                      <FiEye className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
                    </motion.button>
                  </div>

                  {/* Indicador de estado */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Listo para publicar</span>
                  </div>
                </div>

                {/* Picker de emojis */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      className="absolute top-full left-0 mt-2 p-4 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl shadow-rose-500/30 z-20"
                    >
                      <div className="grid grid-cols-5 gap-2">
                        {MAGICAL_EMOJIS.map((emoji, index) => (
                          <motion.button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg hover:bg-rose-100/50 transition-all duration-200"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <span className="text-2xl">{emoji}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sección de Tags */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FiHash className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Tags Mágicos</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-rose-300/50 to-transparent" />
                </div>

                {/* Tags actuales */}
                <AnimatePresence>
                  {postData.tags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 mb-4"
                    >
                      {postData.tags.map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400/20 to-pink-400/20 backdrop-blur-xl border border-rose-400/30 rounded-full group hover:from-rose-400/30 hover:to-pink-400/30 transition-all duration-300"
                        >
                          <FiHash className="w-3 h-3 text-rose-600" />
                          <span className="text-sm font-medium text-rose-700">{tag}</span>
                          <motion.button
                            type="button"
                            onClick={() => removeTag(tag)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 rounded-full hover:bg-rose-500/20 transition-all duration-200"
                          >
                            <FiX className="w-3 h-3 text-rose-500" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input de tag */}
                <div className="relative">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(currentTag);
                      }
                    }}
                    onFocus={() => setShowTagSuggestions(true)}
                    placeholder="Agregar tag..."
                    className="w-full p-4 bg-white/30 backdrop-blur-2xl border-2 border-white/50 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-rose-400/50 focus:border-rose-400/70 transition-all duration-500"
                    disabled={postData.tags.length >= MAX_TAGS}
                  />
                  
                  {currentTag && (
                    <motion.button
                      type="button"
                      onClick={() => addTag(currentTag)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-rose-500/30"
                    >
                      <FiPlus className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Sugerencias de tags */}
                <AnimatePresence>
                  {showTagSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl p-4 shadow-2xl shadow-rose-500/30"
                    >
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Sugerencias populares:</h4>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_TAGS
                          .filter(tag => !postData.tags.includes(tag) && tag.includes(currentTag.toLowerCase()))
                          .slice(0, 8)
                          .map((tag, index) => (
                            <motion.button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-3 py-1 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-xl border border-gray-300/50 rounded-full text-sm text-gray-700 hover:from-rose-100/80 hover:to-pink-100/80 hover:border-rose-300/50 hover:text-rose-700 transition-all duration-300"
                            >
                              #{tag}
                            </motion.button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-xs text-gray-500 text-center">
                  {postData.tags.length}/{MAX_TAGS} tags • Presiona Enter para agregar
                </div>
              </div>

              {/* Botón de publicar */}
              <motion.button
                type="submit"
                disabled={!postData.text.trim() || isPosting}
                whileHover={{ scale: !postData.text.trim() || isPosting ? 1 : 1.02 }}
                whileTap={{ scale: !postData.text.trim() || isPosting ? 1 : 0.98 }}
                className={`
                  w-full py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden
                  ${postData.text.trim() && !isPosting
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white shadow-2xl shadow-rose-500/50 hover:shadow-rose-500/70'
                    : 'bg-gray-300/50 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent rounded-2xl" />
                
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isPosting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FiZap className="w-6 h-6" />
                      </motion.div>
                      <span>Creando magia...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-6 h-6" />
                      <span>Publicar Post Mágico</span>
                      <FiZap className="w-5 h-5" />
                    </>
                  )}
                </div>

                {/* Efectos de brillo en el botón */}
                {postData.text.trim() && !isPosting && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Preview del Post */}
        <AnimatePresence>
          {showPreview && postData.text.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="mt-8 backdrop-blur-3xl bg-gradient-to-br from-white/60 via-white/50 to-white/40 border-2 border-white/70 rounded-3xl p-6 shadow-2xl shadow-rose-500/30 relative overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Vista Previa</h4>
                    <p className="text-sm text-gray-500">Así se verá tu post</p>
                  </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-4 mb-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{postData.text}</p>
                </div>

                {postData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {postData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gradient-to-r from-rose-400/20 to-pink-400/20 backdrop-blur-xl border border-rose-400/30 rounded-full text-sm text-rose-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                      <FiHeart className="w-4 h-4" />
                      <span>0</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <FiMessageCircle className="w-4 h-4" />
                      <span>0</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
                      <FiShare2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span>Hace unos segundos</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estadísticas decorativas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: FiUsers, label: 'Comunidad', value: '10K+', color: 'from-blue-400 to-purple-400' },
            { icon: FiTrendingUp, label: 'Posts Diarios', value: '500+', color: 'from-emerald-400 to-teal-400' },
            { icon: FiHeart, label: 'Reacciones', value: '50K+', color: 'from-rose-400 to-pink-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="backdrop-blur-2xl bg-white/30 border border-white/50 rounded-2xl p-6 text-center hover:bg-white/40 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Notificación de éxito */}
      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-2xl shadow-emerald-500/50 z-50 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">¡Post Creado!</h4>
                <p className="text-sm opacity-90">Tu post mágico ha sido publicado</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación de error */}
      <AnimatePresence>
        {showErrorNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-red-500 to-rose-500 text-white p-6 rounded-2xl shadow-2xl shadow-red-500/50 z-50 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Error al crear post</h4>
                <p className="text-sm opacity-90">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 