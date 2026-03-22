import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GuildChatProps {
  guildId: string;
}

export function GuildChat({ guildId }: GuildChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guildId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('guild_messages')
        .select('*, profiles(name, avatar_url, class_name)')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
      scrollToBottom();
    };

    loadMessages();

    const channel = supabase
      .channel(`guild_${guildId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guild_messages',
          filter: `guild_id=eq.${guildId}`
        },
        async (payload) => {
          // Fetch the profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url, class_name')
            .eq('user_id', payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profile
          };

          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guildId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || !guildId) return;

    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('guild_messages').insert({
      guild_id: guildId,
      user_id: user.id,
      content
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-lg bg-card overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            Nenhuma mensagem ainda. Diga olá para sua Guilda!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center overflow-hidden border border-primary/20">
                    {msg.profiles?.avatar_url ? (
                      <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{msg.profiles?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 text-xs">
                      <span className="font-bold">{msg.profiles?.name}</span>
                      <span className="text-muted-foreground text-[10px]">{msg.profiles?.class_name}</span>
                    </div>
                  )}
                  <div 
                    className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-secondary/80 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 opacity-70">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-secondary/30 border-t border-border flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escreva uma mensagem para a guilda..."
          className="flex-1 bg-background border-border"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()} className="shrink-0 bg-primary hover:bg-primary/90">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
