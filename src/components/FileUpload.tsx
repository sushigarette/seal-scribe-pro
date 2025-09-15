import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        title: "Format de fichier invalide",
        description: "Veuillez sélectionner un fichier JSON.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Vérifier que c'est un tableau de certificats
      if (!Array.isArray(data) && !data.certificates) {
        throw new Error('Format de données invalide');
      }

      const certificates = Array.isArray(data) ? data : data.certificates;

      // Envoyer au backend
      const response = await fetch('http://localhost:3001/api/upload-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificates }),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const result = await response.json();
      
      setUploadStatus('success');
      toast({
        title: "Upload réussi",
        description: `${result.count} certificats ont été importés.`,
      });

      onUploadSuccess();

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploadStatus('error');
      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import de certificats
        </CardTitle>
        <CardDescription>
          Téléchargez un fichier JSON contenant les données de certificats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full"
          variant={uploadStatus === 'success' ? 'default' : 'outline'}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Upload en cours...
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Upload réussi
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Réessayer
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Sélectionner un fichier JSON
            </>
          )}
        </Button>

        {uploadStatus === 'success' && (
          <p className="text-sm text-green-600 text-center">
            Les certificats ont été importés avec succès !
          </p>
        )}

        {uploadStatus === 'error' && (
          <p className="text-sm text-red-600 text-center">
            Erreur lors de l'import. Vérifiez le format du fichier.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

