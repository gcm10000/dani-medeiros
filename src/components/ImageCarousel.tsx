import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Trash, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ProductImage } from '@/services/productService';

interface ImageCarouselProps {
  images: ProductImage[];
  onImagesChange?: (images: ProductImage[]) => void;
  onSetMainImage?: (id: number) => void;
  onUpload?: (files: FileList) => void;
  isEditing?: boolean;
  className?: string;
  onRemoveImage: (id: number) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onSetMainImage,
  onImagesChange,
  onUpload,
  isEditing = false,
  className = '',
  onRemoveImage,
  currentIndex,
  setCurrentIndex
}) => {

  // Pré-carrega todas as imagens para melhorar a UX
  useEffect(() => {
    images.forEach(img => {
      const preload = new window.Image();
      preload.src = img.url;
    });
  }, [images]);

  const nextImage = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleSetMainImage = (index: number) => {
    if (onSetMainImage) {
      onSetMainImage(index);
    }
  }

  const removeImage = (id: number) => {
    if (onRemoveImage) {
      onRemoveImage(id);
      // Não altera o índice aqui; o pai deve controlar após remoção
    } else if (onImagesChange) {
      const newImages = images.filter((img) => img.id !== id);
      onImagesChange(newImages);
      // Não altera o índice aqui; o pai deve controlar após remoção
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onUpload) {
      onUpload(files);
    }
  };

  if (images.length === 0) {
    return (
      <div className={`aspect-square bg-muted rounded-lg flex flex-col items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4 opacity-50">📷</div>
          <p className="text-muted-foreground mb-4">Nenhuma imagem adicionada</p>
          {isEditing && (
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Imagens
                  </span>
                </Button>
              </Label>
              <Input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-square rounded-lg overflow-hidden group ${className}`}>
      {/* Current Image */}
      <img
        src={images[currentIndex]?.url}
        alt={`Imagem ${currentIndex + 1}`}
        className="w-full h-full object-contain"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Edit Controls */}
      {isEditing && (
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Botão estrela na extrema esquerda */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleSetMainImage(images[currentIndex].id)}
            className=""
            title="Definir como principal"
          >
            <Star className="h-4 w-4" style={{ color: images[currentIndex]?.isMain ? '#FFD700' : undefined }} />
          </Button>

          {/* Upload e Remover na extrema direita */}
          <div className="flex gap-2">
            <Label htmlFor="image-upload-existing" className="cursor-pointer">
              <Button variant="secondary" size="icon" className="bg-black/50 hover:bg-black/70 text-white border-none" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
            </Label>
            <Input
              id="image-upload-existing"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />    
            <Button
              variant="destructive"
              size="icon"
              className="bg-red-500/50 hover:bg-red-500/70 text-white border-none"
              onClick={() => removeImage(images[currentIndex].id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Thumbnail indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;