import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
  dietaryRestrictions: string;
}

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: ''
  });

  const updateProfileData = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDailyGoals = () => {
    const age = parseInt(profileData.age);
    const weight = parseFloat(profileData.weight);
    const height = parseFloat(profileData.height);
    
    // Basic BMR calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (profileData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity level multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const activityMultiplier = activityMultipliers[profileData.activityLevel as keyof typeof activityMultipliers] || 1.2;
    let calories = Math.round(bmr * activityMultiplier);

    // Adjust for goals
    if (profileData.goal === 'lose') {
      calories -= 500; // 500 calorie deficit
    } else if (profileData.goal === 'gain') {
      calories += 500; // 500 calorie surplus
    }

    // Calculate macros (general recommendations)
    const protein = Math.round(weight * 2.2); // 1g per lb of body weight
    const fats = Math.round(calories * 0.25 / 9); // 25% of calories from fats
    const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4); // Remaining calories from carbs

    return { calories, protein, carbs, fats };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Save detailed profile data
      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          age: parseInt(profileData.age),
          gender: profileData.gender,
          height: parseFloat(profileData.height),
          weight: parseFloat(profileData.weight),
          activity_level: profileData.activityLevel,
          goal: profileData.goal,
          dietary_restrictions: profileData.dietaryRestrictions || null,
          updated_at: new Date().toISOString()
        });

      if (userProfileError) throw userProfileError;

      // Calculate and save daily goals
      const goals = calculateDailyGoals();
      const { error: goalsError } = await supabase
        .from('user_daily_goals')
        .upsert({
          user_id: user?.id,
          calories: goals.calories,
          protein: goals.protein,
          carbs: goals.carbs,
          fats: goals.fats,
          updated_at: new Date().toISOString()
        });

      if (goalsError) throw goalsError;

      toast({
        title: "Profile setup complete!",
        description: "Your nutrition goals have been calculated and saved.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Let's get to know you!</h2>
              <p className="text-gray-600">We'll use this information to calculate your personalized nutrition goals.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={profileData.age}
                  onChange={(e) => updateProfileData('age', e.target.value)}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <RadioGroup
                  value={profileData.gender}
                  onValueChange={(value) => updateProfileData('gender', value)}
                  className="flex flex-row space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Physical Details</h2>
              <p className="text-gray-600">This helps us calculate your metabolism accurately.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Enter your height in centimeters"
                  value={profileData.height}
                  onChange={(e) => updateProfileData('height', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter your weight in kilograms"
                  value={profileData.weight}
                  onChange={(e) => updateProfileData('weight', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Activity & Goals</h2>
              <p className="text-gray-600">Tell us about your lifestyle and what you want to achieve.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Activity Level</Label>
                <Select value={profileData.activityLevel} onValueChange={(value) => updateProfileData('activityLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="veryActive">Very Active (very hard exercise, physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Primary Goal</Label>
                <Select value={profileData.goal} onValueChange={(value) => updateProfileData('goal', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's your main goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose weight</SelectItem>
                    <SelectItem value="maintain">Maintain weight</SelectItem>
                    <SelectItem value="gain">Gain weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="restrictions">Dietary Restrictions (optional)</Label>
                <Input
                  id="restrictions"
                  placeholder="e.g., vegetarian, gluten-free, dairy-free"
                  value={profileData.dietaryRestrictions}
                  onChange={(e) => updateProfileData('dietaryRestrictions', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profileData.age && profileData.gender;
      case 2:
        return profileData.height && profileData.weight;
      case 3:
        return profileData.activityLevel && profileData.goal;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div className="text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepValid() || loading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || loading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
