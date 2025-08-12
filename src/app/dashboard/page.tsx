'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, MessageSquare, FileText, Pill, Calendar, TrendingUp, HeartPulse, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSettings } from '@/hooks/use-settings';

export default function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const { t } = useSettings();
  
  // Fetch user data from Convex
  const userData = useQuery(api.users.getUserByClerkId, 
    isSignedIn ? { clerkId: user?.id || '' } : 'skip'
  );
  
  const recentChats = useQuery(api.chat.getUserChats, 
    isSignedIn ? { userId: user?.id || '' } : 'skip'
  );
  
  const recentHealth = useQuery(api.health.getRecentHealthHistory, 
    isSignedIn ? { userId: user?.id || '', limit: 5 } : 'skip'
  );

  // Calculate health stats
  const getHealthStats = () => {
    if (!userData || !recentHealth) return { bmi: 'N/A', healthScore: 'N/A' };
    
    const bmi = userData.bmi ? userData.bmi.toFixed(1) : 'N/A';
    const totalRecords = recentHealth.length;
    const recentSymptoms = recentHealth.filter(r => r.type === 'symptom').length;
    const healthScore = totalRecords > 0 ? Math.max(100 - (recentSymptoms * 10), 60) : 85;
    
    return { bmi, healthScore: `${healthScore}%` };
  };

  const { bmi, healthScore } = getHealthStats();

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">{t('welcomeDashboard')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('signInToAccessDashboard')}
          </p>
          <Button asChild>
            <Link href="/">{t('startAsGuest')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('welcomeBack', { name: user?.firstName })}</h1>
        <p className="text-muted-foreground">
          {t('healthJourneyOverview')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalChats')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentChats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('healthConsultations')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('healthRecords')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentHealth?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('recentEntries')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bmi}</div>
            <p className="text-xs text-muted-foreground">
              Body Mass Index
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}</div>
            <p className="text-xs text-muted-foreground">
              Overall wellness
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('startNewConsultation')}
            </CardTitle>
            <CardDescription>
              {t('newConsultationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/health-ai">
                  <HeartPulse className="h-6 w-6 mb-2" />
                  <span className="text-sm">{t('symptomAnalysis')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/general-inquiry">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">{t('generalInquiry')}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('personalHealthInfo')}
            </CardTitle>
            <CardDescription>
              {t('basicHealthInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('weight')}</p>
                <p className="font-medium">{userData?.weight ? `${userData.weight} kg` : t('notSet')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('height')}</p>
                <p className="font-medium">{userData?.height ? `${userData.height} cm` : t('notSet')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('bloodType')}</p>
                <p className="font-medium">{userData?.bloodType || t('notSet')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('age')}</p>
                <p className="font-medium">{userData?.age ? `${userData.age} ${t('years')}` : t('notSet')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/dashboard/profile">
                  <User className="h-6 w-6 mb-2" />
                  <span className="text-sm">{t('updateProfile')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/dashboard/chat-history">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">{t('chatHistory')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/dashboard/health-history">
                  <Activity className="h-6 w-6 mb-2" />
                  <span className="text-sm">{t('healthHistory')}</span>
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/settings">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">{t('settings')}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>Your latest health consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentChats && recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.slice(0, 5).map((chat) => (
                  <div key={chat._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">{chat.type.replace('-', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{chat.messages.length} messages</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">
                No chat history yet. Start your first consultation!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Health Records</CardTitle>
            <CardDescription>Your latest health entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentHealth && recentHealth.length > 0 ? (
              <div className="space-y-3">
                {recentHealth.map((record) => (
                  <div key={record._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {record.type} • {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{record.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">
                No health records yet. Your health journey starts here!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
