'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  
  // Fetch user data from Convex
  const userData = useQuery(api.users.getUserByClerkId, 
    isSignedIn ? { clerkId: user?.id || '' } : 'skip'
  );
  
  const updateUser = useMutation(api.users.updateUser);
  
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    bloodType: '',
    allergies: [] as string[],
    chronicConditions: [] as string[],
    medications: [] as string[],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });
  
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with existing data
  useEffect(() => {
    if (userData) {
      setFormData({
        age: userData.age?.toString() || '',
        weight: userData.weight?.toString() || '',
        height: userData.height?.toString() || '',
        bloodType: userData.bloodType || '',
        allergies: userData.allergies || [],
        chronicConditions: userData.chronicConditions || [],
        medications: userData.medications || [],
        emergencyContact: userData.emergencyContact || {
          name: '',
          phone: '',
          relationship: '',
        },
      });
      
      setAllergiesText(userData.allergies?.join(', ') || '');
      setConditionsText(userData.chronicConditions?.join(', ') || '');
      setMedicationsText(userData.medications?.join(', ') || '');
    }
  }, [userData]);

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Health Profile</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your health profile and personal information.
          </p>
          <Button asChild>
            <Link href="/">Start Using as Guest</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await updateUser({
        clerkId: user.id,
        updates: {
          age: formData.age ? parseInt(formData.age) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          bloodType: formData.bloodType || undefined,
          allergies: allergiesText ? allergiesText.split(',').map(s => s.trim()).filter(s => s) : [],
          chronicConditions: conditionsText ? conditionsText.split(',').map(s => s.trim()).filter(s => s) : [],
          medications: medicationsText ? medicationsText.split(',').map(s => s.trim()).filter(s => s) : [],
          emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined,
        },
      });
      
      toast({
        title: "Profile Updated",
        description: "Your health profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Health Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal health information and medical details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your basic health measurements and personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g., 30"
                    min="0"
                    max="120"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bloodType" className="text-sm font-medium">
                    Blood Type
                  </label>
                  <Select value={formData.bloodType} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g., 70.5"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="height" className="text-sm font-medium">
                    Height (cm)
                  </label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="e.g., 175"
                    min="0"
                  />
                </div>
              </div>

              {bmi && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">BMI Calculation</p>
                  <p className="text-lg font-bold">
                    {bmi} <span className={`text-sm ${bmiInfo?.color}`}>({bmiInfo?.category})</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>
                Contact information for medical emergencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="emergencyName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  placeholder="Contact person's name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="emergencyPhone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  placeholder="Phone number"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="emergencyRelationship" className="text-sm font-medium">
                  Relationship
                </label>
                <Input
                  id="emergencyRelationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
            <CardDescription>
              Your current medications, allergies, and chronic conditions. Use commas to separate multiple items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="allergies" className="text-sm font-medium">
                Allergies
              </label>
              <Textarea
                id="allergies"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g., Peanuts, Shellfish, Penicillin"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="conditions" className="text-sm font-medium">
                Chronic Conditions
              </label>
              <Textarea
                id="conditions"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="e.g., Diabetes, Hypertension, Asthma"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="medications" className="text-sm font-medium">
                Current Medications
              </label>
              <Textarea
                id="medications"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="e.g., Metformin 500mg daily, Lisinopril 10mg daily"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href="/dashboard">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
