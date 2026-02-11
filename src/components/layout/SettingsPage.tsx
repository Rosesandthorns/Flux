



"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Palette, KeyRound, Bell, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import { useAuth, useUserProfile, useFirestore, updateUserSettings } from "@/firebase";
import type { UserProfile } from "@/firebase/auth/users";
import { signOut } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { serverTimestamp } from "firebase/firestore";
import { add, formatDistanceToNow } from "date-fns";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { THEMES } from "@/lib/themes";

type SettingsCategory = "My Account" | "Profiles" | "Privacy & Safety" | "Notifications" | "Keybinds";

const settingsCategories: { name: SettingsCategory, icon: React.ElementType }[] = [
    { name: "My Account", icon: User },
    { name: "Profiles", icon: Palette },
    { name: "Privacy & Safety", icon: Shield },
    { name: "Notifications", icon: Bell },
    { name: "Keybinds", icon: KeyRound },
];

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Must be at least 2 characters.").max(50, "Must be 50 characters or less."),
  handle: z.string().min(2, "Must be at least 2 characters.").max(30, "Must be 30 characters or less.").regex(/^[a-zA-Z0-9_.-]+$/, "Can only contain letters, numbers, underscores, periods, and hyphens."),
  photoURL: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")),
});


export default function SettingsPage() {
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>("My Account");
    const [isSaving, setIsSaving] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { theme: selectedTheme, setTheme: setSelectedTheme } = useTheme();
    const auth = useAuth();
    const firestore = useFirestore();
    const { data: userProfile, loading: userProfileLoading } = useUserProfile();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileFormSchema>>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        displayName: "",
        handle: "",
        photoURL: "",
      },
    });

    useEffect(() => {
        if (userProfile && isEditDialogOpen) {
            form.reset({
                displayName: userProfile.displayName || "",
                handle: userProfile.handle ? userProfile.handle.split('@')[0] : "",
                photoURL: userProfile.photoURL || "",
            });
        }
    }, [userProfile, isEditDialogOpen, form]);

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
        }
    };
    
    const handleSettingsUpdate = async (settings: Partial<UserProfile> | { [key: string]: any }) => {
        if (!firestore || !auth?.currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
            return;
        }
        try {
            await updateUserSettings(firestore, auth.currentUser.uid, settings);
        } catch (error) {
            if (process.env.NODE_ENV !== 'development') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
            }
        }
    };
    
    const handleThemeChange = (newTheme: Theme) => {
        setSelectedTheme(newTheme);
        handleSettingsUpdate({ theme: newTheme });
    };

    const fourWeeksInMillis = 4 * 7 * 24 * 60 * 60 * 1000;
    const canUpdateUsername = userProfile?.profileLastUpdatedAt ? (new Date().getTime() - userProfile.profileLastUpdatedAt.toDate().getTime()) > fourWeeksInMillis : true;
    const nextUpdateDate = userProfile?.profileLastUpdatedAt ? add(userProfile.profileLastUpdatedAt.toDate(), { weeks: 4 }) : null;

    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
      if (!firestore || !auth?.currentUser) return;

      const { dirtyFields } = form.formState;
      const updates: { [key: string]: any } = {};
      let hasIdentityChanged = false;

      if (dirtyFields.displayName) {
          updates.displayName = values.displayName;
          hasIdentityChanged = true;
      }
      if (dirtyFields.handle) {
          updates.handle = `${values.handle}@flux`;
          hasIdentityChanged = true;
      }
      if (dirtyFields.photoURL) {
          updates.photoURL = values.photoURL;
      }

      if (Object.keys(updates).length === 0) {
          toast({ title: "No changes to save." });
          setIsEditDialogOpen(false);
          return;
      }
      
      if (hasIdentityChanged && !canUpdateUsername) {
        toast({ variant: 'destructive', title: 'Cooldown Active', description: 'You cannot change your username or handle yet.' });
        return;
      }

      if (hasIdentityChanged) {
        updates.profileLastUpdatedAt = serverTimestamp();
      }

      setIsSaving(true);
      try {
        await updateUserSettings(firestore, auth.currentUser.uid, updates);
        toast({ title: "Success!", description: "Your profile has been updated." });
        setIsEditDialogOpen(false);
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save profile.' });
        }
      } finally {
        setIsSaving(false);
      }
    }

    const renderContent = () => {
        if (userProfileLoading) {
             return (
                <div>
                     <h1 className="text-2xl font-bold mb-6"><Skeleton className="h-8 w-48" /></h1>
                     <Card><CardContent className="p-8"><Skeleton className="h-64 w-full" /></CardContent></Card>
                </div>
            )
        }

        if (!userProfile) {
            return (
                 <div>
                    <h1 className="text-2xl font-bold mb-6">Settings</h1>
                    <p>Could not load user profile. Please try logging in again.</p>
                </div>
            )
        }


        switch (activeCategory) {
            case "My Account":
                return (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">My Account</h1>
                        <Card className="overflow-hidden">
                            <div className="bg-primary/10 h-24" />
                            <CardContent className="p-4 pt-0">
                                <div className="flex justify-between items-end -mt-12">
                                    <div className="flex items-end gap-4">
                                        <Avatar className="h-24 w-24 border-4 border-background rounded-full">
                                            {userProfile.photoURL && <AvatarImage src={userProfile.photoURL} alt="User Avatar" />}
                                            <AvatarFallback>{userProfile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-xl font-semibold">{userProfile.displayName}</h2>
                                            <p className="text-muted-foreground">{userProfile.handle}</p>
                                        </div>
                                    </div>
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>Edit User Profile</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit Profile</DialogTitle>
                                                <DialogDescription>
                                                    Make changes to your profile here. Click save when you're done.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="displayName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Display Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Your display name" {...field} disabled={!canUpdateUsername || isSaving} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="handle"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Handle</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input placeholder="your_handle" {...field} className="pr-[5.5rem]" disabled={!canUpdateUsername || isSaving}/>
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">@flux</span>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                     {!canUpdateUsername && nextUpdateDate && (
                                                        <p className="text-sm text-muted-foreground">
                                                            You can change your display name and handle again {formatDistanceToNow(nextUpdateDate, { addSuffix: true })}.
                                                        </p>
                                                    )}
                                                    <FormField
                                                        control={form.control}
                                                        name="photoURL"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Profile Picture URL</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="https://example.com/image.png" {...field} disabled={isSaving} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button type="button" variant="secondary" disabled={isSaving}>Cancel</Button>
                                                        </DialogClose>
                                                        <Button type="submit" disabled={isSaving}>
                                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Save changes
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case "Profiles":
                return (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Profiles</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Color Schemes</CardTitle>
                                <CardDescription>Choose a color scheme for your app. The change will be applied application-wide.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {THEMES.map(theme => (
                                    <div key={theme.id} onClick={() => handleThemeChange(theme.id as Theme)} className="cursor-pointer">
                                        <div className={`relative overflow-hidden rounded-lg border-2 ${selectedTheme === theme.id ? 'border-primary' : 'border-border'}`}>
                                            <div className="p-4 space-y-2" style={{ backgroundColor: theme.isDark ? theme.previewColors[0] : theme.previewColors[0] }}>
                                                <div className="flex gap-2">
                                                    {theme.previewColors.map((color, index) => (
                                                        <div key={index} style={{backgroundColor: color}} className={`h-10 w-full rounded ${index === 0 && theme.id === 'crimson' ? '' : 'flex-1'}`} />
                                                    ))}
                                                </div>
                                                <div className="h-6 w-3/4 rounded bg-muted" />
                                                <div className="h-4 w-1/2 rounded bg-muted" />
                                            </div>
                                            {selectedTheme === theme.id && (
                                                <div className="absolute top-2 right-2 text-primary">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-center mt-2 font-medium">{theme.name}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                );
            case "Privacy & Safety":
                return (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Privacy & Safety</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Who can DM me</CardTitle>
                                <CardDescription>Control who is able to send you direct messages.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup 
                                    value={userProfile.privacy?.whoCanDm ?? 'anyone'}
                                    onValueChange={(value) => handleSettingsUpdate({ 'privacy.whoCanDm': value as any })}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="anyone" id="dm-anyone" />
                                        <Label htmlFor="dm-anyone">Anyone</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="friends" id="dm-friends" />
                                        <Label htmlFor="dm-friends">Friends Only</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Who can add me as a friend</CardTitle>
                                <CardDescription>Manage who can send you friend requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup 
                                     value={userProfile.privacy?.whoCanAdd ?? 'anyone'}
                                     onValueChange={(value) => handleSettingsUpdate({ 'privacy.whoCanAdd': value as any })}
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="anyone" id="add-anyone" />
                                        <Label htmlFor="add-anyone">Anyone</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="mutual" id="add-mutual" />
                                        <Label htmlFor="add-mutual">People in a mutual server or a friend of a friend</Label>
                                    </div>
                                     <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="fof" id="add-fof" />
                                        <Label htmlFor="add-fof">Friend of a friend</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="none" id="add-none" />
                                        <Label htmlFor="add-none">No One</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                        <h2 className="text-xl font-bold mt-8 mb-4">Password and Authentication</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>It's a good idea to use a strong password that you're not using elsewhere.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button>Change Password</Button>
                            </CardContent>
                        </Card>

                        <h2 className="text-xl font-bold mt-8 mb-4">Account Removal</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-destructive">Delete Account</CardTitle>
                                <CardDescription>Disabling your account means you can recover it at any time. Deleting your account is permanent.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4">
                                <Button variant="outline" className="text-destructive border-destructive">Disable Account</Button>
                                <Button variant="destructive">Delete Account</Button>
                            </CardContent>
                        </Card>
                    </div>
                );
            case "Notifications":
                return (
                     <div>
                        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Push Notifications</CardTitle>
                                <CardDescription>Enable or disable push notifications for different activities.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notif-friend-requests" className="font-semibold">New friend requests</Label>
                                        <p className="text-sm text-muted-foreground">Receive a notification when someone sends you a friend request.</p>
                                    </div>
                                    <Switch 
                                        id="notif-friend-requests" 
                                        checked={userProfile.notifications?.friendRequests ?? true}
                                        onCheckedChange={(checked) => handleSettingsUpdate({ 'notifications.friendRequests': checked })}
                                    />
                                </div>
                                 <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notif-mentions" className="font-semibold">New mentions in servers</Label>
                                        <p className="text-sm text-muted-foreground">Get notified when someone @mentions you in a server.</p>
                                    </div>
                                    <Switch 
                                        id="notif-mentions" 
                                        checked={userProfile.notifications?.mentions ?? true}
                                        onCheckedChange={(checked) => handleSettingsUpdate({ 'notifications.mentions': checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notif-dms" className="font-semibold">New DMs</Label>
                                        <p className="text-sm text-muted-foreground">Receive a notification for new direct messages.</p>
                                    </div>
                                    <Switch 
                                        id="notif-dms"
                                        checked={userProfile.notifications?.dms ?? false}
                                        onCheckedChange={(checked) => handleSettingsUpdate({ 'notifications.dms': checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case "Keybinds":
                return (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Keybinds</h1>
                         <Card>
                             <CardContent className="p-8 text-center text-muted-foreground">
                                <p>Keybind customization will be available in a future update.</p>
                             </CardContent>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen w-full bg-secondary/30 text-foreground">
            <nav className="hidden md:flex flex-col gap-1 w-80 border-r border-border/50 p-4">
                <h2 className="text-xs uppercase font-bold text-muted-foreground px-2 mb-2">User Settings</h2>
                {settingsCategories.map(category => (
                    <Button
                        key={category.name}
                        variant={activeCategory === category.name ? "secondary" : "ghost"}
                        className="justify-start gap-3 px-2 text-base py-5"
                        onClick={() => setActiveCategory(category.name)}
                    >
                        <category.icon className="h-5 w-5" />
                        <span>{category.name}</span>
                    </Button>
                ))}
                <Separator className="my-2 bg-border/50" />
                <Button variant="ghost" className="justify-start gap-3 px-2 text-base py-5 text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </Button>
            </nav>
            <ScrollArea className="flex-1">
                <div 
                    className="p-8 max-w-4xl mx-auto"
                >
                    {renderContent()}
                </div>
            </ScrollArea>
        </div>
    );
}
