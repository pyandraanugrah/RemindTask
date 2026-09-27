import { PageContainer, PageHeader, PageContent } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Customize your RemindTask experience."
      />
      <PageContent>
        <div className="max-w-2xl space-y-8">
          {/* Theme */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Appearance</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Customize how RemindTask looks
            </p>
            <div className="p-4 rounded-lg border space-y-4">
              <div>
                <div className="font-medium text-sm mb-2">Theme</div>
                <p className="text-xs text-muted-foreground mb-3">
                  Your system theme preference is automatically applied
                </p>
                <div className="flex gap-2">
                  <Badge variant="default">Light</Badge>
                  <Badge variant="muted">Dark</Badge>
                  <Badge variant="muted">Auto</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Notifications</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage how and when you receive reminders
            </p>
            <div className="p-4 rounded-lg border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In-app Reminders</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Browser Notifications</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Built with</span>
                <span className="font-medium">Next.js + Prisma</span>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
