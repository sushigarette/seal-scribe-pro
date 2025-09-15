import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutoImporterProps {
  onImportSuccess: (certificates: any[]) => void;
}

export const AutoImporter = ({ onImportSuccess }: AutoImporterProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'opening' | 'waiting' | 'success' | 'error'>('idle');
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [certificateCount, setCertificateCount] = useState(0);
  const { toast } = useToast();

  // Écouter les messages du popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine pour la sécurité
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'CERTIFICATES_DATA') {
        try {
          const certificates = event.data.certificates;
          if (Array.isArray(certificates) && certificates.length > 0) {
            setCertificateCount(certificates.length);
            setImportStatus('success');
            onImportSuccess(certificates);
            toast({
              title: "Import automatique réussi",
              description: `${certificates.length} certificats ont été importés automatiquement.`,
            });
          } else {
            throw new Error('Aucun certificat valide trouvé');
          }
        } catch (error) {
          console.error('Erreur lors du traitement des données:', error);
          setImportStatus('error');
          toast({
            title: "Erreur d'import",
            description: "Les données reçues ne sont pas valides.",
            variant: "destructive",
          });
        }
        setIsImporting(false);
      } else if (event.data.type === 'CERTIFICATES_ERROR') {
        setImportStatus('error');
        setIsImporting(false);
        toast({
          title: "Erreur d'accès",
          description: event.data.error || "Impossible d'accéder aux données.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onImportSuccess, toast]);

  // Vérifier si le popup est fermé
  useEffect(() => {
    if (!popupWindow) return;

    const checkClosed = setInterval(() => {
      if (popupWindow.closed) {
        if (importStatus === 'waiting') {
          setImportStatus('error');
          setIsImporting(false);
          toast({
            title: "Import annulé",
            description: "La fenêtre d'import a été fermée.",
            variant: "destructive",
          });
        }
        clearInterval(checkClosed);
      }
    }, 1000);

    return () => clearInterval(checkClosed);
  }, [popupWindow, importStatus, toast]);

  const handleAutoImport = () => {
    setIsImporting(true);
    setImportStatus('opening');
    setCertificateCount(0);

    // Ouvrir le popup avec l'URL de l'API
    const popup = window.open(
      'https://office.mhcomm.fr/crtinfo/certindex.json',
      'certificateImporter',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setImportStatus('error');
      setIsImporting(false);
      toast({
        title: "Popup bloqué",
        description: "Veuillez autoriser les popups pour cette fonctionnalité.",
        variant: "destructive",
      });
      return;
    }

    setPopupWindow(popup);

    // Attendre que le popup soit chargé
    const checkLoaded = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkLoaded);
          return;
        }

        // Essayer d'accéder au contenu du popup
        popup.document;
        clearInterval(checkLoaded);
        setImportStatus('waiting');
        
        // Injecter le script de récupération des données
        const script = popup.document.createElement('script');
        script.textContent = `
          (function() {
            try {
              // Essayer de récupérer les données JSON
              fetch(window.location.href)
                .then(response => {
                  if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                  }
                  return response.json();
                })
                .then(data => {
                  // Envoyer les données à la fenêtre parent
                  window.opener.postMessage({
                    type: 'CERTIFICATES_DATA',
                    certificates: data
                  }, '*');
                })
                .catch(error => {
                  // En cas d'erreur, essayer de récupérer le contenu de la page
                  const text = document.body.innerText || document.body.textContent;
                  try {
                    const data = JSON.parse(text);
                    window.opener.postMessage({
                      type: 'CERTIFICATES_DATA',
                      certificates: data
                    }, '*');
                  } catch (parseError) {
                    window.opener.postMessage({
                      type: 'CERTIFICATES_ERROR',
                      error: 'Impossible de récupérer les données JSON: ' + error.message
                    }, '*');
                  }
                });
            } catch (error) {
              window.opener.postMessage({
                type: 'CERTIFICATES_ERROR',
                error: error.message
              }, '*');
            }
          })();
        `;
        popup.document.head.appendChild(script);
        
      } catch (error) {
        // Le popup n'est pas encore chargé ou il y a une erreur CORS
        // Attendre un peu plus
      }
    }, 100);

    // Timeout après 30 secondes
    setTimeout(() => {
      if (importStatus === 'waiting') {
        setImportStatus('error');
        setIsImporting(false);
        toast({
          title: "Timeout",
          description: "L'import a pris trop de temps. Vérifiez vos certificats.",
          variant: "destructive",
        });
        clearInterval(checkLoaded);
      }
    }, 30000);
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'opening':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'waiting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (importStatus) {
      case 'opening':
        return 'Ouverture de la fenêtre...';
      case 'waiting':
        return 'Récupération des données...';
      case 'success':
        return `Import réussi (${certificateCount} certificats)`;
      case 'error':
        return 'Erreur d\'import';
      default:
        return 'Import automatique';
    }
  };

  const getButtonVariant = () => {
    switch (importStatus) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Import automatique
        </CardTitle>
        <CardDescription>
          Récupération automatique des certificats via votre navigateur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité ouvre l'API dans une nouvelle fenêtre avec vos certificats installés,
            récupère automatiquement les données JSON et les importe dans l'application.
          </p>
          
          {importStatus === 'success' && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                {certificateCount} certificat{certificateCount > 1 ? 's' : ''} importé{certificateCount > 1 ? 's' : ''} avec succès
              </span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                Erreur lors de l'import. Vérifiez que vos certificats sont installés.
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleAutoImport}
            disabled={isImporting}
            variant={getButtonVariant()}
            className="flex-1"
          >
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('https://office.mhcomm.fr/crtinfo/certindex.json', '_blank')}
            disabled={isImporting}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {importStatus === 'waiting' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Veuillez patienter pendant la récupération des données...
            </p>
            <div className="mt-2">
              <div className="animate-pulse bg-muted h-2 rounded w-full"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

