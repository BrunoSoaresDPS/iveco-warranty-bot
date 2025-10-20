import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { FileUploadPreview } from "./FileUploadPreview";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  files?: Array<{ fileName: string; mimeType: string }>;
}

interface ChatInterfaceProps {
  userName: string;
  userEmail: string;
}

export const ChatInterface = ({ userName, userEmail }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Olá ${userName}! Sou o assistente IvecoWarranty. Estou aqui para analisar sua solicitação de garantia. Por favor, descreva sua solicitação e anexe os documentos necessários.`,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date(),
      files: files.map(f => ({ fileName: f.name, mimeType: f.type })),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const filesData = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          mimeType: file.type,
          data: await convertFileToBase64(file),
        }))
      );

      const payload = {
        nome: userName,
        email: userEmail,
        mensagem: input,
        data: new Date().toISOString(),
        arquivos: filesData,
      };

      toast.success("Solicitação enviada para análise!");

      const response = await fetch(
        "https://ivecogroup.app.n8n.cloud/webhook-test/9f300db5-3f8b-42b8-bc9d-d0a3c5dfc7a7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      setApiResponse(data);

      const botMessage: Message = {
        text: "Análise concluída! Clique para ver os detalhes da resposta.",
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setShowResponseDialog(true);
      setFiles([]);
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error("Erro ao processar sua solicitação. Tente novamente.");
      
      const errorMessage: Message = {
        text: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">I</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">IvecoWarranty</h1>
              <p className="text-xs text-muted-foreground">Sistema de Análise de Garantia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.map((msg, idx) => (
            <ChatMessage 
              key={idx} 
              message={msg.text}
              isBot={msg.isBot}
              timestamp={msg.timestamp}
              files={msg.files}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processando solicitação...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <FileUploadPreview
                  key={idx}
                  file={file}
                  onRemove={() => removeFile(idx)}
                />
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva sua solicitação de garantia..."
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && files.length === 0)}
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Pressione Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </div>

      {/* Response Dialog */}
      <AlertDialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Resultado da Análise</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 mt-4">
                <div className="bg-secondary rounded-lg p-4 space-y-2">
                  <div>
                    <span className="font-semibold text-foreground">Nome:</span>
                    <span className="ml-2 text-foreground">{userName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Email:</span>
                    <span className="ml-2 text-foreground">{userEmail}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Data:</span>
                    <span className="ml-2 text-foreground">
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                {apiResponse && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-foreground">Resposta do Sistema:</h4>
                    <pre className="text-sm bg-secondary p-3 rounded overflow-x-auto text-foreground">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                )}
                
                <Button
                  onClick={() => setShowResponseDialog(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
