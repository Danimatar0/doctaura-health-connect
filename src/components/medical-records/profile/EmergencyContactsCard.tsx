/**
 * Emergency Contacts Card
 *
 * Displays and manages emergency contact information.
 * Supports add, edit, delete operations with primary contact designation.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Plus,
  Pencil,
  Trash2,
  UserCircle,
  Star,
} from 'lucide-react';
import type { EmergencyContact } from '@/types/healthProfile.types';
import { RELATIONSHIP_LABELS } from '@/types/healthProfile.types';

interface EmergencyContactsCardProps {
  contacts: EmergencyContact[];
  onAdd: () => void;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contact: EmergencyContact) => void;
  isLoading?: boolean;
}

const EmergencyContactsCard = ({
  contacts,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: EmergencyContactsCardProps) => {
  // Sort contacts: primary first, then alphabetically
  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Emergency Contacts
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            disabled={isLoading}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedContacts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No emergency contacts added</p>
            <p className="text-xs mt-1">Add a contact for emergencies</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.name}</span>
                      {contact.isPrimary && (
                        <Badge
                          variant="default"
                          className="bg-yellow-500/10 text-yellow-600 border-yellow-200 text-xs px-1.5 py-0"
                        >
                          <Star className="h-3 w-3 mr-0.5 fill-current" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {RELATIONSHIP_LABELS[contact.relationship]}
                    </p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(contact)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(contact)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsCard;
