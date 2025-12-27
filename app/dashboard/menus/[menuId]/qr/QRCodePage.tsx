"use client";

import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

type QRPageProps = {
  publicId: string;
  menuName: string;
};

export default function QRCodePage({ publicId, menuName }: QRPageProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const menuUrl = `${baseUrl}/menu/${publicId}`;

  function downloadQR() {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${publicId}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printQR() {
    window.print();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/menus">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menus
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code for {menuName}</CardTitle>
          <CardDescription>Scan this code to view your menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div
              ref={qrRef}
              className="bg-white p-8 rounded-lg border-2 border-gray-200"
            >
              <QRCode value={menuUrl} size={256} />
            </div>

            <p className="text-sm text-muted-foreground font-mono text-center break-all max-w-md">
              {menuUrl}
            </p>

            <div className="flex gap-2">
              <Button onClick={downloadQR} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download SVG
              </Button>
              <Button onClick={printQR} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Download or print this QR code</li>
              <li>Display it at your restaurant (table tent, poster, etc.)</li>
              <li>Customers scan to view your menu instantly</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-print-area,
          #qr-print-area * {
            visibility: visible;
          }
          #qr-print-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}
