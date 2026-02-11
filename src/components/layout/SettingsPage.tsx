"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { User, Shield, Palette, KeyRound, Bell, LogOut, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme, type Theme } from "@/context/ThemeContext";

const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

type SettingsCategory = "My Account" | "Profiles" | "Privacy & Safety" | "Notifications" | "Keybinds";

const settingsCategories: { name: SettingsCategory, icon: React.ElementType }[] = [
    { name: "My Account", icon: User },
    { name: "Profiles", icon: Palette },
    { name: "Privacy & Safety", icon: Shield },
    { name: "Notifications", icon: Bell },
    { name: "Keybinds", icon: KeyRound },
];

const themes = [
    { name: "Default", id: "default", colors: ["bg-background", "bg-primary", "bg-accent"] },
    { name: "Void", id: "void", colors: ["bg-[#101014]", "bg-[#8000FF]", "bg-[#27272a]"] },
    { name: "Bright", id: "bright", colors: ["bg-[#fafff0]", "bg-[#38bdf8]", "bg-[#dcfce7]"] },
    { name: "Crimson", id: "crimson", colors: ["bg-gradient-to-b from-red-500 to-red-800", "bg-black", "bg-red-900/50"] },
    { name: "Jade", id: "jade", colors: ["bg-slate-100", "bg-emerald-500", "bg-slate-200"] },
];

export default function SettingsPage() {
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>("Profiles");
    const { theme: selectedTheme, setTheme: setSelectedTheme } = useTheme();

    const renderContent = () => {
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
                                            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-xl font-semibold">username</h2>
                                            <p className="text-muted-foreground">username@flux</p>
                                        </div>
                                    </div>
                                    <Button>Edit User Profile</Button>
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
                                {themes.map(theme => (
                                    <div key={theme.id} onClick={() => setSelectedTheme(theme.id as Theme)} className="cursor-pointer">
                                        <div className={`relative overflow-hidden rounded-lg border-2 ${selectedTheme === theme.id ? 'border-primary' : 'border-border'}`}>
                                            <div className="p-4 space-y-2">
                                                <div className="flex gap-2">
                                                    {theme.colors.map((color, index) => (
                                                        <div key={index} className={`h-10 w-full rounded ${color} ${index === 0 && theme.id === 'crimson' ? '' : 'flex-1'}`} />
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
                                <RadioGroup defaultValue="anyone">
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
                                <RadioGroup defaultValue="anyone">
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
                                    <Switch id="notif-friend-requests" defaultChecked />
                                </div>
                                 <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notif-mentions" className="font-semibold">New mentions in servers</Label>
                                        <p className="text-sm text-muted-foreground">Get notified when someone @mentions you in a server.</p>
                                    </div>
                                    <Switch id="notif-mentions" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notif-dms" className="font-semibold">New DMs</Label>
                                        <p className="text-sm text-muted-foreground">Receive a notification for new direct messages.</p>
                                    </div>
                                    <Switch id="notif-dms" />
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
                <Button variant="ghost" className="justify-start gap-3 px-2 text-base py-5 text-destructive hover:text-destructive">
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </Button>
            </nav>
            <ScrollArea className="flex-1">
                <div className="p-8 max-w-4xl mx-auto">
                    {renderContent()}
                </div>
            </ScrollArea>
        </div>
    );
}
