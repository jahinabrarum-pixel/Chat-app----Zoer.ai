"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAuth,
} from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import {
  type DBMessage,
  type DBProfile,
  type DBFriendRequest,
  type DBNotification,
  type DBNotificationSettings,
  type DBTypingIndicator,
  type DBReport,
  type ConvType,
  type MessageWithSender,
} from "./chat-types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Moon,
  Sun,
  LogOut,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Plus,
  Send,
  Paperclip,
  Pin,
  Star,
  Edit2,
  Trash2,
  Check,
  X,
  UserPlus,
  UserMinus,
  Shield,
  AlertTriangle,
  File,
  MoreVertical,
  ChevronLeft,
  Group,
  User,
  AtSign,
  Volume2,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ==================== SOUND UTILS ====================

const beepSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 800;
    gain.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  } catch {
    // ignore
  }
};

// ==================== AUTH VIEWS ====================

function AuthViews({
  onAuthChange,
  initialView = "signin",
}: {
  onAuthChange?: (view: "signin" | "signup" | "forgot") => void;
  initialView?: "signin" | "signup" | "forgot";
}) {
  const [view, setView] = useState<"signin" | "signup" | "forgot">(initialView);
  const { signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(name, email, username, password);
    setLoading(false);
    if (error) setError(error);
    else setSuccessMsg("Account created! Check your email to confirm, then sign in.");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error);
    else setSuccessMsg("Password reset email sent!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {view === "signup"
                ? "Create your account"
                : view === "forgot"
                ? "Reset your password"
                : "Sign in to continue"}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg mb-4">
              {successMsg}
            </div>
          )}

          {view === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setView("signup")}
                  className="text-primary hover:underline"
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-muted-foreground hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setView("signin")}
                  className="text-muted-foreground hover:underline"
                >
                  Already have an account?
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setView("signin")}
                  className="text-muted-foreground hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ==================== NOTIFICATION SETTINGS PANEL ====================

function NotificationSettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<DBNotificationSettings>({
    user_id: user?.id || "",
    browser_enabled: true,
    sound_enabled: true,
    message_preview: true,
    group_notifications: true,
    quiet_hours_start: null,
    quiet_hours_end: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as DBNotificationSettings);
      });
  }, [user]);

  const updateSetting = async (key: keyof DBNotificationSettings, value: boolean) => {
    if (!user) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await supabase
      .from("notification_settings")
      .upsert({ ...updated, user_id: user.id });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notification Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span className="text-sm">Browser Notifications</span>
            </div>
            <Switch
              checked={settings.browser_enabled}
              onCheckedChange={(v) => updateSetting("browser_enabled", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">Sound</span>
            </div>
            <Switch
              checked={settings.sound_enabled}
              onCheckedChange={(v) => updateSetting("sound_enabled", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellOff className="w-4 h-4" />
              <span className="text-sm">Message Preview</span>
            </div>
            <Switch
              checked={settings.message_preview}
              onCheckedChange={(v) => updateSetting("message_preview", v)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== IN-APP NOTIFICATIONS LIST ====================

function NotificationsList({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DBNotification[]>([]);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setNotifications((data as DBNotification[]) || []);
      });
  }, [user, open]);

  const markRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-3 rounded-lg border text-sm cursor-pointer transition-colors hover:bg-accent",
                    !n.read && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => markRead(n.id)}
                >
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-muted-foreground text-xs mt-1">{n.body}</p>}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ==================== USER SEARCH ====================

function UserSearchDialog({
  open,
  onClose,
  onSelect,
  excludeIds = [],
  title = "Search Users",
  multiSelect = false,
  selectedIds = [],
  onToggleSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (user: DBProfile) => void;
  excludeIds?: string[];
  title?: string;
  multiSelect?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (user: DBProfile) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DBProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .not("user_id", "in", `(${excludeIds.join(",")})`)
        .limit(20);
      setResults((data as DBProfile[]) || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, excludeIds]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search by username or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <ScrollArea className="max-h-64">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {query ? "No users found" : "Start typing to search"}
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((u) => {
                  const isSelected = selectedIds.includes(u.user_id);
                  return (
                    <div
                      key={u.user_id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                        multiSelect && isSelected && "bg-primary/10"
                      )}
                      onClick={() => {
                        if (multiSelect && onToggleSelect) {
                          onToggleSelect(u);
                        } else if (onSelect) {
                          onSelect(u);
                          onClose();
                        }
                      }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback>{u.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.full_name || u.username}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      {multiSelect && isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== CREATE GROUP DIALOG ====================

function CreateGroupDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (group: ConvType) => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<DBProfile[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    const { data: conv } = await supabase
      .from("conversations")
      .insert({
        type: "group",
        title: name.trim(),
        created_by: user.id,
      })
      .select()
      .maybeSingle();

    if (conv) {
      const convData = conv as ConvType;
      const memberInserts = [
        { conversation_id: convData.id, user_id: user.id, role: "admin" },
        ...selectedMembers.map((m) => ({
          conversation_id: convData.id,
          user_id: m.user_id,
          role: "member",
        })),
      ];
      await supabase.from("conversation_members").insert(memberInserts);
      onCreated(convData);
      onClose();
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Members</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedMembers.map((m) => (
                  <Badge key={m.user_id} variant="secondary" className="gap-1">
                    {m.username}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setSelectedMembers((prev) => prev.filter((x) => x.user_id !== m.user_id))
                      }
                    />
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Members
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UserSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Add Group Members"
        multiSelect
        selectedIds={selectedMembers.map((m) => m.user_id)}
        onToggleSelect={(u) => {
          setSelectedMembers((prev) =>
            prev.some((x) => x.user_id === u.user_id)
              ? prev.filter((x) => x.user_id !== u.user_id)
              : [...prev, u]
          );
        }}
        excludeIds={[user?.id || ""]}
      />
    </>
  );
}

// ==================== MESSAGE ITEM ====================

function MessageItem({
  message,
  isOwn,
  currentUserId,
  onEdit,
  onDelete,
  onPin,
  onStar,
  onReport,
}: {
  message: MessageWithSender;
  isOwn: boolean;
  currentUserId: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onStar: () => void;
  onReport: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isStarred = currentUserId ? message.starred_by?.includes(currentUserId) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2 group", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={message.sender?.avatar_url || undefined} />
          <AvatarFallback>{message.sender?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {message.sender?.username}
          </span>
        )}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2 max-w-xs sm:max-w-md text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          {message.media_url && (
            <div className="mb-2">
              {message.media_mime_type?.startsWith("image/") ? (
                <img
                  src={message.media_url}
                  alt={message.media_name || "image"}
                  className="rounded-lg max-w-full max-h-48 object-cover"
                />
              ) : (
                <div className="flex items-center gap-2 bg-background/50 dark:bg-white/10 rounded-lg p-2">
                  <File className="w-4 h-4" />
                  <span className="text-xs truncate">{message.media_name}</span>
                </div>
              )}
            </div>
          )}
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          {message.pinned && (
            <Pin className="w-3 h-3 absolute top-1 right-1 text-primary-foreground/50" />
          )}
          {isStarred && (
            <Star className="w-3 h-3 absolute bottom-1 right-1 text-yellow-400" />
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {message.is_edited && " (edited)"}
          </span>
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-5 h-5">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "end" : "start"}>
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={onPin}>
                <Pin className="w-3 h-3 mr-2" /> {message.pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStar}>
                <Star className="w-3 h-3 mr-2" /> {isStarred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              {!isOwn && (
                <DropdownMenuItem onClick={onReport} className="text-destructive">
                  <AlertTriangle className="w-3 h-3 mr-2" /> Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== CONVERSATION PANEL ====================

function ConversationPanel({
  conversation,
  onBack,
  onOpenProfile,
}: {
  conversation: ConvType;
  onBack?: () => void;
  onOpenProfile: (userId: string) => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<MessageWithSender | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [members, setMembers] = useState<DBProfile[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load messages
  useEffect(() => {
    if (!conversation) return;
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(async ({ data }) => {
        const msgs = (data as DBMessage[]) || [];
        // Fetch sender profiles separately
        const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", senderIds);
        const profileMap = new Map((profiles as DBProfile[] || []).map((p) => [p.user_id, p]));
        const msgsWithSender = msgs.map((m) => ({ ...m, sender: profileMap.get(m.sender_id) })) as MessageWithSender[];
        setMessages(msgsWithSender);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
  }, [conversation]);

  // Load members
  useEffect(() => {
    if (!conversation) return;
    if (conversation.type === "direct") return;
    supabase
      .from("conversation_members")
      .select("user_id, role")
      .eq("conversation_id", conversation.id)
      .then(({ data }) => {
        const userIds = (data || []).map((m: { user_id: string }) => m.user_id);
        if (userIds.length === 0) return;
        supabase
          .from("profiles")
          .select("*")
          .in("user_id", userIds)
          .then(({ data: profiles }) => {
            setMembers((profiles as DBProfile[]) || []);
          });
      });
  }, [conversation]);

  // Realtime messages
  useEffect(() => {
    if (!conversation) return;
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const msg = payload.new as DBMessage;
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", msg.sender_id)
            .maybeSingle();
          const newMsg = { ...msg, sender: sender as DBProfile } as MessageWithSender;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

          // Sound/notification for others
          if (msg.sender_id !== user?.id) {
            supabase
              .from("notification_settings")
              .select("sound_enabled, browser_enabled")
              .eq("user_id", user?.id)
              .maybeSingle()
              .then(({ data: settings }) => {
                if (settings?.sound_enabled) beepSound();
                if (settings?.browser_enabled && Notification.permission === "granted") {
                  new Notification(sender?.username || "New message", { body: msg.content || "Sent a file" });
                }
              });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const updated = payload.new as DBMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, user]);

  // Realtime typing
  useEffect(() => {
    if (!conversation || !user) return;
    const channel = supabase
      .channel(`typing:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setTypingUsers((prev) =>
              prev.filter((id) => id !== (payload.old as { user_id: string }).user_id)
            );
          } else {
            const typing = payload.new as DBTypingIndicator;
            if (typing.user_id !== user.id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("user_id", typing.user_id)
                .maybeSingle();
              setTypingUsers((prev) => {
                if (prev.includes(typing.user_id)) return prev;
                return [...prev, typing.user_id];
              });
              // Auto-clear after 3s
              setTimeout(() => {
                setTypingUsers((prev) => prev.filter((id) => id !== typing.user_id));
              }, 3000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, user]);

  // Mark messages as seen
  useEffect(() => {
    if (!conversation || !user) return;
    const channel = supabase
      .channel(`seen:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const msg = payload.new as DBMessage;
          if (msg.sender_id !== user.id) {
            // Could mark as seen here via a seen table if needed
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, user]);

  const sendTypingIndicator = useCallback(async () => {
    if (!user || !conversation) return;
    await supabase
      .from("typing_indicators")
      .upsert({
        conversation_id: conversation.id,
        user_id: user.id,
        is_typing: true,
        expires_at: new Date(Date.now() + 5000).toISOString(),
      });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from("typing_indicators")
        .delete()
        .eq("conversation_id", conversation.id)
        .eq("user_id", user.id);
    }, 2000);
  }, [user, conversation]);

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!user || !conversation) return;

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    if (selectedFile) {
      setUploadingFile(true);
      try {
        const { upload } = await import("@zoerai/integration");
        const result = await upload.uploadWithPresignedUrl(selectedFile);
        if (result.success && result.url) {
          fileUrl = result.url;
          fileName = selectedFile.name;
          fileType = selectedFile.type;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
      setUploadingFile(false);
      setSelectedFile(null);
      setFilePreview(null);
    }

    if (editingMessage) {
      await supabase
        .from("messages")
        .update({
          content: newMessage.trim() || editingMessage.content,
          is_edited: true,
        })
        .eq("id", editingMessage.id);
      setEditingMessage(null);
      setNewMessage("");
      return;
    }

    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: newMessage.trim() || null,
      type: "text",
      media_url: fileUrl,
      media_name: fileName,
      media_mime_type: fileType,
    });
    setNewMessage("");

    // Clear typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await supabase
      .from("typing_indicators")
      .delete()
      .eq("conversation_id", conversation.id)
      .eq("user_id", user.id);
  };

  const handleEditMessage = (msg: MessageWithSender) => {
    setEditingMessage(msg);
    setNewMessage(msg.content || "");
  };

  const handleDeleteMessage = async (msg: MessageWithSender) => {
    await supabase.from("messages").delete().eq("id", msg.id);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
  };

  const handlePinMessage = async (msg: MessageWithSender) => {
    await supabase
      .from("messages")
      .update({ pinned: !msg.pinned })
      .eq("id", msg.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, pinned: !m.pinned } : m))
    );
  };

  const handleStarMessage = async (msg: MessageWithSender) => {
    if (!user) return;
    const isStarred = msg.starred_by?.includes(user.id);
    const newStarredBy = isStarred
      ? msg.starred_by.filter((id) => id !== user.id)
      : [...(msg.starred_by || []), user.id];
    await supabase
      .from("messages")
      .update({ starred_by: newStarredBy })
      .eq("id", msg.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, starred_by: newStarredBy } : m))
    );
  };

  const handleReportMessage = async (msg: MessageWithSender) => {
    if (!user) return;
    await supabase.from("reports").insert({
      reporter_id: user.id,
      conversation_id: msg.conversation_id,
      message_id: msg.id,
      reason: "Inappropriate message content",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleAddMember = async (member: DBProfile) => {
    if (!conversation) return;
    await supabase.from("conversation_members").insert({
      conversation_id: conversation.id,
      user_id: member.user_id,
      role: "member",
    });
    setMembers((prev) => [...prev, member]);
    setShowAddMember(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!conversation) return;
    await supabase
      .from("conversation_members")
      .delete()
      .eq("conversation_id", conversation.id)
      .eq("user_id", memberId);
    setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
  };

  const displayName = useMemo(() => {
    if (conversation.type === "group") return conversation.title;
    const other = members.find((m) => m.user_id !== user?.id);
    return other?.full_name || other?.username || "Chat";
  }, [conversation, members, user]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <Avatar className="w-10 h-10" onClick={() => {
          const other = members.find((m) => m.user_id !== user?.id);
          if (other) onOpenProfile(other.user_id);
        }}>
          <AvatarImage src={conversation.avatar_url || undefined} />
          <AvatarFallback>
            {conversation.type === "group" ? (
              <Group className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{displayName}</h2>
          {typingUsers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {typingUsers.length === 1 ? "typing..." : "multiple typing..."}
            </p>
          )}
        </div>
        {conversation.type === "group" && (
          <Button variant="ghost" size="icon" onClick={() => setShowMembers(true)}>
            <Users className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.id}
              currentUserId={user?.id}
              onEdit={() => handleEditMessage(msg)}
              onDelete={() => handleDeleteMessage(msg)}
              onPin={() => handlePinMessage(msg)}
              onStar={() => handleStarMessage(msg)}
              onReport={() => handleReportMessage(msg)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* File Preview */}
      {filePreview && selectedFile && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            {selectedFile.type.startsWith("image/") ? (
              <img src={filePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-lg">
                <File className="w-8 h-8" />
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="w-5 h-5 absolute -top-1 -right-1"
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t flex items-end gap-2">
        <div className="flex items-center gap-1">
          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,application/pdf,text/*"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Button variant="ghost" size="icon" asChild>
              <span>
                <Paperclip className="w-5 h-5" />
              </span>
            </Button>
          </label>
        </div>
        <div className="flex-1">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              sendTypingIndicator();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
          />
        </div>
        <Button onClick={handleSend} disabled={!newMessage.trim() && !selectedFile || uploadingFile}>
          {uploadingFile ? "..." : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {/* Members Sheet */}
      <Sheet open={showMembers} onOpenChange={setShowMembers}>
        <SheetContent>
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Members ({members.length})</SheetTitle>
              {conversation.type === "group" && (
                <Button size="sm" variant="outline" onClick={() => setShowAddMember(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              )}
            </div>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
            <div className="space-y-1">
              {members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onOpenProfile(m.user_id)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={m.avatar_url || undefined} />
                    <AvatarFallback>{m.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.full_name || m.username}</p>
                    <p className="text-xs text-muted-foreground">@{m.username}</p>
                  </div>
                  {m.user_id === user?.id && <Badge variant="secondary">You</Badge>}
                  {conversation.created_by === m.user_id && <Badge>Admin</Badge>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <UserSearchDialog
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Member"
        excludeIds={[user?.id || "", ...members.map((m) => m.user_id)]}
        onSelect={handleAddMember}
      />
    </div>
  );
}

// ==================== CHAT LIST SIDEBAR ====================

function ChatSidebar({
  onSelectConversation,
  onNewChat,
  onNewGroup,
  selectedId,
}: {
  onSelectConversation: (conv: ConvType) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  selectedId?: string;
}) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConvType[]>([]);
  const [filter, setFilter] = useState<"all" | "direct" | "group">("all");

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_members",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    loadConversations();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    const { data: memberConvs } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id);

    const convIds = (memberConvs || []).map(
      (m: { conversation_id: string }) => m.conversation_id
    );
    if (convIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("created_at", { ascending: false });

    const convsWithData = (convs || []) as ConvType[];

    // Get member profiles and last message for each
    const enriched = await Promise.all(
      convsWithData.map(async (conv) => {
        const { data: members } = await supabase
          .from("conversation_members")
          .select("user_id")
          .eq("conversation_id", conv.id);

        const memberIds = (members || []).map(
          (m: { user_id: string }) => m.user_id
        );
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", memberIds);

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: unreadData } = await supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id);

        return {
          ...conv,
          members: profiles as DBProfile[],
          last_message: lastMsg as DBMessage | null,
          unread_count: unreadData?.length || 0,
        } as ConvType;
      })
    );

    setConversations(enriched);
  };

  const filtered = conversations.filter((c) => {
    if (filter === "all") return true;
    return c.type === filter;
  });

  const getConvDisplayName = (conv: ConvType) => {
    if (conv.type === "group") return conv.title;
    const other = conv.members?.find((m) => m.user_id !== user?.id);
    return other?.full_name || other?.username || "Chat";
  };

  const getConvAvatar = (conv: ConvType) => {
    if (conv.type === "group") return null;
    return conv.members?.find((m) => m.user_id !== user?.id)?.avatar_url;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Chats</h2>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onNewChat}>
                  <AtSign className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onNewGroup}>
                  <Group className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Group</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
            <TabsTrigger value="group" className="flex-1">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No conversations yet
          </p>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((conv) => {
              const isSelected = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-accent"
                  )}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getConvAvatar(conv) || undefined} />
                    <AvatarFallback>
                      {conv.type === "group" ? (
                        <Group className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{getConvDisplayName(conv)}</p>
                      {conv.last_message && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.last_message?.content ||
                        (conv.last_message?.media_name ? `📎 ${conv.last_message.media_name}` : "")}
                    </p>
                  </div>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {conv.unread_count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ==================== FRIEND REQUESTS PANEL ====================

function FriendRequestsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<(DBFriendRequest & { requester?: DBProfile })[]>([]);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("friend_requests")
      .select("*")
      .eq("addressee_id", user.id)
      .eq("status", "pending")
      .then(async ({ data }) => {
        const reqs = (data as DBFriendRequest[]) || [];
        // Fetch requester profiles separately
        const requesterIds = reqs.map((r) => r.requester_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", requesterIds);
        const profileMap = new Map((profiles as DBProfile[] || []).map((p) => [p.user_id, p]));
        const reqsWithRequester = reqs.map((r) => ({ ...r, requester: profileMap.get(r.requester_id) }));
        setRequests(reqsWithRequester);
      });
  }, [user, open]);

  const handleAccept = async (requestId: string, senderId: string) => {
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    // Create direct conversation
    const { data: conv } = await supabase
      .from("conversations")
      .insert({ type: "direct", created_by: user?.id })
      .select()
      .maybeSingle();

    if (conv && user) {
      await supabase.from("conversation_members").insert([
        { conversation_id: conv.id, user_id: user.id, role: "member" },
        { conversation_id: conv.id, user_id: senderId, role: "member" },
      ]);
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleReject = async (requestId: string) => {
    await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Friend Requests</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending requests
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={req.requester?.avatar_url || undefined} />
                    <AvatarFallback>
                      {req.requester?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {req.requester?.full_name || req.requester?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{req.requester?.username}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleAccept(req.id, req.requester_id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(req.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ==================== ADMIN PANEL ====================

function AdminPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<DBProfile[]>([]);
  const [reports, setReports] = useState<DBReport[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    totalReports: 0,
  });

  useEffect(() => {
    if (!open) return;
    // Load stats
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }),
    ]).then(([u, c, m, r]) => {
      setStats({
        totalUsers: u.count || 0,
        totalConversations: c.count || 0,
        totalMessages: m.count || 0,
        totalReports: r.count || 0,
      });
    });

    if (activeTab === "users") {
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data }) => setUsers((data as DBProfile[]) || []));
    }
    if (activeTab === "reports") {
      supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => setReports((data as DBReport[]) || []));
    }
  }, [open, activeTab]);

  const handleResolveReport = async (id: string, status: "resolved" | "dismissed") => {
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleDeleteUser = async (userId: string) => {
    await supabase.auth.admin.deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <SheetTitle>Admin Panel</SheetTitle>
          </div>
        </SheetHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalConversations}</p>
            <p className="text-xs text-muted-foreground">Chats</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalMessages}</p>
            <p className="text-xs text-muted-foreground">Messages</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalReports}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1">
              Users
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">
              Groups
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.user_id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback>{u.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.full_name || u.username}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(u.user_id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="mt-4">
            <GroupsManagement />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{r.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: {r.status} •{" "}
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {r.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveReport(r.id, "dismissed")}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolveReport(r.id, "resolved")}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No reports</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function GroupsManagement() {
  const [groups, setGroups] = useState<ConvType[]>([]);

  useEffect(() => {
    supabase
      .from("conversations")
      .select("*")
      .eq("type", "group")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setGroups((data as ConvType[]) || []));
  }, []);

  const handleDeleteGroup = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                <Group className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{g.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(g.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(g.id)}>
              Delete
            </Button>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No groups</p>
        )}
      </div>
    </ScrollArea>
  );
}

// ==================== USER PROFILE PANEL ====================

function UserProfilePanel({
  userId,
  open,
  onClose,
}: {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", user?.id)
        .eq("blocked_id", userId)
        .maybeSingle(),
      supabase
        .from("reports")
        .select("id")
        .eq("reporter_id", user?.id)
        .eq("reported_user_id", userId)
        .maybeSingle(),
    ]).then(([{ data: prof }, { data: block }, { data: report }]) => {
      setProfile(prof as DBProfile | null);
      setIsBlocked(!!block);
      setHasReported(!!report);
      setLoading(false);
    });
  }, [userId, open, user]);

  const handleBlock = async () => {
    if (!user || !userId) return;
    if (isBlocked) {
      await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", userId);
      setIsBlocked(false);
    } else {
      await supabase.from("user_blocks").insert({
        blocker_id: user.id,
        blocked_id: userId,
      });
      setIsBlocked(true);
    }
  };

  const handleReport = async () => {
    if (!user || !userId || hasReported) return;
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: userId,
      reason: "User reported by another user",
    });
    setHasReported(true);
  };

  const handleSendMessage = async () => {
    if (!user || !profile) return;
    // Check if direct conv already exists
    const { data: existing } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id);

    const convIds = (existing || []).map(
      (m: { conversation_id: string }) => m.conversation_id
    );

    if (convIds.length > 0) {
      const { data: directConvs } = await supabase
        .from("conversations")
        .select("id")
        .eq("type", "direct")
        .in("id", convIds);

      // Find if user is already a member
      for (const conv of directConvs || []) {
        const { data: members } = await supabase
          .from("conversation_members")
          .select("user_id")
          .eq("conversation_id", conv.id);

        if (members?.some((m: { user_id: string }) => m.user_id === profile.user_id)) {
          onClose();
          return; // Conversation exists
        }
      }
    }

    // Create new direct conversation
    const { data: conv } = await supabase
      .from("conversations")
      .insert({ type: "direct", created_by: user.id })
      .select()
      .maybeSingle();

    if (conv) {
      await supabase.from("conversation_members").insert([
        { conversation_id: conv.id, user_id: user.id, role: "member" },
        { conversation_id: conv.id, user_id: profile.user_id, role: "member" },
      ]);
    }
    onClose();
  };

  if (!userId) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User Profile</SheetTitle>
        </SheetHeader>
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : profile ? (
          <div className="space-y-6 mt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xl">
                  {profile.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 font-bold text-lg">
                {profile.full_name || profile.username}
              </h3>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={handleSendMessage}>
                <MessageSquare className="w-4 h-4 mr-2" /> Send Message
              </Button>
              <Button
                variant={isBlocked ? "default" : "outline"}
                className="w-full"
                onClick={handleBlock}
              >
                {isBlocked ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" /> Unblock
                  </>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" /> Block
                  </>
                )}
              </Button>
              <Button
                variant={hasReported ? "secondary" : "outline"}
                className="w-full"
                onClick={handleReport}
                disabled={hasReported}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {hasReported ? "Reported" : "Report User"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            User not found
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ==================== PROFILE/SETTINGS PANEL ====================

function ProfileSettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, profile, role, signOut, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setUsername(profile.username || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: name, username });
    setSaving(false);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profile & Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {profile?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="mt-2 font-bold">{profile?.full_name || profile?.username}</p>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            {role === "admin" && (
              <Badge variant="default" className="mt-2">
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== FRIEND REQUESTS BUTTON WITH BADGE ====================

function FriendRequestsButton({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick} className="relative">
          <UserPlus className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Friend Requests</TooltipContent>
    </Tooltip>
  );
}

// ==================== MAIN CHAT APP ====================

export default function ChatApp() {
  const { user, loading, role } = useAuth();
  const { setTheme, theme } = useTheme();

  const [selectedConversation, setSelectedConversation] = useState<ConvType | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch counts
  useEffect(() => {
    if (!user) return;
    supabase
      .from("friend_requests")
      .select("id", { count: "exact" })
      .eq("addressee_id", user.id)
      .eq("status", "pending")
      .then(({ count }) => setFriendRequestCount(count || 0));

    supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setNotificationCount(count || 0));

    // Realtime
    const channel = supabase
      .channel("counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests", filter: `addressee_id=eq.${user.id}` },
        () => {
          supabase
            .from("friend_requests")
            .select("id", { count: "exact" })
            .eq("addressee_id", user.id)
            .eq("status", "pending")
            .then(({ count }) => setFriendRequestCount(count || 0));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          supabase
            .from("notifications")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .eq("read", false)
            .then(({ count }) => setNotificationCount(count || 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleNewChat = (selectedUser: DBProfile) => {
    if (!user) return;
    // Check existing direct conversation
    supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id)
      .then(async ({ data: myMembers }) => {
        const myConvIds = (myMembers || []).map(
          (m: { conversation_id: string }) => m.conversation_id
        );
        if (myConvIds.length > 0) {
          const { data: convs } = await supabase
            .from("conversations")
            .select("id")
            .eq("type", "direct")
            .in("id", myConvIds);

          for (const conv of convs || []) {
            const { data: members } = await supabase
              .from("conversation_members")
              .select("user_id")
              .eq("conversation_id", conv.id);

            if (members?.some((m: { user_id: string }) => m.user_id === selectedUser.user_id)) {
              // Found existing - reload conversations
              setShowNewChat(false);
              return;
            }
          }
        }

        // Create new direct conversation
        const { data: conv } = await supabase
          .from("conversations")
          .insert({ type: "direct", created_by: user.id })
          .select()
          .maybeSingle();

        if (conv) {
          await supabase.from("conversation_members").insert([
            { conversation_id: conv.id, user_id: user.id, role: "member" },
            { conversation_id: conv.id, user_id: selectedUser.user_id, role: "member" },
          ]);
        }
        setShowNewChat(false);
      });
  };

  const handleNewGroup = (conv: ConvType) => {
    setSelectedConversation(conv);
    setShowNewGroup(false);
  };

  const handleOpenProfile = (userId: string) => {
    setSelectedProfileUserId(userId);
    setShowProfile(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthViews />;
  }

  return (
    <TooltipProvider>
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r flex flex-col bg-sidebar h-full"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <MessageSquare className="w-5 h-5 text-primary" />
                <h1 className="font-bold">ChatApp</h1>
              </div>
              <div className="flex items-center gap-1">
                <FriendRequestsButton
                  onClick={() => setShowFriendRequests(true)}
                  count={friendRequestCount}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotifications(true)}
                      className="relative"
                    >
                      <Bell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotificationSettings(true)}
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notification Settings</TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowProfile(true)}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 mr-2" />
                      ) : (
                        <Moon className="w-4 h-4 mr-2" />
                      )}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </DropdownMenuItem>
                    {role === "admin" && (
                      <DropdownMenuItem onClick={() => setShowAdmin(true)}>
                        <Shield className="w-4 h-4 mr-2" /> Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await supabase.auth.signOut();
                      }}
                      className="text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search or start new chat"
                  className="pl-9"
                  onFocus={() => setShowNewChat(true)}
                  readOnly
                />
              </div>
            </div>

            {/* Chat List */}
            <ChatSidebar
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                setShowSidebar(false);
              }}
              onNewChat={() => setShowNewChat(true)}
              onNewGroup={() => setShowNewGroup(true)}
              selectedId={selectedConversation?.id}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(true)}
                  className="mb-4"
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Button>
              )}
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold">Welcome to ChatApp</h2>
              <p className="text-muted-foreground mt-2">
                Select a conversation or start a new one
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button onClick={() => setShowNewChat(true)}>
                  <AtSign className="w-4 h-4 mr-2" /> New Chat
                </Button>
                <Button variant="outline" onClick={() => setShowNewGroup(true)}>
                  <Group className="w-4 h-4 mr-2" /> New Group
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ConversationPanel
            conversation={selectedConversation}
            onBack={() => {
              setSelectedConversation(null);
              setShowSidebar(true);
            }}
            onOpenProfile={handleOpenProfile}
          />
        )}
      </div>

      {/* Dialogs */}
      <UserSearchDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        title="Start New Chat"
        onSelect={handleNewChat}
        excludeIds={[user.id]}
      />

      <CreateGroupDialog
        open={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        onCreated={handleNewGroup}
      />

      <FriendRequestsPanel
        open={showFriendRequests}
        onClose={() => setShowFriendRequests(false)}
      />

      <NotificationsList
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <NotificationSettingsPanel
        open={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      <ProfileSettingsPanel
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <UserProfilePanel
        userId={selectedProfileUserId}
        open={showProfile}
        onClose={() => {
          setShowProfile(false);
          setSelectedProfileUserId(null);
        }}
      />

      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
    </TooltipProvider>
  );
}
