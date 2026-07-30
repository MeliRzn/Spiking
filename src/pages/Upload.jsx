import { useState } from 'react'
import { Upload as UploadIcon, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '../lib/utils'

export function Upload() {
  const [warPointsImage, setWarPointsImage] = useState(null)
  const [weeklyPointsImage, setWeeklyPointsImage] = useState(null)
  const [warPointsPreview, setWarPointsPreview] = useState(null)
  const [weeklyPointsPreview, setWeeklyPointsPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleWarPointsChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setWarPointsImage(file)
      setWarPointsPreview(URL.createObjectURL(file))
    }
  }

  const handleWeeklyPointsChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setWeeklyPointsImage(file)
      setWeeklyPointsPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveWarPoints = () => {
    setWarPointsImage(null)
    setWarPointsPreview(null)
  }

  const handleRemoveWeeklyPoints = () => {
    setWeeklyPointsImage(null)
    setWeeklyPointsPreview(null)
  }

  const handleSubmit = async () => {
    if (!warPointsImage || !weeklyPointsImage) {
      alert('Por favor, envie ambas as imagens')
      return
    }

    setUploading(true)
    
    try {
      // TODO: Implement actual upload logic to backend
      console.log('Uploading images:', { warPointsImage, weeklyPointsImage })
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Comprovantes enviados com sucesso!')
      
      // Reset form
      setWarPointsImage(null)
      setWarPointsPreview(null)
      setWeeklyPointsImage(null)
      setWeeklyPointsPreview(null)
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Erro ao enviar comprovantes. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen pt-safe pb-24 px-4">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text">Enviar Metas</h1>
          <p className="text-textSecondary text-sm mt-1">Envie seus comprovantes semanais</p>
        </div>

        {/* Upload Areas */}
        <div className="space-y-6">
          {/* War Points Image */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Print dos Pontos da Guerra de Guilda
            </label>
            {warPointsPreview ? (
              <div className="relative glass rounded-2xl overflow-hidden">
                <img 
                  src={warPointsPreview} 
                  alt="War Points"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={handleRemoveWarPoints}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="glass rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer block">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center mb-3">
                    <ImageIcon className="w-8 h-8 text-textSecondary" />
                  </div>
                  <p className="text-textSecondary text-sm text-center">
                    Toque para selecionar a imagem
                  </p>
                  <p className="text-textSecondary text-xs text-center mt-1">
                    Guerra de Guilda
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWarPointsChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Weekly Points Image */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Print dos Pontos Semanais
            </label>
            {weeklyPointsPreview ? (
              <div className="relative glass rounded-2xl overflow-hidden">
                <img 
                  src={weeklyPointsPreview} 
                  alt="Weekly Points"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={handleRemoveWeeklyPoints}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="glass rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer block">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center mb-3">
                    <ImageIcon className="w-8 h-8 text-textSecondary" />
                  </div>
                  <p className="text-textSecondary text-sm text-center">
                    Toque para selecionar a imagem
                  </p>
                  <p className="text-textSecondary text-xs text-center mt-1">
                    Pontos Semanais
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWeeklyPointsChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!warPointsImage || !weeklyPointsImage || uploading}
            className={cn(
              'w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-200',
              (!warPointsImage || !weeklyPointsImage || uploading)
                ? 'bg-surface2 text-textSecondary cursor-not-allowed'
                : 'bg-primary hover:bg-primaryDark text-white active:scale-98'
            )}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                Enviar Comprovantes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
