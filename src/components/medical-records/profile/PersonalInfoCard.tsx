/**
 * Personal Info Card
 *
 * Displays basic patient information: name, date of birth, blood type.
 * Read-only display card using data from patient profile.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Droplet } from 'lucide-react';

interface PersonalInfoCardProps {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bloodType?: string;
  gender?: string;
}

const PersonalInfoCard = ({
  firstName,
  lastName,
  dateOfBirth,
  bloodType,
  gender,
}: PersonalInfoCardProps) => {
  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Not provided';
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const genderDisplay = gender
    ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
    : null;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Full Name</span>
            <span className="font-medium">{fullName}</span>
          </div>

          {/* Date of Birth & Age */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date of Birth
            </span>
            <div className="text-right">
              <span className="font-medium">
                {dateOfBirth ? formatDate(dateOfBirth) : 'Not provided'}
              </span>
              {age !== null && (
                <Badge variant="secondary" className="ml-2">
                  {age} years
                </Badge>
              )}
            </div>
          </div>

          {/* Gender */}
          {genderDisplay && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gender</span>
              <span className="font-medium">{genderDisplay}</span>
            </div>
          )}

          {/* Blood Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Droplet className="h-4 w-4" />
              Blood Type
            </span>
            {bloodType ? (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-600 border-red-200 font-bold"
              >
                {bloodType}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">Not provided</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
