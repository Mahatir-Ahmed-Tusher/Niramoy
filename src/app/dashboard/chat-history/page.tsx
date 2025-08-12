'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Search, Filter, Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';

export default function ChatHistoryPage() {
  const { user, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [extractingInsights, setExtractingInsights] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useSettings();
  
  // Fetch user chats from Convex
  const userChats = useQuery(api.chat.getUserChats, 
    isSignedIn ? { userId: user?.id || '' } : 'skip'
  );

  const extractHealthInsights = useMutation(api.health.extractHealthInsightsFromChat);

  const handleExtractInsights = async (chatId: string) => {
    if (!user?.id) return;
    
    setExtractingInsights(chatId);
    try {
      const result = await extractHealthInsights({
        chatId,
        userId: user.id,
      });
      
      toast({
        title: "Health Insights Extracted",
        description: `Extracted ${result.extractedInsights} health insights and saved them to your health history.`,
      });
    } catch (error) {
      console.error('Error extracting insights:', error);
      toast({
        title: "Error",
        description: "Failed to extract health insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExtractingInsights(null);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">{t('chatHistory')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('signInToAccessChatHistory')}
          </p>
          <Button asChild>
            <Link href="/">{t('startAsGuest')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter chats based on search and type
  const filteredChats = userChats?.filter(chat => {
    const matchesSearch = chat.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesType = filterType === 'all' || chat.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case 'symptom-analysis':
        return '🏥';
      case 'general-inquiry':
        return '💬';
      case 'report-analyzer':
        return '📋';
      case 'drug-information':
        return '💊';
      default:
        return '💬';
    }
  };

  const getChatTypeLabel = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToDashboard')}
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('chatHistory')}</h1>
        <p className="text-muted-foreground">
          {t('viewAndManageChatHistory')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchChats')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('filterBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allChats')}</SelectItem>
            <SelectItem value="symptom-analysis">{t('symptomAnalysis')}</SelectItem>
            <SelectItem value="general-inquiry">{t('generalInquiry')}</SelectItem>
            <SelectItem value="report-analyzer">{t('reportAnalyzer')}</SelectItem>
            <SelectItem value="drug-information">{t('drugInformation')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userChats?.length || 0}</p>
                <p className="text-sm text-muted-foreground">{t('totalChats')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="text-2xl font-bold">
                  {userChats?.filter(c => c.type === 'symptom-analysis').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">{t('symptomAnalysis')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-2xl font-bold">
                  {userChats?.filter(c => c.type === 'general-inquiry').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">{t('generalInquiry')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-2xl font-bold">
                  {userChats?.filter(c => c.type === 'report-analyzer').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">{t('reportAnalyzer')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat List */}
      <div className="space-y-4">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <Card key={chat._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">
                      {getChatTypeIcon(chat.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {getChatTypeLabel(chat.type)}
                        </h3>
                        <Badge variant="secondary">
                          {chat.messages.length} {t('messages')}
                        </Badge>
                      </div>
                      
                      <div className="text-muted-foreground mb-3">
                        {chat.messages.length > 0 && (
                          <p className="line-clamp-2">
                            {chat.messages[chat.messages.length - 1].content}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(chat.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/chat-history/${chat._id}`}>
                        {t('viewDetails')}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${chat.type}?continueChat=${chat.sessionId}`}>
                        {t('continueChat')}
                      </Link>
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleExtractInsights(chat._id)}
                      disabled={extractingInsights === chat._id}
                    >
                      {extractingInsights === chat._id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          {t('extracting')}
                        </>
                      ) : (
                        t('extractHealthInsights')
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterType !== 'all' ? t('noChatsFound') : t('noChatHistoryYet')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all' 
                  ? t('tryAdjustingFilters')
                  : t('startFirstConsultation')
                }
              </p>
              <Button asChild>
                <Link href="/health-ai">{t('startNewConsultation')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
