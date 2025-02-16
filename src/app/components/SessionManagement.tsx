"use client";

import { useSession } from "@/app/contexts/SessionContext";
import { Button } from "@/app/ui/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/shadcn/dialog";
import { Input } from "@/app/ui/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/shadcn/select";
import { toast } from "@/app/ui/shadcn/use-toast";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const SessionManagement: React.FC = () => {
  const {
    sessions,
    createSession,
    setCurrentSessionByID,
    getSessionNameById,
    deleteSession,
  } = useSession();
  const [newSessionName, setNewSessionName] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const t = useTranslations("SessionManagement");

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      createSession(newSessionName.trim());
      setNewSessionName("");
    }
  };

  const handleLoadSession = () => {
    if (selectedSessionId) {
      const sessionName = getSessionNameById(selectedSessionId);
      setCurrentSessionByID(selectedSessionId);
      setSelectedSessionId("");
      toast({ title: t("toast.loading", { sessionName }) });
    }
  };

  const handleDeleteSession = () => {
    if (selectedSessionId) {
      const sessionName = getSessionNameById(selectedSessionId);
      deleteSession(selectedSessionId);
      setSelectedSessionId("");
      toast({ title: t("toast.deleting", { sessionName }) });
    }
  };

  return (
    <div className={`flex flex-col md:flex-row w-full`}>
      <div className="flex flex-col md:flex-row tour-sessions gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              {t("buttons.new.button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("buttons.new.dialog.header")}</DialogTitle>
            </DialogHeader>
            <div className="flex max-w-sm items-center space-x-2">
              <Input
                placeholder={t("buttons.new.dialog.input_placeholder")}
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
              <DialogFooter className="md:justify-start">
                <DialogClose asChild>
                  <Button onClick={handleCreateSession}>
                    {t("buttons.new.dialog.submit_button")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              {t("buttons.load.button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("buttons.load.dialog.header")}</DialogTitle>
            </DialogHeader>
            <div className="flex max-w-sm items-center space-x-2">
              <Select onValueChange={setSelectedSessionId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("buttons.load.dialog.select_placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {`${session.name} (${new Date(
                        session.lastModified
                      ).toLocaleString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter className="md:justify-start">
                <DialogClose asChild>
                  <Button onClick={handleLoadSession}>
                    {t("buttons.load.dialog.submit_button")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              {t("buttons.delete.button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("buttons.delete.dialog.header")}</DialogTitle>
            </DialogHeader>
            <div className="flex max-w-sm items-center space-x-2">
              <Select onValueChange={setSelectedSessionId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("buttons.delete.dialog.select_placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {`${session.name} (${new Date(
                        session.lastModified
                      ).toLocaleString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter className="md:justify-start">
                <Button onClick={handleDeleteSession}>
                  {t("buttons.delete.dialog.submit_button")}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SessionManagement;
