/**
 * Medical History Timeline Component
 *
 * Displays past medical events in a vertical timeline format.
 * Events are color-coded by type with expandable details.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  History,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Stethoscope,
  Building,
  Syringe,
  AlertCircle,
  FileText,
  MoreHorizontal,
  User,
} from 'lucide-react';
import type { PastMedicalEvent, MedicalEventType } from '@/types/healthProfile.types';
import { MEDICAL_EVENT_TYPE_LABELS } from '@/types/healthProfile.types';

interface MedicalHistoryTimelineProps {
  events: PastMedicalEvent[];
  onAdd: () => void;
  onEdit: (event: PastMedicalEvent) => void;
  onDelete: (event: PastMedicalEvent) => void;
  isLoading?: boolean;
}

const getEventIcon = (type: MedicalEventType) => {
  switch (type) {
    case 'surgery':
      return <Stethoscope className="h-4 w-4" />;
    case 'hospitalization':
      return <Building className="h-4 w-4" />;
    case 'diagnosis':
      return <FileText className="h-4 w-4" />;
    case 'injury':
      return <AlertCircle className="h-4 w-4" />;
    case 'procedure':
      return <Syringe className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

const getEventColor = (type: MedicalEventType) => {
  switch (type) {
    case 'surgery':
      return 'bg-red-500 text-white';
    case 'hospitalization':
      return 'bg-orange-500 text-white';
    case 'diagnosis':
      return 'bg-blue-500 text-white';
    case 'injury':
      return 'bg-yellow-500 text-white';
    case 'procedure':
      return 'bg-purple-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getEventBadgeColor = (type: MedicalEventType) => {
  switch (type) {
    case 'surgery':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'hospitalization':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'diagnosis':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'injury':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'procedure':
      return 'bg-purple-500/10 text-purple-600 border-purple-200';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200';
  }
};

const MedicalHistoryTimeline = ({
  events,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: MedicalHistoryTimelineProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group events by year
  const eventsByYear = sortedEvents.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, PastMedicalEvent[]>);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Medical History
            {events.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {events.length} events
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            disabled={isLoading}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No medical history recorded</p>
            <p className="text-xs mt-1">Add past medical events, surgeries, or diagnoses</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(eventsByYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, yearEvents]) => (
                <div key={year}>
                  {/* Year Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-sm font-semibold">
                      {year}
                    </Badge>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>

                  {/* Timeline */}
                  <div className="relative ml-4 border-l-2 border-muted pl-6 space-y-4">
                    {yearEvents.map((event) => (
                      <Collapsible
                        key={event.id}
                        open={expandedId === event.id}
                        onOpenChange={(open) => setExpandedId(open ? event.id : null)}
                      >
                        <div className="relative group">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[31px] w-5 h-5 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}
                          >
                            {getEventIcon(event.type)}
                          </div>

                          {/* Event card */}
                          <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-start justify-between">
                                <div className="text-left">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{event.title}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getEventBadgeColor(event.type)}`}
                                    >
                                      {MEDICAL_EVENT_TYPE_LABELS[event.type]}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {formatDate(event.date)}
                                    {event.facility && ` • ${event.facility}`}
                                  </p>
                                </div>
                                <ChevronDown
                                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                                    expandedId === event.id ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-3 pt-3 border-t space-y-3">
                              {event.description && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Description
                                  </span>
                                  <p className="text-sm mt-1">{event.description}</p>
                                </div>
                              )}

                              {event.outcome && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Outcome
                                  </span>
                                  <p className="text-sm mt-1">{event.outcome}</p>
                                </div>
                              )}

                              {event.doctorName && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  {event.doctorName}
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(event);
                                  }}
                                  disabled={isLoading}
                                  className="h-7 text-xs"
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(event);
                                  }}
                                  disabled={isLoading}
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalHistoryTimeline;
