import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";

const MediaLibrary = () => {
  return (
    <AuthGuard>
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
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="mr-2 h-5 w-5" />
                Media Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No media files yet</h3>
                <p className="text-muted-foreground">
                  Upload images, videos, and other media files for your practice.
                </p>
                <Button className="mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default MediaLibrary;