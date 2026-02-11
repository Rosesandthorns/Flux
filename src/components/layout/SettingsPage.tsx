"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { User, Shield, Palette, KeyRound, Bell, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

const settingsCategories = [
    { name: "My Account", icon: User },
    { name: "Profiles", icon: Palette },
    { name: "Privacy & Safety", icon: Shield },
    { name: "Notifications", icon: Bell },
    { name: "Keybinds", icon: KeyRound },
]

export default function SettingsPage() {
  return (
    <div className="flex h-screen w-full bg-secondary/30 text-foreground">
        <nav className="hidden md:flex flex-col gap-1 w-80 border-r border-border/50 p-4">
             <h2 className="text-xs uppercase font-bold text-muted-foreground px-2 mb-2">User Settings</h2>
            {settingsCategories.map(category => (
                <Button key={category.name} variant="ghost" className="justify-start gap-3 px-2 text-base py-5">
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
                                    <h2 className="text-xl font-semibold">Username</h2>
                                    <p className="text-muted-foreground">Username#0001</p>
                                </div>
                             </div>
                            <Button>Edit User Profile</Button>
                        </div>
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
        </ScrollArea>
    </div>
  );
}
