import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp?: Date;
  files?: Array<{ fileName: string; mimeType: string }>;
}

export const ChatMessage = ({ message, isBot, timestamp, files }: ChatMessageProps) => {
  return (
    <div className={cn("flex gap-3 mb-4 animate-fade-in", isBot ? "flex-row" : "flex-row-reverse")}>
      <Avatar className={cn("w-10 h-10 shrink-0", isBot ? "bg-primary" : "bg-accent")}>
        <AvatarImage src="" />
        <AvatarFallback className={cn(isBot ? "text-primary-foreground" : "text-accent-foreground")}>
          {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex flex-col max-w-[80%]", isBot ? "items-start" : "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isBot
              ? "bg-card text-card-foreground rounded-tl-none"
              : "bg-primary text-primary-foreground rounded-tr-none"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          {files && files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((file, idx) => (
                <div key={idx} className="text-xs opacity-80 flex items-center gap-1">
                  📎 {file.fileName}
                </div>
              ))}
            </div>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
