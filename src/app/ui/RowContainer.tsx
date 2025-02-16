import { useSession } from "@/app/contexts/SessionContext";
import { Unit } from "@/app/types/Unit";
import MultiUnitForm from "@/app/ui/UnitForm/MultiUnitForm";
import UnitForm from "@/app/ui/UnitForm/UnitForm";
import UnitCard from "@/app/ui/electrical-module/UnitCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/ui/shadcn/alert-dialog";
import { Button } from "@/app/ui/shadcn/button";
import { Dialog, DialogContent } from "@/app/ui/shadcn/dialog";
import { Input } from "@/app/ui/shadcn/input";
import { animations } from "@formkit/drag-and-drop";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";

interface RowContainerProps {
  rowIndex: number;
  units: Unit[];
  onUpdate: () => void;
}

const RowContainer: React.FC<RowContainerProps> = ({
  rowIndex,
  units,
  onUpdate,
}) => {
  const t = useTranslations("RowContainer");
  const {
    addUnit,
    updateUnit,
    deleteUnits,
    deleteUnit,
    duplicateUnits,
    updateRow,
    updateMultipleUnits,
  } = useSession();
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [addCount, setAddCount] = useState(1);
  const [cloneCount, setCloneCount] = useState(1);
  const [editingMultipleUnits, setEditingMultipleUnits] = useState<Unit[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [dragAndDropRef, dragAndDropUnits, setDragAndDropUnits] =
    useDragAndDrop<HTMLDivElement, Unit>(units, {
      group: `row-${rowIndex}`,
      dropZoneClass: "opacity-10",
      plugins: [
        animations({
          duration: 200,
        }),
      ],
    });

  useEffect(() => {
    if (JSON.stringify(units) !== JSON.stringify(dragAndDropUnits)) {
      setDragAndDropUnits(units);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, setDragAndDropUnits]);

  const updateRowIfChanged = useCallback(() => {
    if (JSON.stringify(dragAndDropUnits) !== JSON.stringify(units)) {
      updateRow(rowIndex, () => dragAndDropUnits);
      onUpdate();
    }
  }, [dragAndDropUnits, units, updateRow, rowIndex, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(updateRowIfChanged, 100);
    return () => clearTimeout(timer);
  }, [updateRowIfChanged]);

  const toggleUnitSelection = useCallback(
    (unitId: string, isSelected: boolean) => {
      setSelectedUnits((prev) =>
        isSelected ? [...prev, unitId] : prev.filter((id) => id !== unitId)
      );
    },
    []
  );

  const handleAddUnits = useCallback(() => {
    addUnit(rowIndex, addCount);
    onUpdate();
  }, [addCount, addUnit, rowIndex, onUpdate]);

  const handleDeleteSelected = useCallback(() => {
    setShowDeleteAlert(true);
  }, []);

  const confirmDeleteSelected = useCallback(() => {
    deleteUnits(rowIndex, selectedUnits);
    setSelectedUnits([]);
    onUpdate();
    setShowDeleteAlert(false);
  }, [deleteUnits, selectedUnits, rowIndex, onUpdate]);

  const handleCloneSelected = useCallback(() => {
    duplicateUnits(rowIndex, selectedUnits, cloneCount);
    onUpdate();
  }, [duplicateUnits, rowIndex, selectedUnits, cloneCount, onUpdate]);

  const handleEditSelected = useCallback(() => {
    const selectedUnitObjects = dragAndDropUnits.filter((unit) =>
      selectedUnits.includes(unit.id)
    );

    if (selectedUnitObjects.length === 1) {
      setEditingUnit(selectedUnitObjects[0]);
    } else if (selectedUnitObjects.length > 1) {
      setEditingMultipleUnits(selectedUnitObjects);
    }
  }, [dragAndDropUnits, selectedUnits]);

  const handleUpdateMultipleUnits = (updatedUnits: Unit[]) => {
    updateMultipleUnits(rowIndex, updatedUnits);
    setEditingMultipleUnits([]);
    onUpdate();
  };

  const handleEditUnit = (unit: Unit) => setEditingUnit(unit);
  const handleUpdateUnit = (updatedUnit: Unit) => {
    updateUnit(rowIndex, updatedUnit.id, updatedUnit);
    setEditingUnit(null);
    onUpdate();
  };
  const handleDeleteUnit = (unitId: string) => {
    deleteUnit(rowIndex, unitId);
    onUpdate();
  };

  const handleSelectAll = useCallback(() => {
    setSelectedUnits(dragAndDropUnits.map((unit) => unit.id));
  }, [dragAndDropUnits]);

  const handleDeselectAll = useCallback(() => {
    setSelectedUnits([]);
  }, []);

  return (
    <div className="mb-4">
      <div ref={dragAndDropRef} className="flex flex-wrap gap-2">
        {dragAndDropUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onEdit={() => handleEditUnit(unit)}
            isSelected={selectedUnits.includes(unit.id)}
            onSelect={toggleUnitSelection}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex flex-col md:flex-row gap-2 w-full tour-unit-management-buttons">
          <div className="flex flex-row gap-1 w-full md:w-auto">
            <Input
              type="number"
              value={addCount}
              onChange={(e) => setAddCount(Number(e.target.value))}
              min={1}
              className="w-20"
            />
            <Button
              onClick={handleAddUnits}
              className="flex-grow md:flex-grow-0"
            >
              {t("addUnits")}
            </Button>
          </div>
          <Button
            onClick={handleSelectAll}
            variant="secondary"
            className="w-full md:w-auto"
          >
            {t("selectAll")}
          </Button>
          <Button
            onClick={handleDeselectAll}
            variant="secondary"
            className="w-full md:w-auto"
          >
            {t("deselectAll")}
          </Button>
        </div>
        {selectedUnits.length > 0 && (
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="flex flex-row gap-2 w-full md:w-auto">
              <Input
                type="number"
                value={cloneCount}
                onChange={(e) => setCloneCount(Number(e.target.value))}
                min={1}
                className="w-20"
              />
              <Button onClick={handleCloneSelected} className="flex-grow">
                {t("cloneSelected")}
              </Button>
            </div>
            <Button onClick={handleEditSelected} className="w-full md:w-auto">
              {t("editSelected")}
            </Button>
            <AlertDialog
              open={showDeleteAlert}
              onOpenChange={setShowDeleteAlert}
            >
              <AlertDialogTrigger asChild>
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  className="w-full md:w-auto"
                >
                  {t("deleteSelected")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("deleteSelectedConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteSelectedConfirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteSelected}>
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <Dialog open={!!editingUnit} onOpenChange={() => setEditingUnit(null)}>
        <DialogContent className="w-11/12 max-w-[1200px] h-[95vh] max-h-[95vh] p-0 flex flex-col rounded-lg overflow-hidden">
          <div className="flex-grow overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {editingUnit && (
              <UnitForm
                unit={editingUnit}
                onSubmit={handleUpdateUnit}
                onDelete={() => handleDeleteUnit(editingUnit.id)}
                onCancel={() => setEditingUnit(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingMultipleUnits.length > 0}
        onOpenChange={() => setEditingMultipleUnits([])}
      >
        <DialogContent className="max-w-5xl w-[70vw] h-[95vh] max-h-[95vh] p-0 overflow-hidden">
          <div className="h-full overflow-auto p-6">
            <MultiUnitForm
              units={editingMultipleUnits}
              onSubmit={handleUpdateMultipleUnits}
              onCancel={() => setEditingMultipleUnits([])}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RowContainer;
