import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JsonImporterProps {
  onImportSuccess: (certificates: any[]) => void;
}

export const JsonImporter = ({ onImportSuccess }: JsonImporterProps) => {
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [certificateCount, setCertificateCount] = useState(0);
  const { toast } = useToast();

  const validateJson = (text: string) => {
    try {
      const data = JSON.parse(text);
      let certificates = [];
      
      if (Array.isArray(data)) {
        certificates = data;
      } else if (data.certificates && Array.isArray(data.certificates)) {
        certificates = data.certificates;
      } else if (data.certs && Array.isArray(data.certs)) {
        certificates = data.certs;
      } else {
        certificates = [data];
      }
      
      setIsValid(true);
      setCertificateCount(certificates.length);
      return certificates;
    } catch (error) {
      setIsValid(false);
      setCertificateCount(0);
      return null;
    }
  };

  const handleTextChange = (text: string) => {
    setJsonText(text);
    if (text.trim()) {
      validateJson(text);
    } else {
      setIsValid(null);
      setCertificateCount(0);
    }
  };

  const handleImport = () => {
    const certificates = validateJson(jsonText);
    if (certificates && certificates.length > 0) {
      onImportSuccess(certificates);
      toast({
        title: "Import réussi",
        description: `${certificates.length} certificats ont été importés.`,
      });
      setJsonText('');
      setIsValid(null);
      setCertificateCount(0);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://office.mhcomm.fr/crtinfo/certindex.json');
    toast({
      title: "URL copiée",
      description: "L'URL a été copiée dans le presse-papiers.",
    });
  };

  const handleOpenUrl = () => {
    window.open('https://office.mhcomm.fr/crtinfo/certindex.json', '_blank');
  };

  const handleDownloadExample = () => {
    const exampleData = [
      {
        nom: "exemple.com",
        subject: "CN=exemple.com, O=Mon Entreprise, C=FR",
        issuer: "Let's Encrypt",
        notBefore: "2024-01-15T00:00:00Z",
        notAfter: "2025-01-15T00:00:00Z",
        status: "valid",
        fingerprint: "A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90",
        algorithm: "SHA256-RSA",
        keyLength: 2048,
        domains: ["exemple.com", "www.exemple.com"],
        fileSize: 2048
      }
    ];
    
    const blob = new Blob([JSON.stringify(exampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemple-certificats.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Instructions d'import
          </CardTitle>
          <CardDescription>
            Suivez ces étapes pour importer les données de certificats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Étape 1 : Accéder aux données</h4>
            <p className="text-sm text-muted-foreground">
              Ouvrez l'URL suivante dans votre navigateur (avec vos certificats installés) :
            </p>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code className="text-sm flex-1">https://office.mhcomm.fr/crtinfo/certindex.json</code>
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleOpenUrl}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Étape 2 : Copier les données</h4>
            <p className="text-sm text-muted-foreground">
              Sélectionnez tout le contenu JSON (Ctrl+A) et copiez-le (Ctrl+C)
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Étape 3 : Coller et importer</h4>
            <p className="text-sm text-muted-foreground">
              Collez le JSON dans la zone de texte ci-dessous et cliquez sur "Importer"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Zone de saisie */}
      <Card>
        <CardHeader>
          <CardTitle>Import des données JSON</CardTitle>
          <CardDescription>
            Collez ici le contenu JSON récupéré depuis l'API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Collez ici le contenu JSON des certificats..."
              value={jsonText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            
            {/* Indicateur de validation */}
            {isValid !== null && (
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      JSON valide - {certificateCount} certificat{certificateCount > 1 ? 's' : ''} détecté{certificateCount > 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      JSON invalide - Vérifiez le format
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleImport}
              disabled={!isValid || certificateCount === 0}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Importer {certificateCount > 0 && `(${certificateCount} certificats)`}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownloadExample}
            >
              <Download className="h-4 w-4 mr-2" />
              Exemple
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

