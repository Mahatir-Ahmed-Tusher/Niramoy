'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Search, Plus, Calendar, Clock, FileText, Pill, Stethoscope, TrendingUp, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { useSettings } from '@/hooks/use-settings';

export default function HealthHistoryPage() {
  const { user, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { t } = useSettings();
  
  // Fetch user health history from Convex
  const userHealthHistory = useQuery(api.health.getUserHealthHistory, 
    isSignedIn ? { userId: user?.id || '' } : 'skip'
  );

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">{t('healthHistory')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('signInToAccessHealthHistory')}
          </p>
          <Button asChild>
            <Link href="/">{t('startAsGuest')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter health records based on search and type
  const filteredRecords = userHealthHistory?.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const getHealthTypeIcon = (type: string) => {
    switch (type) {
      case 'symptom':
        return '🤒';
      case 'diagnosis':
        return '🏥';
      case 'medication':
        return '💊';
      case 'report':
        return '📋';
      default:
        return '📊';
    }
  };

  const getHealthTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getHealthTypeColor = (type: string) => {
    switch (type) {
      case 'symptom':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'diagnosis':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medication':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'report':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        <h1 className="text-3xl font-bold mb-2">{t('healthHistory')}</h1>
        <p className="text-muted-foreground">
          {t('viewAndManageHealthHistory')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('yourHealthRecords')}
              </CardTitle>
              <CardDescription>
                {t('browseHealthRecords')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchRecords')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[120px] sm:w-[180px]">
                      <SelectValue placeholder={t('filterBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allRecords')}</SelectItem>
                      <SelectItem value="symptom">{t('symptoms')}</SelectItem>
                      <SelectItem value="diagnosis">{t('diagnoses')}</SelectItem>
                      <SelectItem value="medication">{t('medications')}</SelectItem>
                      <SelectItem value="report">{t('reports')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button asChild>
                  <Link href="/dashboard/health-history/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addRecord')}
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{userHealthHistory?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Records</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🤒</span>
                      <div>
                        <p className="text-2xl font-bold">
                          {userHealthHistory?.filter(r => r.type === 'symptom').length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Symptoms</p>
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
                          {userHealthHistory?.filter(r => r.type === 'diagnosis').length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Diagnoses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💊</span>
                      <div>
                        <p className="text-2xl font-bold">
                          {userHealthHistory?.filter(r => r.type === 'medication').length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Medications</p>
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
                          {userHealthHistory?.filter(r => r.type === 'report').length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Reports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Records List */}
              <div className="space-y-4">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <Card key={record._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-3xl">
                              {getHealthTypeIcon(record.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{record.title}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={`${getHealthTypeColor(record.type)}`}
                                >
                                  {getHealthTypeLabel(record.type)}
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {record.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(record.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(record.updatedAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/health-history/${record._id}`}>
                                {t('viewDetails')}
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/health-history/${record._id}/edit`}>
                                {t('edit')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery || filterType !== 'all' ? t('noRecordsFound') : t('noHealthHistoryYet')}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || filterType !== 'all' 
                          ? t('tryAdjustingFilters')
                          : t('startTrackingHealthJourney')
                        }
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/health-history/new">{t('addFirstRecord')}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'symptom':
      return t('symptom');
    case 'diagnosis':
      return t('diagnosis');
    case 'medication':
      return t('medication');
    case 'report':
      return t('report');
    default:
      return type;
  }
}
