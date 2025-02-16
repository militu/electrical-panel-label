import { Button } from "@/app/ui/shadcn/button";
import { toast } from "@/app/ui/shadcn/use-toast";
import { useTranslations } from "next-intl";
import React from "react";

interface PrintButtonProps {
  svgContent: string;
  className?: string;
  config: {
    PAGE_WIDTH: number;
    PAGE_HEIGHT: number;
  };
}

const PrintButton: React.FC<PrintButtonProps> = ({
  svgContent,
  className,
  config,
}) => {
  const t = useTranslations("PrintButton");

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = svgDoc.documentElement;
      const width =
        svgElement.getAttribute("width") || `${config.PAGE_WIDTH}mm`;
      const height =
        svgElement.getAttribute("height") || `${config.PAGE_HEIGHT}mm`;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${t("printTitle")}</title>
            <style>
              @page {
                size: ${config.PAGE_WIDTH}mm ${config.PAGE_HEIGHT}mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              svg {
                width: ${width};
                height: ${height};
                display: block;
              }
              @media print {
                body {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
                svg {
                  page-break-inside: avoid;
                  page-break-after: always;
                }
              }
            </style>
          </head>
          <body>
            ${svgContent}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onafterprint = () => {
        printWindow.close();
      };
    } else {
      toast({
        title: t("printFailed"),
        description: t("printWindowBlocked"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Button onClick={handlePrint} className={className}>
      {t("printSVG")}
    </Button>
  );
};

export default PrintButton;
