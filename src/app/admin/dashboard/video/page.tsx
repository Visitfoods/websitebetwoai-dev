'use client';

import { useState, useRef } from 'react';
import { Upload, X, Play, Pause } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function VideoManagement() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido.');
      return;
    }

    // Validar tamanho (máximo 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 100MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = await user.getIdToken(true);
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('token', token);

      const response = await fetch('/api/admin/video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSuccess('Vídeo atualizado com sucesso!');
      setTimeout(() => {
        setSuccess('');
        window.location.reload(); // Recarrega a página para mostrar o novo vídeo
      }, 3000);
    } catch (error: any) {
      setError('Erro ao fazer upload do vídeo. Por favor, tente novamente.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestão do Vídeo</h1>
      </div>

      {/* Preview do vídeo atual */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Vídeo Atual</h2>
        <video
          src="/Video/Be2AIvideo.mp4"
          className="w-full aspect-video rounded-xl object-cover"
          controls
        />
      </div>

      {/* Upload de novo vídeo */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Atualizar Vídeo</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-100">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Área de drop/seleção */}
          <div className="relative">
            <input
              type="file"
              onChange={handleFileSelect}
              accept="video/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70">
                Arraste um vídeo ou clique para selecionar
              </p>
              <p className="text-white/40 text-sm mt-2">
                Formato MP4 • Máximo 100MB
              </p>
            </div>
          </div>

          {/* Preview do vídeo selecionado */}
          {previewUrl && (
            <div className="relative">
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={clearSelection}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full aspect-video rounded-xl object-cover"
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Botão de upload */}
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'A fazer upload...' : 'Atualizar Vídeo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 