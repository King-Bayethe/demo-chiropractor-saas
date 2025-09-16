import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";

const MediaLibrary = () => {
  return (
    <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
              <p className="text-muted-foreground">
                All uploaded media assets and files
              </p>
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-16">
                <Image className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Media library and file management features are currently in development. 
                  Check back soon for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
};

export default MediaLibrary;