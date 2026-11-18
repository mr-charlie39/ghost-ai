import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sparkles, Terminal, Layers } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto max-w-4xl p-8 space-y-8">
      <div className="space-y-2">
        <h1 className={cn("text-3xl font-bold tracking-tight text-copy-primary", "flex items-center gap-2")}>
          <Layers className="h-8 w-8 text-brand" />
          Ghost AI Design System
        </h1>
        <p className="text-copy-muted">
          Technical workspace primitives and dark theme design tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Component */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-copy-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Components
            </CardTitle>
            <CardDescription className="text-copy-muted">
              Interactive primitives configured for the dark workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>

            <div className="space-y-2">
              <Input placeholder="System design prompt..." />
              <Textarea placeholder="Architecture specifications..." />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" size="sm" />}>
                Open Dialog
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-copy-primary">System Architecture</DialogTitle>
                  <DialogDescription className="text-copy-muted">
                    Collaborate and refine system designs in real-time.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2 text-sm text-copy-secondary">
                  Dialog overlay and popup rendered with dark surface tokens.
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Tabs and ScrollArea Component */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-copy-primary flex items-center gap-2">
              <Terminal className="h-4 w-4 text-ai" />
              Tabs & Scroll Area
            </CardTitle>
            <CardDescription className="text-copy-muted">
              Multi-tab content with scrollable area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="scroll">Scroll</TabsTrigger>
              </TabsList>
              <TabsContent value="tokens" className="space-y-2 pt-2">
                <div className="text-xs font-mono space-y-1">
                  <div className="p-2 rounded-xl bg-base border border-surface-border text-copy-primary">
                    bg-base: #080809
                  </div>
                  <div className="p-2 rounded-xl bg-surface border border-surface-border text-brand">
                    brand-accent: #00c8d4
                  </div>
                  <div className="p-2 rounded-xl bg-elevated border border-surface-border text-ai">
                    ai-accent: #6457f9
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="scroll" className="pt-2">
                <ScrollArea className="h-28 w-full rounded-xl border border-border p-3">
                  <div className="space-y-2 text-xs text-copy-secondary">
                    <p>Microservices starter architecture loaded.</p>
                    <p>Event-driven gateway connected to Kafka cluster.</p>
                    <p>PostgreSQL replica pool initialized.</p>
                    <p>Redis caching layer configured.</p>
                    <p>Spec generator ready.</p>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
