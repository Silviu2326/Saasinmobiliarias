import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MoreVertical, CheckCircle } from 'lucide-react';
import { useBoardBuckets } from '../hooks';
import { DueDateItem } from '../types';
import SLAIndicator from './SLAIndicator';
import LinkedEntityChip from './LinkedEntityChip';
import { formatRelative, getDueTypeIcon, getPriorityColor } from '../utils';

interface DueDatesBoardProps {
  items: DueDateItem[];
  onItemClick: (item: DueDateItem) => void;
  onItemEdit: (item: DueDateItem) => void;
  onMoveItem?: (itemId: string, newDate: string) => void;
  className?: string;
}

interface BoardItemCardProps {
  item: DueDateItem;
  onItemClick: (item: DueDateItem) => void;
  onItemEdit: (item: DueDateItem) => void;
}

function BoardItemCard({ item, onItemClick, onItemEdit }: BoardItemCardProps) {
  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle completion
    console.log('Complete item:', item.id);
  };

  const handlePostpone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle postpone
    console.log('Postpone item:', item.id);
  };

  return (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4" 
      style={{ borderLeftColor: getPriorityColor(item.priority) }}
      onClick={() => onItemClick(item)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDueTypeIcon(item.type)}</span>
            <div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                {item.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <SLAIndicator sla={item.sla} className="text-xs" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onItemEdit(item);
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{formatRelative(item.date)}</span>
          </div>
          
          {item.assigneeName && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span>{item.assigneeName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {item.entity && (
              <LinkedEntityChip entity={item.entity} className="text-xs" />
            )}
          </div>
          
          <div className="flex gap-1">
            {item.status === 'PENDIENTE' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-green-600 hover:bg-green-50"
                  onClick={handleComplete}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-amber-600 hover:bg-amber-50"
                  onClick={handlePostpone}
                >
                  +1d
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DueDatesBoard({ items, onItemClick, onItemEdit, className }: DueDatesBoardProps) {
  const buckets = useBoardBuckets(items);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${className}`}>
      {buckets.map(bucket => (
        <div key={bucket.id} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="text-sm font-medium">{bucket.title}</span>
                </div>
                <Badge variant="secondary">{bucket.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[600px] overflow-y-auto">
                {bucket.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📥</div>
                    <p className="text-sm">No hay elementos</p>
                  </div>
                ) : (
                  bucket.items.map(item => (
                    <BoardItemCard
                      key={item.id}
                      item={item}
                      onItemClick={onItemClick}
                      onItemEdit={onItemEdit}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}