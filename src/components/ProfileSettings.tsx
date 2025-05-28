
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, User, Target, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileSettingsProps {
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  onGoalsUpdated: (goals: { calories: number; protein: number; carbs: number; fats: number }) => void;
}

export const ProfileSettings = ({ dailyGoals, onGoalsUpdated }: ProfileSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: '',
  });

  // Daily targets
  const [targets, setTargets] = useState({
    calories: dailyGoals.calories,
    protein: dailyGoals.protein,
    carbs: dailyGoals.carbs,
    fats: dailyGoals.fats,
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'targets'>('profile');
  const [validationError, setValidationError] = useState<string>('');

  // Load existing profile data when dialog opens
  useEffect(() => {
    const loadProfileData = async () => {
      if (!open || !user) return;
      
      setLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          setProfileData({
            age: profile.age?.toString() || '',
            gender: profile.gender || '',
            height: profile.height?.toString() || '',
            weight: profile.weight?.toString() || '',
            activityLevel: profile.activity_level || '',
            goal: profile.goal || '',
            dietaryRestrictions: profile.dietary_restrictions || '',
          });
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load your existing profile data.",
          variant: "destructive",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [open, user]);

  const updateProfileData = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate calories from macros
  const calculateCaloriesFromMacros = (protein: number, carbs: number, fats: number) => {
    return (protein * 4) + (carbs * 4) + (fats * 9);
  };

  // Update targets with validation
  const updateTarget = (field: string, value: number) => {
    const newTargets = { ...targets, [field]: value };
    setTargets(newTargets);
    
    // Validate after a brief delay to avoid constant validation while typing
    setTimeout(() => {
      const calculatedCalories = calculateCaloriesFromMacros(newTargets.protein, newTargets.carbs, newTargets.fats);
      const tolerance = 50;
      
      if (Math.abs(calculatedCalories - newTargets.calories) > tolerance) {
        const difference = Math.abs(calculatedCalories - newTargets.calories);
        setValidationError(
          `Macro nutrients don't match calories. Current macros equal ${calculatedCalories} calories, but target is ${newTargets.calories} calories (difference: ${difference} calories).`
        );
      } else {
        setValidationError('');
      }
    }, 500);
  };

  const calculateDailyGoals = () => {
    const age = parseInt(profileData.age);
    const weight = parseFloat(profileData.weight);
    const height = parseFloat(profileData.height);
    
    if (!age || !weight || !height) return targets;

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
      calories -= 500;
    } else if (profileData.goal === 'gain') {
      calories += 500;
    }

    // Calculate macros
    const protein = Math.round(weight * 2.2);
    const fats = Math.round(calories * 0.25 / 9);
    const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);

    return { calories, protein, carbs, fats };
  };

  const handleCalculateTargets = () => {
    const newTargets = calculateDailyGoals();
    setTargets(newTargets);
    setValidationError(''); // Clear any existing validation errors
    toast({
      title: "Targets calculated!",
      description: "Your daily targets have been updated based on your profile.",
    });
  };

  const validateMacros = () => {
    const calculatedCalories = calculateCaloriesFromMacros(targets.protein, targets.carbs, targets.fats);
    const tolerance = 50;
    
    if (Math.abs(calculatedCalories - targets.calories) > tolerance) {
      const difference = Math.abs(calculatedCalories - targets.calories);
      setValidationError(
        `Macro nutrients don't match calories. Current macros equal ${calculatedCalories} calories, but target is ${targets.calories} calories (difference: ${difference} calories). ` +
        `Protein: ${targets.protein}g × 4 = ${targets.protein * 4} cal, ` +
        `Carbs: ${targets.carbs}g × 4 = ${targets.carbs * 4} cal, ` +
        `Fats: ${targets.fats}g × 9 = ${targets.fats * 9} cal`
      );
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleSave = async () => {
    // Validate macros before saving
    if (!validateMacros()) {
      toast({
        title: "Validation Error",
        description: "Please adjust your macro nutrients to match your calorie target.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update/insert user profile if profile data is provided
      if (profileData.age && profileData.gender && profileData.height && profileData.weight) {
        const { error: profileError } = await supabase
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

        if (profileError) throw profileError;
      }

      // Update daily goals with current timestamp
      const { error: goalsError } = await supabase
        .from('user_daily_goals')
        .upsert({
          user_id: user?.id,
          calories: targets.calories,
          protein: targets.protein,
          carbs: targets.carbs,
          fats: targets.fats,
          updated_at: new Date().toISOString()
        });

      if (goalsError) throw goalsError;

      // Update local state
      onGoalsUpdated(targets);

      toast({
        title: "Settings updated!",
        description: "Your profile and daily targets have been saved successfully.",
      });

      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
        </DialogHeader>

        {loadingProfile ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-600">Loading profile data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2 px-1 ${activeTab === 'profile' 
                  ? 'border-b-2 border-emerald-500 text-emerald-600' 
                  : 'text-gray-600'}`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('targets')}
                className={`pb-2 px-1 ${activeTab === 'targets' 
                  ? 'border-b-2 border-emerald-500 text-emerald-600' 
                  : 'text-gray-600'}`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Daily Targets</span>
                </div>
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Update Your Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Height in cm"
                      value={profileData.height}
                      onChange={(e) => updateProfileData('height', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Weight in kg"
                      value={profileData.weight}
                      onChange={(e) => updateProfileData('weight', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Activity Level</Label>
                    <Select value={profileData.activityLevel} onValueChange={(value) => updateProfileData('activityLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light activity</SelectItem>
                        <SelectItem value="moderate">Moderate activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="veryActive">Very active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Goal</Label>
                    <Select value={profileData.goal} onValueChange={(value) => updateProfileData('goal', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose weight</SelectItem>
                        <SelectItem value="maintain">Maintain weight</SelectItem>
                        <SelectItem value="gain">Gain weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="dietaryRestrictions">Dietary Restrictions (optional)</Label>
                    <Input
                      id="dietaryRestrictions"
                      placeholder="e.g., vegetarian, gluten-free, dairy-free"
                      value={profileData.dietaryRestrictions}
                      onChange={(e) => updateProfileData('dietaryRestrictions', e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCalculateTargets}
                  variant="outline"
                  className="w-full"
                  disabled={!profileData.age || !profileData.weight || !profileData.height || !profileData.activityLevel || !profileData.goal}
                >
                  Calculate New Targets Based on Profile
                </Button>
              </div>
            )}

            {/* Targets Tab */}
            {activeTab === 'targets' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customize Daily Targets</h3>
                
                {/* Validation Error Alert */}
                {validationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {validationError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Macro Calculation Info */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-1">Calorie Calculation:</p>
                  <p>Protein: {targets.protein}g × 4 cal/g = {targets.protein * 4} calories</p>
                  <p>Carbs: {targets.carbs}g × 4 cal/g = {targets.carbs * 4} calories</p>
                  <p>Fats: {targets.fats}g × 9 cal/g = {targets.fats * 9} calories</p>
                  <p className="font-medium mt-1">
                    Total from macros: {calculateCaloriesFromMacros(targets.protein, targets.carbs, targets.fats)} calories
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="targetCalories">Calories</Label>
                    <Input
                      id="targetCalories"
                      type="number"
                      min="0"
                      value={targets.calories}
                      onChange={(e) => updateTarget('calories', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetProtein">Protein (g)</Label>
                    <Input
                      id="targetProtein"
                      type="number"
                      min="0"
                      step="0.1"
                      value={targets.protein}
                      onChange={(e) => updateTarget('protein', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetCarbs">Carbs (g)</Label>
                    <Input
                      id="targetCarbs"
                      type="number"
                      min="0"
                      step="0.1"
                      value={targets.carbs}
                      onChange={(e) => updateTarget('carbs', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetFats">Fats (g)</Label>
                    <Input
                      id="targetFats"
                      type="number"
                      min="0"
                      step="0.1"
                      value={targets.fats}
                      onChange={(e) => updateTarget('fats', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading || !!validationError}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
