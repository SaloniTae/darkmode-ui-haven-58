
import { Slot } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Edit, Clock, Calendar, DollarSign, Trash2 } from "lucide-react";
import { formatDateTimeForDisplay } from "@/utils/dateFormatUtils";
import { SlotForm } from "./SlotForm";

interface SlotCardProps {
  slotKey: string;
  slot: Slot;
  editedSlot: Slot;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: () => void;
  onUpdate: (field: keyof Slot, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SlotCard({
  slotKey,
  slot,
  editedSlot,
  isEditing,
  onEdit,
  onDelete,
  onToggleEnabled,
  onUpdate,
  onSave,
  onCancel
}: SlotCardProps) {
  
  return (
    <DataCard
      key={slotKey}
      title={slotKey}
      className={editedSlot.enabled ? "border-green-500/30" : "border-red-500/30"}
    >
      <div className="space-y-4">
        {isEditing ? (
          <SlotForm 
            slotData={editedSlot}
            onSlotChange={onUpdate}
            onSave={onSave}
            onCancel={onCancel}
            slotKey={slotKey}
          />
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${editedSlot.enabled ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm font-medium">{editedSlot.enabled ? "Enabled" : "Disabled"}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-medium text-base">{editedSlot.frequency}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Required Amount</p>
                    <p className="font-medium text-base">₹{editedSlot.required_amount}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Period</p>
                    <p className="font-medium text-sm">
                      {formatDateTimeForDisplay(editedSlot.slot_start)} - 
                      {formatDateTimeForDisplay(editedSlot.slot_end)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-700/30">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-xs">{formatDateTimeForDisplay(editedSlot.last_update)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button 
                variant={editedSlot.enabled ? "destructive" : "outline"}
                size="sm"
                onClick={onToggleEnabled}
              >
                {editedSlot.enabled ? "Disable" : "Enable"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onEdit}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </DataCard>
  );
}
