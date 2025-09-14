import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Camera,
  Save,
  Shield,
  Bell,
  Heart,
  Package,
  Settings,
  Edit,
  Palette,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  avatar_url?: string;
  date_of_birth?: string;
  preferences?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    marketing_emails: boolean;
  };
}

interface SellerProfile {
  id: string;
  display_name: string;
  bio?: string;
  region?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedArtistName, setEditedArtistName] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSellerProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If no profile exists, create one with the signup name
      if (!profileData) {
        const signupName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            email: user?.email,
            full_name: signupName, // Use name from signup
            preferences: {
              email_notifications: true,
              sms_notifications: false,
              marketing_emails: true
            }
          });

        if (insertError) throw insertError;
        
        // Fetch again after creating
        fetchProfile();
        return;
      }

      const userProfile = {
        ...profileData,
        email: user?.email || profileData.email
      };

      setProfile(userProfile);
      setEditedName(userProfile.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const { data: sellerData, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error fetching seller profile:', error);
        return;
      }

      if (sellerData) {
        setSellerProfile(sellerData);
        setEditedArtistName(sellerData.display_name || '');
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          bio: profile.bio,
          date_of_birth: profile.date_of_birth,
          preferences: profile.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update user profile name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editedName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // If user is a seller, update artist name
      if (sellerProfile && editedArtistName) {
        const { error: sellerError } = await supabase
          .from('sellers')
          .update({
            display_name: editedArtistName,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (sellerError) throw sellerError;
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, full_name: editedName });
      }
      if (sellerProfile) {
        setSellerProfile({ ...sellerProfile, display_name: editedArtistName });
      }

      setIsEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setProfile(prev => prev ? {
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading profile...</div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'personal' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Personal Info
                  </button>
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'address' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'preferences' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Preferences
                  </button>
                  
                  <Separator className="my-4" />
                  
                  <Link 
                    to="/wishlist"
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 block"
                  >
                    <Heart className="h-4 w-4 inline mr-2" />
                    Wishlist
                  </Link>
                  <Link 
                    to="/orders"
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 block"
                  >
                    <Package className="h-4 w-4 inline mr-2" />
                    Orders
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {activeTab === 'personal' && 'Personal Information'}
                  {activeTab === 'address' && 'Address Details'}
                  {activeTab === 'preferences' && 'Account Preferences'}
                </CardTitle>
                
                {/* Edit Profile Button */}
                {activeTab === 'personal' && !isEditMode && (
                  <Button 
                    onClick={() => setIsEditMode(true)}
                    variant="outline"
                    className="text-orange-700 border-orange-200 hover:bg-orange-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <>
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xl">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm" disabled={!isEditMode}>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG. Max size: 2MB
                        </p>
                      </div>
                    </div>

                    {/* Edit Mode */}
                    {isEditMode ? (
                      <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-800">Edit Your Profile</h3>
                        
                        <div>
                          <Label htmlFor="edit_name">Your Name</Label>
                          <Input
                            id="edit_name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="Enter your full name"
                            className="mt-1"
                          />
                        </div>

                        {/* Artist Name - Only show if user is a seller */}
                        {sellerProfile && (
                          <div>
                            <Label htmlFor="edit_artist_name" className="flex items-center">
                              <Palette className="h-4 w-4 mr-1" />
                              Artist Name
                            </Label>
                            <Input
                              id="edit_artist_name"
                              value={editedArtistName}
                              onChange={(e) => setEditedArtistName(e.target.value)}
                              placeholder="Enter your artist/display name"
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              This name will be shown on your artworks and profile
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button 
                            onClick={handleEditProfile}
                            disabled={saving}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={() => {
                              setIsEditMode(false);
                              setEditedName(profile?.full_name || '');
                              setEditedArtistName(sellerProfile?.display_name || '');
                            }}
                            variant="outline"
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Your Name</Label>
                              <p className="text-lg font-semibold mt-1">
                                {profile?.full_name || 'No name set'}
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-600">Email</Label>
                              <p className="text-lg mt-1">{profile?.email}</p>
                            </div>

                            {sellerProfile && (
                              <div className="md:col-span-2">
                                <Label className="text-sm font-medium text-gray-600 flex items-center">
                                  <Palette className="h-4 w-4 mr-1" />
                                  Artist Name
                                </Label>
                                <p className="text-lg font-semibold mt-1 text-orange-700">
                                  {sellerProfile.display_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  This is how your name appears on your artworks
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Other profile fields in read-only */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={profile?.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+91 98765 43210"
                            />
                          </div>

                          <div>
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                              id="date_of_birth"
                              type="date"
                              value={profile?.date_of_birth || ''}
                              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profile?.bio || ''}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Address Tab */}
                {activeTab === 'address' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Textarea
                        id="address"
                        value={profile?.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="House number, street name, area"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile?.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={profile?.state || ''} 
                        onValueChange={(value) => handleInputChange('state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        value={profile?.pincode || ''}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="Enter PIN code"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-500">
                              Receive order updates and important announcements
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={profile?.preferences?.email_notifications || false}
                            onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SMS Notifications</Label>
                            <p className="text-sm text-gray-500">
                              Get SMS updates for order status
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={profile?.preferences?.sms_notifications || false}
                            onChange={(e) => handlePreferenceChange('sms_notifications', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Marketing Emails</Label>
                            <p className="text-sm text-gray-500">
                              Receive newsletters and promotional offers
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={profile?.preferences?.marketing_emails || false}
                            onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Package className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button for Address and Preferences */}
                {(activeTab === 'address' || activeTab === 'preferences') && (
                  <div className="flex justify-end pt-6">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
